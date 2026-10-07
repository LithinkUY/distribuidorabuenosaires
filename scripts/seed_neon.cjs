const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_5ljGiT1DMrXb@ep-shiny-wind-b518gn85-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const initialCategories = [
  { id: 'cat-eco-econ', name: 'Ecocuero línea económica', slug: 'ecocuero-linea-economica', description: 'Fundas en ecocuero resistente y de fácil colocación con la mejor relación precio-calidad' },
  { id: 'cat-eco-bondeado', name: 'Ecocuero con bondeado línea intermedia', slug: 'ecocuero-con-bondeado-linea-intermedia', description: 'Fundas acolchadas con espuma bondeada para mayor confort y durabilidad en el uso diario' },
  { id: 'cat-cuero-auto', name: 'Cuero automotor', slug: 'cuero-automotor', description: 'Fundas de alta gama en cuero automotriz reforzado con terminación y textura original' },
  { id: 'cat-cuero-lumbar', name: 'Cuero automotor con soporte lumbar', slug: 'cuero-automotor-con-soporte-lumbar', description: 'Fundas de máxima categoría con soportes lumbares y riñoneras anatómicas integradas' },
  { id: 'cat-alfombras', name: 'Alfombras', slug: 'alfombras', description: 'Bandejas termoformadas 3D, 5D y juegos de alfombras para retención total de suciedad' },
  { id: 'cat-cubre-volantes', name: 'Cubre volantes', slug: 'cubre-volantes', description: 'Cubrevolantes ergonómicos en cuero automotor y ecocuero con agarre deportivo' },
  { id: 'cat-accesorios', name: 'Accesorios', slug: 'accesorios', description: 'Bandejas de baúl, almohadillas cervicales, organizadores y accesorios para tu vehículo' },
];

const initialProducts = [
  {
    id: 'prod-bondeado-kit-150k',
    name: 'Línea Intermedia - Ecocuero Premium con Bondeado (Kit Completo)',
    category: 'Ecocuero con bondeado línea intermedia',
    currency: 'ARS',
    priceUSD: 120,
    priceUYU: 4800,
    priceARS: 150000,
    stock: 40,
    sku: 'DBA-BOND-KIT-150K',
    image: '/src/assets/images/product_ecocuero_bondeado_kit_completo.jpg',
    images: [
      '/src/assets/images/product_ecocuero_bondeado_kit_completo.jpg',
      '/src/assets/images/product_ecocuero_bondeado_variantes.jpg',
    ],
    additionalImages: [
      '/src/assets/images/product_ecocuero_bondeado_variantes.jpg',
    ],
    description: 'Juego completo de fundas universales en Ecocuero Premium acolchado con espuma bondeada de alta densidad. Incluye fundas para las 2 butacas delanteras y el juego trasero completo (asiento y respaldo) más apoyacabezas. Terminación acanalada vertical con soporte mullido, gran resistencia al desgaste y fácil mantenimiento.',
    features: [
      'Kit Completo: 2 butacas delanteras + asiento y respaldo trasero + apoyacabezas',
      'Espuma bondeada acolchada de alta densidad para máximo confort',
      'Ecocuero automotor premium: impermeable, suave y lavable con paño húmedo',
      'Costuras acanaladas verticales reforzadas que mantienen la forma original',
      '4 opciones de combinación: Gris/Plata, Rojo, Azul y Negro pleno',
      'Calce anatómico universal apto para autos y camionetas de 5 plazas',
      'Incluye elásticos reforzados y kit de ganchos metálicos para fijación firme'
    ],
    compatibleBrands: ['Universal', 'Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Fiat', 'Renault', 'Peugeot', 'Nissan', 'Honda', 'Jeep', 'Citroën'],
    isFeatured: true,
    material: 'Ecocuero Premium con Bondeado',
    rating: 5.0,
    reviewsCount: 28,
    variants: [
      { id: 'var-gris', name: 'Negro con Franjas Grises / Plata', stock: 15, priceExtraUSD: 0, image: '/src/assets/images/product_ecocuero_bondeado_kit_completo.jpg' },
      { id: 'var-rojo', name: 'Negro con Franjas Rojas', stock: 10, priceExtraUSD: 0, image: '/src/assets/images/product_ecocuero_bondeado_variantes.jpg' },
      { id: 'var-azul', name: 'Negro con Franjas Azules', stock: 8, priceExtraUSD: 0, image: '/src/assets/images/product_ecocuero_bondeado_variantes.jpg' },
      { id: 'var-negro', name: 'Negro Pleno (Total Black)', stock: 7, priceExtraUSD: 0, image: '/src/assets/images/product_ecocuero_bondeado_variantes.jpg' },
    ],
  },
  {
    id: 'prod-1',
    name: 'Juego de Fundas Ecocuero Línea Económica (Juego Completo)',
    category: 'Ecocuero línea económica',
    currency: 'ARS',
    priceUSD: 85,
    priceUYU: 3400,
    priceARS: 106250,
    stock: 45,
    sku: 'DBA-ECO-ECON-01',
    image: '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
    description: 'Juego completo de fundas universales para asientos delanteros y traseros en ecocuero resistente de fácil limpieza. Ideal para proteger el tapizado original con la mejor relación costo-beneficio para autos y camionetas.',
    features: [
      'Instalación rápida con elásticos y ganchos reforzados',
      'Fácil limpieza con paño húmedo',
      'Protección contra manchas, polvo y desgaste diario',
      'Compatible con butacas delanteras y respaldos traseros'
    ],
    compatibleBrands: ['Universal', 'Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Fiat', 'Renault', 'Peugeot'],
    isFeatured: true,
    material: 'Ecocuero Automotriz',
    rating: 4.8,
    reviewsCount: 48,
  },
  {
    id: 'prod-2',
    name: 'Juego de Fundas Ecocuero con Bondeado Intermedio - Costura Diamante',
    category: 'Ecocuero con bondeado línea intermedia',
    currency: 'ARS',
    priceUSD: 130,
    priceUYU: 5200,
    priceARS: 162500,
    stock: 30,
    sku: 'DBA-ECO-BOND-02',
    image: '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
    description: 'Fundas completas acolchadas con espuma bondeada de 5mm para mayor cuerpo, mullidez y confort. Aporta un diseño elegante con costura en rombos/diamante que no se deforma con el uso continuo.',
    features: [
      'Espuma bondeada de 5mm de alta densidad para máxima comodidad',
      'Costura capitoné diamante reforzada antidesgarro',
      'Textura suave, acolchada y respirable',
      'Excelente calce anatómico para autos y camionetas'
    ],
    compatibleBrands: ['Universal', 'Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Nissan', 'Jeep', 'Renault'],
    isFeatured: true,
    material: 'Ecocuero con Espuma Bondeada 5mm',
    rating: 4.9,
    reviewsCount: 38,
  },
  {
    id: 'prod-3',
    name: 'Juego de Fundas Cuero Automotor Premium',
    category: 'Cuero automotor',
    currency: 'ARS',
    priceUSD: 190,
    priceUYU: 7600,
    priceARS: 237500,
    stock: 22,
    sku: 'DBA-CUERO-AUTO-03',
    image: '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
    description: 'Fundas de máxima calidad elaboradas en cuero automotriz de 1.2mm de espesor. Terminación y textura idéntica al tapizado original de fábrica, alta resistencia al roce intensivo y apto para despliegue de airbags.',
    features: [
      'Cuero automotor de 1.2mm de máxima durabilidad',
      'Terminación y textura idéntica a tapizado de fábrica',
      'Aptas para airbags laterales y apoyacabezas',
      'Garantía oficial por 3 años'
    ],
    compatibleBrands: ['Universal', 'Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Audi', 'BMW', 'Honda', 'Jeep'],
    isFeatured: true,
    material: 'Cuero Automotor 1.2mm',
    rating: 5.0,
    reviewsCount: 56,
  },
  {
    id: 'prod-4',
    name: 'Juego de Fundas Cuero Automotor con Soporte Lumbar Ergonómico',
    category: 'Cuero automotor con soporte lumbar',
    currency: 'ARS',
    priceUSD: 240,
    priceUYU: 9600,
    priceARS: 300000,
    stock: 18,
    sku: 'DBA-CUERO-LUMB-04',
    image: '/src/assets/images/product_cubreasiento_deportivo_alcantara_1791205503234.jpg',
    description: 'Línea de máxima jerarquía con soporte lumbar anatómico y almohadillas ortopédicas laterales integradas. Brinda una postura de manejo perfecta, aliviando tensiones en la espalda durante viajes largos y uso diario exigente.',
    features: [
      'Soporte lumbar ergonómico ortopédico integrado',
      'Refuerzos laterales para contención de cintura y riñones',
      'Cuero automotor microperforado para ventilación térmica',
      'Ajuste firme que no se desplaza con el uso'
    ],
    compatibleBrands: ['Universal', 'Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Audi', 'BMW', 'Mercedes-Benz'],
    isFeatured: true,
    material: 'Cuero Automotor & Soporte Lumbar Ergonómico',
    rating: 5.0,
    reviewsCount: 34,
  },
  {
    id: 'prod-5',
    name: 'Alfombras Termoformadas 3D Bandeja Profunda (Set Completo)',
    category: 'Alfombras',
    currency: 'ARS',
    priceUSD: 110,
    priceUYU: 4400,
    priceARS: 137500,
    stock: 35,
    sku: 'DBA-ALF-3D-05',
    image: '/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg',
    description: 'Set de alfombras con borde perimetral elevado de 5cm para retener barro, líquidos, arena y suciedad. Material TPE inodoro, antideslizante y lavable en segundos con hidrolavadora.',
    features: [
      'Borde elevado antiderrame de 5 cm de contención total',
      'Material TPE virgen inodoro y 100% lavable',
      'Fijación antideslizante con anclajes',
      'Protección total del piso original de autos y camionetas'
    ],
    compatibleBrands: ['Universal', 'Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Renault'],
    isFeatured: true,
    material: 'Polímero Termoplástico TPE 3D',
    rating: 4.8,
    reviewsCount: 36,
  },
  {
    id: 'prod-6',
    name: 'Cubre Volante Cuero Automotor Microperforado con Kit de Coser',
    category: 'Cubre volantes',
    currency: 'ARS',
    priceUSD: 25,
    priceUYU: 1000,
    priceARS: 31250,
    stock: 60,
    sku: 'DBA-VOL-CUERO-06',
    image: '/src/assets/images/product_cubreasiento_deportivo_alcantara_1791205503234.jpg',
    description: 'Funda para volante en cuero automotor microperforado de agarre deportivo. Incluye aguja e hilo encerado para una colocación firme al milímetro que renueva por completo la sensación de manejo.',
    features: [
      'Grip antideslizante de textura microperforada',
      'Incluye aguja e hilo encerado de alta resistencia',
      'Se adapta a volantes de 37cm a 39cm de diámetro',
      'Terminación deportiva profesional sin costuras molestas'
    ],
    compatibleBrands: ['Universal'],
    isFeatured: false,
    material: 'Cuero Automotor Microperforado',
    rating: 4.9,
    reviewsCount: 42,
  },
  {
    id: 'prod-7',
    name: 'Cubrebaúl Termoformado Rígido con Superficie Antideslizante',
    category: 'Accesorios',
    currency: 'ARS',
    priceUSD: 85,
    priceUYU: 3400,
    priceARS: 106250,
    stock: 22,
    sku: 'DBA-ACC-BAUL-07',
    image: '/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg',
    description: 'Bandeja protectora para el baúl con borde perimetral que evita el traspaso de suciedad, líquidos, herramientas o cochecitos al piso alfombrado original.',
    features: [
      'Borde perimetral antiderrames de 4cm',
      'Resistente a aceites, solventes y productos químicos',
      'Fácil extracción y limpieza rápida',
      'Superficie antideslizante de alta resistencia'
    ],
    compatibleBrands: ['Universal', 'Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Peugeot', 'Renault'],
    isFeatured: false,
    material: 'TPE Rígido Antideslizante',
    rating: 4.9,
    reviewsCount: 19,
  },
  {
    id: 'prod-8',
    name: 'Kit Premium Almohadillas Cervicales Viscoelásticas (Par)',
    category: 'Accesorios',
    currency: 'ARS',
    priceUSD: 35,
    priceUYU: 1400,
    priceARS: 43750,
    stock: 45,
    sku: 'DBA-ACC-CERV-08',
    image: '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
    description: 'Par de almohadillas cervicales ergonómicas en cuero con interior de memory foam. Apoyo perfecto para cuello y nuca que reduce el cansancio en viajes cortos y largos.',
    features: [
      'Espuma con memoria viscoelástica (Memory Foam)',
      'Funda exterior desmontable y lavable',
      'Correa elástica de sujeción al apoyacabezas',
      'Diseño ergonómico para descanso cervical'
    ],
    compatibleBrands: ['Universal'],
    isFeatured: false,
    material: 'Cuero Ecológico & Memory Foam',
    rating: 4.8,
    reviewsCount: 31,
  },
];

const initialUsers = [
  {
    id: 'usr-1',
    name: 'Juan Ignacio Pérez',
    email: 'juan.perez@gmail.com',
    password_hash: 'cliente123',
    phone: '+598 99 234 567',
    address: 'Av. Brasil 2450, Apto 501',
    city: 'Montevideo, Pocitos',
    vehicles: [
      { brand: 'Toyota', model: 'Hilux SRV', year: '2023' },
      { brand: 'Volkswagen', model: 'Nivus Highline', year: '2024' },
    ],
    role: 'customer',
    status: 'Activo',
    created_at: '2026-08-15T10:00:00Z',
    last_login: '2026-10-04T18:30:00Z',
  },
  {
    id: 'usr-2',
    name: 'Administrador General',
    email: 'admin@distribuidorabuenosaires.com',
    password_hash: 'admin123',
    phone: '+54 9 11 1234 5678',
    address: 'Franklin D. Roosevelt 1700',
    city: 'CABA, Buenos Aires',
    vehicles: [{ brand: 'Ford', model: 'Ranger Raptor', year: '2024' }],
    role: 'admin',
    status: 'Activo',
    created_at: '2026-01-01T00:00:00Z',
    last_login: '2026-10-07T00:00:00Z',
  },
  {
    id: 'usr-3',
    name: 'Carolina Méndez',
    email: 'caro.mendez@empresa.com',
    password_hash: 'cliente123',
    phone: '+598 94 555 123',
    address: 'Bvar. Artigas 1200',
    city: 'Montevideo',
    vehicles: [{ brand: 'Chevrolet', model: 'Tracker', year: '2022' }],
    role: 'customer',
    status: 'Pendiente',
    created_at: '2026-10-05T14:10:00Z',
  },
  {
    id: 'usr-4',
    name: 'Martín Delgado',
    email: 'martin.delgado@correo.uy',
    password_hash: 'cliente123',
    phone: '+598 92 888 777',
    address: 'Av. 8 de Octubre 3100',
    city: 'Montevideo',
    vehicles: [{ brand: 'Nissan', model: 'Frontier', year: '2021' }],
    role: 'customer',
    status: 'Rechazado',
    created_at: '2026-10-04T16:20:00Z',
  },
];

const initialOrders = [
  {
    id: 'ord-101',
    orderNumber: 'DBA-9821',
    customerName: 'Juan Ignacio Pérez',
    customerEmail: 'juan.perez@gmail.com',
    customerPhone: '+598 99 234 567',
    customerAddress: 'Av. Brasil 2450, Apto 501',
    customerCity: 'Montevideo, Pocitos',
    carDetails: { brand: 'Toyota', model: 'Hilux SRV', year: '2023' },
    items: [
      {
        productId: 'prod-2',
        productName: 'Juego de Fundas Ecocuero con Bondeado Intermedio - Costura Diamante',
        price: 130,
        currency: 'USD',
        quantity: 1,
        image: '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
        customization: { stitchingColor: 'Rojo Ferrari' },
      },
      {
        productId: 'prod-5',
        productName: 'Alfombras Termoformadas 3D Bandeja Profunda (Set Completo)',
        price: 110,
        currency: 'USD',
        quantity: 1,
        image: '/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg',
      },
    ],
    totalUSD: 240,
    totalARS: 300000,
    totalUYU: 9600,
    paidCurrency: 'USD',
    status: 'En Preparación',
    paymentMethod: 'mercadopago',
    createdAt: '2026-10-02T14:30:00Z',
    notes: 'Cliente solicitó fundas en color negro con costura diamante.',
    whatsappReminderSent: true,
  },
  {
    id: 'ord-102',
    orderNumber: 'DBA-9822',
    customerName: 'Lucía Fernández',
    customerEmail: 'lucia.fdez@montevideo.com.uy',
    customerPhone: '+59898765432',
    customerAddress: 'Rambla República de México 5400',
    customerCity: 'Montevideo, Carrasco',
    carDetails: { brand: 'Volkswagen', model: 'Nivus Highline', year: '2024' },
    items: [
      {
        productId: 'prod-4',
        productName: 'Juego de Fundas Cuero Automotor con Soporte Lumbar Ergonómico',
        price: 240,
        currency: 'USD',
        quantity: 1,
        image: '/src/assets/images/product_cubreasiento_deportivo_alcantara_1791205503234.jpg',
      },
    ],
    totalUSD: 240,
    totalARS: 300000,
    totalUYU: 9600,
    paidCurrency: 'USD',
    status: 'Pendiente',
    paymentMethod: 'transferencia',
    createdAt: '2026-10-04T09:15:00Z',
    notes: 'Esperando comprobante de transferencia bancaria BROU.',
    whatsappReminderSent: false,
  },
  {
    id: 'ord-103',
    orderNumber: 'DBA-9823',
    customerName: 'Martín Benítez',
    customerEmail: 'martin.benitez@empresa.com.ar',
    customerPhone: '+5491145238890',
    customerAddress: 'Av. Libertador 7200',
    customerCity: 'Buenos Aires, Nuñez',
    carDetails: { brand: 'Ford', model: 'Ranger Raptor', year: '2023' },
    items: [
      {
        productId: 'prod-3',
        productName: 'Juego de Fundas Cuero Automotor Premium',
        price: 190,
        currency: 'USD',
        quantity: 1,
        image: '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
      },
      {
        productId: 'prod-7',
        productName: 'Cubrebaúl Termoformado Rígido con Superficie Antideslizante',
        price: 85,
        currency: 'USD',
        quantity: 1,
        image: '/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg',
      },
    ],
    totalUSD: 275,
    totalARS: 343750,
    totalUYU: 11000,
    paidCurrency: 'ARS',
    status: 'Pagado',
    paymentMethod: 'tarjeta',
    createdAt: '2026-10-03T18:40:00Z',
    notes: 'Pago aprobado en 3 cuotas sin interés.',
    whatsappReminderSent: true,
  },
  {
    id: 'ord-104',
    orderNumber: 'DBA-9824',
    customerName: 'Gonzalo Méndez',
    customerEmail: 'gmendez99@hotmail.com',
    customerPhone: '+59891234890',
    customerAddress: 'Calle 24 entre 27 y 28',
    customerCity: 'Punta del Este, Maldonado',
    carDetails: { brand: 'Audi', model: 'Q5 45 TFSI', year: '2022' },
    items: [
      {
        productId: 'prod-1',
        productName: 'Juego de Fundas Ecocuero Línea Económica (Juego Completo)',
        price: 85,
        currency: 'USD',
        quantity: 1,
        image: '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
      },
    ],
    totalUSD: 85,
    totalARS: 106250,
    totalUYU: 3400,
    paidCurrency: 'UYU',
    status: 'Despachado',
    paymentMethod: 'mercadopago',
    createdAt: '2026-09-28T11:20:00Z',
    notes: 'Despachado por Agencia Central con número de rastreo #DAC-88410.',
    whatsappReminderSent: true,
  },
  {
    id: 'ord-105',
    orderNumber: 'DBA-9825',
    customerName: 'Valeria Soria',
    customerEmail: 'valeria.soria@adinet.com.uy',
    customerPhone: '+59894455667',
    customerAddress: 'Bulevar Artigas 1420',
    customerCity: 'Montevideo, Tres Cruces',
    carDetails: { brand: 'Chevrolet', model: 'Tracker Premier', year: '2024' },
    items: [
      {
        productId: 'prod-5',
        productName: 'Alfombras Termoformadas 3D Bandeja Profunda (Set Completo)',
        price: 110,
        currency: 'USD',
        quantity: 1,
        image: '/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg',
      },
      {
        productId: 'prod-6',
        productName: 'Cubre Volante Cuero Automotor Microperforado con Kit de Coser',
        price: 25,
        currency: 'USD',
        quantity: 1,
        image: '/src/assets/images/product_cubreasiento_deportivo_alcantara_1791205503234.jpg',
      },
    ],
    totalUSD: 135,
    totalARS: 168750,
    totalUYU: 5400,
    paidCurrency: 'USD',
    status: 'Entregado',
    paymentMethod: 'efectivo',
    createdAt: '2026-09-20T16:00:00Z',
    notes: 'Retiró en sucursal central.',
    whatsappReminderSent: true,
  },
];

const initialReviews = [
  {
    id: 'rev-1',
    author: 'Esteban Larrosa',
    carModel: 'Toyota Hilux 2023',
    productName: 'Juego de Fundas Ecocuero con Bondeado Intermedio',
    rating: 5,
    comment: 'Impresionante calidad. Quedaron como si el tapizado viniera de fábrica. El acolchado bondeado le da un confort bárbaro. Recomiendo 100%.',
    dateText: 'Hace 4 días',
    verifiedPurchase: true,
    isApproved: true,
  },
  {
    id: 'rev-2',
    author: 'Mariana Duarte',
    carModel: 'Volkswagen Nivus 2024',
    productName: 'Alfombras Termoformadas 3D Bandeja Profunda',
    rating: 5,
    comment: 'Las alfombras encajaron perfecto. Ya las probé con lluvia y barro, se sacan y lavan con manguera en 1 minuto.',
    dateText: 'Hace 1 semana',
    verifiedPurchase: true,
    isApproved: true,
  },
  {
    id: 'rev-3',
    author: 'Federico Balbi',
    carModel: 'Ford Ranger XLT',
    productName: 'Juego de Fundas Cuero Automotor con Soporte Lumbar',
    rating: 5,
    comment: 'El soporte lumbar cambia todo en los viajes largos en ruta. Excelente agarre, calidad de terminación y rápida entrega.',
    dateText: 'Hace 2 semanas',
    verifiedPurchase: true,
    isApproved: true,
  },
  {
    id: 'rev-4',
    author: 'Carlos Silveira',
    carModel: 'Chevrolet Tracker 2022',
    productName: 'Cubrebaúl Termoformado Rígido con Superficie Antideslizante',
    rating: 4,
    comment: 'Muy buena terminación, protege el piso del baúl cuando cargás compras o el perro. Llegó en 48hs al interior.',
    dateText: 'Hace 3 semanas',
    verifiedPurchase: true,
    isApproved: true,
  },
];

const initialBrands = [
  'Universal', 'Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Fiat', 'Renault', 'Peugeot',
  'Nissan', 'Honda', 'Jeep', 'Citroën', 'Audi', 'BMW', 'Mercedes-Benz', 'Hyundai'
];

const initialStoreSettings = {
  id: 'default',
  business_name: 'Distribuidora Buenos Aires',
  company_legal_name: 'Distribuidora Buenos Aires S.A.S.',
  company_rut: '21.849.201.0018',
  company_phone: '+54 9 11 1234-5678',
  company_email: 'ventas@distribuidorabuenosaires.com',
  company_address: 'Franklin D. Roosevelt 1700',
  company_city: 'C1772 CABA, Buenos Aires, Argentina',
  whatsapp_number: '5491112345678',
  primary_color: '#0055ff',
  header_bg_color: '#ffffff',
  header_text_color: '#1e293b',
  hero_slides: [
    {
      id: 'slide-1',
      type: 'image',
      mediaUrl: '/src/assets/images/hero_car_interior_dark_red_1791205466989.jpg',
      title: 'DISTRIBUIDORA BUENOS AIRES',
      subtitle: 'Fundas a medida y accesorios de alta durabilidad con colocación profesional garantizada y stock permanente.',
      buttonText: 'Explorar Catálogo',
    }
  ],
  home_sections: [
    { id: 'productos', title: 'Colección & Productos', subtitle: 'Calidad Premium', visible: true },
    { id: 'alfombras', title: 'Bandejas 3D Antiderrame', subtitle: 'Calce Original', visible: true },
    { id: 'resenas', title: 'Opiniones de Clientes', subtitle: '', visible: true }
  ],
  contact_section: {
    badge: 'Datos de contacto de la tienda',
    title: 'Contactate con Nuestro Equipo',
    description: 'Atención personalizada para la elección del material, pedidos mayoristas y envíos a todo el país.',
    locationTitle: 'Sede Central & Showroom',
    locationAddress: 'Franklin D. Roosevelt 1700, C1772 Cdad. Autónoma de Buenos Aires, Argentina',
    hoursTitle: 'Horarios de Atención',
    hoursText: 'Lunes a Viernes: 08:30 a 18:30 hs · Sábados: 09:00 a 13:00 hs',
    phonesTitle: 'Líneas de Atención Telefónica',
    phonesText: '+54 9 11 1234-5678 · WhatsApp Ventas: +54 9 11 1234-5678',
    whatsappButtonText: 'Hablar con un Asesor por WhatsApp',
    whatsappNumber: '5491112345678',
    whatsappMessage: '¡Hola! Quisiera realizar una consulta a Distribuidora Buenos Aires sobre sus productos y envíos.',
    cardTitle: 'Ubicacion',
    cardDescription: 'Franklin D. Roosevelt 1700, C1772 Cdad. Autónoma de Buenos Aires, Argentina',
    features: [],
    guaranteeLabel: 'Garantía Escrita',
    guaranteeText: '3 Años de Cobertura Total',
    mapIframeUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.9992332500856!2d-58.45380459999999!3d-34.5535748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb42dd70c6349%3A0x3a03ff44b1ea6ef3!2sFranklin%20D.%20Roosevelt%201700%2C%20C1772%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires%2C%20Argentina!5e0!3m2!1ses!2suy!4v1791325820777!5m2!1ses!2suy',
    mapGoogleLink: 'https://maps.google.com/?q=Franklin+D.+Roosevelt+1700,+C1772+Buenos+Aires,+Argentina',
  },
  footer_settings: {
    aboutText: 'Distribuidora líder en cubreasientos, fundas para vehículos y accesorios automotrices de alta calidad en stock permanente para despacho inmediato.',
    column2Title: 'Colección & Catálogo',
    links: [
      { id: 'fl-1', label: 'Probador Virtual 3D', actionType: 'fitter', target: '' },
      { id: 'fl-2', label: 'Fundas Cuero Automotor', actionType: 'section', target: 'productos' },
      { id: 'fl-3', label: 'Alfombras & Accesorios', actionType: 'section', target: 'productos' },
      { id: 'fl-4', label: 'Venta Mayorista & Distribuidores', actionType: 'wholesale', target: '' },
    ],
    column3Title: 'Tu Cuenta',
    column4Title: 'Local Central',
    showroomAddress: 'Franklin D. Roosevelt 1700, CABA, Argentina',
    showroomPhone: 'WhatsApp: +54 9 11 1234-5678',
    showroomHours: 'Horario: Lun a Vie 08:30 a 18:30 hs',
    badgeText: 'Stock Inmediato y Envíos a Todo el País',
    copyrightText: 'Todos los derechos reservados.',
    subText: 'Distribuidora Buenos Aires · Envíos a Todo el País',
  }
};

function generateSQL() {
  let sql = `-- =========================================================================
-- DISTRIBUIDORA BUENOS AIRES - BACKUP & SCHEMA POSTGRESQL / NEON DB
-- Generado para: https://github.com/LithinkUY/distribuidorabuenosaires
-- Fecha: ${new Date().toISOString()}
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
\n`;

  // Categories
  sql += `-- INSERTS: categories\n`;
  initialCategories.forEach((c) => {
    sql += `INSERT INTO categories (id, name, slug, description)
VALUES ('${c.id}', '${escapeStr(c.name)}', '${escapeStr(c.slug)}', '${escapeStr(c.description)}')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;\n`;
  });
  sql += `\n`;

  // Products
  sql += `-- INSERTS: products\n`;
  initialProducts.forEach((p) => {
    sql += `INSERT INTO products (
  id, name, category, currency, price_usd, price_uyu, price_ars, stock, sku, image, images, additional_images, description, features, compatible_brands, is_featured, material, rating, reviews_count, variants
) VALUES (
  '${p.id}',
  '${escapeStr(p.name)}',
  '${escapeStr(p.category)}',
  '${p.currency || 'ARS'}',
  ${p.priceUSD},
  ${p.priceUYU},
  ${p.priceARS},
  ${p.stock},
  '${escapeStr(p.sku)}',
  '${escapeStr(p.image)}',
  '${JSON.stringify(p.images || []).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(p.additionalImages || []).replace(/'/g, "''")}'::jsonb,
  '${escapeStr(p.description)}',
  '${JSON.stringify(p.features || []).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(p.compatibleBrands || []).replace(/'/g, "''")}'::jsonb,
  ${p.isFeatured ? 'true' : 'false'},
  '${escapeStr(p.material)}',
  ${p.rating},
  ${p.reviewsCount},
  '${JSON.stringify(p.variants || []).replace(/'/g, "''")}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  stock = EXCLUDED.stock;\n`;
  });
  sql += `\n`;

  // Users
  sql += `-- INSERTS: users\n`;
  initialUsers.forEach((u) => {
    sql += `INSERT INTO users (id, name, email, password_hash, phone, address, city, vehicles, role, status, created_at)
VALUES (
  '${u.id}',
  '${escapeStr(u.name)}',
  '${escapeStr(u.email)}',
  '${u.password_hash}',
  '${escapeStr(u.phone)}',
  '${escapeStr(u.address)}',
  '${escapeStr(u.city)}',
  '${JSON.stringify(u.vehicles || []).replace(/'/g, "''")}'::jsonb,
  '${u.role}',
  '${u.status}',
  '${u.created_at}'
) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;\n`;
  });
  sql += `\n`;

  // Orders
  sql += `-- INSERTS: orders\n`;
  initialOrders.forEach((o) => {
    sql += `INSERT INTO orders (
  id, order_number, customer_name, customer_email, customer_phone, customer_address, customer_city, car_details, items, total_usd, total_ars, total_uyu, paid_currency, status, payment_method, notes, whatsapp_reminder_sent, created_at
) VALUES (
  '${o.id}',
  '${escapeStr(o.orderNumber)}',
  '${escapeStr(o.customerName)}',
  '${escapeStr(o.customerEmail)}',
  '${escapeStr(o.customerPhone)}',
  '${escapeStr(o.customerAddress)}',
  '${escapeStr(o.customerCity)}',
  '${JSON.stringify(o.carDetails || {}).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(o.items || []).replace(/'/g, "''")}'::jsonb,
  ${o.totalUSD},
  ${o.totalARS},
  ${o.totalUYU},
  '${o.paidCurrency}',
  '${o.status}',
  '${o.paymentMethod}',
  '${escapeStr(o.notes || '')}',
  ${o.whatsappReminderSent ? 'true' : 'false'},
  '${o.createdAt}'
) ON CONFLICT (order_number) DO UPDATE SET status = EXCLUDED.status, total_ars = EXCLUDED.total_ars;\n`;
  });
  sql += `\n`;

  // Reviews
  sql += `-- INSERTS: reviews\n`;
  initialReviews.forEach((r) => {
    sql += `INSERT INTO reviews (id, author, car_model, product_name, rating, comment, date_text, verified_purchase, is_approved)
VALUES (
  '${r.id}',
  '${escapeStr(r.author)}',
  '${escapeStr(r.carModel)}',
  '${escapeStr(r.productName)}',
  ${r.rating},
  '${escapeStr(r.comment)}',
  '${escapeStr(r.dateText)}',
  ${r.verifiedPurchase ? 'true' : 'false'},
  ${r.isApproved ? 'true' : 'false'}
) ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment, rating = EXCLUDED.rating;\n`;
  });
  sql += `\n`;

  // Brands
  sql += `-- INSERTS: brands\n`;
  initialBrands.forEach((b, idx) => {
    sql += `INSERT INTO brands (id, name) VALUES ('brand-${idx + 1}', '${escapeStr(b)}') ON CONFLICT (name) DO NOTHING;\n`;
  });
  sql += `\n`;

  // Store Settings
  sql += `-- INSERTS: store_settings\n`;
  sql += `INSERT INTO store_settings (
  id, business_name, company_legal_name, company_rut, company_phone, company_email, company_address, company_city, whatsapp_number, primary_color, header_bg_color, header_text_color, hero_slides, home_sections, contact_section, footer_settings
) VALUES (
  '${initialStoreSettings.id}',
  '${escapeStr(initialStoreSettings.business_name)}',
  '${escapeStr(initialStoreSettings.company_legal_name)}',
  '${escapeStr(initialStoreSettings.company_rut)}',
  '${escapeStr(initialStoreSettings.company_phone)}',
  '${escapeStr(initialStoreSettings.company_email)}',
  '${escapeStr(initialStoreSettings.company_address)}',
  '${escapeStr(initialStoreSettings.company_city)}',
  '${escapeStr(initialStoreSettings.whatsapp_number)}',
  '${escapeStr(initialStoreSettings.primary_color)}',
  '${escapeStr(initialStoreSettings.header_bg_color)}',
  '${escapeStr(initialStoreSettings.header_text_color)}',
  '${JSON.stringify(initialStoreSettings.hero_slides).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(initialStoreSettings.home_sections).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(initialStoreSettings.contact_section).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(initialStoreSettings.footer_settings).replace(/'/g, "''")}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  company_address = EXCLUDED.company_address,
  contact_section = EXCLUDED.contact_section,
  footer_settings = EXCLUDED.footer_settings;\n`;

  return sql;
}

function escapeStr(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "''");
}

async function run() {
  const sql = generateSQL();
  const filePath = path.join(__dirname, '..', 'database_backup_neon.sql');
  fs.writeFileSync(filePath, sql, 'utf8');
  console.log(`[OK] Archivo SQL generado con exito en: ${filePath}`);

  console.log('[...] Conectando a Neon PostgreSQL...');
  const client = new Client({ connectionString: NEON_CONNECTION_STRING });
  await client.connect();
  console.log('[OK] Conectado exitosamente a Neon DB.');

  console.log('[...] Ejecutando script SQL en Neon DB...');
  await client.query(sql);
  console.log('[OK] Todas las tablas y datos se crearon e insertaron exitosamente en Neon DB.');

  // Verify tables
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log('[OK] Tablas creadas en Neon DB:');
  console.log(res.rows.map(r => r.table_name));

  // Count items
  const counts = await Promise.all([
    client.query('SELECT COUNT(*) FROM categories'),
    client.query('SELECT COUNT(*) FROM products'),
    client.query('SELECT COUNT(*) FROM users'),
    client.query('SELECT COUNT(*) FROM orders'),
    client.query('SELECT COUNT(*) FROM reviews'),
    client.query('SELECT COUNT(*) FROM brands'),
    client.query('SELECT COUNT(*) FROM store_settings')
  ]);

  console.log('[OK] Resumen de registros insertados en Neon DB:');
  console.log(`- Categories: ${counts[0].rows[0].count}`);
  console.log(`- Products: ${counts[1].rows[0].count}`);
  console.log(`- Users: ${counts[2].rows[0].count}`);
  console.log(`- Orders: ${counts[3].rows[0].count}`);
  console.log(`- Reviews: ${counts[4].rows[0].count}`);
  console.log(`- Brands: ${counts[5].rows[0].count}`);
  console.log(`- Store Settings: ${counts[6].rows[0].count}`);

  await client.end();
  console.log('[EXITO TOTAL] Neon DB esta 100% listo y poblado.');
}

run().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
