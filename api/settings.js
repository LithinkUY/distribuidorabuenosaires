import { getPool } from './db.js';

function rowToSettings(r) {
  return {
    businessName: r.business_name || 'Distribuidora Buenos Aires',
    companyLegalName: r.company_legal_name || '',
    companyRut: r.company_rut || '',
    companyPhone: r.company_phone || '',
    companyEmail: r.company_email || '',
    companyAddress: r.company_address || '',
    companyCity: r.company_city || '',
    whatsappNumber: r.whatsapp_number || '5491112345678',
    primaryColor: r.primary_color || '#0055ff',
    headerBgColor: r.header_bg_color || '#ffffff',
    headerTextColor: r.header_text_color || '#1e293b',
    heroSlides: typeof r.hero_slides === 'string' ? JSON.parse(r.hero_slides) : (r.hero_slides || []),
    homeSections: typeof r.home_sections === 'string' ? JSON.parse(r.home_sections) : (r.home_sections || []),
    menuItems: typeof r.menu_items === 'string' ? JSON.parse(r.menu_items) : (r.menu_items || []),
    contactSection: typeof r.contact_section === 'string' ? JSON.parse(r.contact_section) : (r.contact_section || undefined),
    footerSettings: typeof r.footer_settings === 'string' ? JSON.parse(r.footer_settings) : (r.footer_settings || undefined),
    alfombrasSection: typeof r.alfombras_section === 'string' ? JSON.parse(r.alfombras_section) : (r.alfombras_section || undefined),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pool = getPool();

  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM store_settings WHERE id = \'default\' LIMIT 1;');
      if (result.rows.length === 0) {
        return res.status(200).json(null);
      }
      return res.status(200).json(rowToSettings(result.rows[0]));
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const s = req.body;
      if (!s) {
        return res.status(400).json({ error: 'Settings object is required' });
      }

      const query = `
        INSERT INTO store_settings (
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
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;

      const values = [
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
        JSON.stringify(s.heroSlides || []),
        JSON.stringify(s.homeSections || []),
        JSON.stringify(s.menuItems || []),
        JSON.stringify(s.contactSection || {}),
        JSON.stringify(s.footerSettings || {}),
        JSON.stringify(s.alfombrasSection || {}),
      ];

      const result = await pool.query(query, values);
      return res.status(200).json(rowToSettings(result.rows[0]));
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/settings:', error);
    return res.status(500).json({ error: error.message });
  }
}
