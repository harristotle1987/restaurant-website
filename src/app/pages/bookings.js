import db from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, phone, date, time, guests, message } = req.body
    
    try {
      await db.query(
        `INSERT INTO bookings (name, email, phone, date, time, guests, message)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [name, email, phone, date, time, guests, message || '']
      )
      
      return res.status(201).json({ success: true })
    } catch (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}