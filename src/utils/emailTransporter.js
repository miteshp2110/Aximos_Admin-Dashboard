// Email transport configuration

const { pool } = require("../config/db");
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = require("../config/secrets");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const forgotPassword = async(req, res) => {
    const { email } = req.body;
    const otp = generateOTP();
    
    const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is ${otp}.`
    };
    
    try {
        const [result] = await pool.query("SELECT count(id) as count FROM admin WHERE email = ?", [email]);
        if (result[0].count === 0) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }   
        const [otpResult] = await pool.query("SELECT count(id) as count FROM email_otp WHERE email = ?", [email]);
        if (otpResult[0].count > 0) {
            return res.status(409).json({ success: false, message: 'OTP already sent' });
        } else {
            await pool.query("INSERT INTO email_otp (email, otp) VALUES (?, ?)", [email, otp]);
        }
        await transporter.sendMail(mailOptions);
        res.status(200).json({success:true, message: 'OTP sent successfully'});
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success : false,message: 'Error sending OTP' });
    }
}

module.exports = {forgotPassword}