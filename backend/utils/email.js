const nodemailer = require('nodemailer');

function buildTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  // Fallback: ethereal or console transport in dev
  if (process.env.NODE_ENV !== 'production') {
    return {
      sendMail: async (opts) => {
        console.log('[DEV email] To:', opts.to);
        console.log('[DEV email] Subject:', opts.subject);
        console.log('[DEV email] Text:', opts.text);
        console.log('[DEV email] HTML:', opts.html);
        return { messageId: 'dev-' + Date.now() };
      },
    };
  }
  throw new Error('SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
}

const transport = buildTransport();

async function sendMail({ to, subject, text, html }) {
  return transport.sendMail({ from: process.env.MAIL_FROM || 'no-reply@example.com', to, subject, text, html });
}

module.exports = { sendMail };
