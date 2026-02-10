const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use Gmail service by default or configure host/port
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // Define the email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Quiz App Admin'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // In case you want to send HTML emails
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
