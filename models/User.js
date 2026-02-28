const pool = require('../config/db');

class User {
  // Créer un nouvel utilisateur
  static async create(data) {
    const { 
      nom, prenom, username, sexe, date_naissance, ville, pays, 
      nationalite, telephone, email, mot_de_passe, avatar_choisi, 
      avatar_url, accepted_terms, terms_accepted_at 
    } = data;
    
    const query = `INSERT INTO utilisateurs 
      (nom, prenom, username, sexe, date_naissance, ville, pays, 
       nationalite, telephone, email, mot_de_passe, avatar_choisi, 
       avatar_url, accepted_terms, terms_accepted_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING id, nom, prenom, username, email, telephone, avatar_choisi, avatar_url, role, date_creation`;
      
    const values = [
      nom, prenom, username, sexe, date_naissance, ville, pays, 
      nationalite, telephone, email, mot_de_passe, avatar_choisi, 
      avatar_url, accepted_terms, terms_accepted_at
    ];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error('Erreur création utilisateur:', err);
      throw err;
    }
  }

  // Rechercher par nom d'utilisateur
  static async findByUsername(username) {
    const query = 'SELECT * FROM utilisateurs WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Rechercher par email
  static async findByEmail(email) {
    const query = 'SELECT * FROM utilisateurs WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Rechercher par téléphone
  static async findByPhone(telephone) {
    const query = 'SELECT * FROM utilisateurs WHERE telephone = $1';
    const result = await pool.query(query, [telephone]);
    return result.rows[0];
  }

  // Rechercher par ID
  static async findById(id) {
    const query = `SELECT id, nom, prenom, username, email, telephone, 
                   avatar_choisi, avatar_url, role, date_creation, 
                   ville, pays, nationalite, sexe
                   FROM utilisateurs WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Mettre à jour un utilisateur
  static async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id' && key !== 'mot_de_passe') {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    
    if (fields.length === 0) return null;
    
    const query = `UPDATE utilisateurs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, nom, prenom, username, email, telephone, avatar_choisi, avatar_url, role`;
    values.push(id);
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Mettre à jour le mot de passe
  static async updatePassword(id, hashedPassword) {
    const query = 'UPDATE utilisateurs SET mot_de_passe = $1 WHERE id = $2 RETURNING id';
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rows[0];
  }

  // Supprimer un utilisateur (soft delete ou réel)
  static async delete(id) {
    // Soft delete : mettre is_active à false
    const query = 'UPDATE utilisateurs SET is_active = false WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Récupérer tous les utilisateurs (admin)
  static async findAll(limit = 100, offset = 0) {
    const query = `SELECT id, nom, prenom, username, email, telephone, 
                   role, is_active, date_creation 
                   FROM utilisateurs 
                   ORDER BY date_creation DESC 
                   LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Compter les utilisateurs
  static async count() {
    const result = await pool.query('SELECT COUNT(*) FROM utilisateurs WHERE is_active = true');
    return parseInt(result.rows[0].count);
  }

  // Mettre à jour la date de dernier accès
  static async updateLastAccess(id) {
    const query = 'UPDATE utilisateurs SET dernier_acces = CURRENT_TIMESTAMP WHERE id = $1';
    await pool.query(query, [id]);
  }

  // Vérifier si un email existe déjà (pour validation)
  static async emailExists(email) {
    const result = await pool.query('SELECT id FROM utilisateurs WHERE email = $1', [email]);
    return result.rows.length > 0;
  }

  // Vérifier si un username existe déjà
  static async usernameExists(username) {
    const result = await pool.query('SELECT id FROM utilisateurs WHERE username = $1', [username]);
    return result.rows.length > 0;
  }

  // Vérifier si un téléphone existe déjà
  static async phoneExists(telephone) {
    const result = await pool.query('SELECT id FROM utilisateurs WHERE telephone = $1', [telephone]);
    return result.rows.length > 0;
  }
}

module.exports = User;