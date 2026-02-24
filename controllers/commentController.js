const Comment = require('../models/Comment');
const moderationService = require('../services/moderationService');

exports.createComment = async (req, res) => {
  try {
    const { signalement_id, contenu, parent_id } = req.body;
    const utilisateur_id = req.user.id;

    // Modération du contenu
    const moderation = await moderationService.analyzeText(contenu);
    if (!moderation.isValid) {
      return res.status(400).json({ error: 'Commentaire inapproprié.', details: moderation.reasons });
    }

    const comment = await Comment.create({
      signalement_id,
      utilisateur_id,
      contenu,
      parent_id
    });
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { signalement_id } = req.params;
    const comments = await Comment.findByReport(signalement_id);
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Commentaire non trouvé.' });
    if (comment.utilisateur_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé.' });
    }
    await Comment.delete(req.params.id);
    res.json({ message: 'Commentaire supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};