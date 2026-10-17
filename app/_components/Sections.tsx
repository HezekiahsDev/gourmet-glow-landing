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
  const whatsappCommunity = 'https://chat.whatsapp.com/REPLACE_WITH_WHATSAPP_GROUP_INVITE';
  const whatsappDm = 'https://wa.me/2340000000000?text=Hi%20Gourmet%20Glow%2C%20I%20have%20a%20question%20about%20your%20products';

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
            <div className="footer-socials">
              <a href="https://instagram.com/gourmetglow" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://tiktok.com/@gourmetglow" target="_blank" rel="noopener noreferrer" aria-label="Follow us on TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
              <a href="https://x.com/gourmetglow" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X (Twitter)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://facebook.com/gourmetglow" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
            </div>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <div><h3>Explore</h3><a href="#collection">Collection</a><a href="#story">Our story</a><a href="#ingredients">Ingredients</a></div>
            <div><h3>Help</h3><a href="#finder">Glow Finder</a><a href="#faq">FAQ</a><a href="mailto:hello@gourmetglow.com">Contact</a><a href={whatsappDm} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a></div>
            <div><h3>Community</h3><a href={whatsappCommunity} target="_blank" rel="noopener noreferrer">Join community (WhatsApp)</a></div>
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
