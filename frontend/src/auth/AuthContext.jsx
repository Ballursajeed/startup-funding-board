import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  setToken,
  setAuthFailureHandler,
  setRefreshHandler,
} from '../api/client.js';
import * as authApi from '../api/auth.api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const logoutRef = useRef(null);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // best-effort
    }
    setToken(null);
    setUser(null);
  }, []);

  // Keep a ref so the auth failure handler (registered once) can always call
  // the latest logout without needing to re-register
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    // Register handlers once on mount
    setRefreshHandler(authApi.refreshToken);
    setAuthFailureHandler(() => logoutRef.current?.());

    // Session restoration
    (async () => {
      try {
        const refreshRes = await authApi.refreshToken();
        const { accessToken } = refreshRes.data;
        setToken(accessToken);
        const meRes = await authApi.getMe(accessToken);
        setUser(meRes.data.user);
      } catch (_) {
        // No valid session — treat as logged out silently
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    const { accessToken, user: userData } = res.data;
    setToken(accessToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const res = await authApi.register(name, email, password, role);
    const { accessToken, user: userData } = res.data;
    setToken(accessToken);
    setUser(userData);
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
