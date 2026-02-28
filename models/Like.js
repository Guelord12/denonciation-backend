const pool = require('../config/db');

class Like {
  // Ajouter un like
  static async add(signalement_id, utilisateur_id) {
    const query = `INSERT INTO likes (signalement_id, utilisateur_id) 
                   VALUES ($1, $2) 
                   ON CONFLICT (signalement_id, utilisateur_id) DO NOTHING 
                   RETURNING *`;
    const result = await pool.query(query, [signalement_id, utilisateur_id]);
    return result.rows[0];
  }

  // Retirer un like
  static async remove(signalement_id, utilisateur_id) {
    const query = `DELETE FROM likes 
                   WHERE signalement_id = $1 AND utilisateur_id = $2 
                   RETURNING *`;
    const result = await pool.query(query, [signalement_id, utilisateur_id]);
    return result.rows[0];
  }

  // Compter les likes d'un signalement
  static async countByReport(signalement_id) {
    const query = `SELECT COUNT(*) FROM likes WHERE signalement_id = $1`;
    const result = await pool.query(query, [signalement_id]);
    return parseInt(result.rows[0].count);
  }

  // Vérifier si un utilisateur a liké un signalement
  static async userLiked(signalement_id, utilisateur_id) {
    const query = `SELECT id FROM likes 
                   WHERE signalement_id = $1 AND utilisateur_id = $2`;
    const result = await pool.query(query, [signalement_id, utilisateur_id]);
    return result.rows.length > 0;
  }

  // Récupérer les utilisateurs qui ont liké un signalement
  static async getUsersByReport(signalement_id) {
    const query = `SELECT u.id, u.username, u.avatar_choisi, u.avatar_url 
                   FROM likes l
                   JOIN utilisateurs u ON l.utilisateur_id = u.id
                   WHERE l.signalement_id = $1
                   ORDER BY l.date_like DESC`;
    const result = await pool.query(query, [signalement_id]);
    return result.rows;
  }
}

module.exports = Like;