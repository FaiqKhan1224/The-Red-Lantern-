import { useEffect, useState } from 'react';
import { Seo, PageHero, Field, Reveal, Eyebrow } from '../components/ui.jsx';
import { IMG } from '../lib/images.js';
import { api } from '../lib/api.js';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  const [s, setS] = useState(null);
  const blank = { name: '', email: '', phone: '', subject: '', message: '' };
  const [f, setF] = useState(blank);
  const [state, setState] = useState({ busy: false, ok: false, err: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  useEffect(() => { api('/settings', { auth: false }).then(setS).catch(() => {}); }, []);

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, ok: false, err: '' });
    try { await api('/contact', { method: 'POST', body: f, auth: false }); setState({ busy: false, ok: true, err: '' }); setF(blank); }
    catch (er) { setState({ busy: false, ok: false, err: er.message }); }
  }
  const addr = s?.address || '128 Heritage Lane, London, W1K 3AB';

  return (
    <>
      <Seo title="Contact" description="Find The Red Lantern: address, opening hours, phone and a message form. Step through the lanterns." />
      <PageHero title="Find Us" subtitle="Step through the lanterns." image={IMG.contact} crumb="Contact" />
      <section className="paper">
        <div className="wrap contact-grid">
          <Reveal className="info">
            <Eyebrow>Visit Us</Eyebrow>
            <p><MapPin size={16} /> {addr}</p>
            <p><Phone size={16} /> {s?.phone}</p>
            <p><Mail size={16} /> {s?.email}</p>
            <h3 className="hours-h">Opening Hours</h3>
            <ul className="hours">
              {(s?.hours || []).map((h) => <li key={h.day}><span>{h.day}</span><i /><span>{h.closed ? 'Closed' : `${h.open} — ${h.close}`}</span></li>)}
            </ul>
          </Reveal>
          <Reveal delay={0.15} className="map">
            <iframe title="Map showing The Red Lantern" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(addr)}&output=embed`} />
          </Reveal>
        </div>
      </section>
      <section className="ink">
        <div className="wrap narrow">
          <Reveal><Eyebrow light>We’d love to hear from you</Eyebrow><h2>Send Us a Message</h2></Reveal>
          {state.ok ? <p className="success">Thank you — your message has reached us. We will reply soon.</p> : (
            <form onSubmit={submit} className="form dark-form">
              <div className="row2"><Field label="Name" id="c-n"><input id="c-n" required value={f.name} onChange={set('name')} /></Field>
                <Field label="Email" id="c-e"><input id="c-e" type="email" required value={f.email} onChange={set('email')} /></Field></div>
              <div className="row2"><Field label="Phone" id="c-p"><input id="c-p" value={f.phone} onChange={set('phone')} /></Field>
                <Field label="Subject" id="c-s"><input id="c-s" value={f.subject} onChange={set('subject')} /></Field></div>
              <Field label="Message" id="c-m"><textarea id="c-m" rows="5" required value={f.message} onChange={set('message')} /></Field>
              {state.err && <p className="form-err" role="alert">{state.err}</p>}
              <button className="btn btn-red" disabled={state.busy}>{state.busy ? 'Sending…' : 'Send Message'}</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
