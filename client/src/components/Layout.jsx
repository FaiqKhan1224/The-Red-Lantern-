import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Star } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';

const LINKS = [
  ['/', 'Home'], ['/our-story', 'Our Story'], ['/dining', 'Dining'], ['/gallery', 'Gallery'],
  ['/private-dining', 'Private Dining'], ['/reservations', 'Reservations'], ['/contact', 'Contact'],
];

// variant "nav" (default): lantern emblem + wordmark. "footer" / "drawer": full provided logo.
export function Logo({ footer, drawer }) {
  if (footer || drawer) {
    return (
      <Link to="/" className={`logo-full ${footer ? 'logo-footer' : 'logo-drawer'}`} aria-label="The Red Lantern home">
        <img src={footer ? '/brand/logo.webp' : '/brand/icon-full.webp'} width="960" height="640"
          alt="The Red Lantern Chinese Restaurant" decoding="async" />
      </Link>
    );
  }
  return (
    <Link to="/" className="logo" aria-label="The Red Lantern home">
      <img className="mark" src="/brand/emblem.webp" width="512" height="512" alt="" decoding="async" />
      <span className="txt">
        <span className="zh">红灯笼</span>
        <span className="en">THE RED LANTERN</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  return (
    <>
      <nav className={`nav ${solid ? 'solid' : ''}`} aria-label="Main">
        <Logo />
        <ul className="links">
          {LINKS.map(([to, label]) => (
            <li key={to}><NavLink to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink></li>
          ))}
        </ul>
        <div className="right">
          {user ? (
            <>
              {user.role === 'admin' ? <Link to="/admin/reservations" className="textlink">Admin</Link> : <Link to="/my-reservations" className="textlink">My Reservations</Link>}
              <button className="textlink" onClick={logout}>Sign out</button>
            </>
          ) : <Link to="/login" className="textlink">Sign in</Link>}
          <Link to="/reservations" className="btn btn-outline small">Reserve</Link>
          <button className="burger" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
        </div>
      </nav>

      <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <button className="close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={28} /></button>
        <Logo drawer />
        <ul>
          {LINKS.map(([to, label], i) => (
            <li key={to} style={{ transitionDelay: `${open ? i * 60 : 0}ms` }}><NavLink to={to} end={to === '/'}>{label}</NavLink></li>
          ))}
          {user && <li><NavLink to={user.role === 'admin' ? '/admin/reservations' : '/my-reservations'}>{user.role === 'admin' ? 'Admin' : 'My Reservations'}</NavLink></li>}
          <li>{user ? <button onClick={logout}>Sign out</button> : <NavLink to="/login">Sign in</NavLink>}</li>
        </ul>
      </div>

      <Link to="/reservations" className="sticky-reserve">Reserve a table</Link>
    </>
  );
}

export function Footer() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/settings', { auth: false }).then(setS).catch(() => {}); }, []);
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="f-top">
          <div>
            <Logo footer />
            <p className="tag">Chinese Dining • Heritage • Hospitality</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>{LINKS.map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}</ul>
          </div>
          <div>
            <h4>Hours</h4>
            <ul className="hours-mini">
              {(s?.hours || []).map((h) => (
                <li key={h.day}><span>{h.day.slice(0, 3)}</span><span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Visit</h4>
            <address>
              {s?.address || '128 Heritage Lane, London'}<br />
              <a href={`tel:${s?.phone || ''}`}>{s?.phone}</a><br />
              <a href={`mailto:${s?.email || ''}`}>{s?.email}</a>
            </address>
            <div className="social">
              <a href={s?.instagram || '#'} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={18} /></a>
              <a href={s?.facebook || '#'} aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={18} /></a>
              <a href={s?.tripadvisor || '#'} aria-label="TripAdvisor" target="_blank" rel="noreferrer"><Star size={18} /></a>
            </div>
          </div>
        </div>
        <div className="f-bottom">
          <span>© {new Date().getFullYear()} The Red Lantern. All rights reserved.</span>
          <span><a href="#privacy">Privacy Policy</a> · <a href="#terms">Terms</a></span>
        </div>
      </div>
    </footer>
  );
}
