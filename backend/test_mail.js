const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function testMail() {
    console.log("Checking environment variables...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "****" + process.env.EMAIL_PASS.slice(-4) : "MISSING");
    console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
    console.log("EMAIL_PORT:", process.env.EMAIL_PORT);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        console.log("Verifying transporter...");
        await transporter.verify();
        console.log("✅ Transporter is ready to take our messages");
    } catch (err) {
        console.error("❌ Transporter verification failed:");
        console.error(err);
    }
}

testMail();
