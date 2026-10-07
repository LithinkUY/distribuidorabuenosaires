import { getPool } from './db.js';

function rowToCategory(r) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description || '',
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
      const result = await pool.query('SELECT * FROM categories ORDER BY created_at ASC;');
      const categories = result.rows.map(rowToCategory);
      return res.status(200).json(categories);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const c = req.body;
      if (!c || !c.name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const id = c.id || `cat-${Date.now()}`;
      const slug =
        c.slug ||
        c.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      const query = `
        INSERT INTO categories (id, name, slug, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description
        RETURNING *;
      `;

      const result = await pool.query(query, [id, c.name, slug, c.description || '']);
      return res.status(200).json(rowToCategory(result.rows[0]));
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Category id is required' });
      }

      await pool.query('DELETE FROM categories WHERE id = $1;', [id]);
      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/categories:', error);
    return res.status(500).json({ error: error.message });
  }
}
