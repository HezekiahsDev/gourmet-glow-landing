# Gourmet Glow landing page

A conversion-focused pre-launch landing page for Gourmet Glow, built with Next.js 14, TypeScript and hand-written CSS (no UI libraries).

## Brand palette

| Token | Hex | Use |
| --- | --- | --- |
| Cocoa brown | `#4A3027` | Primary dark, text, dark sections |
| Warm ivory | `#F3EBDD` | Light surfaces, text on dark |
| Terracotta | `#A76545` | Primary accent and CTAs (white text passes WCAG AA) |
| Muted olive | `#77775A` | Subtle botanical accent, used sparingly |

Tints and shades are derived from these in `app/globals.css` (`:root`). For small text on light backgrounds, use `--terracotta-700` / `--olive-700`, which pass AA contrast.

## Page flow

Hero → promise → collection → scroll story → ingredients → Glow Finder quiz → founding-list signup → FAQ. Every section links to the signup. "Notify me" buttons and the quiz result pre-select the visitor's interest in the form.

- `app/_data.ts`: all copy, products, story chapters, ingredients and FAQs
- `app/_components/`: page sections (`StoryScroll` is the pinned, scroll-driven story)
- `app/api/subscribe/route.ts`: signup endpoint

## Run locally

1. Install Node.js 18.17+.
2. `pnpm install` (or `npm install`).
3. `pnpm dev`, then open `http://localhost:3000`.

Fonts are self-hosted in `app/fonts`, so builds need no network access.

## Environment

- `SIGNUP_WEBHOOK_URL`: where founding-list signups are POSTed as JSON (n8n, Zapier, Make, or your email platform). **Without it, signups are validated but not stored.**
- `NEXT_PUBLIC_SITE_URL`: the production URL, used for social share images.

## Before launch

- Product images are crops of the packaging mockup; replace them with final product photography. Lifestyle images in `public/images` are from Unsplash.
- Confirm product names, ingredient lists and all claims before publishing.
- Set `SIGNUP_WEBHOOK_URL` and test a real signup.
- Add social profile URLs, privacy policy and terms (and a consent line on the form if your email platform requires it).
- Review any applicable Nigerian regulatory requirements for cosmetics marketing.
