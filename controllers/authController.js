const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateEmail, validatePhone } = require('../utils/validation');

exports.register = async (req, res) => {
  try {
    const { nom, prenom, date_naissance, telephone, email, username, mot_de_passe, ...rest } = req.body;

    // Validation âge
    const birthDate = new Date(date_naissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) return res.status(400).json({ error: 'Vous devez avoir au moins 18 ans.' });

    // Validation email et téléphone
    if (!validateEmail(email)) return res.status(400).json({ error: 'Email invalide.' });
    if (!validatePhone(telephone)) return res.status(400).json({ error: 'Téléphone invalide.' });

    // Vérifier unicité
    const existing = await User.findByUsername(username);
    if (existing) return res.status(400).json({ error: 'Nom d\'utilisateur déjà pris.' });

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const user = await User.create({ ...req.body, mot_de_passe: hashedPassword });
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, mot_de_passe } = req.body;
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });

    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};