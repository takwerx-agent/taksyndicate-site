// The site is static files (dist/). This Worker only runs for /api/* (see
// run_worker_first in wrangler.jsonc) and for requests that match no file.
//
// POST /api/shield-submit takes a shield image plus a few details and emails
// them to the TAK Syndicate inbox. Nothing is stored and nothing goes on the
// site by itself: AJ reviews each email and adds the shield by hand.
//
// Defences, in order: method + Origin check, request size cap, per-IP rate
// limit, honeypot, Turnstile (verified here, server side), field limits,
// image type checked by its file signature (no SVG), plain-text email only.
// The send_email binding can only deliver to the one verified address set in
// wrangler.jsonc, so this endpoint cannot be used to mail anyone else.

import { EmailMessage } from 'cloudflare:email';

const SITE_HOSTS = ['www.thetaksyndicate.org', 'thetaksyndicate.org'];
const MAIL_FROM = 'shields@thetaksyndicate.org';
const MAX_IMAGE = 2 * 1024 * 1024; // 2 MB
const MAX_BODY = MAX_IMAGE + 64 * 1024; // image + form fields

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/shield-submit') return submitShield(request, env);
    if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'Not found.' }, 404);
    return env.ASSETS.fetch(request);
  },
};

async function submitShield(request, env) {
  const dev = env.DEV === '1';

  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405, { Allow: 'POST' });

  // Only our own pages may post here.
  const origin = request.headers.get('Origin') || '';
  let originHost = '';
  try { originHost = new URL(origin).hostname; } catch {}
  if (!(SITE_HOSTS.includes(originHost) || (dev && originHost === 'localhost'))) {
    return json({ ok: false, error: 'Bad origin.' }, 403);
  }

  const size = Number(request.headers.get('Content-Length') || 0);
  if (!size || size > MAX_BODY) return json({ ok: false, error: 'The upload is too large. The limit is 2 MB.' }, 413);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.SUBMIT_LIMIT) {
    const { success } = await env.SUBMIT_LIMIT.limit({ key: ip });
    if (!success) return json({ ok: false, error: 'Too many tries. Wait a minute and try again.' }, 429);
  }

  let form;
  try { form = await request.formData(); } catch { return json({ ok: false, error: 'Bad form data.' }, 400); }

  // Honeypot: hidden from people, bots fill it in. Pretend it worked.
  if (str(form.get('fax'))) return json({ ok: true });

  // Turnstile, checked with Cloudflare before anything else is read.
  const token = str(form.get('cf-turnstile-response'));
  if (!token || token.length > 2048) return json({ ok: false, error: 'Complete the human check and try again.' }, 400);
  const check = await verifyTurnstile(token, ip, env);
  if (!check.success || (!dev && (check.action !== 'shield-submit' || !SITE_HOSTS.includes(check.hostname)))) {
    console.warn('turnstile failed', JSON.stringify({ codes: check['error-codes'], action: check.action, host: check.hostname }));
    return json({ ok: false, error: 'The human check failed. Try again.' }, 403);
  }

  // Fields.
  const team = line(form.get('team'), 60);
  const area = line(form.get('area'), 60);
  const name = line(form.get('name'), 80);
  const email = line(form.get('email'), 254);
  const site = line(form.get('site'), 200);
  const comment = text(form.get('comment'), 1000);
  const rights = form.get('rights') === 'yes';

  if (!team) return json({ ok: false, error: 'Enter the team or shield name.' }, 400);
  if (!name) return json({ ok: false, error: 'Enter your name.' }, 400);
  if (!/^[^\s@<>()",;:\\[\]]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,63}$/.test(email)) {
    return json({ ok: false, error: 'Enter a valid email address.' }, 400);
  }
  if (site && !/^https?:\/\/[^\s<>"]+$/i.test(site)) return json({ ok: false, error: 'The website must start with https://' }, 400);
  if (!rights) return json({ ok: false, error: 'Confirm that you may share this shield.' }, 400);

  // Image: check the real bytes, not the name or the browser's type.
  const file = form.get('shield');
  if (!file || typeof file === 'string' || !file.size) return json({ ok: false, error: 'Attach the shield image.' }, 400);
  if (file.size > MAX_IMAGE) return json({ ok: false, error: 'The image is too large. The limit is 2 MB.' }, 413);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(bytes);
  if (!kind) return json({ ok: false, error: 'Use a PNG, JPEG or WebP image.' }, 415);

  const slug = team.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'shield';
  const filename = `shield-${slug}.${kind.ext}`;

  const body = [
    'A new shield was sent from thetaksyndicate.org/shields.',
    'Check the image and the details before it goes on the site.',
    '',
    `Team / shield: ${team}`,
    `Small line:    ${area || '-'}`,
    `Website:       ${site || '-'}`,
    '',
    `From:          ${name}`,
    `Email:         ${email}`,
    `IP / country:  ${ip} / ${request.cf?.country || '?'}`,
    '',
    'Comment:',
    comment || '-',
    '',
    `Attachment: ${filename} (${kind.type}, ${Math.round(bytes.length / 1024)} KB)`,
    'The sender confirmed they may share this shield.',
  ].join('\n');

  const raw = buildMime({
    from: `TAK Syndicate shields <${MAIL_FROM}>`,
    to: env.SHIELD_TO,
    replyTo: email,
    subject: `Shield submission: ${team}`,
    body,
    attachment: { filename, type: kind.type, bytes },
  });

  try {
    await env.SHIELD_MAIL.send(new EmailMessage(MAIL_FROM, env.SHIELD_TO, raw));
  } catch (e) {
    console.error('send failed', e && e.message);
    return json({ ok: false, error: 'The email could not be sent. Try again later.' }, 502);
  }
  return json({ ok: true });
}

async function verifyTurnstile(token, ip, env) {
  if (!env.TURNSTILE_SECRET) return { success: false, 'error-codes': ['missing-secret'] };
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
    });
    return await r.json();
  } catch {
    return { success: false, 'error-codes': ['siteverify-unreachable'] };
  }
}

// PNG, JPEG and WebP only. SVG is refused on purpose: it can carry script.
function sniffImage(b) {
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) {
    return { ext: 'png', type: 'image/png' };
  }
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', type: 'image/jpeg' };
  if (b.length > 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP') return { ext: 'webp', type: 'image/webp' };
  return null;
}

function ascii(b, s, e) { return String.fromCharCode(...b.subarray(s, e)); }

// One line of text: no control characters (so no header injection), trimmed, capped.
function line(v, max) { return str(v).replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
// A text block: keeps line breaks, drops other control characters.
function text(v, max) { return str(v).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g, ' ').trim().slice(0, max); }
function str(v) { return typeof v === 'string' ? v : ''; }

function buildMime({ from, to, replyTo, subject, body, attachment }) {
  const boundary = 'tsb-' + crypto.randomUUID();
  const host = MAIL_FROM.split('@')[1];
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${encodeWord(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${host}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap(b64(new TextEncoder().encode(body))),
    `--${boundary}`,
    `Content-Type: ${attachment.type}; name="${attachment.filename}"`,
    `Content-Disposition: attachment; filename="${attachment.filename}"`,
    'Content-Transfer-Encoding: base64',
    '',
    wrap(b64(attachment.bytes)),
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

function encodeWord(s) { return `=?UTF-8?B?${b64(new TextEncoder().encode(s))}?=`; }

function b64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function wrap(s) { return s.replace(/.{1,76}/g, '$&\r\n').replace(/\r\n$/, ''); }

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra },
  });
}
