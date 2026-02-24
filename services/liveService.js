const LiveStream = require('../models/LiveStream');

// Gestion des streams avec Node-Media-Server
exports.notifyStart = async (streamKey) => {
  // Appelé par le webhook du serveur RTMP
  const stream = await LiveStream.updateStatus(streamKey, true);
  return stream;
};

exports.notifyStop = async (streamKey) => {
  const stream = await LiveStream.updateStatus(streamKey, false);
  return stream;
};

exports.generateStreamKey = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(20).toString('hex');
};

// Vérifier si un utilisateur a accès à un stream payant
exports.checkAccess = async (streamId, userId) => {
  const stream = await LiveStream.findById(streamId);
  if (!stream) return false;
  if (!stream.is_paid) return true;
  // Implémenter la logique de vérification d'achat
  // Exemple : rechercher dans une table "purchases"
  return true; // temporaire
};