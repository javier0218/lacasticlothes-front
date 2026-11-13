# LaCasti Clothes — Tienda online (frontend)

Tienda de ropa de segunda mano hecha con **React 19 + Vite + React Bootstrap + React Router**.
Los productos, usuarios, pedidos y pagos vienen del backend `lacasticlothes-backend`
(el contrato de la API está en `lacasticlothes-backend/docs/API.md`).

## Qué incluye

- Catálogo con búsqueda, filtro por categoría, orden por precio y "Cargar más".
- Detalle de cada prenda con galería de fotos (`/productos/:slug`).
- Carrito guardado en el navegador (respeta el stock: casi siempre "Única unidad").
- Registro, inicio de sesión y perfil con el historial de pedidos.
- Checkout en 2 pasos: envío y pago con **Mercado Pago** (o un pago simulado si el backend está en modo de prueba).
- Envíos por **Correo Argentino** (a domicilio o a sucursal) y retiro en persona opcional: el precio se cotiza con la provincia y el código postal, y se suma al total. El cliente ve el número de seguimiento en su perfil.
- Panel de administración: productos (con subida de fotos), pedidos (con carga del número de seguimiento al despachar) y envíos (tarifas por zona, envío gratis y retiro en persona).

## Cómo correrlo en tu compu

Necesitás Node.js 20 o superior.

```bash
npm install
cp .env.example .env     # y ajustá VITE_API_URL si hace falta
npm run dev              # abre http://localhost:5173
```

El backend tiene que estar corriendo (por defecto en `http://localhost:3000`).

Otros comandos:

| Comando | Para qué sirve |
|---|---|
| `npm run lint` | Revisa el código con ESLint |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión de `dist/` |

## Variables de entorno

| Variable | Ejemplo | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | URL del backend, **sin** `/api` al final. |

La clave pública de Mercado Pago no va en el front: la entrega el backend en `GET /api/payments/config`.

## Deploy en Vercel

1. Importá el repositorio en [vercel.com](https://vercel.com) (framework: **Vite**).
2. Build command: `npm run build` · Output directory: `dist`.
3. En *Settings → Environment Variables* agregá `VITE_API_URL` con la URL pública del backend.
4. El archivo `vercel.json` redirige todas las rutas a `index.html`, así los links directos
   (por ejemplo `/productos/camisa-blanca`) no dan 404.

Recordá agregar el dominio de Vercel a los orígenes permitidos (CORS) del backend.

## Estructura

```
src/
  components/   piezas reutilizables (Header, ProductCard, checkout/, admin/...)
  context/      estado global: sesión (Auth), carrito (Cart) y avisos (Toast)
  paginas/      una página por ruta
  services/     llamadas a la API (api.js es el cliente base)
  utils/        formato de precios/fechas y textos en castellano
```
