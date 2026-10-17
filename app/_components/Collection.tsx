'use client';

import Image from 'next/image';
import { products } from '../_data';
import { chooseInterest } from './interest';

export default function Collection() {
  return (
    <section className="collection section" id="collection" aria-labelledby="collection-title">
      <div className="ambient" aria-hidden="true"><span className="orb orb-c" /></div>
      <div className="container">
        <header className="section-head split" data-reveal>
          <div>
            <p className="eyebrow">The first collection</p>
            <h2 id="collection-title">Three essentials.<br /><em>Everyday glow.</em></h2>
          </div>
          <p className="section-sub">Rich textures, potent botanicals, beautifully formulated for real life. Tap <b>Notify me</b> and we’ll save you a spot in the first batch.</p>
        </header>

        <div className="product-grid">
          {products.map((p, i) => (
            <article
              className="product-card"
              key={p.id}
              data-tilt
              data-reveal
              style={{ '--d': `${i * 110}ms`, '--accent': p.accent } as React.CSSProperties}
            >
              <div className="product-media">
                <Image src={p.image} alt={`Gourmet Glow ${p.name} packaging`} fill sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw" />
                <span className="glass glass-dark product-badge">Coming soon</span>
                <span className="product-num" aria-hidden="true">0{i + 1}</span>
              </div>
              <div className="glass glass-light product-body" data-glow>
                <p className="product-line">{p.line}</p>
                <h3>{p.name}</h3>
                <p className="product-tagline">{p.tagline}</p>
                <ul className="chips" aria-label="Key ingredients">
                  {p.ingredients.map((ing) => <li key={ing}>{ing}</li>)}
                </ul>
                <button type="button" className="btn btn-dark btn-block" onClick={() => chooseInterest(p.interest, p.name)}>
                  Notify me at launch <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
