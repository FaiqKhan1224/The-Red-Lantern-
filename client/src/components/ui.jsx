import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SRCSET, FOCUS } from '../lib/images.js';

export function Seo({ title, description }) {
  useEffect(() => {
    document.title = `The Red Lantern | ${title}`;
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
    m.content = description;
    window.scrollTo(0, 0);
  }, [title, description]);
  return null;
}

export function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const M = motion[as];
  return (
    <M className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 1.0, delay, ease: [0.22, 0.61, 0.36, 1] }}>
      {children}
    </M>
  );
}

// Image with graceful dark fallback if a photo cannot load.
// Provided photos get responsive srcset + per-device focal point (see lib/images.js).
export function Img({ src, alt, className = '', ...rest }) {
  const [bad, setBad] = useState(false);
  if (!src || bad) return <div className={`img-fallback ${className}`} role="img" aria-label={alt} />;
  const focus = FOCUS[src];
  const style = focus ? { '--pos-d': focus[0], '--pos-m': focus[1], ...rest.style } : rest.style;
  const srcSet = SRCSET[src];
  return (
    <img src={src} alt={alt} loading="lazy" decoding="async" className={className}
      srcSet={srcSet} sizes={srcSet ? '100vw' : undefined}
      onError={() => setBad(true)} {...rest} style={style} />
  );
}

export function Seal({ text = '红灯', size = 44 }) {
  return <span className="seal" style={{ width: size, height: size, fontSize: size * 0.34 }} aria-hidden="true">{text}</span>;
}

export function Eyebrow({ children, light }) {
  return <p className={`eyebrow ${light ? 'light' : ''}`}><span className="rule" />{children}</p>;
}

export function PageHero({ title, subtitle, image, crumb, tall }) {
  return (
    <header className={`page-hero ${tall ? 'tall' : ''}`}>
      <Img src={image} alt="" className="bg" />
      <div className="shade" />
      <div className="inner">
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }}>{title}</motion.h1>
        <motion.p className="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 0.3 }}>{subtitle}</motion.p>
        {crumb && <p className="crumb"><Link to="/">Home</Link> <span>›</span> {crumb}</p>}
      </div>
    </header>
  );
}

export function PasswordInput({ id, label, value, onChange, autoComplete = 'current-password', hint }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pw">
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange}
          autoComplete={autoComplete} required minLength={8} aria-describedby={hint ? `${id}-hint` : undefined} />
        <button type="button" className="eye" onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}

export function Field({ label, id, children }) {
  return <div className="field"><label htmlFor={id}>{label}</label>{children}</div>;
}
