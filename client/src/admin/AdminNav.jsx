import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function AdminNav() {
  const [pending, setPending] = useState(0);
  useEffect(() => {
    const load = () => api('/reservations/summary').then((s) => setPending(s.pending)).catch(() => {});
    load(); const t = setInterval(load, 30000); return () => clearInterval(t);
  }, []);
  return (
    <nav className="admin-nav" aria-label="Admin pages">
      <NavLink to="/admin/reservations">Reservations {pending > 0 && <span className="badge" aria-label={`${pending} pending`}>{pending}</span>}</NavLink>
      <NavLink to="/admin" end>Menu &amp; Content</NavLink>
    </nav>
  );
}
