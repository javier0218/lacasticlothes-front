import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearToken, getToken, saveToken, setUnauthorizedHandler } from '../services/api';
import { getMe, loginRequest, registerRequest } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getToken());
  // Si hay un token guardado, arrancamos "cargando" hasta validarlo con /auth/me
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  // Si el servidor responde 401 (token vencido), cerramos la sesión
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Al abrir la página: validar el token guardado y traer los datos del usuario
  useEffect(() => {
    if (!getToken()) return;
    const controller = new AbortController();

    getMe(controller.signal)
      .then((data) => setUser(data.user))
      .catch((err) => {
        // Solo borramos el token si el servidor dice que no sirve (401).
        // Si el servidor no responde, lo dejamos para reintentar en la próxima visita.
        if (err.status === 401) logout();
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [logout]);

  // Guarda la sesión que devuelven /auth/login y /auth/register
  const startSession = (data) => {
    saveToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    return startSession(data);
  };

  const register = async (name, email, password) => {
    const data = await registerRequest(name, email, password);
    return startSession(data);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
