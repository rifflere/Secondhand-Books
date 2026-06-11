const nodemailer = require('nodemailer');

const hasSmtp = () => Boolean(process.env.SMTP_HOST);

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const FROM = () => process.env.SMTP_FROM || 'Secondhand Books <noreply@secondhandbooks.app>';

const sendUsernameReminder = async (toEmail, username) => {
  const subject = 'Your Secondhand Books username';
  const text = `Hi there!\n\nYour Secondhand Books username is: ${username}\n\nHappy reading!`;

  if (!hasSmtp()) {
    console.log(`[EMAIL] To: ${toEmail}\nSubject: ${subject}\n${text}\n`);
    return;
  }

  await getTransporter().sendMail({ from: FROM(), to: toEmail, subject, text });
};

const sendPasswordReset = async (toEmail, username, resetLink) => {
  const subject = 'Reset your Secondhand Books password';
  const text = `Hi ${username}!\n\nClick the link below to reset your password. This link expires in 1 hour.\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`;

  if (!hasSmtp()) {
    console.log(`[EMAIL] To: ${toEmail}\nSubject: ${subject}\n${text}\n`);
    return;
  }

  await getTransporter().sendMail({ from: FROM(), to: toEmail, subject, text });
};

module.exports = { sendUsernameReminder, sendPasswordReset };
