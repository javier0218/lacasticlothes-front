// Cliente HTTP pequeño para hablar con el backend de LaCasti Clothes.
// Todas las llamadas a la API pasan por la función `apiFetch`.

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
export const API_URL = `${BASE_URL}/api`;

const TOKEN_KEY = 'token';

// --- Manejo del token guardado en el navegador ---
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Función que se ejecuta cuando el servidor responde 401 (sesión vencida).
// La registra el AuthContext para cerrar la sesión automáticamente.
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

/**
 * Hace una petición a la API.
 * @param {string} path   Ruta sin el prefijo /api, por ejemplo '/products'
 * @param {object} options { method, body, query, signal, headers }
 *   - body puede ser un objeto (se envía como JSON) o un FormData (archivos).
 *   - query es un objeto que se convierte en ?clave=valor (se ignoran los vacíos).
 *   - headers son encabezados extra (ej. el token de reCAPTCHA al crear un pedido).
 */
export async function apiFetch(path, { method = 'GET', body, query, signal, headers: extraHeaders } = {}) {
  const url = new URL(API_URL + path, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers = { ...extraHeaders, Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  // Con FormData NO ponemos Content-Type: el navegador agrega el "boundary" solo.
  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    const networkError = new Error('No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.');
    networkError.status = 0;
    networkError.code = 'NETWORK_ERROR';
    throw networkError;
  }

  // 204 = sin contenido
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || `Error ${response.status} del servidor`);
    error.status = response.status;
    error.code = data?.error?.code || 'UNKNOWN_ERROR';
    error.details = data?.error?.details || null;

    if (response.status === 401 && token && onUnauthorized) onUnauthorized();
    throw error;
  }

  return data;
}

// Sirve para no mostrar errores cuando cancelamos una petición a propósito
export function isAbortError(err) {
  return err?.name === 'AbortError';
}
