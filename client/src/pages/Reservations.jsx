import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo, PageHero, Field, Seal } from '../components/ui.jsx';
import { useAuth } from '../lib/auth.jsx';
import { IMG } from '../lib/images.js';
import { api } from '../lib/api.js';

const EXPERIENCES = [
  ['Dining Room', 'The main room, beneath the lanterns.'],
  ['Private Dining', 'A screened room for groups of 8 or more.'],
  ["Chef's Experience", 'An eight-course tasting at the kitchen table.'],
];
const OCCASIONS = ['None', 'Birthday', 'Anniversary', 'Business Dinner', 'Family Celebration', 'Date Night', 'Other'];
const TIMES = ['12:00', '12:30', '13:00', '13:30', '14:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

export default function Reservations() {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const blank = { firstName: '', lastName: '', email: '', phone: '', date: '', time: '19:00', guests: 2, experience: 'Dining Room', occasion: 'None', requests: '' };
  const [f, setF] = useState(blank);
  const [state, setState] = useState({ busy: false, err: '', done: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (user) setF((p) => ({ ...p, firstName: p.firstName || user.name.split(' ')[0], lastName: p.lastName || user.name.split(' ').slice(1).join(' '), email: p.email || user.email }));
  }, [user]);

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, err: '', done: null });
    try { const r = await api('/reservations', { method: 'POST', body: { ...f, guests: Number(f.guests) } }); setState({ busy: false, err: '', done: r }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (er) { setState({ busy: false, err: er.message, done: null }); }
  }

  const d = state.done;
  return (
    <>
      <Seo title="Reservations" description="Reserve your table at The Red Lantern. Your evening begins here." />
      <PageHero title="Reserve Your Table" subtitle="Your evening begins here." image={IMG.reservations} crumb="Reservations" />
      <section className="paper res-sec">
        <div className="wrap narrow">
          {d ? (
            <div className="confirm">
              <Seal size={64} />
              <h2>Your Table Is Requested</h2>
              <p className="serif-quote">“Thank you for choosing The Red Lantern, {d.firstName}.”</p>
              <dl className="facts light">
                <div><dt>Date</dt><dd>{d.date}</dd></div><div><dt>Time</dt><dd>{d.time}</dd></div>
                <div><dt>Guests</dt><dd>{d.guests}</dd></div><div><dt>Reference</dt><dd className="ref">{d.reference}</dd></div>
              </dl>
              <p className="muted">{d.emailSent ? <>A confirmation email has been sent to <strong>{d.email}</strong>.</> : <>We could not send the confirmation email to <strong>{d.email}</strong>, but your request is saved.</>} Our team will review it and email you about every update. Status: <strong>{d.status}</strong>.</p>
              <div className="btn-row center"><Link to="/my-reservations" className="btn btn-red">My Reservations</Link><Link to="/" className="btn btn-dark">Return Home</Link></div>
            </div>
          ) : (
            <form onSubmit={submit} className="form">
              <fieldset className="choices">
                <legend>Choose your experience</legend>
                {EXPERIENCES.map(([n, t]) => (
                  <label key={n} className={f.experience === n ? 'on' : ''}>
                    <input type="radio" name="exp" value={n} checked={f.experience === n} onChange={set('experience')} />
                    <strong>{n}</strong><span>{t}</span>
                  </label>
                ))}
              </fieldset>
              <div className="row2"><Field label="First Name" id="r-fn"><input id="r-fn" required value={f.firstName} onChange={set('firstName')} autoComplete="given-name" /></Field>
                <Field label="Last Name" id="r-ln"><input id="r-ln" required value={f.lastName} onChange={set('lastName')} autoComplete="family-name" /></Field></div>
              <div className="row2"><Field label="Email" id="r-em"><input id="r-em" type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></Field>
                <Field label="Phone" id="r-ph"><input id="r-ph" type="tel" required value={f.phone} onChange={set('phone')} autoComplete="tel" /></Field></div>
              <div className="row3"><Field label="Date" id="r-dt"><input id="r-dt" type="date" min={today} required value={f.date} onChange={set('date')} /></Field>
                <Field label="Time" id="r-tm"><select id="r-tm" value={f.time} onChange={set('time')}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select></Field>
                <Field label="Guests" id="r-gs"><select id="r-gs" value={f.guests} onChange={set('guests')}>{Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}</select></Field></div>
              <Field label="Occasion" id="r-oc"><select id="r-oc" value={f.occasion} onChange={set('occasion')}>{OCCASIONS.map((o) => <option key={o}>{o}</option>)}</select></Field>
              <Field label="Special Requests" id="r-rq"><textarea id="r-rq" rows="3" maxLength="1000" value={f.requests} onChange={set('requests')} placeholder="Allergies, seating preferences, celebrations…" /></Field>
              {state.err && <p className="form-err" role="alert">{state.err}</p>}
              <button className="btn btn-red wide" disabled={state.busy}>{state.busy ? 'Sending…' : 'Request Reservation'}</button>
              <p className="muted center">No payment is taken. {!user && <>Sign in <Link to="/login" state={{ from: '/reservations' }}>here</Link> first to see this booking under My Reservations.</>}</p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
