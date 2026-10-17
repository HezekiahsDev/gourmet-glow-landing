'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { navLinks } from '../_data';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const sections = navLinks
      .map((l) => document.querySelector(l.href))
      .filter((el): el is Element => Boolean(el));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(`#${e.target.id}`); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => observer.observe(s));

    return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="header-inner">
        <a className="wordmark" href="#top" aria-label="Gourmet Glow home" onClick={close}>
          <Image src="/logo.png" alt="" width={44} height={50} priority />
          <span><b>GOURMET</b><strong>GLOW</strong></span>
        </a>

        <nav className="nav" aria-label="Main navigation">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className={active === l.href ? 'is-active' : undefined} aria-current={active === l.href ? 'true' : undefined}>{l.label}</a>
          ))}
        </nav>

        <div className="header-cta">
          <a className="btn btn-glass btn-sm hide-sm" href="#join">Get early access</a>
          <button
            type="button"
            className="menu-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            <span /><span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile navigation">
          {navLinks.map((l, i) => (
            <a key={l.href} href={l.href} onClick={close} style={{ '--i': i } as React.CSSProperties}>
              <small>0{i + 1}</small>{l.label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu-actions">
          <a className="btn btn-clay btn-block" href="#join" onClick={close}>Get early access <span aria-hidden="true">→</span></a>
          <a className="btn btn-ghost-light btn-block" href="https://chat.whatsapp.com/REPLACE_WITH_WHATSAPP_GROUP_INVITE" target="_blank" rel="noopener noreferrer" onClick={close}>
            Join community
          </a>
          <a className="btn btn-ghost-light btn-block" href="https://wa.me/2340000000000?text=Hi%20Gourmet%20Glow%2C%20I%20have%20a%20question%20about%20your%20products" target="_blank" rel="noopener noreferrer" onClick={close}>
            Message us
          </a>
        </div>
        <div className="mobile-socials">
          <a href="https://instagram.com/gourmetglow" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
          <a href="https://tiktok.com/@gourmetglow" target="_blank" rel="noopener noreferrer" aria-label="TikTok">TT</a>
          <a href="https://x.com/gourmetglow" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">X</a>
          <a href="https://facebook.com/gourmetglow" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a>
        </div>
        <p className="mobile-menu-note">Founding list open. Free to join, first to shop.</p>
      </div>
    </header>
  );
}
