const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateEmail, validatePhone } = require('../utils/validation');
const cloudinary = require('../config/cloudinary');

exports.register = async (req, res) => {
  try {
    const { 
      nom, prenom, username, sexe, date_naissance, ville, pays, 
      nationalite, telephone, email, mot_de_passe, avatar_type, 
      avatar_custom, accepted_terms 
    } = req.body;

    // Validation âge
    const birthDate = new Date(date_naissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) {
      return res.status(400).json({ error: 'Vous devez avoir au moins 18 ans.' });
    }

    // Validation email et téléphone
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email invalide.' });
    }
    if (!validatePhone(telephone)) {
      return res.status(400).json({ error: 'Téléphone invalide. Utilisez le format avec indicatif (ex: +243123456789).' });
    }

    // Vérifier unicité
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Nom d\'utilisateur déjà pris.' });
    }
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email déjà utilisé.' });
    }
    const existingPhone = await User.findByPhone(telephone);
    if (existingPhone) {
      return res.status(400).json({ error: 'Numéro de téléphone déjà utilisé.' });
    }

    // Gestion de l'avatar
    let avatar_url = null;
    if (avatar_custom) {
      // Si l'utilisateur a uploadé une image personnalisée
      try {
        const result = await cloudinary.uploader.upload(avatar_custom, {
          folder: 'avatars',
          transformation: { width: 200, height: 200, crop: 'fill' }
        });
        avatar_url = result.secure_url;
      } catch (err) {
        console.error('Erreur upload avatar:', err);
      }
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    
    const userData = {
      nom,
      prenom,
      username,
      sexe,
      date_naissance,
      ville,
      pays,
      nationalite,
      telephone,
      email,
      mot_de_passe: hashedPassword,
      avatar_choisi: avatar_type || null,
      avatar_url,
      accepted_terms,
      terms_accepted_at: accepted_terms ? new Date() : null
    };

    const user = await User.create(userData);
    
    // Ne pas renvoyer le mot de passe
    delete user.mot_de_passe;
    
    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      user 
    });
  } catch (err) {
    console.error('Erreur register:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, mot_de_passe } = req.body;
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Ne pas renvoyer le mot de passe
    delete user.mot_de_passe;
    
    res.json({ user, token });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};