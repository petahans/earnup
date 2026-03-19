const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

// ---- Domain config (server-trusted) ----
// Wichtig: Reward/Coin-Logik nie vom Client übernehmen.
const TASKS = {
  // Frontend: tasks[] IDs
  '1': { reward: 250, type: 'game' },
  '2': { reward: 150, type: 'game' },
  '3': { reward: 175, type: 'game' },
  '4': { reward: 120, type: 'survey' },
  '5': { reward: 80, type: 'survey' },
  '6': { reward: 200, type: 'survey' },
};

// Cashout (Server-seitig validiert)
const CASHOUT_REWARDS = {
  paypal: { minCoins: 500 },
  bitcoin: { minCoins: 1000 },
  amazon: { minCoins: 800 },
  steam: { minCoins: 700 },
  netflix: { minCoins: 1200 },
  spotify: { minCoins: 900 },
};

function requireAuth(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Registrierung
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Passwort verschlüsseln
    const password_hash = await bcrypt.hash(password, 10);

    // Referral Code generieren
    const referral_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Nutzer in Datenbank speichern
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password_hash, phone, referral_code }])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    // JWT Token erstellen
    const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: data[0].id, name, email, coins: 0 } });

  } catch (err) {
    res.status(500).json({ error: 'Server Fehler' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return res.status(400).json({ error: 'Nutzer nicht gefunden' });

    const valid = await bcrypt.compare(password, data.password_hash);
    if (!valid) return res.status(400).json({ error: 'Falsches Passwort' });

    const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: data.id, name: data.name, email: data.email, coins: data.coins } });

  } catch (err) {
    res.status(500).json({ error: 'Server Fehler' });
  }
});
// Aufgabe erledigen & Coins gutschreiben
router.post('/tasks/complete', async (req, res) => {
  const { taskId } = req.body || {};
  const decoded = requireAuth(req, res);

  if (!decoded) return res.status(401).json({ error: 'Nicht eingeloggt' });
  if (!taskId || !TASKS[String(taskId)]) return res.status(400).json({ error: 'Ungültige Aufgabe' });

  const reward = TASKS[String(taskId)].reward;
  const userId = decoded.id;
  const taskIdStr = String(taskId);

  try {
    // Prüfen ob Aufgabe schon erledigt (idempotent)
    const { data: existing } = await supabase
      .from('completed_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('task_id', taskIdStr)
      .maybeSingle();

    if (existing) return res.status(400).json({ error: 'Aufgabe bereits erledigt' });

    // Aufgabe speichern (Reward serverseitig)
    await supabase.from('completed_tasks').insert([{
      user_id: userId,
      task_id: taskIdStr,
      reward,
    }]);

    // Coins addieren
    const { data: user } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    const newCoins = Number(user.coins) + Number(reward);

    await supabase
      .from('users')
      .update({ coins: newCoins })
      .eq('id', userId);

    res.json({ coins: newCoins });
  } catch (err) {
    res.status(500).json({ error: 'Server Fehler' });
  }
  });

// Completed Tasks laden
router.get('/tasks/completed', async (req, res) => {
  const decoded = requireAuth(req, res);
  if (!decoded) return res.status(401).json({ error: 'Nicht eingeloggt' });

  const userId = decoded.id;
  try {
    const { data, error } = await supabase
      .from('completed_tasks')
      .select('task_id')
      .eq('user_id', userId);

    if (error) return res.status(500).json({ error: 'Server Fehler' });

    const taskIds = (data || []).map(x => Number(x.task_id));
    res.json({ taskIds });
  } catch {
    res.status(500).json({ error: 'Server Fehler' });
  }
});

// Aktueller User (Coins synchronisieren)
router.get('/me', async (req, res) => {
  const decoded = requireAuth(req, res);
  if (!decoded) return res.status(401).json({ error: 'Nicht eingeloggt' });

  const userId = decoded.id;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, coins')
      .eq('id', userId)
      .single();

    if (error) return res.status(500).json({ error: 'Server Fehler' });
    res.json({ user: data });
  } catch {
    res.status(500).json({ error: 'Server Fehler' });
  }
});

// Leaderboard (Top-N Coins)
router.get('/leaderboard', async (req, res) => {
  const decoded = requireAuth(req, res);
  if (!decoded) return res.status(401).json({ error: 'Nicht eingeloggt' });

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, coins')
      .order('coins', { ascending: false })
      .limit(10);

    if (error) return res.status(500).json({ error: 'Server Fehler' });

    const leaderboard = (data || []).map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      name: u.name,
      coins: u.coins,
      avatar: String(u.name || '?')[0]?.toUpperCase(),
    }));

    res.json({ leaderboard });
  } catch {
    res.status(500).json({ error: 'Server Fehler' });
  }
});

// Cashout einlösen (Coins serverseitig validiert & abgezogen)
router.post('/cashout/redeem', async (req, res) => {
  const decoded = requireAuth(req, res);
  if (!decoded) return res.status(401).json({ error: 'Nicht eingeloggt' });

  const { rewardId } = req.body || {};
  if (!rewardId || !CASHOUT_REWARDS[String(rewardId)]) {
    return res.status(400).json({ error: 'Ungültiger Reward' });
  }

  const userId = decoded.id;
  const cost = CASHOUT_REWARDS[String(rewardId)].minCoins;

  try {
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (userErr) return res.status(500).json({ error: 'Server Fehler' });

    const currentCoins = Number(user.coins);
    if (currentCoins < cost) return res.status(400).json({ error: 'Nicht genug Coins' });

    const newCoins = currentCoins - cost;

    await supabase
      .from('users')
      .update({ coins: newCoins })
      .eq('id', userId);

    // Optional: Cashout-Event auditieren (falls Table existiert)
    try {
      await supabase.from('cashouts').insert([{
        user_id: userId,
        reward_id: String(rewardId),
        cost,
      }]);
    } catch {
      // Kein Hard-Fail, um nicht wegen fehlender Tabelle alles zu blockieren
    }

    res.json({ coins: newCoins });
  } catch {
    res.status(500).json({ error: 'Server Fehler' });
  }
});
module.exports = router;