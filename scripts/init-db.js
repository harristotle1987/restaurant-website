import pg from 'pg';

const { Client } = pg;

// Database configuration - use environment variables
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'restaurant_db',
  password: process.env.DB_PASSWORD || 'Colony082987@',
  port: parseInt(process.env.DB_PORT || '5432'),
};

async function initDatabase() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Database connected!');

    // Create tables
    console.log('Creating tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        popular BOOLEAN DEFAULT false
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        guests INT NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample menu data
    console.log('Inserting sample menu data...');
    await client.query(`
      INSERT INTO menu_items (name, description, price, category, popular)
      VALUES 
        ('Truffle Arancini', 'Risotto balls with black truffle', 12.95, 'appetizers', true),
        ('Seared Scallops', 'With cauliflower puree and caviar', 16.50, 'appetizers', false),
        ('Filet Mignon', '8oz grass-fed beef, truffle mashed potatoes', 34.95, 'main', true),
        ('Wild Salmon', 'Pan-seared with lemon dill sauce', 26.75, 'main', false),
        ('Chocolate Soufflé', 'With vanilla ice cream', 10.50, 'desserts', true),
        ('Crème Brûlée', 'Classic vanilla bean', 9.25, 'desserts', false),
        ('Signature Cocktail', 'House special with seasonal ingredients', 14.00, 'drinks', false),
        ('Wine Flight', 'Three 3oz pours of selected wines', 18.50, 'drinks', true)
      ON CONFLICT DO NOTHING;
    `);

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

initDatabase();