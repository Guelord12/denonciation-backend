const News = require('../models/News');
const newsService = require('../services/newsService');

exports.fetchAndSaveNews = async (req, res) => {
  try {
    const { categorie, pays = 'cd' } = req.query;
    const articles = await newsService.fetchNews(categorie || 'general', pays);
    
    // Sauvegarder en base (optionnel)
    for (const article of articles) {
      if (article.title && article.url) {
        await News.create({
          titre: article.title,
          description: article.description,
          contenu: article.content,
          categorie: categorie || 'general',
          source: article.source.name,
          url: article.url,
          image_url: article.urlToImage,
          date_publication: article.publishedAt,
          pays
        }).catch(err => console.error('Erreur insertion news:', err.message));
      }
    }

    // Nettoyer les vieilles actualités (plus de 7 jours)
    await News.deleteOlderThan(7);

    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur récupération actualités.' });
  }
};

exports.getNewsFromDB = async (req, res) => {
  try {
    const { categorie, pays } = req.query;
    const news = await News.findAll({ categorie, pays });
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};