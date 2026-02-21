const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* ============================
   REGISTER (SIGN UP)
============================ */
exports.register = async (req, res) => {
  try {
    const {
      username,
      full_name,
      email,
      password,
      country,
      income_bracket
    } = req.body;

    // Validation
    if (!username || !full_name || !email || !password || !country) {
      return res.status(400).json({ message: "All required fields are missing" });
    }

    // Check if user already exists
    const checkSql = "SELECT id FROM users WHERE email = ? OR username = ?";
    const [existingUsers] = await db.query(checkSql, [email, username]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const insertSql = `
      INSERT INTO users 
      (username, full_name, email, password_hash, country, income_bracket)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(
      insertSql,
      [
        username,
        full_name,
        email,
        hashedPassword,
        country,
        income_bracket || null
      ]
    );

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================
   LOGIN
============================ */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    const [users] = await db.query(sql, [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        country: user.country
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================
   FORGOT PASSWORD (OTP)
============================ */
const transporter = require("../utils/mailer");


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [users] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = users[0].id;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      `INSERT INTO password_resets (user_id, reset_token, expires_at)
       VALUES (?, ?, ?)`,
      [userId, otp, expiresAt]
    );

    // 📧 Send OTP via email
    console.log(`Attempting to send OTP to ${email}...`);
    const info = await transporter.sendMail({
      from: `"TaxPal Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; borderRadius: 10px;">
          <h2 style="color: #3b82f6;">TaxPal Password Reset</h2>
          <p>You requested a password reset. Use the following dynamic OTP to proceed:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px;">
            <h1 style="letter-spacing: 5px; color: #1f2937; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log("Email sent successfully info:", info.messageId);
    res.json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ============================
   VERIFY OTP
============================ */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const sql = `
      SELECT pr.id
      FROM password_resets pr
      JOIN users u ON pr.user_id = u.id
      WHERE u.email = ?
        AND pr.reset_token = ?
        AND pr.expires_at > NOW()
        AND pr.used = false
      ORDER BY pr.created_at DESC
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [email, otp]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 🔐 Generate one-time reset session token
    const resetSessionToken = require("crypto")
      .randomBytes(32)
      .toString("hex");

    await db.query(
      `UPDATE password_resets
       SET verified = true,
           reset_session_token = ?
       WHERE id = ?`,
      [resetSessionToken, rows[0].id]
    );

    res.json({
      message: "OTP verified",
      resetSessionToken
    });

  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================
   RESET PASSWORD
============================ */
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetSessionToken, newPassword } = req.body;

    if (!email || !resetSessionToken || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const sql = `
      SELECT pr.id
      FROM password_resets pr
      JOIN users u ON pr.user_id = u.id
      WHERE u.email = ?
        AND pr.reset_session_token = ?
        AND pr.verified = true
        AND pr.used = false
        AND pr.expires_at > NOW()
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [email, resetSessionToken]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset session" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hashedPassword, email]
    );

    await db.query(
      "UPDATE password_resets SET used = true WHERE id = ?",
      [rows[0].id]
    );

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

