import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import { Seo } from '../components/ui.jsx';
import AdminNav from './AdminNav.jsx';
import { api } from '../lib/api.js';

const TYPES = ['Dining Room', 'Private Dining', "Chef's Experience"];
const LABEL = { pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected', cancelled: 'Cancelled', completed: 'Completed' };
const TABS = [
  ['pending', 'Pending', { status: 'pending' }, 'asc'],
  ['upcoming', 'Upcoming', { scope: 'upcoming' }, 'asc'],
  ['confirmed', 'Confirmed', { status: 'confirmed' }, 'asc'],
  ['rejected', 'Rejected', { status: 'rejected' }, 'desc'],
  ['cancelled', 'Cancelled', { status: 'cancelled' }, 'desc'],
  ['completed', 'Completed', { status: 'completed' }, 'desc'],
  ['past', 'Past', { scope: 'past' }, 'desc'],
  ['all', 'All', {}, 'desc'],
];
// Which admin actions are available for each current status (mirrors the server rules)
const CAN = {
  confirm: ['pending', 'rejected', 'cancelled'], reject: ['pending', 'confirmed'], cancel: ['pending', 'confirmed'],
  complete: ['confirmed'], update: ['pending', 'confirmed'], message: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
};
const ACTION_TEXT = { created: 'Request submitted', confirm: 'Confirmed', reject: 'Rejected', cancel: 'Cancelled', update: 'Updated', complete: 'Marked completed', message: 'Message sent' };
const fmtStamp = (t) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function Detail({ r, onClose, onSaved }) {
  const [f, setF] = useState({ date: r.date, time: r.time, guests: r.guests, message: '' });
  const [busy, setBusy] = useState('');
  const [res, setRes] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  useEffect(() => { setF({ date: r.date, time: r.time, guests: r.guests, message: '' }); setRes(null); }, [r._id]); // eslint-disable-line
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function act(action) {
    if (['reject', 'cancel'].includes(action) && !confirm(`${action === 'reject' ? 'Reject' : 'Cancel'} this reservation? The guest will be emailed.`)) return;
    setBusy(action); setRes(null);
    try {
      const d = await api(`/reservations/${r._id}`, { method: 'PATCH', body: { action, date: f.date, time: f.time, guests: Number(f.guests), message: f.message } });
      setRes({ ok: true, text: d.emailSent ? `Done. Email sent to ${d.sentTo}.` : `Saved, but the email to ${d.sentTo} could not be sent${d.emailError ? ` (${d.emailError})` : ''}.`, warn: !d.emailSent });
      setF((x) => ({ ...x, message: '' }));
      onSaved(d.reservation);
    } catch (e) { setRes({ ok: false, text: e.message }); }
    finally { setBusy(''); }
  }
  const can = (a) => CAN[a].includes(r.status);
  const Btn = ({ a, cls, children }) => can(a) && <button className={`btn small ${cls}`} disabled={!!busy} onClick={() => act(a)}>{busy === a ? 'Working…' : children}</button>;

  return (
    <aside className="r-panel" role="dialog" aria-modal="true" aria-label={`Reservation ${r.reference}`}>
      <div className="r-head">
        <div><span className="ref">{r.reference}</span><h2>{r.firstName} {r.lastName}</h2></div>
        <button onClick={onClose} aria-label="Close"><X size={22} /></button>
      </div>
      <span className={`pill ${r.status}`}>{LABEL[r.status]}</span>
      <dl className="r-facts">
        <div><dt>Type</dt><dd>{r.experience}</dd></div><div><dt>Guests</dt><dd>{r.guests}</dd></div>
        <div><dt>Email</dt><dd><a href={`mailto:${r.email}`}>{r.email}</a></dd></div>
        <div><dt>Phone</dt><dd>{r.phone}</dd></div>
        <div><dt>Occasion</dt><dd>{r.occasion}</dd></div><div><dt>Submitted</dt><dd>{fmtStamp(r.createdAt)}</dd></div>
        {r.requests && <div className="wide"><dt>Guest requests</dt><dd>{r.requests}</dd></div>}
      </dl>

      <h3>Manage</h3>
      <div className="r-form">
        <label>Date<input type="date" min={r.status === 'completed' ? undefined : today} value={f.date} onChange={set('date')} /></label>
        <label>Time<input type="time" value={f.time} onChange={set('time')} /></label>
        <label>Guests<input type="number" min="1" max="20" value={f.guests} onChange={set('guests')} /></label>
        <label className="wide">Message to the guest (included in the email, shown on their dashboard)
          <textarea rows="3" maxLength="1000" value={f.message} onChange={set('message')} placeholder="e.g. We've moved you to the Jade Room; sorry we are fully booked at 8pm…" /></label>
      </div>
      <div className="r-actions">
        <Btn a="confirm" cls="btn-red">Confirm</Btn>
        <Btn a="reject" cls="btn-outline">Reject</Btn>
        <Btn a="cancel" cls="btn-outline">Cancel</Btn>
        <Btn a="update" cls="btn-outline">Save changes</Btn>
        <Btn a="complete" cls="btn-outline">Mark completed</Btn>
        {!['update'].some(can) && can('message') && <Btn a="message" cls="btn-outline">Send message</Btn>}
      </div>
      <p className="r-note">Every action updates the reservation, notifies the guest by email at <strong>{r.email}</strong> and appears instantly on their My Reservations page.</p>
      {res && <p className={res.ok ? (res.warn ? 'form-err' : 'success inline') : 'form-err'} role="status">{res.text}</p>}

      <h3>History</h3>
      <ol className="r-history">
        {[...(r.history || [])].reverse().map((h, i) => (
          <li key={i}><time>{fmtStamp(h.at)}</time><strong>{ACTION_TEXT[h.action] || h.action}</strong> <small>by {h.by}</small>
            <div>{LABEL[h.status]} · {h.date} {h.time} · {h.guests} guests</div>{h.note && <em>“{h.note}”</em>}</li>
        ))}
      </ol>
    </aside>
  );
}

export default function AdminReservations() {
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [rows, setRows] = useState([]);
  const [sum, setSum] = useState({});
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => { const t = setTimeout(() => setDq(q), 300); return () => clearTimeout(t); }, [q]);

  const load = useCallback(async () => {
    const [, , params, sort] = TABS.find((t) => t[0] === tab);
    const qs = new URLSearchParams({ ...params, sort, ...(dq && { q: dq }), ...(date && { date }), ...(type && { experience: type }) });
    try {
      const [list, s] = await Promise.all([api(`/reservations?${qs}`), api('/reservations/summary')]);
      setRows(list); setSum(s); setErr('');
      setOpen((o) => (o ? list.find((x) => x._id === o._id) || o : o));
    } catch (e) { setErr(e.message); }
  }, [tab, dq, date, type]);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  const clear = () => { setQ(''); setDate(''); setType(''); };
  const filtered = !!(q || date || type);

  return (
    <section className="admin">
      <Seo title="Admin · Reservations" description="Manage reservations." />
      <div className="wrap wide">
        <h1>Reservations</h1>
        <AdminNav />
        <div className="a-tabs" role="tablist" aria-label="Reservation views">
          {TABS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {label} <span className="count">{sum[k] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="a-filters">
          <label className="search"><span>Search</span><div><Search size={15} /><input placeholder="Name, email, phone or reservation ID" value={q} onChange={(e) => setQ(e.target.value)} /></div></label>
          <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label>Type<select value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
          {filtered && <button className="textlink gold" onClick={clear}>Clear filters</button>}
          <button className="textlink gold" onClick={load}><RefreshCw size={13} /> Refresh</button>
        </div>
        {err && <p className="form-err">{err}</p>}

        <div className="a-table"><table>
          <thead><tr><th>ID</th><th>Guest</th><th>Type</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="clickable" onClick={() => setOpen(r)}>
                <td>{r.reference}</td>
                <td>{r.firstName} {r.lastName}<br /><small>{r.email}</small></td>
                <td>{r.experience}</td><td>{r.date}</td><td>{r.time}</td><td>{r.guests}</td>
                <td><span className={`pill ${r.status}`}>{LABEL[r.status]}</span></td>
                <td><button className="textlink gold" onClick={(e) => { e.stopPropagation(); setOpen(r); }}>Review</button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="8" className="empty">No reservations match.</td></tr>}
          </tbody>
        </table></div>
      </div>

      {open && <>
        <div className="r-backdrop" onClick={() => setOpen(null)} />
        <Detail r={open} onClose={() => setOpen(null)} onSaved={(nr) => { setOpen(nr); load(); }} />
      </>}
    </section>
  );
}
