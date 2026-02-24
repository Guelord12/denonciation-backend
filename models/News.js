const pool = require('../config/db');

class News {
  static async create(data) {
    const { titre, description, contenu, categorie, source, url, image_url, date_publication, pays } = data;
    const query = `INSERT INTO actualites 
      (titre, description, contenu, categorie, source, url, image_url, date_publication, pays) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
    const values = [titre, description, contenu, categorie, source, url, image_url, date_publication, pays];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM actualites';
    const conditions = [];
    const values = [];
    if (filters.categorie) {
      conditions.push(`categorie = $${values.length + 1}`);
      values.push(filters.categorie);
    }
    if (filters.pays) {
      conditions.push(`pays = $${values.length + 1}`);
      values.push(filters.pays);
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY date_publication DESC LIMIT 50';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async deleteOlderThan(days) {
    await pool.query('DELETE FROM actualites WHERE date_publication < NOW() - $1::interval', [`${days} days`]);
  }
}

module.exports = News;