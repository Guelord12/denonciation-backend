const pool = require('../config/db');

class Category {
  static async findAll() {
    const result = await pool.query('SELECT * FROM categories_abus ORDER BY id');
    return result.rows;
  }

  static async findBySlug(slug) {
    const result = await pool.query('SELECT * FROM categories_abus WHERE slug = $1', [slug]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM categories_abus WHERE id = $1', [id]);
    return result.rows[0];
  }
}

module.exports = Category;