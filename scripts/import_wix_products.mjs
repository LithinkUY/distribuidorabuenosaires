// Importa los productos del catálogo Wix (digital fundas) a Neon DB.
// Descarga las imágenes a /public/wix para no depender de Wix.
// Uso: node scripts/import_wix_products.mjs
import fs from 'fs';
import path from 'path';
import { getPool } from '../api/db.js';

const SRC = JSON.parse(fs.readFileSync(new URL('./data/wix_products.json', import.meta.url), 'utf8'));
const OUT_DIR = path.resolve('public/wix');
fs.mkdirSync(OUT_DIR, { recursive: true });

const META = {
  'funda-gamuza-deportiva': { id: 'wix-kit-bondeado', category: 'Ecocuero con bondeado línea intermedia', material: 'Eco cuero Premium con bondeado' },
  'cobertor-textil-ajustado': { id: 'wix-kit-cuero-sin-lumbar', category: 'Cuero automotor', material: 'Cuero automotor 4mm' },
  'funda-cuero-premium': { id: 'wix-kit-cuero-con-lumbar', category: 'Cuero automotor con soporte lumbar', material: 'Cuero automotor 4mm' },
  'funda-deportiva-acolchada': { id: 'wix-2-butacas-bondeado', category: 'Ecocuero con bondeado línea intermedia', material: 'Eco cuero Premium con bondeado' },
  'cobertor-capitoneado': { id: 'wix-combo-bondeado', category: 'Combos', material: 'Eco cuero Premium con bondeado' },
  'funda-confort-viscoel%C3%A1stica': { id: 'wix-combo-cuero-sin-lumbar', category: 'Combos', material: 'Cuero automotor 4mm' },
  'protector-base-asiento': { id: 'wix-combo-cuero-con-lumbar', category: 'Combos', material: 'Cuero automotor 4mm' },
  'funda-trasera-mascotas': { id: 'wix-funda-mascotas', category: 'Accesorios', material: 'Tela impermeable / Vinilo' },
  'protector-asiento-universal': { id: 'wix-protector-universal', category: 'Accesorios', material: 'Tela resistente al agua' },
};

const titleCase = (s) => s.replace(/\s+/g, ' ').trim();

async function download(url) {
  const file = url.split('/').pop().replace(/~mv2\.(webp|png|jpeg|jpg)$/i, '') + '.jpg';
  const dest = path.join(OUT_DIR, file);
  if (!fs.existsSync(dest)) {
    const res = await fetch(`${url}/v1/fit/w_1200,h_1200,q_85/file.jpg`);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
  return `/wix/${file}`;
}

function parseDesc(desc) {
  const clean = desc.replace(/\(https?:\/\/wa\.me[^)]*\)/g, '').replace(/COMPRAR( AHORA)?\s*$/gim, '').trim();
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  const features = lines.filter((l) => !/:$/.test(l) && l.length < 90 && lines.indexOf(l) > 0).slice(0, 8);
  return { description: clean, features };
}

const pool = getPool();

await pool.query(
  `INSERT INTO categories (id, name, slug, description) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
  ['cat-combos', 'Combos', 'combos', 'Kits de fundas + cubre volante + alfombras de goma']
).catch((e) => console.warn('categoría Combos:', e.message));

for (const p of SRC) {
  const meta = META[p.slug];
  const images = [];
  for (const u of p.images) {
    try { images.push(await download(u)); } catch (e) { console.warn('img', e.message); }
  }
  const { description, features } = parseDesc(p.desc);
  const opt = p.options[0];
  const variants = (opt?.values || []).map((v, i) => ({
    id: `${meta.id}-v${i + 1}`,
    name: v,
    stock: 20,
    priceExtraUSD: 0,
    image: images[i] || images[0],
  }));
  const priceARS = p.price;
  const product = {
    id: meta.id,
    name: titleCase(p.title),
    category: meta.category,
    currency: 'ARS',
    price_usd: Math.round(priceARS / 1250),
    price_uyu: 0,
    price_ars: priceARS,
    stock: 100,
    sku: meta.id.toUpperCase(),
    image: images[0] || '',
    images,
    description,
    features: features.length ? features : [opt ? `${opt.name}: ${opt.values.join(', ')}` : 'Calce perfecto'],
    material: opt && opt.name !== 'Color' && opt.name !== 'Tonalidad' ? `${meta.material}` : meta.material,
    variants,
    variantLabel: opt?.name || 'Variante',
  };

  await pool.query(
    `INSERT INTO products (id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images,
      additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, price_ars=EXCLUDED.price_ars,
       price_usd=EXCLUDED.price_usd, image=EXCLUDED.image, images=EXCLUDED.images, additional_images=EXCLUDED.additional_images,
       description=EXCLUDED.description, features=EXCLUDED.features, material=EXCLUDED.material, variants=EXCLUDED.variants,
       is_featured=EXCLUDED.is_featured`,
    [product.id, product.name, product.category, 'ARS', product.price_usd, 0, priceARS, product.stock, product.sku,
      product.image, JSON.stringify(images), JSON.stringify(images.slice(1)), description, JSON.stringify(product.features),
      JSON.stringify(['Universal']), true, product.material, 5, 0, JSON.stringify(variants)]
  );
  console.log(`✔ ${product.name}  (${images.length} imgs, ${variants.length} variantes, $${priceARS})`);
}

process.exit(0);
