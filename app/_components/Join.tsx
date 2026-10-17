'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { perks, type Interest } from '../_data';
import { INTEREST_EVENT, JOINED_KEY, readStore, writeStore, type InterestDetail } from './interest';

const interestOptions: { value: Interest; label: string }[] = [
  { value: 'skin', label: 'Skin' },
  { value: 'hair', label: 'Hair' },
  { value: 'body', label: 'Body' },
  { value: 'everything', label: 'Everything' },
];

type Status = 'idle' | 'sending' | 'done' | 'error';

export default function Join() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [interest, setInterest] = useState<Interest>('everything');
  const [pickedFor, setPickedFor] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (readStore(JOINED_KEY)) setStatus('done');
    const onInterest = (e: Event) => {
      const { interest: i, label } = (e as CustomEvent<InterestDetail>).detail;
      setInterest(i);
      setPickedFor(label);
      window.setTimeout(() => emailRef.current?.focus({ preventScroll: true }), 700);
    };
    window.addEventListener(INTEREST_EVENT, onInterest);
    return () => window.removeEventListener(INTEREST_EVENT, onInterest);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailRef.current?.checkValidity()) {
      setError('Please enter a valid email address.');
      emailRef.current?.focus();
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), interest, product: pickedFor }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Something went wrong.');
      writeStore(JOINED_KEY, '1');
      window.dispatchEvent(new Event('gg:joined'));
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  async function share() {
    const data = { title: 'Gourmet Glow', text: 'Nigerian-made skin & hair care is launching soon. Join the founding list:', url: window.location.origin };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch { /* share dismissed */ }
  }

  return (
    <section className="join section" id="join" aria-labelledby="join-title">
      <div className="join-bg" aria-hidden="true">
        <span className="orb orb-1" /><span className="orb orb-2" /><span className="grain" />
        <Image className="join-mark" src="/logo.png" alt="" width={420} height={478} />
      </div>
      <div className="container join-grid">
        <div className="join-copy" data-reveal>
          <p className="eyebrow eyebrow-light">The Founding Circle</p>
          <h2 id="join-title">Be first <em>to glow.</em></h2>
          <p className="join-lede">Our first batch is limited. Join free today and you’ll be first in line when it lands.</p>
          <ul className="perks">
            {perks.map((p, i) => (
              <li key={p.title}>
                <span className="perk-num">0{i + 1}</span>
                <div><b>{p.title}</b><span>{p.body}</span></div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass glass-dark join-card" id="join-card" data-glow data-reveal>
          {status === 'done' ? (
            <div className="join-done" role="status">
              <div className="burst" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--a': `${i * 30}deg` } as React.CSSProperties} />)}</div>
              <div className="done-badge" aria-hidden="true">✓</div>
              <h3>You’re in{name ? `, ${name.split(' ')[0]}` : ''}.</h3>
              <p>Welcome to the Founding Circle. Watch your inbox for launch news and your early-access invite.</p>
              <button type="button" className="btn btn-glass btn-block" onClick={share}>
                {copied ? 'Link copied ✓' : 'Share the glow with a friend'}
              </button>
              <a className="link-btn" href="#story">Revisit our story</a>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h3 className="join-card-title">Claim your early access</h3>
              {pickedFor && <p className="join-picked">Saving your spot for <b>{pickedFor}</b> ✳</p>}

              <div className="field">
                <label htmlFor="join-name">First name <span>(optional)</span></label>
                <input id="join-name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada" />
              </div>
              <div className="field">
                <label htmlFor="join-email">Email address</label>
                <input
                  id="join-email"
                  ref={emailRef}
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'join-error' : 'join-note'}
                />
              </div>

              <fieldset className="field">
                <legend>I’m most excited about</legend>
                <div className="chip-group">
                  {interestOptions.map((o) => (
                    <label key={o.value} className={`chip-radio${interest === o.value ? ' is-on' : ''}`}>
                      <input type="radio" name="interest" value={o.value} checked={interest === o.value} onChange={() => { setInterest(o.value); setPickedFor(undefined); }} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="btn btn-clay btn-lg btn-block" disabled={status === 'sending'}>
                {status === 'sending' ? 'Saving your spot…' : <>Join the founding list <span aria-hidden="true">→</span></>}
              </button>
              {error
                ? <p className="form-error" id="join-error" role="alert">{error}</p>
                : <p className="form-note" id="join-note">Free to join. No spam, just thoughtful updates. Unsubscribe anytime.</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
