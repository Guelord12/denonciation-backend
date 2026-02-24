const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };
  return transporter.sendMail(mailOptions);
};

// Exemples de templates
exports.sendWelcomeEmail = (email, username) => {
  const subject = 'Bienvenue sur Dénonciation RDC';
  const html = `<h1>Bonjour ${username} !</h1><p>Merci de vous être inscrit.</p>`;
  return this.sendEmail(email, subject, html);
};

exports.sendPasswordResetEmail = (email, token) => {
  const subject = 'Réinitialisation de mot de passe';
  const html = `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe : <a href="http://localhost:5000/reset-password?token=${token}">Réinitialiser</a></p>`;
  return this.sendEmail(email, subject, html);
};