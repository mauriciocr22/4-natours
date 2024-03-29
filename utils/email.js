const { htmlToText } = require('html-to-text');
const nodemailer = require('nodemailer');
const pug = require('pug');
const Transport = require("nodemailer-brevo-transport");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Maurício de Carvalho <${process.env.EMAIL_FROM}>`
  }

  newTransport() {
    if(process.env.NODE_ENV === "production") {
      return nodemailer.createTransport(
        new Transport({ apiKey: process.env.BREVO_KEY })
    );
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
    }

    await this.newTransport().sendMail(mailOptions)

  }

  async sendWelcome() {
    this.send("welcome", "Welcome to the Natour Family!")
  }

  async sendPasswordReset() {
    await this.send("passwordReset", "Your password reset token(valid for only 10 minutes)")
  }
}