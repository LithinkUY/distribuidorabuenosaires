# Distribuidora Buenos Aires — E-Commerce & CMS

Plataforma integral de comercio electrónico y gestor de contenidos (CMS) para la tienda online de **Distribuidora Buenos Aires** (fundas de asiento, cubre volantes y accesorios automotores).

> **Desarrollado por Ruben Nicolas Gomez — Uruguay**

---

## Características Principales

### Tienda Pública (Storefront)
- **Home Dinámico y Personalizable:** Slider Hero con control de ancho y altura, grilla de categorías destacadas, carruseles y grillas de productos (**Ofertas**, **Destacados** y **Lanzamientos**), banners promocionales y bloques enriquecidos.
- **Comentarios y Reseñas de Clientes en el Home:** Los clientes pueden dejar comentarios con calificación de 1 a 5 estrellas, modelo de vehículo y foto adjunta. Se publican tras la auditoría del administrador.
- **Catálogo Avanzado:** Filtros por categoría, subcategoría, marca, tipo de material, disponibilidad en stock, rango de precios y buscador predictivo en tiempo real.
- **Doble Moneda (ARS / USD):** Cotización configurable desde el panel para conversión automática o precios manuales en pesos argentinos.
- **Carrito y Checkout Completo:** Cotización en tiempo real, cupones de descuento (porcentaje o monto fijo), métodos de envío (a domicilio con envío gratis superando monto mínimo o retiro en local) y pasarelas de pago (**Mercado Pago** sandbox/producción, **Transferencia bancaria** con descuento y **Pago contra entrega**).

### Panel de Administración (`/admin`)
- **Dashboard Analítico:** Métricas de ingresos en ARS y USD, evolución por día/semana/mes, productos más vendidos, alertas de bajo stock y últimos pedidos.
- **Gestión Rápida de Productos y Stock:** Control con un clic en el listado para marcar productos como **Destacados (`★`)**, **¿Oferta? (`Switch`)** y **Lanzamientos**, además de edición rápida de stock y precios por variante.
- **Auditoría de Comentarios:** Módulo para aceptar/rechazar comentarios de clientes y crear o editar reseñas con foto desde el panel.
- **Constructor Visual (Home, Header, Tema y Sitio):** Editor en vivo de paleta de colores, tipografías, logo, menú multinivel, barra de anuncios, pop-up promocional, botón flotante de WhatsApp y páginas informativas sincronizadas con el menú.

---

## Tecnologías Utilizadas

- **Backend:** Python 3.12 · FastAPI · Motor / PyMongo (MongoDB asíncrono) · JWT (`PyJWT`) · `bcrypt`
- **Frontend:** React 19 · React Router v7 · Tailwind CSS · Radix UI / shadcn · Lucide Icons · Recharts
- **Base de Datos:** MongoDB

---

## Instalación y Ejecución Local

### 1. Requisitos previos
- **Python 3.11+**
- **Node.js 18+ y Yarn**
- **MongoDB** ejecutándose localmente en `mongodb://localhost:27017`

### 2. Backend (`app/backend`)
```bash
cd app/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend (`app/frontend`)
```bash
cd app/frontend
yarn install
yarn start
```
La tienda estará disponible en `http://localhost:3000` y la API en `http://localhost:8000`.

---

## Credenciales de Prueba por Defecto

| Rol | Email | Contraseña | Acceso |
| :--- | :--- | :--- | :--- |
| **Administrador (`ADMIN`)** | `admin@distribuidoraba.com` | `Admin123!` | `/admin` |
| **Cliente (`CLIENTE`)** | `cliente@demo.com` | `Cliente123!` | `/cuenta` |

---

## Créditos y Autoría

**Desarrollado por Ruben Nicolas Gomez — Uruguay**
