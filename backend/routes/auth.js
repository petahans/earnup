const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

// ---- Offerwall Tasks (server-trusted) ----
// Hinweis: Reward/Coin-Logik nie vom Client übernehmen.
const TASKS_LIST = [
  // Games
  { id: 1, type: 'game', title: 'Coin Rush', desc: 'Erreiche Level 5', reward: 250, time: '10 Min', rating: 5, bg: 'linear-gradient(135deg, #1a0a2e, #2d1b69)' },
  { id: 2, type: 'game', title: 'Bubble Pop', desc: '3 Runden ohne Fehler', reward: 150, time: '7 Min', rating: 4, bg: 'linear-gradient(135deg, #0a1a2e, #1b3a69)' },
  { id: 3, type: 'game', title: 'Match Master', desc: '10 Züge in Folge lösen', reward: 175, time: '8 Min', rating: 4, bg: 'linear-gradient(135deg, #1a2e0a, #3a6921)' },
  { id: 7, type: 'game', title: 'Farm Frenzy', desc: 'Ernte 50 Felder', reward: 240, time: '12 Min', rating: 4, bg: 'linear-gradient(135deg, #2a0a2e, #7a1b5a)' },
  { id: 8, type: 'game', title: 'Puzzle Quest', desc: 'Löse 20 Levels', reward: 160, time: '6 Min', rating: 4, bg: 'linear-gradient(135deg, #0a1a2e, #1b6a69)' },
  { id: 9, type: 'game', title: 'Runner Royale', desc: '10 Kilometer laufen', reward: 210, time: '15 Min', rating: 5, bg: 'linear-gradient(135deg, #1a0a2e, #4a1b69)' },
  { id: 10, type: 'game', title: 'Word Wizard', desc: '50 Wörter finden', reward: 130, time: '4 Min', rating: 3, bg: 'linear-gradient(135deg, #2d0a0a, #691b1b)' },
  { id: 11, type: 'game', title: 'Strategy Stronghold', desc: 'Bau 1 Festung', reward: 280, time: '18 Min', rating: 5, bg: 'linear-gradient(135deg, #0d1f2d, #1a3a4a)' },
  { id: 12, type: 'game', title: 'Arcade Ascend', desc: '3 Runden ohne Leben', reward: 190, time: '9 Min', rating: 4, bg: 'linear-gradient(135deg, #0a2e1a, #1b693a)' },
  { id: 13, type: 'game', title: 'Music Mixer', desc: 'Perfect Combo erzielen', reward: 150, time: '7 Min', rating: 4, bg: 'linear-gradient(135deg, #2a2a0a, #6b6b1b)' },
  { id: 14, type: 'game', title: 'Shooting Star', desc: '10 Headshots', reward: 170, time: '8 Min', rating: 4, bg: 'linear-gradient(135deg, #1a0a2e, #2d1b69)' },
  { id: 15, type: 'game', title: 'Card Collector', desc: 'Erhalte 5 Seltenheiten', reward: 220, time: '11 Min', rating: 5, bg: 'linear-gradient(135deg, #131921, #232f3e)' },
  { id: 16, type: 'game', title: 'Bubble Galaxy', desc: '2 Portale aktivieren', reward: 120, time: '5 Min', rating: 3, bg: 'linear-gradient(135deg, #121212, #1db954)' },
  { id: 17, type: 'game', title: 'Castle Defender', desc: '10 Wellen halten', reward: 260, time: '14 Min', rating: 5, bg: 'linear-gradient(135deg, #0a1a2e, #1b3a69)' },
  { id: 18, type: 'game', title: 'Trivia Royale', desc: '8 Runden gewinnen', reward: 140, time: '6 Min', rating: 4, bg: 'linear-gradient(135deg, #1a2e0a, #3a6921)' },

  // Surveys
  { id: 4, type: 'survey', title: 'CPX Research', desc: 'Bezahlte Meinungsumfragen', reward: 120, time: '3 Min', rating: 5, bg: 'linear-gradient(135deg, #0d1f2d, #1a3a4a)' },
  { id: 5, type: 'survey', title: 'Pollfish', desc: 'Kurze tägliche Umfragen', reward: 80, time: '2 Min', rating: 3, bg: 'linear-gradient(135deg, #2d0a0a, #691b1b)' },
  { id: 6, type: 'survey', title: 'YourSurveys', desc: 'Produkttest & Feedback', reward: 200, time: '5 Min', rating: 5, bg: 'linear-gradient(135deg, #1a0a2e, #4a1b69)' },
  { id: 19, type: 'survey', title: 'SurveySprint', desc: 'Schnelle Fragen zu deinem Alltag', reward: 90, time: '3 Min', rating: 4, bg: 'linear-gradient(135deg, #0a1a2e, #1b3a69)' },
  { id: 20, type: 'survey', title: 'BrandPulse', desc: 'Meinung zu Marken & Produkten', reward: 130, time: '4 Min', rating: 5, bg: 'linear-gradient(135deg, #1a0a2e, #2d1b69)' },
  { id: 21, type: 'survey', title: 'OpinionWorks', desc: 'Kurze Umfragen mit guter Auszahlung', reward: 70, time: '2 Min', rating: 3, bg: 'linear-gradient(135deg, #2d0a0a, #691b1b)' },
  { id: 22, type: 'survey', title: 'ProductTest Hub', desc: 'Produkttests & Feedback', reward: 200, time: '7 Min', rating: 5, bg: 'linear-gradient(135deg, #0d1f2d, #1a3a4a)' },
  { id: 23, type: 'survey', title: 'QuickView Surveys', desc: 'Kurze Umfrage am Feierabend', reward: 110, time: '3 Min', rating: 4, bg: 'linear-gradient(135deg, #2a2a0a, #6b6b1b)' },
  { id: 24, type: 'survey', title: 'CPX Extra', desc: 'Zusätzliche Meinungsumfragen', reward: 150, time: '5 Min', rating: 5, bg: 'linear-gradient(135deg, #131921, #232f3e)' },
  { id: 25, type: 'survey', title: 'YourSurveys Plus', desc: 'Mehr Fragen, mehr Bonus', reward: 180, time: '6 Min', rating: 5, bg: 'linear-gradient(135deg, #121212, #1db954)' },
];

const TASKS_BY_ID = TASKS_LIST.reduce((acc, t) => {
  acc[String(t.id)] = { reward: t.reward, type: t.type };
  return acc;
}, {});

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
  if (!taskId || !TASKS_BY_ID[String(taskId)]) return res.status(400).json({ error: 'Ungültige Aufgabe' });

  const reward = TASKS_BY_ID[String(taskId)].reward;
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

// Offerwall Tasks (für die UI)
router.get('/tasks', async (req, res) => {
  res.json({ tasks: TASKS_LIST });
});
module.exports = router;