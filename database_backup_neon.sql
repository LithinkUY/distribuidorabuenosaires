-- =========================================================================
-- DISTRIBUIDORA BUENOS AIRES - BACKUP & SCHEMA POSTGRESQL / NEON DB
-- Generado para: https://github.com/LithinkUY/distribuidorabuenosaires
-- Fecha: 2026-10-07T19:33:40.483Z
-- =========================================================================

-- 1. TABLA: categories
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: products
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ARS',
  price_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price_uyu NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price_ars NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(100) NOT NULL UNIQUE,
  image TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  additional_images JSONB DEFAULT '[]'::jsonb,
  video TEXT,
  video_url TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  compatible_brands JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  material VARCHAR(255),
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) DEFAULT 'cliente123',
  phone VARCHAR(100),
  address TEXT,
  city VARCHAR(255),
  vehicles JSONB DEFAULT '[]'::jsonb,
  role VARCHAR(50) DEFAULT 'customer',
  status VARCHAR(50) DEFAULT 'Activo',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  order_number VARCHAR(100) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(100),
  customer_address TEXT,
  customer_city VARCHAR(255),
  car_details JSONB DEFAULT '{}'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_usd NUMERIC(12, 2) DEFAULT 0,
  total_ars NUMERIC(12, 2) DEFAULT 0,
  total_uyu NUMERIC(12, 2) DEFAULT 0,
  paid_currency VARCHAR(10) DEFAULT 'ARS',
  status VARCHAR(50) DEFAULT 'Pendiente',
  payment_method VARCHAR(50) DEFAULT 'mercadopago',
  notes TEXT,
  whatsapp_reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: reviews
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(100) PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  car_model VARCHAR(255),
  product_name VARCHAR(255),
  rating INTEGER DEFAULT 5,
  comment TEXT,
  date_text VARCHAR(100),
  verified_purchase BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: brands
CREATE TABLE IF NOT EXISTS brands (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: store_settings
CREATE TABLE IF NOT EXISTS store_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  business_name VARCHAR(255) DEFAULT 'Distribuidora Buenos Aires',
  company_legal_name VARCHAR(255),
  company_rut VARCHAR(100),
  company_phone VARCHAR(100),
  company_email VARCHAR(255),
  company_address TEXT,
  company_city VARCHAR(255),
  whatsapp_number VARCHAR(100),
  primary_color VARCHAR(50) DEFAULT '#0055ff',
  header_bg_color VARCHAR(50) DEFAULT '#ffffff',
  header_text_color VARCHAR(50) DEFAULT '#1e293b',
  hero_slides JSONB DEFAULT '[]'::jsonb,
  home_sections JSONB DEFAULT '[]'::jsonb,
  contact_section JSONB DEFAULT '{}'::jsonb,
  footer_settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- INSERTS DE DATOS INICIALES (ON CONFLICT DO UPDATE)
-- =========================================================================

-- INSERTS: categories
INSERT INTO categories (id, name, slug, description)
VALUES ('cat-eco-econ', 'Ecocuero línea económica', 'ecocuero-linea-economica', 'Fundas en ecocuero resistente y de fácil colocación con la mejor relación precio-calidad')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, slug, description)
VALUES ('cat-eco-bondeado', 'Ecocuero con bondeado línea intermedia', 'ecocuero-con-bondeado-linea-intermedia', 'Fundas acolchadas con espuma bondeada para mayor confort y durabilidad en el uso diario')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, slug, description)
VALUES ('cat-cuero-auto', 'Cuero automotor', 'cuero-automotor', 'Fundas de alta gama en cuero automotriz reforzado con terminación y textura original')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, slug, description)
VALUES ('cat-cuero-lumbar', 'Cuero automotor con soporte lumbar', 'cuero-automotor-con-soporte-lumbar', 'Fundas de máxima categoría con soportes lumbares y riñoneras anatómicas integradas')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, slug, description)
VALUES ('cat-alfombras', 'Alfombras', 'alfombras', 'Bandejas termoformadas 3D, 5D y juegos de alfombras para retención total de suciedad')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, slug, description)
VALUES ('cat-cubre-volantes', 'Cubre volantes', 'cubre-volantes', 'Cubrevolantes ergonómicos en cuero automotor y ecocuero con agarre deportivo')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, slug, description)
VALUES ('cat-accesorios', 'Accesorios', 'accesorios', 'Bandejas de baúl, almohadillas cervicales, organizadores y accesorios para tu vehículo')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- INSERTS: products
INSERT INTO products (
  id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images, additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants
) VALUES (
  'prod-bondeado-kit-150k',
  'Línea Intermedia - Ecocuero Premium con Bondeado (Kit Completo)',
  'Ecocuero con bondeado línea intermedia',
  'ARS',
  120,
  4800,
  150000,
  40,
  'DBA-BOND-KIT-150K',
  '/src/assets/images/product_ecocuero_bondeado_kit_completo.jpg',
  '["/src/assets/images/product_ecocuero_bondeado_kit_completo.jpg","/src/assets/images/product_ecocuero_bondeado_variantes.jpg"]'::jsonb,
  '["/src/assets/images/product_ecocuero_bondeado_variantes.jpg"]'::jsonb,
  'Juego completo de fundas universales en Ecocuero Premium acolchado con espuma bondeada de alta densidad. Incluye fundas para las 2 butacas delanteras y el juego trasero completo (asiento y respaldo) más apoyacabezas. Terminación acanalada vertical con soporte mullido, gran resistencia al desgaste y fácil mantenimiento.',
  '["Kit Completo: 2 butacas delanteras + asiento y respaldo trasero + apoyacabezas","Espuma bondeada acolchada de alta densidad para máximo confort","Ecocuero automotor premium: impermeable, suave y lavable con paño húmedo","Costuras acanaladas verticales reforzadas que mantienen la forma original","4 opciones de combinación: Gris/Plata, Rojo, Azul y Negro pleno","Calce anatómico universal apto para autos y camionetas de 5 plazas","Incluye elásticos reforzados y kit de ganchos metálicos para fijación firme"]'::jsonb,
  '["Universal","Toyota","Volkswagen","Ford","Chevrolet","Fiat","Renault","Peugeot","Nissan","Honda","Jeep","Citroën"]'::jsonb,
  true,
  'Ecocuero Premium con Bondeado',
  5,
  28,
  '[{"id":"var-gris","name":"Negro con Franjas Grises / Plata","stock":15,"priceExtraUSD":0,"image":"/src/assets/images/product_ecocuero_bondeado_kit_completo.jpg"},{"id":"var-rojo","name":"Negro con Franjas Rojas","stock":10,"priceExtraUSD":0,"image":"/src/assets/images/product_ecocuero_bondeado_variantes.jpg"},{"id":"var-azul","name":"Negro con Franjas Azules","stock":8,"priceExtraUSD":0,"image":"/src/assets/images/product_ecocuero_bondeado_variantes.jpg"},{"id":"var-negro","name":"Negro Pleno (Total Black)","stock":7,"priceExtraUSD":0,"image":"/src/assets/images/product_ecocuero_bondeado_variantes.jpg"}]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  stock = EXCLUDED.stock;
INSERT INTO products (
  id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images, additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants
) VALUES (
  'prod-1',
  'Juego de Fundas Ecocuero Línea Económica (Juego Completo)',
  'Ecocuero línea económica',
  'ARS',
  85,
  3400,
  106250,
  45,
  'DBA-ECO-ECON-01',
  '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  'Juego completo de fundas universales para asientos delanteros y traseros en ecocuero resistente de fácil limpieza. Ideal para proteger el tapizado original con la mejor relación costo-beneficio para autos y camionetas.',
  '["Instalación rápida con elásticos y ganchos reforzados","Fácil limpieza con paño húmedo","Protección contra manchas, polvo y desgaste diario","Compatible con butacas delanteras y respaldos traseros"]'::jsonb,
  '["Universal","Toyota","Volkswagen","Ford","Chevrolet","Fiat","Renault","Peugeot"]'::jsonb,
  true,
  'Ecocuero Automotriz',
  4.8,
  48,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  stock = EXCLUDED.stock;
INSERT INTO products (
  id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images, additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants
) VALUES (
  'prod-2',
  'Juego de Fundas Ecocuero con Bondeado Intermedio - Costura Diamante',
  'Ecocuero con bondeado línea intermedia',
  'ARS',
  130,
  5200,
  162500,
  30,
  'DBA-ECO-BOND-02',
  '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  'Fundas completas acolchadas con espuma bondeada de 5mm para mayor cuerpo, mullidez y confort. Aporta un diseño elegante con costura en rombos/diamante que no se deforma con el uso continuo.',
  '["Espuma bondeada de 5mm de alta densidad para máxima comodidad","Costura capitoné diamante reforzada antidesgarro","Textura suave, acolchada y respirable","Excelente calce anatómico para autos y camionetas"]'::jsonb,
  '["Universal","Toyota","Volkswagen","Ford","Chevrolet","Nissan","Jeep","Renault"]'::jsonb,
  true,
  'Ecocuero con Espuma Bondeada 5mm',
  4.9,
  38,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  stock = EXCLUDED.stock;
INSERT INTO products (
  id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images, additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants
) VALUES (
  'prod-3',
  'Juego de Fundas Cuero Automotor Premium',
  'Cuero automotor',
  'ARS',
  190,
  7600,
  237500,
  22,
  'DBA-CUERO-AUTO-03',
  '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  'Fundas de máxima calidad elaboradas en cuero automotriz de 1.2mm de espesor. Terminación y textura idéntica al tapizado original de fábrica, alta resistencia al roce intensivo y apto para despliegue de airbags.',
  '["Cuero automotor de 1.2mm de máxima durabilidad","Terminación y textura idéntica a tapizado de fábrica","Aptas para airbags laterales y apoyacabezas","Garantía oficial por 3 años"]'::jsonb,
  '["Universal","Toyota","Volkswagen","Ford","Chevrolet","Audi","BMW","Honda","Jeep"]'::jsonb,
  true,
  'Cuero Automotor 1.2mm',
  5,
  56,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  stock = EXCLUDED.stock;
INSERT INTO products (
  id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images, additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants
) VALUES (
  'prod-4',
  'Juego de Fundas Cuero Automotor con Soporte Lumbar Ergonómico',
  'Cuero automotor con soporte lumbar',
  'ARS',
  240,
  9600,
  300000,
  18,
  'DBA-CUERO-LUMB-04',
  '/src/assets/images/product_cubreasiento_deportivo_alcantara_1791205503234.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  'Línea de máxima jerarquía con soporte lumbar anatómico y almohadillas ortopédicas laterales integradas. Brinda una postura de manejo perfecta, aliviando tensiones en la espalda durante viajes largos y uso diario exigente.',
  '["Soporte lumbar ergonómico ortopédico integrado","Refuerzos laterales para contención de cintura y riñones","Cuero automotor microperforado para ventilación térmica","Ajuste firme que no se desplaza con el uso"]'::jsonb,
  '["Universal","Toyota","Volkswagen","Ford","Chevrolet","Audi","BMW","Mercedes-Benz"]'::jsonb,
  true,
  'Cuero Automotor & Soporte Lumbar Ergonómico',
  5,
  34,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  stock = EXCLUDED.stock;
INSERT INTO products (
  id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images, additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants
) VALUES (
  'prod-5',
  'Alfombras Termoformadas 3D Bandeja Profunda (Set Completo)',
  'Alfombras',
  'ARS',
  110,
  4400,
  137500,
  35,
  'DBA-ALF-3D-05',
  '/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  'Set de alfombras con borde perimetral elevado de 5cm para retener barro, líquidos, arena y suciedad. Material TPE inodoro, antideslizante y lavable en segundos con hidrolavadora.',
  '["Borde elevado antiderrame de 5 cm de contención total","Material TPE virgen inodoro y 100% lavable","Fijación antideslizante con anclajes","Protección total del piso original de autos y camionetas"]'::jsonb,
  '["Universal","Toyota","Volkswagen","Ford","Chevrolet","Nissan","Hyundai","Renault"]'::jsonb,
  true,
  'Polímero Termoplástico TPE 3D',
  4.8,
  36,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  stock = EXCLUDED.stock;
INSERT INTO products (
  id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images, additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants
) VALUES (
  'prod-6',
  'Cubre Volante Cuero Automotor Microperforado con Kit de Coser',
  'Cubre volantes',
  'ARS',
  25,
  1000,
  31250,
  60,
  'DBA-VOL-CUERO-06',
  '/src/assets/images/product_cubreasiento_deportivo_alcantara_1791205503234.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  'Funda para volante en cuero automotor microperforado de agarre deportivo. Incluye aguja e hilo encerado para una colocación firme al milímetro que renueva por completo la sensación de manejo.',
  '["Grip antideslizante de textura microperforada","Incluye aguja e hilo encerado de alta resistencia","Se adapta a volantes de 37cm a 39cm de diámetro","Terminación deportiva profesional sin costuras molestas"]'::jsonb,
  '["Universal"]'::jsonb,
  false,
  'Cuero Automotor Microperforado',
  4.9,
  42,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  stock = EXCLUDED.stock;
INSERT INTO products (
  id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images, additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants
) VALUES (
  'prod-7',
  'Cubrebaúl Termoformado Rígido con Superficie Antideslizante',
  'Accesorios',
  'ARS',
  85,
  3400,
  106250,
  22,
  'DBA-ACC-BAUL-07',
  '/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  'Bandeja protectora para el baúl con borde perimetral que evita el traspaso de suciedad, líquidos, herramientas o cochecitos al piso alfombrado original.',
  '["Borde perimetral antiderrames de 4cm","Resistente a aceites, solventes y productos químicos","Fácil extracción y limpieza rápida","Superficie antideslizante de alta resistencia"]'::jsonb,
  '["Universal","Toyota","Volkswagen","Ford","Chevrolet","Peugeot","Renault"]'::jsonb,
  false,
  'TPE Rígido Antideslizante',
  4.9,
  19,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  stock = EXCLUDED.stock;
INSERT INTO products (
  id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images, additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants
) VALUES (
  'prod-8',
  'Kit Premium Almohadillas Cervicales Viscoelásticas (Par)',
  'Accesorios',
  'ARS',
  35,
  1400,
  43750,
  45,
  'DBA-ACC-CERV-08',
  '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  'Par de almohadillas cervicales ergonómicas en cuero con interior de memory foam. Apoyo perfecto para cuello y nuca que reduce el cansancio en viajes cortos y largos.',
  '["Espuma con memoria viscoelástica (Memory Foam)","Funda exterior desmontable y lavable","Correa elástica de sujeción al apoyacabezas","Diseño ergonómico para descanso cervical"]'::jsonb,
  '["Universal"]'::jsonb,
  false,
  'Cuero Ecológico & Memory Foam',
  4.8,
  31,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  stock = EXCLUDED.stock;

-- INSERTS: users
INSERT INTO users (id, name, email, password_hash, phone, address, city, vehicles, role, status, created_at)
VALUES (
  'usr-1',
  'Juan Ignacio Pérez',
  'juan.perez@gmail.com',
  'cliente123',
  '+598 99 234 567',
  'Av. Brasil 2450, Apto 501',
  'Montevideo, Pocitos',
  '[{"brand":"Toyota","model":"Hilux SRV","year":"2023"},{"brand":"Volkswagen","model":"Nivus Highline","year":"2024"}]'::jsonb,
  'customer',
  'Activo',
  '2026-08-15T10:00:00Z'
) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
INSERT INTO users (id, name, email, password_hash, phone, address, city, vehicles, role, status, created_at)
VALUES (
  'usr-2',
  'Administrador General',
  'admin@distribuidorabuenosaires.com',
  'admin123',
  '+54 9 11 1234 5678',
  'Franklin D. Roosevelt 1700',
  'CABA, Buenos Aires',
  '[{"brand":"Ford","model":"Ranger Raptor","year":"2024"}]'::jsonb,
  'admin',
  'Activo',
  '2026-01-01T00:00:00Z'
) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
INSERT INTO users (id, name, email, password_hash, phone, address, city, vehicles, role, status, created_at)
VALUES (
  'usr-2-legacy',
  'Administrador (La Casa del Cubreasiento)',
  'admin@lacasadelcubreasiento.com',
  'admin123',
  '+54 9 11 1234 5678',
  'Franklin D. Roosevelt 1700',
  'CABA, Buenos Aires',
  '[{"brand":"Ford","model":"Ranger Raptor","year":"2024"}]'::jsonb,
  'admin',
  'Activo',
  '2026-01-01T00:00:00Z'
) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
INSERT INTO users (id, name, email, password_hash, phone, address, city, vehicles, role, status, created_at)
VALUES (
  'usr-3',
  'Carolina Méndez',
  'caro.mendez@empresa.com',
  'cliente123',
  '+598 94 555 123',
  'Bvar. Artigas 1200',
  'Montevideo',
  '[{"brand":"Chevrolet","model":"Tracker","year":"2022"}]'::jsonb,
  'customer',
  'Pendiente',
  '2026-10-05T14:10:00Z'
) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
INSERT INTO users (id, name, email, password_hash, phone, address, city, vehicles, role, status, created_at)
VALUES (
  'usr-4',
  'Martín Delgado',
  'martin.delgado@correo.uy',
  'cliente123',
  '+598 92 888 777',
  'Av. 8 de Octubre 3100',
  'Montevideo',
  '[{"brand":"Nissan","model":"Frontier","year":"2021"}]'::jsonb,
  'customer',
  'Rechazado',
  '2026-10-04T16:20:00Z'
) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

-- INSERTS: orders
INSERT INTO orders (
  id, order_number, customer_name, customer_email, customer_phone, customer_address, customer_city, car_details, items, total_usd, total_ars, total_uyu, paid_currency, status, payment_method, notes, whatsapp_reminder_sent, created_at
) VALUES (
  'ord-101',
  'DBA-9821',
  'Juan Ignacio Pérez',
  'juan.perez@gmail.com',
  '+598 99 234 567',
  'Av. Brasil 2450, Apto 501',
  'Montevideo, Pocitos',
  '{"brand":"Toyota","model":"Hilux SRV","year":"2023"}'::jsonb,
  '[{"productId":"prod-2","productName":"Juego de Fundas Ecocuero con Bondeado Intermedio - Costura Diamante","price":130,"currency":"USD","quantity":1,"image":"/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg","customization":{"stitchingColor":"Rojo Ferrari"}},{"productId":"prod-5","productName":"Alfombras Termoformadas 3D Bandeja Profunda (Set Completo)","price":110,"currency":"USD","quantity":1,"image":"/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg"}]'::jsonb,
  240,
  300000,
  9600,
  'USD',
  'En Preparación',
  'mercadopago',
  'Cliente solicitó fundas en color negro con costura diamante.',
  true,
  '2026-10-02T14:30:00Z'
) ON CONFLICT (order_number) DO UPDATE SET status = EXCLUDED.status, total_ars = EXCLUDED.total_ars;
INSERT INTO orders (
  id, order_number, customer_name, customer_email, customer_phone, customer_address, customer_city, car_details, items, total_usd, total_ars, total_uyu, paid_currency, status, payment_method, notes, whatsapp_reminder_sent, created_at
) VALUES (
  'ord-102',
  'DBA-9822',
  'Lucía Fernández',
  'lucia.fdez@montevideo.com.uy',
  '+59898765432',
  'Rambla República de México 5400',
  'Montevideo, Carrasco',
  '{"brand":"Volkswagen","model":"Nivus Highline","year":"2024"}'::jsonb,
  '[{"productId":"prod-4","productName":"Juego de Fundas Cuero Automotor con Soporte Lumbar Ergonómico","price":240,"currency":"USD","quantity":1,"image":"/src/assets/images/product_cubreasiento_deportivo_alcantara_1791205503234.jpg"}]'::jsonb,
  240,
  300000,
  9600,
  'USD',
  'Pendiente',
  'transferencia',
  'Esperando comprobante de transferencia bancaria BROU.',
  false,
  '2026-10-04T09:15:00Z'
) ON CONFLICT (order_number) DO UPDATE SET status = EXCLUDED.status, total_ars = EXCLUDED.total_ars;
INSERT INTO orders (
  id, order_number, customer_name, customer_email, customer_phone, customer_address, customer_city, car_details, items, total_usd, total_ars, total_uyu, paid_currency, status, payment_method, notes, whatsapp_reminder_sent, created_at
) VALUES (
  'ord-103',
  'DBA-9823',
  'Martín Benítez',
  'martin.benitez@empresa.com.ar',
  '+5491145238890',
  'Av. Libertador 7200',
  'Buenos Aires, Nuñez',
  '{"brand":"Ford","model":"Ranger Raptor","year":"2023"}'::jsonb,
  '[{"productId":"prod-3","productName":"Juego de Fundas Cuero Automotor Premium","price":190,"currency":"USD","quantity":1,"image":"/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg"},{"productId":"prod-7","productName":"Cubrebaúl Termoformado Rígido con Superficie Antideslizante","price":85,"currency":"USD","quantity":1,"image":"/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg"}]'::jsonb,
  275,
  343750,
  11000,
  'ARS',
  'Pagado',
  'tarjeta',
  'Pago aprobado en 3 cuotas sin interés.',
  true,
  '2026-10-03T18:40:00Z'
) ON CONFLICT (order_number) DO UPDATE SET status = EXCLUDED.status, total_ars = EXCLUDED.total_ars;
INSERT INTO orders (
  id, order_number, customer_name, customer_email, customer_phone, customer_address, customer_city, car_details, items, total_usd, total_ars, total_uyu, paid_currency, status, payment_method, notes, whatsapp_reminder_sent, created_at
) VALUES (
  'ord-104',
  'DBA-9824',
  'Gonzalo Méndez',
  'gmendez99@hotmail.com',
  '+59891234890',
  'Calle 24 entre 27 y 28',
  'Punta del Este, Maldonado',
  '{"brand":"Audi","model":"Q5 45 TFSI","year":"2022"}'::jsonb,
  '[{"productId":"prod-1","productName":"Juego de Fundas Ecocuero Línea Económica (Juego Completo)","price":85,"currency":"USD","quantity":1,"image":"/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg"}]'::jsonb,
  85,
  106250,
  3400,
  'UYU',
  'Despachado',
  'mercadopago',
  'Despachado por Agencia Central con número de rastreo #DAC-88410.',
  true,
  '2026-09-28T11:20:00Z'
) ON CONFLICT (order_number) DO UPDATE SET status = EXCLUDED.status, total_ars = EXCLUDED.total_ars;
INSERT INTO orders (
  id, order_number, customer_name, customer_email, customer_phone, customer_address, customer_city, car_details, items, total_usd, total_ars, total_uyu, paid_currency, status, payment_method, notes, whatsapp_reminder_sent, created_at
) VALUES (
  'ord-105',
  'DBA-9825',
  'Valeria Soria',
  'valeria.soria@adinet.com.uy',
  '+59894455667',
  'Bulevar Artigas 1420',
  'Montevideo, Tres Cruces',
  '{"brand":"Chevrolet","model":"Tracker Premier","year":"2024"}'::jsonb,
  '[{"productId":"prod-5","productName":"Alfombras Termoformadas 3D Bandeja Profunda (Set Completo)","price":110,"currency":"USD","quantity":1,"image":"/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg"},{"productId":"prod-6","productName":"Cubre Volante Cuero Automotor Microperforado con Kit de Coser","price":25,"currency":"USD","quantity":1,"image":"/src/assets/images/product_cubreasiento_deportivo_alcantara_1791205503234.jpg"}]'::jsonb,
  135,
  168750,
  5400,
  'USD',
  'Entregado',
  'efectivo',
  'Retiró en sucursal central.',
  true,
  '2026-09-20T16:00:00Z'
) ON CONFLICT (order_number) DO UPDATE SET status = EXCLUDED.status, total_ars = EXCLUDED.total_ars;

-- INSERTS: reviews
INSERT INTO reviews (id, author, car_model, product_name, rating, comment, date_text, verified_purchase, is_approved)
VALUES (
  'rev-1',
  'Esteban Larrosa',
  'Toyota Hilux 2023',
  'Juego de Fundas Ecocuero con Bondeado Intermedio',
  5,
  'Impresionante calidad. Quedaron como si el tapizado viniera de fábrica. El acolchado bondeado le da un confort bárbaro. Recomiendo 100%.',
  'Hace 4 días',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment, rating = EXCLUDED.rating;
INSERT INTO reviews (id, author, car_model, product_name, rating, comment, date_text, verified_purchase, is_approved)
VALUES (
  'rev-2',
  'Mariana Duarte',
  'Volkswagen Nivus 2024',
  'Alfombras Termoformadas 3D Bandeja Profunda',
  5,
  'Las alfombras encajaron perfecto. Ya las probé con lluvia y barro, se sacan y lavan con manguera en 1 minuto.',
  'Hace 1 semana',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment, rating = EXCLUDED.rating;
INSERT INTO reviews (id, author, car_model, product_name, rating, comment, date_text, verified_purchase, is_approved)
VALUES (
  'rev-3',
  'Federico Balbi',
  'Ford Ranger XLT',
  'Juego de Fundas Cuero Automotor con Soporte Lumbar',
  5,
  'El soporte lumbar cambia todo en los viajes largos en ruta. Excelente agarre, calidad de terminación y rápida entrega.',
  'Hace 2 semanas',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment, rating = EXCLUDED.rating;
INSERT INTO reviews (id, author, car_model, product_name, rating, comment, date_text, verified_purchase, is_approved)
VALUES (
  'rev-4',
  'Carlos Silveira',
  'Chevrolet Tracker 2022',
  'Cubrebaúl Termoformado Rígido con Superficie Antideslizante',
  4,
  'Muy buena terminación, protege el piso del baúl cuando cargás compras o el perro. Llegó en 48hs al interior.',
  'Hace 3 semanas',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment, rating = EXCLUDED.rating;

-- INSERTS: brands
INSERT INTO brands (id, name) VALUES ('brand-1', 'Universal') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-2', 'Toyota') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-3', 'Volkswagen') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-4', 'Ford') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-5', 'Chevrolet') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-6', 'Fiat') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-7', 'Renault') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-8', 'Peugeot') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-9', 'Nissan') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-10', 'Honda') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-11', 'Jeep') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-12', 'Citroën') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-13', 'Audi') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-14', 'BMW') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-15', 'Mercedes-Benz') ON CONFLICT (name) DO NOTHING;
INSERT INTO brands (id, name) VALUES ('brand-16', 'Hyundai') ON CONFLICT (name) DO NOTHING;

-- INSERTS: store_settings
INSERT INTO store_settings (
  id, business_name, company_legal_name, company_rut, company_phone, company_email, company_address, company_city, whatsapp_number, primary_color, header_bg_color, header_text_color, hero_slides, home_sections, contact_section, footer_settings
) VALUES (
  'default',
  'Distribuidora Buenos Aires',
  'Distribuidora Buenos Aires S.A.S.',
  '21.849.201.0018',
  '+54 9 11 1234-5678',
  'ventas@distribuidorabuenosaires.com',
  'Franklin D. Roosevelt 1700',
  'C1772 CABA, Buenos Aires, Argentina',
  '5491112345678',
  '#0055ff',
  '#ffffff',
  '#1e293b',
  '[{"id":"slide-1","type":"image","mediaUrl":"/src/assets/images/hero_car_interior_dark_red_1791205466989.jpg","title":"DISTRIBUIDORA BUENOS AIRES","subtitle":"Fundas a medida y accesorios de alta durabilidad con colocación profesional garantizada y stock permanente.","buttonText":"Explorar Catálogo"}]'::jsonb,
  '[{"id":"productos","title":"Colección & Productos","subtitle":"Calidad Premium","visible":true},{"id":"alfombras","title":"Bandejas 3D Antiderrame","subtitle":"Calce Original","visible":true},{"id":"resenas","title":"Opiniones de Clientes","subtitle":"","visible":true}]'::jsonb,
  '{"badge":"Datos de contacto de la tienda","title":"Contactate con Nuestro Equipo","description":"Atención personalizada para la elección del material, pedidos mayoristas y envíos a todo el país.","locationTitle":"Sede Central & Showroom","locationAddress":"Franklin D. Roosevelt 1700, C1772 Cdad. Autónoma de Buenos Aires, Argentina","hoursTitle":"Horarios de Atención","hoursText":"Lunes a Viernes: 08:30 a 18:30 hs · Sábados: 09:00 a 13:00 hs","phonesTitle":"Líneas de Atención Telefónica","phonesText":"+54 9 11 1234-5678 · WhatsApp Ventas: +54 9 11 1234-5678","whatsappButtonText":"Hablar con un Asesor por WhatsApp","whatsappNumber":"5491112345678","whatsappMessage":"¡Hola! Quisiera realizar una consulta a Distribuidora Buenos Aires sobre sus productos y envíos.","cardTitle":"Ubicacion","cardDescription":"Franklin D. Roosevelt 1700, C1772 Cdad. Autónoma de Buenos Aires, Argentina","features":[],"guaranteeLabel":"Garantía Escrita","guaranteeText":"3 Años de Cobertura Total","mapIframeUrl":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.9992332500856!2d-58.45380459999999!3d-34.5535748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb42dd70c6349%3A0x3a03ff44b1ea6ef3!2sFranklin%20D.%20Roosevelt%201700%2C%20C1772%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires%2C%20Argentina!5e0!3m2!1ses!2suy!4v1791325820777!5m2!1ses!2suy","mapGoogleLink":"https://maps.google.com/?q=Franklin+D.+Roosevelt+1700,+C1772+Buenos+Aires,+Argentina"}'::jsonb,
  '{"aboutText":"Distribuidora líder en cubreasientos, fundas para vehículos y accesorios automotrices de alta calidad en stock permanente para despacho inmediato.","column2Title":"Colección & Catálogo","links":[{"id":"fl-1","label":"Probador Virtual 3D","actionType":"fitter","target":""},{"id":"fl-2","label":"Fundas Cuero Automotor","actionType":"section","target":"productos"},{"id":"fl-3","label":"Alfombras & Accesorios","actionType":"section","target":"productos"},{"id":"fl-4","label":"Venta Mayorista & Distribuidores","actionType":"wholesale","target":""}],"column3Title":"Tu Cuenta","column4Title":"Local Central","showroomAddress":"Franklin D. Roosevelt 1700, CABA, Argentina","showroomPhone":"WhatsApp: +54 9 11 1234-5678","showroomHours":"Horario: Lun a Vie 08:30 a 18:30 hs","badgeText":"Stock Inmediato y Envíos a Todo el País","copyrightText":"Todos los derechos reservados.","subText":"Distribuidora Buenos Aires · Envíos a Todo el País"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  company_address = EXCLUDED.company_address,
  contact_section = EXCLUDED.contact_section,
  footer_settings = EXCLUDED.footer_settings;
