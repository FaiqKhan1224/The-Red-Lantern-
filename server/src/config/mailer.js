import nodemailer from 'nodemailer';

let transporter;
const configured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

/** 'smtp' when real email is configured, otherwise 'console' (emails are printed in the server terminal). */
export const mailMode = () => (configured() ? 'smtp' : 'console');

export async function sendMail({ to, subject, html, text }) {
  if (!configured()) {
    console.log(`\n┌── EMAIL (SMTP not configured – printed instead of sent) ─────────\n│ To: ${to}\n│ Subject: ${subject}\n│\n${text.split('\n').map((l) => '│ ' + l).join('\n')}\n└──────────────────────────────────────────────────────────────\n`);
    return { mode: 'console' };
  }
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || `"The Red Lantern" <${process.env.SMTP_USER}>`,
    to, subject, html, text,
  });
  return { mode: 'smtp' };
}
