import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('rl_token')) return setReady(true);
    api('/auth/me').then((d) => setUser(d.user)).catch(() => localStorage.removeItem('rl_token')).finally(() => setReady(true));
  }, []);

  const finish = useCallback((d) => { localStorage.setItem('rl_token', d.token); setUser(d.user); return d.user; }, []);
  const login = async (email, password) => finish(await api('/auth/login', { method: 'POST', body: { email, password }, auth: false }));
  const register = async (name, email, password) => finish(await api('/auth/register', { method: 'POST', body: { name, email, password }, auth: false }));
  const refresh = async () => { const d = await api('/auth/me'); setUser(d.user); };
  const logout = () => { localStorage.removeItem('rl_token'); setUser(null); };

  return <Ctx.Provider value={{ user, ready, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}
