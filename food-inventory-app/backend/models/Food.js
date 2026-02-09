import pool from '../config/database.js'

class Food {
  static async create({ userId, imageUrl, meatType, purchaseDate, storageMethod, freshnessScore }) {
    const query = `
      INSERT INTO foods (user_id, image_url, meat_type, purchase_date, storage_method, freshness_score)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    const values = [userId, imageUrl, meatType, purchaseDate, storageMethod, freshnessScore]
    const result = await pool.query(query, values)
    return result.rows[0]
  }

  static async findByUserId(userId) {
    const query = `
      SELECT * FROM foods
      WHERE user_id = $1
      ORDER BY created_at DESC
    `
    const result = await pool.query(query, [userId])
    return result.rows
  }

  static async findRecentByUserId(userId, limit = 5) {
    const query = `
      SELECT * FROM foods
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `
    const result = await pool.query(query, [userId, limit])
    return result.rows
  }

  static async getStats(userId) {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN freshness_score >= 50 AND freshness_score < 75 THEN 1 END) as expiring_soon,
        COUNT(CASE WHEN freshness_score >= 75 THEN 1 END) as fresh,
        COUNT(CASE WHEN freshness_score < 50 THEN 1 END) as spoiled
      FROM foods
      WHERE user_id = $1
    `
    const result = await pool.query(query, [userId])
    return result.rows[0]
  }

  static async delete(id, userId) {
    const query = 'DELETE FROM foods WHERE id = $1 AND user_id = $2 RETURNING *'
    const result = await pool.query(query, [id, userId])
    return result.rows[0]
  }

  static async findById(id, userId) {
    const query = 'SELECT * FROM foods WHERE id = $1 AND user_id = $2'
    const result = await pool.query(query, [id, userId])
    return result.rows[0]
  }
}

export default Food
