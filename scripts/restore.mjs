import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../api/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.join(__dirname, '..', 'backups');

async function runRestore(file) {
  const targetFile = file || path.join(backupDir, 'backup_latest.json');
  if (!fs.existsSync(targetFile)) {
    console.error(`❌ No se encontró archivo de backup en: ${targetFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(targetFile, 'utf-8');
  const backup = JSON.parse(raw);
  const pool = getPool();

  console.log(`🔄 Restaurando datos a Neon DB desde ${targetFile}...`);

  try {
    // 1. Restaurar Categorías
    if (Array.isArray(backup.categories)) {
      for (const c of backup.categories) {
        await pool.query(
          `INSERT INTO categories (id, name, slug, description)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             slug = EXCLUDED.slug,
             description = EXCLUDED.description;`,
          [c.id, c.name, c.slug, c.description || '']
        );
      }
      console.log(`✅ ${backup.categories.length} categorías restauradas.`);
    }

    // 2. Restaurar Productos
    if (Array.isArray(backup.products)) {
      for (const p of backup.products) {
        await pool.query(
          `INSERT INTO products (
             id, name, category, currency, price_usd, price_uyu, price_ars,
             stock, sku, image, images, additional_images, video, video_url,
             description, features, compatible_brands, is_featured, material,
             rating, reviews_count, variants
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7,
             $8, $9, $10, $11, $12, $13, $14,
             $15, $16, $17, $18, $19,
             $20, $21, $22
           )
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             category = EXCLUDED.category,
             currency = EXCLUDED.currency,
             price_usd = EXCLUDED.price_usd,
             price_uyu = EXCLUDED.price_uyu,
             price_ars = EXCLUDED.price_ars,
             stock = EXCLUDED.stock,
             sku = EXCLUDED.sku,
             image = EXCLUDED.image,
             images = EXCLUDED.images,
             additional_images = EXCLUDED.additional_images,
             video = EXCLUDED.video,
             video_url = EXCLUDED.video_url,
             description = EXCLUDED.description,
             features = EXCLUDED.features,
             compatible_brands = EXCLUDED.compatible_brands,
             is_featured = EXCLUDED.is_featured,
             material = EXCLUDED.material,
             rating = EXCLUDED.rating,
             reviews_count = EXCLUDED.reviews_count,
             variants = EXCLUDED.variants;`,
          [
            p.id,
            p.name,
            p.category,
            p.currency || 'ARS',
            p.price_usd || 0,
            p.price_uyu || 0,
            p.price_ars || 0,
            p.stock || 0,
            p.sku,
            p.image || '',
            typeof p.images === 'string' ? p.images : JSON.stringify(p.images || []),
            typeof p.additional_images === 'string' ? p.additional_images : JSON.stringify(p.additional_images || []),
            p.video || null,
            p.video_url || null,
            p.description || '',
            typeof p.features === 'string' ? p.features : JSON.stringify(p.features || []),
            typeof p.compatible_brands === 'string' ? p.compatible_brands : JSON.stringify(p.compatible_brands || []),
            Boolean(p.is_featured),
            p.material || '',
            p.rating || 5,
            p.reviews_count || 0,
            typeof p.variants === 'string' ? p.variants : JSON.stringify(p.variants || []),
          ]
        );
      }
      console.log(`✅ ${backup.products.length} productos restaurados.`);
    }

    // 3. Restaurar Settings
    if (backup.settings) {
      const s = backup.settings;
      await pool.query(
        `INSERT INTO store_settings (
           id, business_name, company_legal_name, company_rut,
           company_phone, company_email, company_address, company_city,
           whatsapp_number, primary_color, header_bg_color, header_text_color,
           hero_slides, home_sections, menu_items, contact_section,
           footer_settings, alfombras_section, updated_at
         ) VALUES (
           'default', $1, $2, $3,
           $4, $5, $6, $7,
           $8, $9, $10, $11,
           $12, $13, $14, $15,
           $16, $17, CURRENT_TIMESTAMP
         )
         ON CONFLICT (id) DO UPDATE SET
           business_name = EXCLUDED.business_name,
           company_legal_name = EXCLUDED.company_legal_name,
           company_rut = EXCLUDED.company_rut,
           company_phone = EXCLUDED.company_phone,
           company_email = EXCLUDED.company_email,
           company_address = EXCLUDED.company_address,
           company_city = EXCLUDED.company_city,
           whatsapp_number = EXCLUDED.whatsapp_number,
           primary_color = EXCLUDED.primary_color,
           header_bg_color = EXCLUDED.header_bg_color,
           header_text_color = EXCLUDED.header_text_color,
           hero_slides = EXCLUDED.hero_slides,
           home_sections = EXCLUDED.home_sections,
           menu_items = EXCLUDED.menu_items,
           contact_section = EXCLUDED.contact_section,
           footer_settings = EXCLUDED.footer_settings,
           alfombras_section = EXCLUDED.alfombras_section,
           updated_at = CURRENT_TIMESTAMP;`,
        [
          s.business_name,
          s.company_legal_name,
          s.company_rut,
          s.company_phone,
          s.company_email,
          s.company_address,
          s.company_city,
          s.whatsapp_number,
          s.primary_color,
          s.header_bg_color,
          s.header_text_color,
          typeof s.hero_slides === 'string' ? s.hero_slides : JSON.stringify(s.hero_slides || []),
          typeof s.home_sections === 'string' ? s.home_sections : JSON.stringify(s.home_sections || []),
          typeof s.menu_items === 'string' ? s.menu_items : JSON.stringify(s.menu_items || []),
          typeof s.contact_section === 'string' ? s.contact_section : JSON.stringify(s.contact_section || {}),
          typeof s.footer_settings === 'string' ? s.footer_settings : JSON.stringify(s.footer_settings || {}),
          typeof s.alfombras_section === 'string' ? s.alfombras_section : JSON.stringify(s.alfombras_section || {}),
        ]
      );
      console.log(`✅ Configuración del CMS y tienda restaurada.`);
    }

    console.log('🎉 Restauración completada con éxito.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante restauración:', err);
    process.exit(1);
  }
}

const fileArg = process.argv[2];
runRestore(fileArg);
