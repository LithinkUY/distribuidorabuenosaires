import { getPool } from './db.js';

function rowToOrder(r) {
  return {
    id: r.id,
    orderNumber: r.order_number,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
    customerAddress: r.customer_address,
    customerCity: r.customer_city,
    carDetails: typeof r.car_details === 'string' ? JSON.parse(r.car_details) : r.car_details,
    items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
    totalUSD: parseFloat(r.total_usd),
    totalARS: parseFloat(r.total_ars),
    totalUYU: parseFloat(r.total_uyu),
    paidCurrency: r.paid_currency,
    status: r.status,
    paymentMethod: r.payment_method,
    createdAt: r.created_at,
    notes: r.notes,
    whatsappReminderSent: r.whatsapp_reminder_sent
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
      const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC;');
      const orders = result.rows.map(rowToOrder);
      return res.status(200).json(orders);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const o = req.body;
      if (!o || !o.id) {
        return res.status(400).json({ error: 'Order id is required' });
      }

      const query = `
        INSERT INTO orders (
          id, order_number, customer_name, customer_email,
          customer_phone, customer_address, customer_city,
          car_details, items, total_usd, total_ars, total_uyu,
          paid_currency, status, payment_method, created_at,
          notes, whatsapp_reminder_sent
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16,
          $17, $18
        )
        ON CONFLICT (id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          customer_email = EXCLUDED.customer_email,
          customer_phone = EXCLUDED.customer_phone,
          customer_address = EXCLUDED.customer_address,
          customer_city = EXCLUDED.customer_city,
          car_details = EXCLUDED.car_details,
          items = EXCLUDED.items,
          total_usd = EXCLUDED.total_usd,
          total_ars = EXCLUDED.total_ars,
          total_uyu = EXCLUDED.total_uyu,
          paid_currency = EXCLUDED.paid_currency,
          status = EXCLUDED.status,
          payment_method = EXCLUDED.payment_method,
          notes = EXCLUDED.notes,
          whatsapp_reminder_sent = EXCLUDED.whatsapp_reminder_sent
        RETURNING *;
      `;

      const values = [
        o.id,
        o.orderNumber || '',
        o.customerName || '',
        o.customerEmail || '',
        o.customerPhone || '',
        o.customerAddress || '',
        o.customerCity || '',
        JSON.stringify(o.carDetails || {}),
        JSON.stringify(o.items || []),
        o.totalUSD || 0,
        o.totalARS || 0,
        o.totalUYU || 0,
        o.paidCurrency || 'USD',
        o.status || 'Pendiente',
        o.paymentMethod || 'mercadopago',
        o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        o.notes || '',
        !!o.whatsappReminderSent
      ];

      const saved = await pool.query(query, values);
      return res.status(200).json(rowToOrder(saved.rows[0]));
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Order id is required for deletion' });
      }

      await pool.query('DELETE FROM orders WHERE id = $1;', [id]);
      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/orders:', error);
    return res.status(500).json({ error: error.message });
  }
}
