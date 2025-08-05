import { db } from '../config/database.connection.js';
import otpGenerator from 'otp-generator';
import bcrypt from 'bcrypt';

export function generateOTP() {
  return otpGenerator.generate(6, {upperCaseAlphabets: true, specialChars: false, lowerCaseAlphabets: true, digits: true});
}

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Please enter your email." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format." });
  }
  
  try {
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "You are not an authenticated user." });
    }

    const otp = generateOTP();
    const saltRounds = 13;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
    await db.query(`
      INSERT INTO otps (email, otp, expires_at)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at)
    `, [email, hashedOtp, expiresAt]
    );
    console.log(`Generated OTP for ${email}: ${otp}`);
    return res.status(200).json({ success: true, message: 'OTP generated successfully (Check Console)' });
  } catch (error) {
    console.error('Error generating OTP:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }

  try {
    const [rows] = await db.query('SELECT otp, expires_at FROM otps WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
    }

    const { otp: hashedOtp, expires_at } = rows[0];

    if (new Date() > expires_at) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    const isMatch = await bcrypt.compare(otp, hashedOtp);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    await db.query('DELETE FROM otps WHERE email = ?', [email]);
    return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};