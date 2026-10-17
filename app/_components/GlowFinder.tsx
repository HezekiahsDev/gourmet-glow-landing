'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { products, quiz, type Interest } from '../_data';
import { chooseInterest, readStore, writeStore } from './interest';

const RESULT_KEY = 'gg-finder';

const textureTip: Record<string, string> = {
  rich: 'You love a cocooning feel, so go generous and let it melt in slowly.',
  light: 'A little goes a long way. Warm a small amount between your palms first.',
  balanced: 'Start light and layer more where you need extra comfort.',
};

export default function GlowFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    const saved = readStore(RESULT_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === quiz.length) { setAnswers(parsed); setStep(quiz.length); }
    } catch { /* ignore malformed */ }
  }, []);

  const pick = (value: string) => {
    const next = [...answers.slice(0, step), value];
    setAnswers(next);
    setStep(step + 1);
    if (next.length === quiz.length) writeStore(RESULT_KEY, JSON.stringify(next));
  };

  const restart = () => { setAnswers([]); setStep(0); writeStore(RESULT_KEY, ''); };

  const done = step >= quiz.length;
  const need = answers[0] as Interest | undefined;
  const matches = need === 'everything' ? products : products.filter((p) => p.interest === need);
  const resultName = need === 'everything' ? 'The full ritual' : matches[0]?.name;

  return (
    <section className="finder section" id="finder" aria-labelledby="finder-title">
      <div className="finder-bg" aria-hidden="true">
        <Image src="/images/ritual.jpg" alt="" fill sizes="100vw" />
      </div>
      <div className="container finder-grid">
        <header className="section-head finder-head" data-reveal>
          <p className="eyebrow eyebrow-light">Glow Finder · 20 seconds</p>
          <h2 id="finder-title">Find your <em>first ritual.</em></h2>
          <p className="section-sub">Two quick questions and we’ll match you with the product to reach for first, and save it to your early-access spot.</p>
        </header>

        <div className="glass glass-dark finder-card" data-glow data-reveal>
          <div className="finder-progress" aria-hidden="true">
            {quiz.map((_, i) => <span key={i} className={i < step || done ? 'is-on' : ''} />)}
            <span className={done ? 'is-on' : ''} />
          </div>

          {!done && (
            <fieldset className="finder-step" key={step}>
              <legend><small>Question {step + 1} of {quiz.length}</small>{quiz[step].q}</legend>
              <div className="finder-options">
                {quiz[step].options.map((o) => (
                  <button key={o.value} type="button" className={answers[step] === o.value ? 'is-picked' : ''} onClick={() => pick(o.value)}>
                    {o.label}<span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
              {step > 0 && <button type="button" className="link-btn" onClick={() => setStep(step - 1)}>← Back</button>}
            </fieldset>
          )}

          {done && need && (
            <div className="finder-result" aria-live="polite">
              <small>Your match</small>
              <h3>{resultName}</h3>
              <div className={`finder-matches${matches.length > 1 ? ' is-multi' : ''}`}>
                {matches.map((m) => (
                  <figure key={m.id}>
                    <Image src={m.image} alt={`Gourmet Glow ${m.name}`} width={160} height={192} />
                    <figcaption>{m.name}</figcaption>
                  </figure>
                ))}
              </div>
              <p>{matches.length > 1 ? 'Cleanse, nourish, then seal in the glow. ' : `${matches[0]?.tagline} `}{textureTip[answers[1]]}</p>
              <button type="button" className="btn btn-clay btn-block" onClick={() => chooseInterest(need, resultName)}>
                Save my spot for {resultName} <span aria-hidden="true">→</span>
              </button>
              <button type="button" className="link-btn" onClick={restart}>Start over</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
