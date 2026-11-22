import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Seo, PageHero } from '../components/ui.jsx';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import { IMG } from '../lib/images.js';

export const STATUS_LABEL = { pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected', cancelled: 'Cancelled', completed: 'Completed' };
const STATUS_HELP = {
  pending: 'Awaiting confirmation from our team.',
  confirmed: 'Your table is confirmed. We look forward to seeing you.',
  rejected: 'We were unable to accommodate this request.',
  cancelled: 'This reservation has been cancelled.',
  completed: 'Thank you for dining with us.',
};
const ACTION_TEXT = { created: 'Request submitted', confirm: 'Confirmed by the restaurant', reject: 'Rejected by the restaurant', cancel: 'Cancelled by the restaurant', update: 'Details updated by the restaurant', complete: 'Marked as completed', message: 'Message from the restaurant' };

const fmtDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fmtStamp = (t) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function MyReservations() {
  const { user, ready } = useAuth();
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all');
  const [stamp, setStamp] = useState(null);

  const load = useCallback(async () => {
    try { setRows(await api('/reservations/mine')); setErr(''); setStamp(new Date()); }
    catch (e) { setErr(e.message); }
  }, []);

  // Live updates: poll every 15 s, and refresh whenever the tab regains focus
  useEffect(() => {
    if (!user) return;
    load();
    const t = setInterval(load, 15000);
    const vis = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', vis); window.addEventListener('focus', load);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', vis); window.removeEventListener('focus', load); };
  }, [user, load]);

  if (!ready) return <div className="center-msg">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: '/my-reservations' }} replace />;

  const list = (rows || []).filter((r) => filter === 'all' || r.status === filter);
  const count = (s) => (rows || []).filter((r) => r.status === s).length;

  return (
    <>
      <Seo title="My Reservations" description="Track your reservations at The Red Lantern and see updates from our team." />
      <PageHero title="My Reservations" subtitle="Every booking, and every update, in one place." image={IMG.dining} crumb="My Reservations" />
      <section className="paper mine">
        <div className="wrap narrow-lg">
          <div className="mine-bar">
            <div className="chips" role="tablist" aria-label="Filter by status">
              {['all', 'pending', 'confirmed', 'completed', 'rejected', 'cancelled'].map((s) => (
                <button key={s} role="tab" aria-selected={filter === s} className={filter === s ? 'on' : ''} onClick={() => setFilter(s)}>
                  {s === 'all' ? `All (${rows?.length || 0})` : `${STATUS_LABEL[s]} (${count(s)})`}
                </button>
              ))}
            </div>
            <button className="textlink live" onClick={load} aria-label="Refresh"><RefreshCw size={14} /> {stamp ? `Updated ${stamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Refresh'}</button>
          </div>
          {err && <p className="form-err" role="alert">{err}</p>}

          {rows && list.length === 0 && (
            <div className="empty-state"><p className="serif-quote">{rows.length ? 'No reservations with this status.' : 'You have no reservations yet.'}</p>
              <Link to="/reservations" className="btn btn-red">Reserve a Table</Link></div>
          )}

          <ul className="res-list">
            {list.map((r) => (
              <li key={r._id} className={`res-card ${r.status}`}>
                <div className="res-top">
                  <div><span className="ref">{r.reference}</span><h3>{r.experience}</h3></div>
                  <span className={`status ${r.status}`}>{STATUS_LABEL[r.status]}</span>
                </div>
                <p className="status-help">{STATUS_HELP[r.status]}</p>
                <dl className="res-facts">
                  <div><dt>Date</dt><dd>{fmtDate(r.date)}</dd></div>
                  <div><dt>Time</dt><dd>{r.time}</dd></div>
                  <div><dt>Guests</dt><dd>{r.guests}</dd></div>
                  {r.occasion && r.occasion !== 'None' && <div><dt>Occasion</dt><dd>{r.occasion}</dd></div>}
                </dl>
                {r.requests && <p className="res-req"><strong>Your requests:</strong> {r.requests}</p>}
                {r.adminMessage && <div className="admin-note"><span>Message from the restaurant</span>{r.adminMessage}</div>}
                <details className="timeline-d">
                  <summary>Updates ({r.history?.length || 0})</summary>
                  <ol>
                    {[...(r.history || [])].reverse().map((h, i) => (
                      <li key={i}><time>{fmtStamp(h.at)}</time><strong>{ACTION_TEXT[h.action] || h.action}</strong>
                        {h.action !== 'created' && <span> — {STATUS_LABEL[h.status]} · {h.date} {h.time}</span>}
                        {h.note && <em>“{h.note}”</em>}</li>
                    ))}
                  </ol>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
