const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = {
  sendMail: async ({ from, to, subject, html }) => {
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw new Error(error.message);
    return data;
  },
  verify: (cb) => cb(null, true),
};

console.log("📧 Mailer is ready to send emails");

module.exports = transporter;
