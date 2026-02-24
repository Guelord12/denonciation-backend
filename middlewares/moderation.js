const moderationService = require('../services/moderationService');

module.exports = async (req, res, next) => {
  // Pour les endpoints qui créent du contenu, on peut vérifier avant
  // Mais on peut aussi le faire dans le contrôleur directement
  next();
};