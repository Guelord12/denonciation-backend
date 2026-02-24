const pool = require('../config/db');

class Statistic {
  // Agrégation par catégorie pour une période donnée
  static async getStatsByCategory(periode = 'jour', date = new Date()) {
    let interval;
    switch (periode) {
      case 'jour':
        interval = '1 day';
        break;
      case 'semaine':
        interval = '7 days';
        break;
      case 'mois':
        interval = '1 month';
        break;
      case 'annee':
        interval = '1 year';
        break;
      default:
        interval = '1 day';
    }
    const query = `
      SELECT 
        c.id AS categorie_id,
        c.name,
        COUNT(s.id) AS nombre_signalements
      FROM signalements s
      RIGHT JOIN categories_abus c ON s.categorie_id = c.id
      WHERE s.date_signalement >= NOW() - $1::interval
      GROUP BY c.id, c.name
      ORDER BY nombre_signalements DESC
    `;
    const result = await pool.query(query, [interval]);
    return result.rows;
  }

  static async getStatsByVille(periode = 'jour', date = new Date()) {
    let interval;
    switch (periode) {
      case 'jour':
        interval = '1 day';
        break;
      case 'semaine':
        interval = '7 days';
        break;
      case 'mois':
        interval = '1 month';
        break;
      case 'annee':
        interval = '1 year';
        break;
      default:
        interval = '1 day';
    }
    const query = `
      SELECT 
        ville,
        COUNT(id) AS nombre_signalements
      FROM signalements
      WHERE date_signalement >= NOW() - $1::interval AND ville IS NOT NULL
      GROUP BY ville
      ORDER BY nombre_signalements DESC
    `;
    const result = await pool.query(query, [interval]);
    return result.rows;
  }

  // Pour les graphiques temporels (évolution)
  static async getTimeline(periode = 'jour', limit = 7) {
    let groupBy;
    let format;
    switch (periode) {
      case 'jour':
        groupBy = 'DATE(date_signalement)';
        format = 'YYYY-MM-DD';
        break;
      case 'semaine':
        groupBy = 'DATE_TRUNC(\'week\', date_signalement)';
        format = 'YYYY-"W"WW';
        break;
      case 'mois':
        groupBy = 'DATE_TRUNC(\'month\', date_signalement)';
        format = 'YYYY-MM';
        break;
      default:
        groupBy = 'DATE(date_signalement)';
        format = 'YYYY-MM-DD';
    }
    const query = `
      SELECT 
        ${groupBy} AS periode,
        COUNT(id) AS total
      FROM signalements
      WHERE date_signalement >= NOW() - INTERVAL '${limit} ${periode === 'annee' ? 'years' : periode === 'mois' ? 'months' : 'days'}'
      GROUP BY periode
      ORDER BY periode ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Statistic;