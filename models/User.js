const pool = require('../config/db');

class User {
  static async create(data) {
    const { nom, prenom, date_naissance, ville, pays, nationalite, telephone, email, username, mot_de_passe, photo_profil } = data;
    const query = `INSERT INTO utilisateurs 
      (nom, prenom, date_naissance, ville, pays, nationalite, telephone, email, username, mot_de_passe, photo_profil, accepted_terms, terms_accepted_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;
    const values = [nom, prenom, date_naissance, ville, pays, nationalite, telephone, email, username, mot_de_passe, photo_profil, true, new Date()];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await pool.query('SELECT * FROM utilisateurs WHERE username = $1', [username]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM utilisateurs WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    if (fields.length === 0) return null;
    const query = `UPDATE utilisateurs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM utilisateurs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = User;