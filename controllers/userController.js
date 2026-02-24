const User = require('../models/User');
const bcrypt = require('bcrypt');
const cloudinary = require('../config/cloudinary');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    delete user.mot_de_passe;
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    // Ne pas permettre la modification du mot de passe ici
    delete updates.mot_de_passe;
    delete updates.id;
    const user = await User.update(req.user.id, updates);
    delete user.mot_de_passe;
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni.' });
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'avatars' });
    const user = await User.update(req.user.id, { photo_profil: result.secure_url });
    delete user.mot_de_passe;
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.delete(req.user.id);
    res.json({ message: 'Compte supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};