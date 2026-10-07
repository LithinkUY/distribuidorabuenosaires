import { getPool } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Cache-Control, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { products, categories, storeSettings } = req.body || {};
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Sync categories if provided
    if (Array.isArray(categories) && categories.length > 0) {
      for (const c of categories) {
        if (!c.id || !c.name) continue;
        const slug =
          c.slug ||
          c.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        await client.query(
          `INSERT INTO categories (id, name, slug, description)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             slug = EXCLUDED.slug,
             description = EXCLUDED.description;`,
          [c.id, c.name, slug, c.description || '']
        );
      }
    }

    // 2. Sync products if provided
    if (Array.isArray(products) && products.length > 0) {
      for (const p of products) {
        if (!p.id || !p.name) continue;
        await client.query(
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
            p.category || 'General',
            p.currency || 'ARS',
            p.priceUSD || 0,
            p.priceUYU || 0,
            p.priceARS || 0,
            p.stock || 0,
            p.sku || `SKU-${p.id}`,
            p.image || '',
            JSON.stringify(p.images || []),
            JSON.stringify(p.additionalImages || []),
            p.video || null,
            p.videoUrl || null,
            p.description || '',
            JSON.stringify(p.features || []),
            JSON.stringify(p.compatibleBrands || []),
            Boolean(p.isFeatured),
            p.material || '',
            p.rating || 5,
            p.reviewsCount || 0,
            JSON.stringify(p.variants || []),
          ]
        );
      }
    }

    // 3. Sync storeSettings if provided
    if (storeSettings && typeof storeSettings === 'object') {
      const s = storeSettings;
      await client.query(
        `INSERT INTO store_settings (
           id, business_name, company_legal_name, company_rut,
           company_phone, company_email, company_address, company_city,
           whatsapp_number, primary_color, header_bg_color, header_text_color,
           logo_url, logo_size, home_hero_title, home_hero_subtitle,
           default_currency, addresses, hero_slides, home_sections,
           menu_items, contact_section, footer_settings, alfombras_section,
           extra_data, updated_at
         ) VALUES (
           'default', $1, $2, $3,
           $4, $5, $6, $7,
           $8, $9, $10, $11,
           $12, $13, $14, $15,
           $16, $17, $18, $19,
           $20, $21, $22, $23,
           $24, CURRENT_TIMESTAMP
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
           logo_url = EXCLUDED.logo_url,
           logo_size = EXCLUDED.logo_size,
           home_hero_title = EXCLUDED.home_hero_title,
           home_hero_subtitle = EXCLUDED.home_hero_subtitle,
           default_currency = EXCLUDED.default_currency,
           addresses = EXCLUDED.addresses,
           hero_slides = EXCLUDED.hero_slides,
           home_sections = EXCLUDED.home_sections,
           menu_items = EXCLUDED.menu_items,
           contact_section = EXCLUDED.contact_section,
           footer_settings = EXCLUDED.footer_settings,
           alfombras_section = EXCLUDED.alfombras_section,
           extra_data = EXCLUDED.extra_data,
           updated_at = CURRENT_TIMESTAMP;`,
        [
          s.businessName || 'Distribuidora Buenos Aires',
          s.companyLegalName || '',
          s.companyRut || '',
          s.companyPhone || '',
          s.companyEmail || '',
          s.companyAddress || '',
          s.companyCity || '',
          s.whatsappNumber || '5491112345678',
          s.primaryColor || '#0055ff',
          s.headerBgColor || '#ffffff',
          s.headerTextColor || '#1e293b',
          s.logoUrl || null,
          parseInt(s.logoSize, 10) || 48,
          s.homeHeroTitle || '',
          s.homeHeroSubtitle || '',
          s.defaultCurrency || 'ARS',
          JSON.stringify(s.addresses || []),
          JSON.stringify(s.heroSlides || []),
          JSON.stringify(s.homeSections || []),
          JSON.stringify(s.menuItems || []),
          JSON.stringify(s.contactSection || {}),
          JSON.stringify(s.footerSettings || {}),
          JSON.stringify(s.alfombrasSection || {}),
          JSON.stringify(s),
        ]
      );
    }

    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'All data synced to Neon DB successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in /api/sync:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}


