import { db } from '../config/database.connection.js';
import otpGenerator from 'otp-generator';

export function generateOTP() {
  return otpGenerator.generate(6, {upperCaseAlphabets: true, specialChars: false, lowerCaseAlphabets: true, digits: true});
}

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Please enter your email." });
  }

  try {
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "You have to sign up first." });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await db.query('INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)', [
      email,
      otp,
      expiresAt,
    ]);

    console.log(`Generated OTP for ${email}: ${otp}`);

    return res.status(200).json({ success: true, message: 'OTP generated successfully (check console)' });
  } catch (error) {
    console.error('Error generating OTP:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Please provide both email and OTP" });
    }

  try {
    const [rows] = await db.query(`
        SELECT * 
        FROM otps 
        WHERE email = ? AND otp = ? AND expires_at > NOW()`,
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully', email });
  } catch (error) {
    console.error('OTP verification failed:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};
