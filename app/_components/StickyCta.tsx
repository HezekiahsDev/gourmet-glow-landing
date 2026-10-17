'use client';

import { useEffect, useState } from 'react';
import { JOINED_KEY, readStore } from './interest';

// Mobile-only bar that keeps the main action within thumb reach once the
// hero CTA has scrolled away, and steps aside near the signup form.
export default function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let joined = Boolean(readStore(JOINED_KEY));
    let pastHero = false;
    let joinInView = false;
    const sync = () => setVisible(!joined && pastHero && !joinInView);

    const hero = document.getElementById('top');
    const join = document.getElementById('join');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === hero) pastHero = !e.isIntersecting;
        if (e.target === join) joinInView = e.isIntersecting;
      });
      sync();
    }, { threshold: 0 });
    if (hero) observer.observe(hero);
    if (join) observer.observe(join);
    const onJoined = () => { joined = true; sync(); };
    window.addEventListener('gg:joined', onJoined);
    return () => { observer.disconnect(); window.removeEventListener('gg:joined', onJoined); };
  }, []);

  return (
    <div className={`sticky-cta glass glass-dark${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <div>
        <b>Founding list open</b>
        <span>Be first to shop the launch</span>
      </div>
      <a className="btn btn-clay btn-sm" href="#join" tabIndex={visible ? 0 : -1}>Join free</a>
    </div>
  );
}
