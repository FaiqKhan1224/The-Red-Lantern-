import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Seo, PageHero, Reveal, Img, Eyebrow } from '../components/ui.jsx';
import { IMG } from '../lib/images.js';
import { api } from '../lib/api.js';

const CATS = ['Signatures', 'Dim Sum', 'Main Courses', 'Vegetarian', 'Rice & Noodles', 'Desserts', 'Tea & Beverages'];
const LEGEND = { V: 'Vegetarian', VG: 'Vegan', GF: 'Gluten-free', SPICY: 'Spicy' };

export default function Dining() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState(CATS[0]);
  const [err, setErr] = useState('');

  useEffect(() => { api('/menu', { auth: false }).then(setItems).catch((e) => setErr(e.message)); }, []);
  const list = useMemo(() => items.filter((i) => i.category === cat && i.available), [items, cat]);
  const chef = items.find((i) => i.featured && i.image) || null;

  return (
    <>
      <Seo title="Chinese Dining & Menu" description="A menu shaped by tradition, season and imagination. Explore signatures, dim sum, mains, vegetarian dishes, desserts and tea." />
      <PageHero title="Dining & Menu" subtitle="A menu shaped by tradition, season and imagination." image={IMG.dining} crumb="Dining & Menu" />

      <section className="paper menu-sec">
        <div className="wrap menu-layout">
          <div>
            <nav className="menu-tabs" aria-label="Menu categories">
              {CATS.map((c) => (
                <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)} aria-pressed={c === cat}>{c}</button>
              ))}
            </nav>
            {err && <p className="form-err">{err}</p>}
            <AnimatePresence mode="wait">
              <motion.ul key={cat} className="menu-list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                {list.map((d) => (
                  <li key={d._id}>
                    <div className="m-head">
                      <h3>{d.name}</h3><span className="dots" /><span className="price">£{d.price}</span>
                    </div>
                    <p>{d.description}{d.dietary?.length > 0 && <span className="diet">{d.dietary.map((x) => <abbr key={x} title={LEGEND[x]}>{x}</abbr>)}</span>}</p>
                  </li>
                ))}
                {!err && list.length === 0 && <li className="empty">This section is being prepared.</li>}
              </motion.ul>
            </AnimatePresence>
            <p className="legend">V Vegetarian · VG Vegan · GF Gluten-free · SPICY Spicy. Please tell your server about any allergies.</p>
          </div>
          <aside className="chef-table">
            <div className="frame"><Img src={chef?.image || IMG.duck} alt="Chef's table dish" /></div>
            <Eyebrow>Chef’s Table</Eyebrow>
            <p>A seasonal selection curated by our kitchen, served as a tasting journey of eight small courses.</p>
            <Link to="/reservations" className="textlink">Reserve the Chef’s Experience →</Link>
          </aside>
        </div>
      </section>

      <section className="ink season">
        <div className="wrap split">
          <Reveal><Eyebrow light>This Season</Eyebrow><h2>Winter, <em>slowly braised</em></h2></Reveal>
          <Reveal delay={0.15}><p className="lead">As the weather cools, our kitchen turns to long braises, aged teas, chestnuts, white radish and the quiet comfort of clay-pot cooking. Ask your server about the dishes that will only be with us until spring.</p></Reveal>
        </div>
      </section>
    </>
  );
}
