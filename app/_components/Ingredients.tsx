'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ingredients } from '../_data';

export default function Ingredients() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const item = ingredients[active];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % ingredients.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + ingredients.length) % ingredients.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="ingredients section" id="ingredients" aria-labelledby="ingredients-title">
      <div className="ambient" aria-hidden="true"><span className="orb orb-a" /><span className="orb orb-c" /></div>
      <div className="container ingredients-grid">
        <div className="ingredients-visual" data-reveal>
          <div className="ingredients-frame">
            <Image key={item.id} src={item.image} alt={item.imageAlt} fill sizes="(max-width: 900px) 92vw, 46vw" />
          </div>
          <span className="ring ring-1" aria-hidden="true" />
          <span className="ring ring-2" aria-hidden="true" />
          {ingredients.map((ing, i) => (
            <button
              key={ing.id}
              type="button"
              className={`glass glass-light ing-tag ing-tag-${i + 1}${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
              tabIndex={-1}
              aria-hidden="true"
            >
              {ing.name}
            </button>
          ))}
        </div>

        <div className="ingredients-copy">
          <header className="section-head" data-reveal>
            <p className="eyebrow">Ingredients with a story</p>
            <h2 id="ingredients-title">A little closer <em>to nature.</em></h2>
            <p className="section-sub">Nine thoughtful botanicals sit at the heart of our collection. Tap one to learn where it comes from, or let the stories rotate.</p>
          </header>

          <div className="ing-tabs" role="tablist" aria-label="Signature ingredients" onKeyDown={onKey} data-reveal>
            {ingredients.map((ing, i) => (
              <button
                key={ing.id}
                ref={(el) => { tabs.current[i] = el; }}
                role="tab"
                id={`tab-${ing.id}`}
                aria-selected={i === active}
                aria-controls="ing-panel"
                tabIndex={i === active ? 0 : -1}
                className={i === active ? 'is-active' : ''}
                onClick={() => setActive(i)}
              >
                <span>0{i + 1}</span>{ing.name}
              </button>
            ))}
          </div>

          <div className="glass glass-light ing-panel" id="ing-panel" role="tabpanel" aria-labelledby={`tab-${item.id}`} aria-live="polite" data-glow key={item.id}>
            <p className="ing-origin">{item.origin}</p>
            <p className="ing-note">{item.note}</p>
            <dl className="ing-facts">
              <div><dt>Feels</dt><dd>{item.feel}</dd></div>
              <div><dt>Found in</dt><dd>{item.foundIn.join(', ')}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
