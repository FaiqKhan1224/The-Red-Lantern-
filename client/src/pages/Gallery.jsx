import { useEffect, useState } from 'react';
import { Seo, PageHero, Img, Reveal } from '../components/ui.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { IMG } from '../lib/images.js';
import { api } from '../lib/api.js';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(null);
  useEffect(() => { api('/gallery', { auth: false }).then(setItems).catch(() => {}); }, []);

  return (
    <>
      <Seo title="Gallery" description="A glimpse behind the lanterns — the dining room, the kitchen, the chef and the dishes of The Red Lantern." />
      <PageHero title="The Experience" subtitle="A glimpse behind the lanterns." image={IMG.gallery} crumb="Gallery" />
      <section className="ink gallery-sec">
        <div className="wrap wide">
          <div className="mosaic">
            {items.map((g, i) => (
              <Reveal key={g._id} className={`tile ${g.size}`}>
                <button onClick={() => setIdx(i)} aria-label={`Open ${g.title}`}>
                  <Img src={g.url} alt={g.title} />
                  <span className="cap"><em>{g.category}</em><strong>{g.title}</strong></span>
                </button>
              </Reveal>
            ))}
          </div>
          <p className="quote-end serif-quote">“More than a restaurant, a destination.”</p>
        </div>
      </section>
      <Lightbox items={items} index={idx} onClose={() => setIdx(null)} onIndex={setIdx} />
    </>
  );
}
