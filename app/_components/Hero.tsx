'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { products } from '../_data';

const headline = [['Nature’s', 'goodness.'], ['Thoughtfully', 'crafted.']];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setCurrent((c) => (c + 1) % products.length), 3800);
    return () => window.clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--px', `${(e.clientX / window.innerWidth - 0.5).toFixed(3)}`);
        el.style.setProperty('--py', `${(e.clientY / window.innerHeight - 0.5).toFixed(3)}`);
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => el.style.setProperty('--sy', `${Math.min(window.scrollY, 900)}`));
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('pointermove', onMove); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);

  const product = products[current];
  let word = 0;

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-bg" aria-hidden="true">
        <span className="orb orb-1" /><span className="orb orb-2" /><span className="orb orb-3" />
        <span className="grain" />
      </div>

      <div className="hero-inner">
        <div className="hero-copy">
          <p className="pill pill-dark hero-pill"><span className="pulse" aria-hidden="true" /> Founding list open · Launching soon</p>
          <h1 className="hero-title">
            {headline.map((line, li) => (
              <span className={`line${li === 1 ? ' line-accent' : ''}`} key={li}>
                {line.map((w) => (
                  <span className="word-mask" key={w}>
                    <span className="word" style={{ '--i': word++ } as React.CSSProperties}>{w}</span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p className="hero-lede">
            Premium skin and hair care made with pure Nigerian ingredients: shea, cocoa and baobab, crafted for healthy skin, stronger-feeling hair and a natural glow.
          </p>
          <div className="hero-actions">
            <a className="btn btn-clay btn-lg" href="#join">Get early access <span aria-hidden="true">→</span></a>
            <a className="btn btn-ghost-light btn-lg" href="#collection">See the collection</a>
          </div>
          <ul className="hero-trust" aria-label="Why Gourmet Glow">
            <li><Check /> No harsh chemicals</li>
            <li><Check /> Nigerian-sourced ingredients</li>
            <li><Check /> Free to join</li>
          </ul>
        </div>

        <div className="hero-visual">
          <div className="hero-arch">
            <Image
              src="/images/hero.jpg"
              alt="A Nigerian woman with glowing skin wearing an Ankara print top"
              fill
              priority
              sizes="(max-width: 900px) 90vw, 42vw"
            />
          </div>

          <div
            className="glass glass-dark float-card hero-product"
            data-depth="1"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-live="polite"
          >
            <div className="hero-product-img">
              {products.map((p, i) => (
                <Image key={p.id} src={p.image} alt={i === current ? `Gourmet Glow ${p.name}` : ''} fill sizes="88px" className={i === current ? 'is-active' : ''} />
              ))}
            </div>
            <div className="hero-product-meta">
              <small>First collection · {String(current + 1).padStart(2, '0')}/{String(products.length).padStart(2, '0')}</small>
              <b key={product.id}>{product.name}</b>
              <span>{product.ingredients.join(' · ')}</span>
              <div className="dots" role="group" aria-label="Choose product">
                {products.map((p, i) => (
                  <button key={p.id} type="button" aria-label={`Show ${p.name}`} aria-pressed={i === current} className={i === current ? 'is-active' : ''} onClick={() => setCurrent(i)} />
                ))}
              </div>
            </div>
          </div>

          <div className="glass glass-dark float-card hero-chip" data-depth="2">
            <span className="chip-dot" aria-hidden="true" />
            <div><small>Rooted in</small><b>Nigeria</b></div>
          </div>

          <div className="hero-seal" data-depth="3" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs><path id="seal-path" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text><textPath href="#seal-path">GOOD INGREDIENTS ✳ THOUGHTFUL CARE ✳ HONEST BEAUTY ✳</textPath></text>
            </svg>
            <Image src="/logo.png" alt="" width={44} height={50} />
          </div>
        </div>
      </div>

      <a className="scroll-cue" href="#promise" aria-label="Scroll to learn more"><span /></a>
    </section>
  );
}

function Check() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
