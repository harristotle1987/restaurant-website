import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function testConnection() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful!');
    
    // Check table existence
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'menu_items'
      );
    `);
    
    console.log('Table "menu_items" exists:', res.rows[0].exists);
    
    // Test query
    const menuItems = await client.query('SELECT * FROM menu_items LIMIT 1');
    console.log('Sample menu item:', menuItems.rows[0] || 'No items found');
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error);
  } finally {
    await client.end();
  }
}

testConnection(); 