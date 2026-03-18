const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

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
    const { taskId, reward } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) return res.status(401).json({ error: 'Nicht eingeloggt' });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Prüfen ob Aufgabe schon erledigt
      const { data: existing } = await supabase
        .from('completed_tasks')
        .select('id')
        .eq('user_id', decoded.id)
        .eq('task_id', taskId)
        .single();
  
      if (existing) return res.status(400).json({ error: 'Aufgabe bereits erledigt' });
  
      // Aufgabe speichern
      await supabase.from('completed_tasks').insert([{
        user_id: decoded.id,
        task_id: taskId,
        reward: reward
      }]);
  
      // Coins addieren
      const { data: user } = await supabase
        .from('users')
        .select('coins')
        .eq('id', decoded.id)
        .single();
  
      const newCoins = user.coins + reward;
  
      await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', decoded.id);
  
      res.json({ coins: newCoins });
  
    } catch (err) {
      res.status(401).json({ error: 'Ungültiger Token' });
    }
  });
module.exports = router;