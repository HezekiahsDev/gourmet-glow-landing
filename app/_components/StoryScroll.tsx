'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { chapters } from '../_data';

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// A pinned, scroll-driven story: each chapter's image bursts open from a
// circle as you scroll, while the oversized chapter word and caption swap.
export default function StoryScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let last = -1;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const span = section.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(span, 1));
      const p = progress * chapters.length; // 0 .. n
      const idx = Math.min(chapters.length - 1, Math.floor(p));
      if (idx !== last) { last = idx; setActive(idx); }
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;

      layersRef.current.forEach((layer, i) => {
        if (!layer) return;
        // Chapter i opens over the final 40% of the previous chapter's scroll.
        const reveal = i === 0 ? 1 : reduce ? (p >= i ? 1 : 0) : clamp((p - i + 0.4) / 0.4);
        const eased = 1 - Math.pow(1 - reveal, 3);
        layer.style.clipPath = `circle(${(eased * 150).toFixed(2)}% at 50% 55%)`;
        const img = layer.firstElementChild as HTMLElement | null;
        if (img && !reduce) img.style.transform = `scale(${(1.25 - eased * 0.25).toFixed(4)})`;
      });
    };

    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, []);

  const jumpTo = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const span = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY + (span * (i + 0.5)) / chapters.length;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section className="story" id="story" ref={sectionRef} style={{ '--chapters': chapters.length } as React.CSSProperties} aria-labelledby="story-title">
      <div className="story-stage">
        <div className="story-layers">
          {chapters.map((c, i) => (
            <div className="story-layer" key={c.word} ref={(el) => { layersRef.current[i] = el; }} style={{ zIndex: i + 1 }}>
              <Image src={c.image} alt={c.alt} fill sizes="100vw" loading={i < 2 ? 'eager' : 'lazy'} />
            </div>
          ))}
          <div className="story-shade" />
        </div>

        <p className="story-word" aria-hidden="true">
          {chapters.map((c, i) => <span key={c.word} className={i === active ? 'is-active' : i < active ? 'is-past' : ''}>{c.word}</span>)}
        </p>

        <div className="story-top">
          <p className="pill pill-dark">Our story</p>
          <h2 id="story-title" className="sr-only">From Nigerian soil to your skin</h2>
          <p className="story-intro">From Nigerian soil <em>to your skin.</em></p>
        </div>

        <div className="glass glass-dark story-card" aria-live="polite">
          {chapters.map((c, i) => (
            <div key={c.word} className={`story-text${i === active ? ' is-active' : ''}`} aria-hidden={i !== active}>
              <small>{c.kicker} / 0{chapters.length}</small>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
          {active === chapters.length - 1 && (
            <a href="#collection" className="btn btn-clay btn-sm story-cta">Meet the collection <span aria-hidden="true">→</span></a>
          )}
        </div>

        <nav className="story-rail" aria-label="Story chapters">
          <span className="story-rail-track"><span className="story-rail-fill" ref={fillRef} /></span>
          {chapters.map((c, i) => (
            <button key={c.word} type="button" className={i <= active ? 'is-on' : ''} aria-current={i === active ? 'step' : undefined} onClick={() => jumpTo(i)}>
              <span className="sr-only">Chapter {i + 1}: </span>{c.word}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
