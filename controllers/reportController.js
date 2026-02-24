const Report = require('../models/Report');
const moderationService = require('../services/moderationService');
const cloudinary = require('../config/cloudinary');

exports.createReport = async (req, res) => {
  try {
    const { titre, description, categorie_id, latitude, longitude, ville } = req.body;
    const utilisateur_id = req.user.id;

    // Gestion des preuves (fichiers uploadés via multer)
    let preuve_image = null, preuve_video = null, preuve_document = null, preuve_audio = null;
    if (req.files) {
      if (req.files.image) {
        const result = await cloudinary.uploader.upload(req.files.image[0].path, { folder: 'signalements/images' });
        preuve_image = result.secure_url;
      }
      // idem pour video, document, audio
    }

    // Modération IA du texte
    const textModeration = await moderationService.analyzeText(titre + ' ' + description);
    if (!textModeration.isValid) {
      return res.status(400).json({ error: 'Votre signalement contient du contenu inapproprié.', details: textModeration.reasons });
    }

    // Modération des images si présentes
    let imageModeration = { isValid: true };
    if (preuve_image) {
      imageModeration = await moderationService.analyzeImage(preuve_image);
      if (!imageModeration.isValid) {
        return res.status(400).json({ error: 'L\'image fournie est inappropriée.' });
      }
    }

    const reportData = {
      utilisateur_id,
      categorie_id,
      titre,
      description,
      latitude,
      longitude,
      ville,
      preuve_image,
      preuve_video,
      preuve_document,
      preuve_audio,
      preuve_type: req.body.preuve_type,
      analyse_ia: { text: textModeration, image: imageModeration }
    };

    const report = await Report.create(reportData);
    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { ville, categorie } = req.query;
    const filters = {};
    if (ville) filters.ville = ville;
    if (categorie) filters.categorie_id = categorie;
    const reports = await Report.findAll(filters);
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Signalement non trouvé.' });
    await Report.incrementViews(report.id);
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.likeReport = async (req, res) => {
  // Implémenter la gestion des likes (table likes séparée ou compteur)
  res.json({ message: 'Fonctionnalité à implémenter' });
};

exports.shareReport = async (req, res) => {
  try {
    await Report.incrementShares(req.params.id);
    res.json({ message: 'Partage enregistré' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};