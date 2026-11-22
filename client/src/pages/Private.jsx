import { useState } from 'react';
import { Seo, PageHero, Reveal, Img, Eyebrow, Field } from '../components/ui.jsx';
import { IMG } from '../lib/images.js';
import { api } from '../lib/api.js';

const TYPES = [
  ['Intimate Celebrations', 'Birthdays, anniversaries and family gatherings around a single round table.'],
  ['Corporate Dining', 'Business dinners and hospitality, with discreet service and set banquet menus.'],
  ['Private Events', 'Custom dining experiences for weddings, cultural evenings and special occasions.'],
];

export default function Private() {
  const empty = { name: '', email: '', phone: '', eventType: 'Intimate Celebrations', date: '', guests: 10, message: '' };
  const [f, setF] = useState(empty);
  const [state, setState] = useState({ busy: false, ok: false, err: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, ok: false, err: '' });
    try { await api('/enquiries', { method: 'POST', body: { ...f, guests: Number(f.guests) }, auth: false }); setState({ busy: false, ok: true, err: '' }); setF(empty); }
    catch (er) { setState({ busy: false, ok: false, err: er.message }); }
  }

  return (
    <>
      <Seo title="Private Dining" description="Gather, celebrate, remember. Private dining and events at The Red Lantern for birthdays, corporate dinners and weddings." />
      <PageHero title="Private Dining" subtitle="Gather. Celebrate. Remember." image={IMG.private} crumb="Private Dining & Events" />

      <section className="paper">
        <div className="wrap split">
          <Reveal className="frame"><Img src={IMG.dining} alt="Private dining room" /></Reveal>
          <Reveal delay={0.15} className="priv-text">
            <Eyebrow>Intimate Spaces. Unforgettable Experiences.</Eyebrow>
            <p className="lead dark">The Red Lantern offers exclusive dining rooms for every kind of celebration, delivered with the same care as our main dining room.</p>
            <ul className="seal-list"><li>Private dining rooms</li><li>Corporate events</li><li>Celebrations &amp; parties</li><li>Custom menus</li></ul>
            <a href="#enquire" className="btn btn-red">Enquire Now</a>
          </Reveal>
        </div>
      </section>

      <section className="paper types">
        <div className="wrap">
          {TYPES.map(([t, d], i) => (
            <Reveal key={t} className="type-row"><span className="num">0{i + 1}</span><h3>{t}</h3><p>{d}</p></Reveal>
          ))}
        </div>
      </section>

      <section className="ink room">
        <div className="wrap split">
          <Reveal><Eyebrow light>The Private Room</Eyebrow><h2>The Jade Room</h2>
            <dl className="facts"><div><dt>Seating</dt><dd>Up to 24 seated · 40 standing</dd></div><div><dt>Atmosphere</dt><dd>Lantern-lit, screened, acoustically soft</dd></div><div><dt>Arrangements</dt><dd>Round tables, long banquet or cocktail style</dd></div><div><dt>Dining</dt><dd>Banquet menus from £65 per guest</dd></div></dl>
          </Reveal>
          <Reveal delay={0.15} className="frame"><Img src={IMG.reservations} alt="The Jade Room" /></Reveal>
        </div>
      </section>

      <section className="ink enquiry" id="enquire">
        <div className="wrap narrow">
          <Reveal><Eyebrow light>Plan Your Event</Eyebrow><h2>Event Enquiry</h2></Reveal>
          {state.ok ? <p className="success">Thank you. Our events team will reply within one working day.</p> : (
            <form onSubmit={submit} className="form dark-form">
              <div className="row2"><Field label="Name" id="p-name"><input id="p-name" required value={f.name} onChange={set('name')} /></Field>
                <Field label="Email" id="p-email"><input id="p-email" type="email" required value={f.email} onChange={set('email')} /></Field></div>
              <div className="row2"><Field label="Phone" id="p-phone"><input id="p-phone" value={f.phone} onChange={set('phone')} /></Field>
                <Field label="Event Type" id="p-type"><select id="p-type" value={f.eventType} onChange={set('eventType')}>{TYPES.map(([t]) => <option key={t}>{t}</option>)}</select></Field></div>
              <div className="row2"><Field label="Preferred Date" id="p-date"><input id="p-date" type="date" value={f.date} onChange={set('date')} /></Field>
                <Field label="Number of Guests" id="p-guests"><input id="p-guests" type="number" min="2" max="60" value={f.guests} onChange={set('guests')} /></Field></div>
              <Field label="Message" id="p-msg"><textarea id="p-msg" rows="4" value={f.message} onChange={set('message')} /></Field>
              {state.err && <p className="form-err" role="alert">{state.err}</p>}
              <button className="btn btn-red" disabled={state.busy}>{state.busy ? 'Sending…' : 'Enquire About Your Event'}</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
