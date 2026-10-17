'use client';

import { useEffect } from 'react';

// Page-wide progressive enhancements: scroll reveals, reading progress,
// cursor-follow glow on glass surfaces and gentle 3D tilt on cards.
export default function Effects() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

    const bar = document.querySelector<HTMLElement>('.progress-bar');
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = root.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const target = e.target as Element | null;
      const glow = target?.closest<HTMLElement>('[data-glow]');
      if (glow) {
        const r = glow.getBoundingClientRect();
        glow.style.setProperty('--mx', `${e.clientX - r.left}px`);
        glow.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      const tilt = target?.closest<HTMLElement>('[data-tilt]');
      if (tilt && !reduce) {
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.setProperty('--ry', `${x * 8}deg`);
        tilt.style.setProperty('--rx', `${y * -8}deg`);
      }
    };
    const onLeave = (e: PointerEvent) => {
      const tilt = (e.target as Element | null)?.closest?.<HTMLElement>('[data-tilt]');
      if (tilt && !tilt.contains(e.relatedTarget as Node)) {
        tilt.style.setProperty('--rx', '0deg');
        tilt.style.setProperty('--ry', '0deg');
      }
    };
    document.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('pointerout', onLeave, { passive: true });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerout', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="progress" aria-hidden="true"><div className="progress-bar" /></div>;
}
