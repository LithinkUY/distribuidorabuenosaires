import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../api/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

async function runBackup() {
  const pool = getPool();
  console.log('🔄 Conectando a Neon DB para realizar backup...');

  try {
    const productsRes = await pool.query('SELECT * FROM products ORDER BY created_at ASC;');
    const categoriesRes = await pool.query('SELECT * FROM categories ORDER BY name ASC;');
    const settingsRes = await pool.query('SELECT * FROM store_settings WHERE id = \'default\';');
    const ordersRes = await pool.query('SELECT * FROM orders ORDER BY created_at DESC;');
    const usersRes = await pool.query('SELECT * FROM users ORDER BY created_at ASC;');

    const backupData = {
      timestamp: new Date().toISOString(),
      productsCount: productsRes.rows.length,
      products: productsRes.rows,
      categories: categoriesRes.rows,
      settings: settingsRes.rows[0] || null,
      orders: ordersRes.rows,
      users: usersRes.rows,
    };

    const fileName = `backup_${Date.now()}.json`;
    const latestFileName = 'backup_latest.json';
    
    fs.writeFileSync(path.join(backupDir, fileName), JSON.stringify(backupData, null, 2), 'utf-8');
    fs.writeFileSync(path.join(backupDir, latestFileName), JSON.stringify(backupData, null, 2), 'utf-8');

    console.log(`✅ Backup completado exitosamente:`);
    console.log(`   - Archivo: backups/${fileName}`);
    console.log(`   - Archivo latest: backups/${latestFileName}`);
    console.log(`   - Productos guardados: ${productsRes.rows.length}`);
    console.log(`   - Categorías guardadas: ${categoriesRes.rows.length}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al realizar backup:', err);
    process.exit(1);
  }
}

runBackup();
