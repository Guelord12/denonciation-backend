const pool = require('../config/db');

class Report {
  static async create(data) {
    const { utilisateur_id, categorie_id, titre, description, latitude, longitude, ville, preuve_image, preuve_video, preuve_document, preuve_audio, preuve_type, analyse_ia } = data;
    const query = `INSERT INTO signalements 
      (utilisateur_id, categorie_id, titre, description, latitude, longitude, ville, preuve_image, preuve_video, preuve_document, preuve_audio, preuve_type, analyse_ia) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;
    const values = [utilisateur_id, categorie_id, titre, description, latitude, longitude, ville, preuve_image, preuve_video, preuve_document, preuve_audio, preuve_type, analyse_ia];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = 'SELECT r.*, u.username, u.photo_profil, c.name as categorie_nom FROM signalements r JOIN utilisateurs u ON r.utilisateur_id = u.id LEFT JOIN categories_abus c ON r.categorie_id = c.id WHERE r.is_valid = true';
    const values = [];
    const conditions = [];
    if (filters.ville) {
      conditions.push(`r.ville = $${values.length + 1}`);
      values.push(filters.ville);
    }
    if (filters.categorie_id) {
      conditions.push(`r.categorie_id = $${values.length + 1}`);
      values.push(filters.categorie_id);
    }
    if (conditions.length) {
      query += ' AND ' + conditions.join(' AND ');
    }
    query += ' ORDER BY r.date_signalement DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT r.*, u.username, u.photo_profil, c.name as categorie_nom FROM signalements r JOIN utilisateurs u ON r.utilisateur_id = u.id LEFT JOIN categories_abus c ON r.categorie_id = c.id WHERE r.id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    // similaire à User.update
  }

  static async delete(id) {
    // soft delete ou réel
  }

  static async incrementViews(id) {
    await pool.query('UPDATE signalements SET views_count = views_count + 1 WHERE id = $1', [id]);
  }

  static async incrementShares(id) {
    await pool.query('UPDATE signalements SET shares_count = shares_count + 1 WHERE id = $1', [id]);
  }
}

module.exports = Report;