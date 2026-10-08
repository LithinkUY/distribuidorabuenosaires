import { getPool } from '../api/db.js';

async function migrate() {
  const pool = getPool();
  console.log('Ejecutando migracion de orders...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      order_number VARCHAR(50),
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      customer_address TEXT,
      customer_city TEXT,
      car_details JSONB,
      items JSONB,
      total_usd NUMERIC(10, 2),
      total_ars NUMERIC(15, 2),
      total_uyu NUMERIC(15, 2),
      paid_currency VARCHAR(10),
      status VARCHAR(50),
      payment_method VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      whatsapp_reminder_sent BOOLEAN DEFAULT false
    );
  `);

  console.log('Tabla orders creada exitosamente.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
