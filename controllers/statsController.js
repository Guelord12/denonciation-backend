const Statistic = require('../models/Statistic');

exports.getStats = async (req, res) => {
  try {
    const { periode = 'jour' } = req.query; // jour, semaine, mois, annee
    const statsByCategory = await Statistic.getStatsByCategory(periode);
    const statsByVille = await Statistic.getStatsByVille(periode);
    const timeline = await Statistic.getTimeline(periode, 7);

    // Calcul des pourcentages
    const total = statsByCategory.reduce((acc, cur) => acc + parseInt(cur.nombre_signalements), 0);
    const categoriesWithPercent = statsByCategory.map(c => ({
      ...c,
      pourcentage: total ? ((c.nombre_signalements / total) * 100).toFixed(2) : 0
    }));

    const totalVille = statsByVille.reduce((acc, cur) => acc + parseInt(cur.nombre_signalements), 0);
    const villesWithPercent = statsByVille.map(v => ({
      ...v,
      pourcentage: totalVille ? ((v.nombre_signalements / totalVille) * 100).toFixed(2) : 0
    }));

    res.json({
      categories: categoriesWithPercent,
      villes: villesWithPercent,
      timeline,
      total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};