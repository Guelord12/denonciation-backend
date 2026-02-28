const Report = require('../models/Report');
const Category = require('../models/Category');
const Like = require('../models/Like'); // Nouveau modèle à créer
const moderationService = require('../services/moderationService');
const cloudinary = require('../config/cloudinary');

// Créer un signalement
exports.createReport = async (req, res) => {
  try {
    const { titre, description, categorie_id, latitude, longitude, ville } = req.body;
    const utilisateur_id = req.user.id;

    // Gestion des preuves (fichiers uploadés via multer)
    let preuve_image = null, preuve_video = null, preuve_document = null, preuve_audio = null;
    
    if (req.files) {
      if (req.files.image) {
        const result = await cloudinary.uploader.upload(req.files.image[0].path, { 
          folder: 'signalements/images',
          transformation: { width: 1200, crop: 'limit' }
        });
        preuve_image = result.secure_url;
      }
      if (req.files.video) {
        const result = await cloudinary.uploader.upload(req.files.video[0].path, { 
          folder: 'signalements/videos',
          resource_type: 'video'
        });
        preuve_video = result.secure_url;
      }
      if (req.files.document) {
        const result = await cloudinary.uploader.upload(req.files.document[0].path, { 
          folder: 'signalements/documents',
          resource_type: 'raw'
        });
        preuve_document = result.secure_url;
      }
      if (req.files.audio) {
        const result = await cloudinary.uploader.upload(req.files.audio[0].path, { 
          folder: 'signalements/audios',
          resource_type: 'video' // ou 'raw' selon le format
        });
        preuve_audio = result.secure_url;
      }
    }

    // Modération IA du texte
    const textModeration = await moderationService.analyzeText(titre + ' ' + description);
    if (!textModeration.isValid) {
      return res.status(400).json({ 
        error: 'Votre signalement contient du contenu inapproprié.', 
        details: textModeration.reasons 
      });
    }

    // Modération des images si présentes
    let imageModeration = { isValid: true };
    if (preuve_image) {
      imageModeration = await moderationService.analyzeImage(preuve_image);
      if (!imageModeration.isValid) {
        return res.status(400).json({ 
          error: 'L\'image fournie est inappropriée.' 
        });
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
    
    // Récupérer les informations de l'utilisateur et de la catégorie pour la réponse
    const fullReport = await Report.findById(report.id);
    
    res.status(201).json(fullReport);
  } catch (err) {
    console.error('Erreur création signalement:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Récupérer tous les signalements avec filtres
exports.getReports = async (req, res) => {
  try {
    const { ville, categorie, utilisateur_id, page = 1, limit = 20 } = req.query;
    const filters = {};
    
    if (ville) filters.ville = ville;
    if (categorie) filters.categorie_id = categorie;
    if (utilisateur_id) filters.utilisateur_id = utilisateur_id;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const reports = await Report.findAll(filters, parseInt(limit), offset);
    
    // Pour chaque rapport, ajouter le nombre de likes
    for (let report of reports) {
      report.likes_count = await Like.countByReport(report.id);
      // Vérifier si l'utilisateur connecté a liké ce rapport
      if (req.user) {
        report.user_liked = await Like.userLiked(report.id, req.user.id);
      }
    }
    
    const total = await Report.count(filters);
    
    res.json({
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Erreur récupération signalements:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Récupérer un signalement par ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Signalement non trouvé.' });
    }
    
    // Incrémenter le compteur de vues
    await Report.incrementViews(report.id);
    
    // Ajouter les commentaires
    const comments = await Comment.findByReport(report.id);
    
    // Ajouter le nombre de likes
    report.likes_count = await Like.countByReport(report.id);
    if (req.user) {
      report.user_liked = await Like.userLiked(report.id, req.user.id);
    }
    
    res.json({ ...report, comments });
  } catch (err) {
    console.error('Erreur récupération signalement:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Mettre à jour un signalement
exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Signalement non trouvé.' });
    }
    
    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (report.utilisateur_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé.' });
    }
    
    const updated = await Report.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('Erreur mise à jour signalement:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Supprimer un signalement (soft delete)
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Signalement non trouvé.' });
    }
    
    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (report.utilisateur_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé.' });
    }
    
    await Report.delete(req.params.id);
    res.json({ message: 'Signalement supprimé.' });
  } catch (err) {
    console.error('Erreur suppression signalement:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Liker un signalement
exports.likeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur_id = req.user.id;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Signalement non trouvé.' });
    }
    
    // Vérifier si l'utilisateur a déjà liké
    const alreadyLiked = await Like.userLiked(id, utilisateur_id);
    
    if (alreadyLiked) {
      // Si déjà liké, on retire le like (unlike)
      await Like.remove(id, utilisateur_id);
      res.json({ liked: false, message: 'Like retiré' });
    } else {
      // Sinon, on ajoute le like
      await Like.add(id, utilisateur_id);
      res.json({ liked: true, message: 'Signalement liké' });
    }
  } catch (err) {
    console.error('Erreur like:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Partager un signalement
exports.shareReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Signalement non trouvé.' });
    }
    
    await Report.incrementShares(id);
    
    // Générer une URL de partage (à adapter selon votre frontend)
    const shareUrl = `${process.env.FRONTEND_URL}/signalement/${id}`;
    
    res.json({ 
      message: 'Partage enregistré',
      shareUrl 
    });
  } catch (err) {
    console.error('Erreur partage:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Récupérer les signalements d'un utilisateur
exports.getUserReports = async (req, res) => {
  try {
    const { utilisateur_id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Vérifier que l'utilisateur connecté est le propriétaire ou admin
    if (parseInt(utilisateur_id) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé.' });
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const reports = await Report.findByUser(utilisateur_id, parseInt(limit), offset);
    const total = await Report.countByUser(utilisateur_id);
    
    res.json({
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Erreur récupération signalements utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Récupérer toutes les catégories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    console.error('Erreur récupération catégories:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Récupérer une catégorie par ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée.' });
    }
    res.json(category);
  } catch (err) {
    console.error('Erreur récupération catégorie:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Signaler un signalement (pour modération)
exports.reportReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { raison } = req.body;
    const utilisateur_id = req.user.id;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Signalement non trouvé.' });
    }
    
    // Implémenter la logique de signalement (table signalements_abus)
    // await ReportAbuse.create({ signalement_id: id, utilisateur_id, raison });
    
    res.json({ message: 'Signalement signalé à la modération.' });
  } catch (err) {
    console.error('Erreur signalement abus:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Marquer un signalement comme vérifié (admin)
exports.verifyReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Signalement non trouvé.' });
    }
    
    await Report.verify(id);
    res.json({ message: 'Signalement vérifié.' });
  } catch (err) {
    console.error('Erreur vérification:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};