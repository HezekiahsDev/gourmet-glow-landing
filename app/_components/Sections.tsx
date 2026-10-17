import Image from 'next/image';
import { faqs, promises } from '../_data';

const tickerItems = ['Shea butter', 'Cocoa butter', 'Baobab', 'Made in Nigeria', 'No harsh chemicals', 'Skin', 'Hair', 'Body'];

export function Marquee() {
  const row = [...tickerItems, ...tickerItems];
  return (
    <div className="marquee" aria-label={tickerItems.join(', ')}>
      <div className="marquee-track" aria-hidden="true">
        {row.map((t, i) => <span key={i}>{t}<i>✳</i></span>)}
      </div>
    </div>
  );
}

const promiseIcons = [
  <path key="leaf" d="M6 26C7 12 15 5 28 5c-1 13-8 21-22 21Zm0 0L21 11" />,
  <path key="map" d="M16 4c-6 0-10 4.5-10 10 0 7 10 14 10 14s10-7 10-14c0-5.5-4-10-10-10Zm0 13.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" />,
  <path key="heart" d="M16 27S4 20 4 11.5A6.5 6.5 0 0 1 16 8a6.5 6.5 0 0 1 12 3.5C28 20 16 27 16 27Z" />,
  <path key="spark" d="M16 3l2.8 9.2L28 15l-9.2 2.8L16 27l-2.8-9.2L4 15l9.2-2.8L16 3Z" />,
];

export function Promises() {
  return (
    <section className="promise section" id="promise" aria-labelledby="promise-title">
      <div className="ambient" aria-hidden="true"><span className="orb orb-a" /><span className="orb orb-b" /></div>
      <div className="container">
        <header className="section-head center" data-reveal>
          <p className="eyebrow">The Gourmet Glow promise</p>
          <h2 id="promise-title">Care you can <em>feel good</em> about.</h2>
        </header>
        <div className="promise-grid">
          {promises.map((p, i) => (
            <article className="glass glass-light promise-card" data-glow data-reveal style={{ '--d': `${i * 90}ms` } as React.CSSProperties} key={p.title}>
              <svg viewBox="0 0 32 32" aria-hidden="true" className="promise-icon">{promiseIcons[i]}</svg>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="faq section" id="faq" aria-labelledby="faq-title">
      <div className="container faq-grid">
        <header className="section-head" data-reveal>
          <p className="eyebrow">Good questions</p>
          <h2 id="faq-title">Before you <em>join.</em></h2>
          <p className="section-sub">Still curious? Write to us at <a href="mailto:hello@gourmetglow.com">hello@gourmetglow.com</a>.</p>
        </header>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <details className="glass glass-light faq-item" data-reveal style={{ '--d': `${i * 70}ms` } as React.CSSProperties} key={f.q} open={i === 0}>
              <summary>{f.q}<span className="faq-icon" aria-hidden="true" /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="wordmark wordmark-light" href="#top" aria-label="Back to top">
              <Image src="/logo.png" alt="" width={44} height={50} />
              <span><b>GOURMET</b><strong>GLOW</strong></span>
            </a>
            <p>Nature’s goodness. Thoughtfully crafted.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <div><h3>Explore</h3><a href="#collection">Collection</a><a href="#story">Our story</a><a href="#ingredients">Ingredients</a></div>
            <div><h3>Help</h3><a href="#finder">Glow Finder</a><a href="#faq">FAQ</a><a href="mailto:hello@gourmetglow.com">Contact</a></div>
          </nav>
          <a className="btn btn-clay" href="#join">Join the founding list <span aria-hidden="true">→</span></a>
        </div>
        <p className="footer-giant" aria-hidden="true">Glow</p>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Gourmet Glow. All rights reserved.</span>
          <span>Made with care in Nigeria <b>✳</b></span>
        </div>
      </div>
    </footer>
  );
}
