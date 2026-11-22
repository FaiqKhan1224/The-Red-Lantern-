import { useCallback, useEffect, useState } from 'react';
import { Seo } from '../components/ui.jsx';
import AdminNav from './AdminNav.jsx';
import { api } from '../lib/api.js';
import { Trash2, Check } from 'lucide-react';

const TABS = ['Menu', 'Gallery', 'Enquiries', 'Messages', 'Restaurant'];
const CATS = ['Signatures', 'Dim Sum', 'Main Courses', 'Vegetarian', 'Rice & Noodles', 'Desserts', 'Tea & Beverages'];

function useList(path) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const load = useCallback(() => api(path).then((r) => { setRows(r); setErr(''); }).catch((e) => setErr(e.message)), [path]);
  useEffect(() => { load(); }, [load]);
  return [rows, load, err];
}

function Menu() {
  const [rows, load] = useList('/menu');
  const blank = { name: '', description: '', price: '', category: CATS[0], image: '', featured: false };
  const [f, setF] = useState(blank);
  const add = async (e) => { e.preventDefault(); await api('/menu', { method: 'POST', body: { ...f, price: Number(f.price) } }); setF(blank); load(); };
  const patch = async (r, p) => { await api(`/menu/${r._id}`, { method: 'PUT', body: p }); load(); };
  const del = async (id) => { if (confirm('Delete this dish?')) { await api(`/menu/${id}`, { method: 'DELETE' }); load(); } };
  return (
    <>
      <form className="a-form" onSubmit={add}>
        <input placeholder="Dish name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <input placeholder="Price (£)" type="number" step="0.5" min="0" required value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <input placeholder="Image URL (optional)" value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} />
        <label className="chk"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> Featured</label>
        <button className="btn btn-red small">Add dish</button>
      </form>
      <div className="a-table"><table>
        <thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Featured</th><th>Available</th><th /></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r._id}><td>{r.name}<br /><small>{r.description}</small></td><td>{r.category}</td>
            <td><input className="mini" type="number" defaultValue={r.price} onBlur={(e) => Number(e.target.value) !== r.price && patch(r, { price: Number(e.target.value) })} /></td>
            <td><input type="checkbox" checked={r.featured} onChange={(e) => patch(r, { featured: e.target.checked })} /></td>
            <td><input type="checkbox" checked={r.available} onChange={(e) => patch(r, { available: e.target.checked })} /></td>
            <td className="acts"><button onClick={() => del(r._id)} title="Delete"><Trash2 size={16} /></button></td></tr>))}
        </tbody></table></div>
    </>
  );
}

function Gallery() {
  const [rows, load] = useList('/gallery');
  const blank = { title: '', category: 'The Dining Room', url: '', size: 'small' };
  const [f, setF] = useState(blank);
  const add = async (e) => { e.preventDefault(); await api('/gallery', { method: 'POST', body: f }); setF(blank); load(); };
  const del = async (id) => { if (confirm('Remove this image?')) { await api(`/gallery/${id}`, { method: 'DELETE' }); load(); } };
  return (
    <>
      <form className="a-form" onSubmit={add}>
        <input placeholder="Title" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <input placeholder="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
        <input placeholder="Image URL or /images/file.jpg" required value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
        <select value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })}>{['small', 'wide', 'tall', 'large'].map((s) => <option key={s}>{s}</option>)}</select>
        <button className="btn btn-red small">Add image</button>
      </form>
      <div className="a-thumbs">{rows.map((r) => (
        <figure key={r._id}><img src={r.url} alt={r.title} loading="lazy" /><figcaption>{r.title}<button onClick={() => del(r._id)} aria-label={`Delete ${r.title}`}><Trash2 size={14} /></button></figcaption></figure>))}</div>
    </>
  );
}

function Enquiries() {
  const [rows, load] = useList('/enquiries');
  const set = async (id, status) => { await api(`/enquiries/${id}`, { method: 'PUT', body: { status } }); load(); };
  const del = async (id) => { if (confirm('Delete enquiry?')) { await api(`/enquiries/${id}`, { method: 'DELETE' }); load(); } };
  return (
    <div className="a-table"><table>
      <thead><tr><th>From</th><th>Event</th><th>Date</th><th>Guests</th><th>Message</th><th>Status</th><th /></tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r._id}><td>{r.name}<br /><small>{r.email}<br />{r.phone}</small></td><td>{r.eventType}</td><td>{r.date}</td><td>{r.guests}</td><td><small>{r.message}</small></td>
          <td><select value={r.status} onChange={(e) => set(r._id, e.target.value)}>{['new', 'contacted', 'confirmed', 'closed'].map((s) => <option key={s}>{s}</option>)}</select></td>
          <td className="acts"><button onClick={() => del(r._id)}><Trash2 size={16} /></button></td></tr>))}
        {!rows.length && <tr><td colSpan="7" className="empty">No enquiries yet.</td></tr>}</tbody></table></div>
  );
}

function Messages() {
  const [rows, load] = useList('/contact');
  const mark = async (r) => { await api(`/contact/${r._id}`, { method: 'PUT', body: { read: !r.read } }); load(); };
  const del = async (id) => { if (confirm('Delete message?')) { await api(`/contact/${id}`, { method: 'DELETE' }); load(); } };
  return (
    <div className="a-table"><table>
      <thead><tr><th>From</th><th>Subject</th><th>Message</th><th>Received</th><th /></tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r._id} className={r.read ? 'read' : ''}><td>{r.name}<br /><small>{r.email}<br />{r.phone}</small></td><td>{r.subject}</td><td>{r.message}</td><td><small>{new Date(r.createdAt).toLocaleString()}</small></td>
          <td className="acts"><button onClick={() => mark(r)} title="Toggle read"><Check size={16} /></button><button onClick={() => del(r._id)}><Trash2 size={16} /></button></td></tr>))}
        {!rows.length && <tr><td colSpan="5" className="empty">No messages yet.</td></tr>}</tbody></table></div>
  );
}

function Restaurant() {
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { api('/settings', { auth: false }).then(setS); }, []);
  if (!s) return null;
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const hour = (i, k, v) => setS({ ...s, hours: s.hours.map((h, j) => (j === i ? { ...h, [k]: v } : h)) });
  const save = async (e) => { e.preventDefault(); await api('/settings', { method: 'PUT', body: s }); setMsg('Saved.'); setTimeout(() => setMsg(''), 2500); };
  return (
    <form className="a-form col" onSubmit={save}>
      {['address', 'phone', 'email', 'instagram', 'facebook', 'tripadvisor'].map((k) => <label key={k}>{k}<input value={s[k] || ''} onChange={set(k)} /></label>)}
      <h3>Opening hours</h3>
      {s.hours.map((h, i) => (
        <div className="hrow" key={h.day}><span>{h.day}</span>
          <label className="chk"><input type="checkbox" checked={!!h.closed} onChange={(e) => hour(i, 'closed', e.target.checked)} /> Closed</label>
          {!h.closed && <><input type="time" value={h.open || ''} onChange={(e) => hour(i, 'open', e.target.value)} /><input type="time" value={h.close || ''} onChange={(e) => hour(i, 'close', e.target.value)} /></>}
        </div>))}
      <button className="btn btn-red small">Save changes</button> {msg && <span className="success inline">{msg}</span>}
    </form>
  );
}

const VIEWS = { Menu, Gallery, Enquiries, Messages, Restaurant };

export default function Admin() {
  const [tab, setTab] = useState('Menu');
  const View = VIEWS[tab];
  return (
    <section className="admin">
      <Seo title="Admin" description="Restaurant management." />
      <div className="wrap wide">
        <h1>Menu &amp; Content</h1>
        <AdminNav />
        <nav className="a-tabs" aria-label="Admin sections">{TABS.map((t) => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</nav>
        <View />
      </div>
    </section>
  );
}
