const moderationService = require('../services/moderationService');

// Endpoint pour recevoir les résultats de modération asynchrones (webhook)
exports.moderationWebhook = async (req, res) => {
  try {
    const { type, contentId, result } = req.body;
    // Traiter le résultat (mettre à jour la base, etc.)
    console.log('Webhook de modération reçu:', { type, contentId, result });
    // I on pourrait mettre à jour le champ analyse_ia du signalement ou commentaire
    res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Modération manuelle (admin)
exports.moderateManually = async (req, res) => {
  try {
    const { contentId, type, decision } = req.body; // type: 'signalement' ou 'commentaire'
    // Implémenter la logique de modération manuelle
    res.json({ message: 'Modération effectuée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};