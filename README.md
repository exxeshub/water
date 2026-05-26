# HOUSE OF MAJI — Static Site

This repo contains a single-page static site for HOUSE OF MAJI water delivery. I upgraded it for accessibility, mobile UX, visual polish, basic performance, and added a small server example to receive orders.

## What I changed
- Accessibility: skip link, ARIA attributes, semantic landmarks.
- SEO & social: enhanced meta tags and Open Graph fields, added JSON-LD (if desired you can add more).
- Mobile UX: responsive styles, hamburger menu, improved touch targets.
- Visual polish: SVG hero wave, refined palette and glass cards.
- Performance: preloads stylesheet, images use `loading="lazy"`.
- Forms & delivery: client-side sharing via email/WhatsApp; optional server endpoint `send_order.php` for email forwarding.

## Run locally
### Static preview
Open `index.html` in a browser for basic static preview.

### PHP server (for `send_order.php` endpoint)
If you want the server-side email feature working locally, run built-in PHP server and ensure your PHP installation is configured to send mail (or route via an SMTP relay):

```bash
php -S localhost:8000
```

Then visit: http://localhost:8000/index.html

When submitting the order form the page will attempt to POST to `/send_order.php`. If the endpoint is available and `mail()` succeeds, you'll receive a success message. If not, the page falls back to email/WhatsApp sharing links.

## Deploy
- For static hosting (GitHub Pages, Netlify, Vercel) you can deploy the site directly — note `send_order.php` won't run on GitHub Pages. For server email, use a host that supports PHP or create a serverless function (e.g., Netlify Function) that sends email via a transactional provider (SendGrid, Mailgun).

## Lighthouse checklist
- Accessibility: run Lighthouse and resolve any color-contrast, label, or keyboard focus issues.
- Performance: consider inlining critical CSS, optimizing/serving images via next-gen formats, and enabling caching on the host.
- Best practices: enable HTTPS, add appropriate CSP and security headers via hosting.

## Next steps I can take
- Replace the emoji mark with a small SVG logo and add a favicon.
- Add serverless function example (Netlify Function) using SendGrid.
- Add rich structured data for LocalBusiness and operating hours.
- Integrate payment flow (M-Pesa API) via secure backend.

If you want me to implement any of the above, tell me which one to do next.