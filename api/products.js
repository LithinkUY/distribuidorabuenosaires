import { getPool } from './db.js';

function rowToProduct(r) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    currency: r.currency || 'ARS',
    priceUSD: parseFloat(r.price_usd) || 0,
    priceUYU: parseFloat(r.price_uyu) || 0,
    priceARS: parseFloat(r.price_ars) || 0,
    stock: parseInt(r.stock, 10) || 0,
    sku: r.sku,
    image: r.image,
    images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []),
    additionalImages: typeof r.additional_images === 'string' ? JSON.parse(r.additional_images) : (r.additional_images || []),
    video: r.video || undefined,
    videoUrl: r.video_url || undefined,
    description: r.description || '',
    features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || []),
    compatibleBrands: typeof r.compatible_brands === 'string' ? JSON.parse(r.compatible_brands) : (r.compatible_brands || []),
    isFeatured: Boolean(r.is_featured),
    material: r.material || '',
    rating: parseFloat(r.rating) || 5,
    reviewsCount: parseInt(r.reviews_count, 10) || 0,
    variants: typeof r.variants === 'string' ? JSON.parse(r.variants) : (r.variants || []),
  };
}

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

  const pool = getPool();

  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM products ORDER BY created_at ASC;');
      const products = result.rows.map(rowToProduct);
      return res.status(200).json(products);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const p = req.body;
      if (!p || !p.id || !p.name) {
        return res.status(400).json({ error: 'Product id and name are required' });
      }

      const query = `
        INSERT INTO products (
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
          variants = EXCLUDED.variants
        RETURNING *;
      `;

      const values = [
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
      ];

      const saved = await pool.query(query, values);
      return res.status(200).json(rowToProduct(saved.rows[0]));
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Product id is required for deletion' });
      }

      await pool.query('DELETE FROM products WHERE id = $1;', [id]);
      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/products:', error);
    return res.status(500).json({ error: error.message });
  }
}


