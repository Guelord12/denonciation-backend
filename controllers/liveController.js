const LiveStream = require('../models/LiveStream');
const crypto = require('crypto');
// Importer la configuration Firebase (qui retourne maintenant un fallback)
const db = require('../config/firebase');

exports.createLiveStream = async (req, res) => {
  try {
    const { titre, description, is_paid, price, chat_enabled, donations_enabled } = req.body;
    const utilisateur_id = req.user.id;

    const stream_key = crypto.randomBytes(20).toString('hex');

    const live = await LiveStream.create({
      utilisateur_id,
      titre,
      description,
      stream_key,
      is_paid: is_paid || false,
      price: price || 0,
      chat_enabled: chat_enabled !== false,
      donations_enabled: donations_enabled !== false
    });

    const rtmpUrl = `rtmp://${req.hostname}:${process.env.RTMP_SERVER_PORT}/live/${stream_key}`;
    res.status(201).json({ ...live, rtmpUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.getActiveStreams = async (req, res) => {
  try {
    const streams = await LiveStream.findAllActive();
    res.json(streams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.getStreamById = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: 'Stream non trouvé.' });
    res.json(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Webhook appelé par le serveur RTMP
exports.startStream = async (req, res) => {
  try {
    const { stream_key } = req.body;
    const stream = await LiveStream.updateStatus(stream_key, true);
    if (!stream) return res.status(404).json({ error: 'Stream key invalide.' });
    res.json({ message: 'Stream démarré.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.stopStream = async (req, res) => {
  try {
    const { stream_key } = req.body;
    const stream = await LiveStream.updateStatus(stream_key, false);
    res.json({ message: 'Stream arrêté.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.addDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const utilisateur_id = req.user.id;
    await LiveStream.addDonation(id, amount, utilisateur_id);
    res.json({ message: 'Don enregistré.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Fonctions pour le chat (utilisant Firestore ou fallback)
exports.getMessages = async (req, res) => {
  try {
    const { streamId } = req.params;
    // Récupérer les messages depuis Firestore
    const messagesRef = db.collection('streams').doc(streamId).collection('messages');
    const snapshot = await messagesRef.orderBy('timestamp', 'asc').get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { streamId } = req.params;
    const { contenu } = req.body;
    const utilisateur_id = req.user.id;
    const username = req.user.username;

    const messagesRef = db.collection('streams').doc(streamId).collection('messages');
    const message = {
      userId: utilisateur_id,
      username,
      text: contenu,
      timestamp: new Date().toISOString()
    };
    const docRef = await messagesRef.add(message);
    res.status(201).json({ id: docRef.id, ...message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};