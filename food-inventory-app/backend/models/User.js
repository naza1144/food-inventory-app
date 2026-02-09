import pool from '../config/database.js'
import bcrypt from 'bcryptjs'

class User {
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10)
    const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `
    const values = [name, email, hashedPassword]
    const result = await pool.query(query, values)
    return result.rows[0]
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1'
    const result = await pool.query(query, [email])
    return result.rows[0]
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, created_at FROM users WHERE id = $1'
    const result = await pool.query(query, [id])
    return result.rows[0]
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword)
  }
}

export default User
