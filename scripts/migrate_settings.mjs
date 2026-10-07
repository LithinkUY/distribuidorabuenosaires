import { getPool } from '../api/db.js';

async function migrate() {
  const pool = getPool();
  console.log('🔄 Ejecutando migración en store_settings...');

  await pool.query(`
    ALTER TABLE store_settings
      ADD COLUMN IF NOT EXISTS logo_url TEXT,
      ADD COLUMN IF NOT EXISTS logo_size INTEGER DEFAULT 48,
      ADD COLUMN IF NOT EXISTS home_hero_title TEXT,
      ADD COLUMN IF NOT EXISTS home_hero_subtitle TEXT,
      ADD COLUMN IF NOT EXISTS default_currency VARCHAR(10) DEFAULT 'ARS',
      ADD COLUMN IF NOT EXISTS addresses JSONB,
      ADD COLUMN IF NOT EXISTS extra_data JSONB;
  `);

  console.log('✅ Columnas agregadas exitosamente a store_settings.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
