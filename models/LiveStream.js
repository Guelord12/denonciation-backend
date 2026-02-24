const pool = require('../config/db');

class LiveStream {
  static async create(data) {
    const { utilisateur_id, titre, description, stream_key, is_paid, price, chat_enabled, donations_enabled } = data;
    const query = `INSERT INTO live_streams 
      (utilisateur_id, titre, description, stream_key, is_paid, price, chat_enabled, donations_enabled) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const values = [utilisateur_id, titre, description, stream_key, is_paid, price, chat_enabled, donations_enabled];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAllActive() {
    const result = await pool.query(`
      SELECT ls.*, u.username, u.photo_profil 
      FROM live_streams ls 
      JOIN utilisateurs u ON ls.utilisateur_id = u.id 
      WHERE ls.is_live = true 
      ORDER BY ls.created_at DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT ls.*, u.username, u.photo_profil 
      FROM live_streams ls 
      JOIN utilisateurs u ON ls.utilisateur_id = u.id 
      WHERE ls.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async updateStatus(stream_key, is_live) {
    const result = await pool.query(
      'UPDATE live_streams SET is_live = $1 WHERE stream_key = $2 RETURNING *',
      [is_live, stream_key]
    );
    return result.rows[0];
  }

  static async incrementViewers(id) {
    await pool.query('UPDATE live_streams SET viewers_count = viewers_count + 1 WHERE id = $1', [id]);
  }

  static async decrementViewers(id) {
    await pool.query('UPDATE live_streams SET viewers_count = viewers_count - 1 WHERE id = $1', [id]);
  }

  static async addDonation(id, amount, user_id) {
    // Enregistrer un don (table donations à créer)
    const query = `INSERT INTO donations (live_stream_id, utilisateur_id, amount) VALUES ($1, $2, $3)`;
    await pool.query(query, [id, user_id, amount]);
    // Mettre à jour le total des revenus
    await pool.query('UPDATE live_streams SET total_earnings = total_earnings + $1 WHERE id = $2', [amount, id]);
  }
}

module.exports = LiveStream;