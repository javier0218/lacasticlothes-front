import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';

// Casilla "No soy un robot" de Google reCAPTCHA v2, sin dependencias extra:
// cargamos el script de Google a mano y dibujamos el widget en modo "explicit".
//   <RecaptchaCheckbox ref={captchaRef} siteKey={...} onChange={setToken} />
//   captchaRef.current.reset()  → después de un envío fallido (cada token sirve una sola vez)
// Sin siteKey no muestra nada (desarrollo sin claves).

const ONLOAD_CALLBACK = '__lacastiRecaptchaOnLoad';
const SCRIPT_URL = `https://www.google.com/recaptcha/api.js?render=explicit&hl=es-419&onload=${ONLOAD_CALLBACK}`;

// El script se carga una sola vez para toda la app (aunque el componente se monte varias veces)
let scriptPromise = null;
function loadRecaptcha() {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      window[ONLOAD_CALLBACK] = () => resolve(window.grecaptcha);
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        scriptPromise = null; // permite reintentar si se vuelve a montar
        script.remove();
        reject(new Error('No se pudo cargar reCAPTCHA'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function RecaptchaCheckbox({ siteKey, onChange, ref }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [loadError, setLoadError] = useState(false);
  const [expired, setExpired] = useState(false);

  // Guardamos la última versión de onChange sin volver a dibujar el widget
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!siteKey) return undefined;
    let cancelled = false;
    // Google no deja dibujar dos veces en el mismo elemento: usamos uno nuevo en cada montaje
    // (en StrictMode React monta, desmonta y vuelve a montar).
    const host = document.createElement('div');
    containerRef.current.appendChild(host);

    loadRecaptcha()
      .then((grecaptcha) => {
        if (cancelled) return;
        widgetIdRef.current = grecaptcha.render(host, {
          sitekey: siteKey,
          callback: (token) => {
            setExpired(false);
            onChangeRef.current?.(token);
          },
          // El token vence a los 2 minutos: hay que volver a marcar la casilla
          'expired-callback': () => {
            setExpired(true);
            onChangeRef.current?.(null);
          },
          'error-callback': () => onChangeRef.current?.(null),
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      widgetIdRef.current = null;
      host.remove();
    };
  }, [siteKey]);

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        if (widgetIdRef.current !== null) window.grecaptcha?.reset(widgetIdRef.current);
        setExpired(false);
        onChangeRef.current?.(null);
      },
    }),
    []
  );

  if (!siteKey) return null;

  return (
    <div className="mb-3">
      {loadError ? (
        <Alert variant="warning" className="mb-0">
          No pudimos cargar la verificación &quot;No soy un robot&quot;. Revisá tu conexión, desactivá el bloqueador de anuncios para este sitio y recargá la página.
        </Alert>
      ) : (
        <>
          <p className="small text-muted mb-2">Antes de continuar, confirmá que no sos un robot:</p>
          <div ref={containerRef} />
          {expired && <div className="small text-danger mt-1">La verificación venció. Marcá la casilla de nuevo.</div>}
        </>
      )}
    </div>
  );
}
