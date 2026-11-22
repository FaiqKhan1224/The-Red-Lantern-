import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Seo, Reveal, Img, Seal, Eyebrow } from '../components/ui.jsx';
import { IMG } from '../lib/images.js';

const EXPERIENCES = [
  ['The Kitchen', 'Traditional techniques interpreted through a contemporary lens.', IMG.contact],
  ['The Table', 'A dining experience designed around connection and hospitality.', IMG.dining],
  ['The Culture', 'A celebration of Chinese heritage through food, architecture and atmosphere.', IMG.story],
];

const DISHES = [
  ['Peking Duck', 'Crisp skin, aromatic spices and centuries of culinary tradition.', IMG.duck],
  ['Sichuan Chilli Prawns', 'Wok-fired with dried chilli and the numbing warmth of Sichuan pepper.', IMG.prawns],
  ['Dragon Pearl Dumplings', 'Hand-pleated by our dim sum chefs each morning.', IMG.dumplings],
];

export default function Home() {
  const hero = useRef(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);

  return (
    <>
      <Seo title="Chinese Restaurant" description="The Red Lantern — a contemporary expression of Chinese dining. Tradition, flavour and hospitality. Reserve your table." />

      <section className="hero" ref={hero}>
        <motion.div className="hero-bg" style={{ y }}><Img src={IMG.hero} alt="A traditional dining room at The Red Lantern, lit by red paper lanterns" className="bg" loading="eager" fetchpriority="high" /></motion.div>
        <div className="shade" />
        <motion.div className="hero-copy" style={{ opacity: fade, y: textY }}>
          <motion.p className="zh-big" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>红灯笼</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 0.2 }}>The Red Lantern</motion.h1>
          <motion.p className="hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.7 }}>A Contemporary Expression of Chinese Dining</motion.p>
          <p className="hero-tag"><span className="rule" /> TRADITION • FLAVOR • HOSPITALITY <span className="rule" /></p>
          <div className="btn-row">
            <Link to="/reservations" className="btn btn-red">Reserve a Table</Link>
            <Link to="/our-story" className="btn btn-outline">Explore Our Story</Link>
          </div>
        </motion.div>
        <div className="vertical-text" aria-hidden="true">传统 · 风味 · 款待</div>
      </section>

      <section className="paper intro">
        <div className="wrap split">
          <Reveal className="quote">
            <Seal />
            <blockquote>“Where ancient traditions meet the rhythm of modern dining.”</blockquote>
          </Reveal>
          <Reveal delay={0.15} className="dark-panel">
            <Eyebrow light>The Art of Hospitality</Eyebrow>
            <p>At The Red Lantern, we bring together heritage, flavour and warmth. Every dish begins with respect for tradition and ends with a table that feels like home — shared slowly, generously and with intention.</p>
            <Link to="/our-story" className="textlink gold">Learn more →</Link>
          </Reveal>
        </div>
      </section>

      <section className="paper experience">
        <div className="wrap">
          <Reveal><p className="kicker">Our Signature Experience</p></Reveal>
          <div className="exp-row">
            {EXPERIENCES.map(([t, d, img], i) => (
              <Reveal key={t} delay={i * 0.15} className="exp">
                <div className="frame"><Img src={img} alt={t} /></div>
                <div className="exp-text">
                  <h3>{t}</h3><p>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ink dishes">
        <div className="wrap">
          <Reveal><Eyebrow light>Signature Dishes</Eyebrow><h2>Chef’s Selection</h2></Reveal>
          {DISHES.map(([name, text, img], i) => (
            <div key={name} className={`dish ${i % 2 ? 'flip' : ''}`}>
              <Reveal className="dish-img"><Img src={img} alt={name} /></Reveal>
              <Reveal delay={0.15} className="dish-text">
                <span className="small-caps">Signature</span>
                <h3>{name}</h3>
                <p className="serif-quote">“{text}”</p>
                <span className="small-caps gold">Chef’s Selection</span>
              </Reveal>
            </div>
          ))}
          <Reveal><Link to="/dining" className="textlink gold">View the full menu →</Link></Reveal>
        </div>
      </section>

      <section className="atmos">
        <Img src={IMG.private} alt="Red lanterns above the dining room of The Red Lantern" className="bg" />
        <div className="shade" />
        <Reveal className="atmos-copy"><h2>Come for the flavor.<br /><em>Stay for the experience.</em></h2></Reveal>
      </section>

      <section className="ink final">
        <Reveal>
          <p className="zh-big small">红灯笼</p>
          <h2>Your Table Awaits</h2>
          <div className="btn-row center">
            <Link to="/reservations" className="btn btn-red">Reserve a Table</Link>
            <Link to="/contact" className="btn btn-outline">Contact Us</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
