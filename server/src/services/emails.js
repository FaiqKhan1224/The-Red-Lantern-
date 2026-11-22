import { RestaurantSettings } from '../models/index.js';
import { sendMail } from '../config/mailer.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmtDate = (d) => {
  const dt = new Date(`${d}T12:00:00Z`);
  return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};
const LABEL = { pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected', cancelled: 'Cancelled', completed: 'Completed' };
const COLOR = { pending: '#B99555', confirmed: '#4f7a54', rejected: '#8E2424', cancelled: '#8E2424', completed: '#59665A' };

function shell({ preheader, heading, bodyHtml, s }) {
  return `<!doctype html><html><body style="margin:0;background:#e9e2d5;font-family:Helvetica,Arial,sans-serif;color:#11100E">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9e2d5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#F5F0E8">
<tr><td style="background:#11100E;padding:28px 32px;text-align:center;border-bottom:3px solid #8E2424">
<div style="color:#8E2424;font-size:18px;letter-spacing:6px;filter:brightness(1.5)">红灯笼</div>
<div style="font-family:Georgia,serif;color:#B99555;font-size:22px;letter-spacing:6px;margin-top:6px">THE RED LANTERN</div></td></tr>
<tr><td style="padding:34px 32px 8px"><h1 style="font-family:Georgia,serif;font-weight:normal;font-size:28px;margin:0 0 14px">${esc(heading)}</h1>${bodyHtml}</td></tr>
<tr><td style="padding:22px 32px 30px;border-top:1px solid #d8cdb8;font-size:12px;color:#6b6459;line-height:1.6">
${esc(s.name || 'The Red Lantern')} · ${esc(s.address || '')}<br>${esc(s.phone || '')} · ${esc(s.email || '')}<br>
This email was sent to the address entered on your reservation. If this wasn’t you, you can ignore it.</td></tr>
</table></td></tr></table></body></html>`;
}

function detailsTable(r, changes = []) {
  const changed = new Set(changes.map((c) => c.field));
  const row = (k, v, hl) => `<tr><td style="padding:9px 0;border-bottom:1px solid #d8cdb8;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8E2424;width:38%">${k}</td><td style="padding:9px 0;border-bottom:1px solid #d8cdb8;font-size:15px;${hl ? 'font-weight:bold;' : ''}">${v}</td></tr>`;
  const rows = [
    row('Reference', `<strong>${esc(r.reference)}</strong>`),
    row('Type', esc(r.experience)),
    row('Date', esc(fmtDate(r.date)) + (changed.has('date') ? ' <em style="color:#8E2424">(updated)</em>' : ''), changed.has('date')),
    row('Time', esc(r.time) + (changed.has('time') ? ' <em style="color:#8E2424">(updated)</em>' : ''), changed.has('time')),
    row('Guests', String(r.guests) + (changed.has('guests') ? ' <em style="color:#8E2424">(updated)</em>' : ''), changed.has('guests')),
  ];
  if (r.occasion && r.occasion !== 'None') rows.push(row('Occasion', esc(r.occasion)));
  if (r.requests) rows.push(row('Requests', esc(r.requests)));
  rows.push(row('Status', `<span style="display:inline-block;padding:3px 12px;border:1px solid ${COLOR[r.status]};color:${COLOR[r.status]};font-size:12px;letter-spacing:2px;text-transform:uppercase">${LABEL[r.status]}</span>`));
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0">${rows.join('')}</table>`;
}

const COPY = {
  received: (r) => ({ subject: `We’ve received your reservation request — ${r.reference}`, heading: 'Your request is received', intro: `Thank you, ${r.firstName}. Your reservation request is now <strong>pending</strong> and awaiting confirmation from our team. We’ll email you as soon as it has been reviewed.` }),
  confirm: (r) => ({ subject: `Reservation confirmed — ${r.reference}`, heading: 'Your table is confirmed', intro: `Dear ${r.firstName}, we’re delighted to confirm your reservation. We look forward to welcoming you.` }),
  reject: (r) => ({ subject: `Update on your reservation request — ${r.reference}`, heading: 'We’re unable to confirm your request', intro: `Dear ${r.firstName}, we’re sorry — we aren’t able to accommodate this reservation. You are very welcome to submit a new request for another date or time.` }),
  cancel: (r) => ({ subject: `Reservation cancelled — ${r.reference}`, heading: 'Your reservation has been cancelled', intro: `Dear ${r.firstName}, your reservation has been cancelled. If you did not expect this, please contact us.` }),
  update: (r) => ({ subject: `Your reservation has been updated — ${r.reference}`, heading: 'Your reservation has been updated', intro: `Dear ${r.firstName}, our team has updated your reservation. Please review the details below.` }),
  complete: (r) => ({ subject: `Thank you for dining with us — ${r.reference}`, heading: 'Thank you for visiting', intro: `Dear ${r.firstName}, it was a pleasure to host you. We hope to welcome you again soon.` }),
  message: (r) => ({ subject: `A message about your reservation — ${r.reference}`, heading: 'A message from our team', intro: `Dear ${r.firstName}, our team has sent you a message about your reservation.` }),
};

/** Sends a reservation email. Never throws — returns { sent, error }. */
export async function sendReservationEmail(kind, r, { changes = [] } = {}) {
  try {
    const s = (await RestaurantSettings.findOne({ key: 'main' }).lean()) || {};
    const c = COPY[kind](r);
    const msg = r.adminMessage
      ? `<div style="margin:6px 0 4px;padding:14px 18px;border-left:3px solid #8E2424;background:#ece4d4;font-size:15px;line-height:1.6"><div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8E2424;margin-bottom:6px">Message from the restaurant</div>${esc(r.adminMessage).replace(/\n/g, '<br>')}</div>`
      : '';
    const changeLine = changes.length
      ? `<p style="font-size:14px;color:#4a443b">Changes: ${changes.map((x) => `${esc(x.field)}: ${esc(x.from)} → <strong>${esc(x.to)}</strong>`).join(' · ')}</p>` : '';
    const html = shell({
      preheader: c.heading, heading: c.heading, s,
      bodyHtml: `<p style="font-size:16px;line-height:1.7;margin:0">${c.intro}</p>${changeLine}${detailsTable(r, changes)}${msg}
        <p style="font-size:14px;color:#4a443b;line-height:1.7">You can follow every update under <strong>My Reservations</strong> on our website.</p>`,
    });
    const text = [
      c.heading, '', c.intro.replace(/<[^>]+>/g, ''), '',
      `Reference: ${r.reference}`, `Type: ${r.experience}`, `Date: ${fmtDate(r.date)}`, `Time: ${r.time}`, `Guests: ${r.guests}`,
      `Status: ${LABEL[r.status]}`,
      ...(changes.length ? ['', 'Changes: ' + changes.map((x) => `${x.field}: ${x.from} -> ${x.to}`).join('; ')] : []),
      ...(r.adminMessage ? ['', `Message from the restaurant: ${r.adminMessage}`] : []),
      '', `${s.name || 'The Red Lantern'} · ${s.address || ''} · ${s.phone || ''}`,
    ].join('\n');
    await sendMail({ to: r.email, subject: c.subject, html, text });
    return { sent: true };
  } catch (err) {
    console.error('Reservation email failed:', err.message);
    return { sent: false, error: err.message };
  }
}
