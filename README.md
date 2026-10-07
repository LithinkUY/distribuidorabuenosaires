# Distribuidora Buenos Aires - Tienda Online & Panel de Gestión

Distribuidora líder en cubreasientos, fundas para vehículos y accesorios automotrices de alta calidad en stock permanente para despacho inmediato.

## Características Principales

- **Catálogo de Productos y Filtros:** Búsqueda en tiempo real por modelo, categoría, material y marca de vehículo.
- **Selector de Moneda Dual Nativo:** Carga y facturación directa en Pesos Argentinos (ARS) o Dólares (USD) sin conversiones distorsionadas.
- **Probador Virtual 3D:** Visualización y personalización de butacas automotrices.
- **Carrito y Checkout Rápido:** Selección de medio de pago (Mercado Pago, Tarjeta, Transferencia con 10% OFF, Efectivo/Retiro) con envío automático de comprobante por WhatsApp.
- **Panel de Clientes:** Seguimiento de pedidos en tiempo real y descarga de comprobantes en PDF membretados.
- **Panel Administrador:** Gestión completa de inventario, categorías, marcas, ventas, presupuestos / cotizaciones formales, clientes y personalización de la tienda.
- **Base de Datos PostgreSQL (Neon DB):** Esquema relacional completo incluido en `database_backup_neon.sql`.

---

## Despliegue en Vercel

1. Importar el repositorio desde GitHub: `https://github.com/LithinkUY/distribuidorabuenosaires`
2. Configurar el Framework Preset como **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configurar las Variables de Entorno en el panel de Vercel (**Settings -> Environment Variables**):
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_5ljGiT1DMrXb@ep-shiny-wind-b518gn85-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `POSTGRES_URL`: `postgresql://neondb_owner:npg_5ljGiT1DMrXb@ep-shiny-wind-b518gn85-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `VITE_DATABASE_URL`: `postgresql://neondb_owner:npg_5ljGiT1DMrXb@ep-shiny-wind-b518gn85-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `APP_URL`: `https://distribuidorabuenosaires.vercel.app` (o tu dominio personalizado)
   - `VITE_APP_URL`: `https://distribuidorabuenosaires.vercel.app`

---

## Base de Datos Neon PostgreSQL

El archivo [`database_backup_neon.sql`](database_backup_neon.sql) contiene la creación de tablas e inserts de datos iniciales:
- `categories`
- `products`
- `users`
- `orders`
- `reviews`
- `brands`
- `store_settings`

Para ejecutar o restaurar en Neon DB:
```bash
node scripts/seed_neon.cjs
```
O copiar y pegar el contenido de `database_backup_neon.sql` en la consola SQL de Neon.

---

## Ejecución Local

```bash
# 1. Instalar dependencias
npm install --legacy-peer-deps

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```
