const pool = require('../config/db');

class Comment {
  static async create(data) {
    const { signalement_id, utilisateur_id, contenu, parent_id, media_image, media_video, media_document, media_audio } = data;
    const query = `INSERT INTO commentaires 
      (signalement_id, utilisateur_id, contenu, parent_id, media_image, media_video, media_document, media_audio) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const values = [signalement_id, utilisateur_id, contenu, parent_id, media_image, media_video, media_document, media_audio];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByReport(signalement_id) {
    const query = `
      SELECT c.*, u.username, u.photo_profil 
      FROM commentaires c 
      JOIN utilisateurs u ON c.utilisateur_id = u.id 
      WHERE c.signalement_id = $1 AND c.is_valid = true 
      ORDER BY c.date_commentaire ASC
    `;
    const result = await pool.query(query, [signalement_id]);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM commentaires WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    // similaire à User.update
  }

  static async delete(id) {
    await pool.query('DELETE FROM commentaires WHERE id = $1', [id]);
  }
}

module.exports = Comment;