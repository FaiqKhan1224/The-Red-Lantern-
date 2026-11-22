import { Seo, PageHero, Reveal, Img, Seal, Eyebrow } from '../components/ui.jsx';
import { IMG } from '../lib/images.js';

const TIMELINE = [
  ['1987', 'The Beginning', 'A single lantern hung above a family kitchen, and a belief that a meal should be remembered long after it is eaten.', IMG.gallery],
  ['1996', 'The Heritage', 'Recipes carried from Sichuan, Canton and Jiangnan, preserved by hand and shared across generations.', IMG.story],
  ['2008', 'The Craft', 'Ingredients chosen at dawn. Woks seasoned for years. Techniques practised until they become instinct.', IMG.contact],
  ['Today', 'A New Chapter', 'A modern interpretation of Chinese hospitality — where every guest is welcomed as family.', IMG.dining],
];

export default function Story() {
  return (
    <>
      <Seo title="Our Story" description="A legacy of tradition, a vision for tomorrow. Discover the heritage, craft and people behind The Red Lantern." />
      <PageHero title="Our Story" subtitle="Rooted in tradition. Created for today." image={IMG.story} crumb="Our Story" />

      <section className="paper">
        <div className="wrap timeline">
          {TIMELINE.map(([year, title, text, img], i) => (
            <Reveal key={year} className={`tl-item ${i % 2 ? 'flip' : ''}`}>
              <div className="tl-year"><span>{year}</span><i /></div>
              <div className="tl-body"><h3>{title}</h3><p>{text}</p></div>
              <div className="tl-img frame"><Img src={img} alt={title} /></div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="ink philosophy">
        <div className="wrap">
          <Reveal>
            <Eyebrow light>Our Philosophy</Eyebrow>
            <h2 className="mega">Food is memory.<br /><em>Hospitality is culture.</em></h2>
            <p className="lead">We cook the way we were taught — patiently, seasonally and without shortcuts. We welcome people the same way: with warmth, attention and the quiet confidence that comes from generations of practice.</p>
          </Reveal>
        </div>
      </section>

      <section className="paper chef">
        <div className="wrap split">
          <Reveal className="frame tall"><Img src={IMG.chef} alt="Executive Chef Wei Chen at work" /></Reveal>
          <Reveal delay={0.15} className="chef-text">
            <Eyebrow>Executive Chef</Eyebrow>
            <h2>Chef Wei Chen</h2>
            <p>Trained in Chengdu and Hong Kong before leading kitchens across Europe, Chef Chen returned to the classical canon with a modern eye — honouring technique while letting the seasons lead.</p>
            <p className="serif-quote">“A great dish should taste of its place, its people and its patience.”</p>
            <Seal text="味" />
          </Reveal>
        </div>
      </section>

      <section className="ink heritage">
        <Img src={IMG.private} alt="Traditional lanterns" className="bg" />
        <div className="shade" />
        <Reveal className="atmos-copy"><h2>A heritage worth <em>keeping alight</em></h2></Reveal>
      </section>
    </>
  );
}
