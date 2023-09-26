const nodemailer = require("nodemailer");
// nodemailer
const sendEmail = async (options) => {
  //! 1) create transporter(service that send email like "gmail" "mailgun" mailtrap" etc..)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //! 2) define the email options like subject, body, etc..
  const mailOptions = {
    from: "E-shop App <mohamedahmedmohamed461@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //! 3) actually send the email with nodemailer
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
