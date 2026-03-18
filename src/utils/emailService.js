const nodemailer = require('nodemailer');
class EmailService {
    constructor() {
        this.transporter = null;
        this.isInitialized = false;
        this.initialize();
    }

    initialize() {
        // Skip if already initialized
        if (this.isInitialized) return;

        // Check if email credentials exist
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('⚠️ Email credentials not found. Emails will be logged to console only.');
            return;
        }

        try {
            // Log configuration (without password)
            console.log('📧 Configuring email with:', {
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: 465,
                secure: true,
                user: process.env.EMAIL_USER,
                hasPassword: !!process.env.EMAIL_PASS
            });

            // FIXED: Hardcode port 465 and secure: true as per Gmail requirements [citation:2][citation:7]
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com', // Hardcode to ensure correct
                port: 465,
                secure: true, // CRITICAL: Must be true for port 465 [citation:7][citation:9]
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS // 16-char app password
                },
                tls: {
                    rejectUnauthorized: true, // Keep true for security
                    minVersion: 'TLSv1.2' // Force minimum TLS version [citation:9]
                },
                connectionTimeout: 30000, // 30 seconds (increased from 10)
                greetingTimeout: 30000,
                socketTimeout: 30000,
                debug: process.env.NODE_ENV === 'development'
            });

            // Verify connection asynchronously
            this.verifyConnection();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Failed to initialize email transporter:', error.message);
            this.transporter = null;
        }
    }

    async verifyConnection() {
        if (!this.transporter) return;

        try {
            console.log('⏳ Verifying email connection...');
            
            // Use Promise version of verify for better error handling
            await new Promise((resolve, reject) => {
                this.transporter.verify((error, success) => {
                    if (error) {
                        console.error('❌ Email transporter verification failed:', error.message);
                        
                        // Specific error guidance [citation:1][citation:5]
                        if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
                            console.log('💡 Tip: This is often due to:');
                            console.log('   1. Antivirus/firewall blocking SSL connections [citation:3]');
                            console.log('   2. ISP blocking port 465 (use VPN to test) [citation:3]');
                            console.log('   3. Google account security flags (visit: https://accounts.google.com/DisplayUnlockCaptcha) [citation:4]');
                        } else if (error.message.includes('auth') || error.code === 'EAUTH') {
                            console.log('💡 Tip: Authentication failed - check app password (16 chars, no spaces)');
                        }
                        
                        reject(error);
                    } else {
                        console.log('✅ Email transporter is ready to send messages');
                        resolve(success);
                    }
                });
            });
        } catch (error) {
            console.error('❌ Email verification error:', error.message);
        }
    }

    async sendContactConfirmation(to, name) {
        // If no transporter, log and return success
        if (!this.transporter) {
            console.log(`📧 [DEV] Would send confirmation email to: ${to}`);
            return true;
        }

        try {
            const mailOptions = {
                from: `"Blessing Oga" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: 'Thank You for Contacting Blessing Oga',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #964B2F;">Thank You for Reaching Out!</h2>
                        <p>Hi ${name},</p>
                        <p>I've received your message and will get back to you within 24 hours.</p>
                        <p>Best regards,<br><strong>Blessing Oga</strong></p>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Contact confirmation email sent to:', to);
            return true;
        } catch (error) {
            console.error('❌ Error sending contact confirmation:', error.message);
            return false;
        }
    }

    async sendAdminNotification(messageData) {
        if (!this.transporter) {
            console.log(`📧 [DEV] New message from: ${messageData.name} (${messageData.email})`);
            return true;
        }

        try {
            const mailOptions = {
                from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
                to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                subject: '🔔 New Contact Form Submission',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #964B2F;">New Message Received</h2>
                        <p><strong>Name:</strong> ${messageData.name}</p>
                        <p><strong>Email:</strong> ${messageData.email}</p>
                        ${messageData.company ? `<p><strong>Company:</strong> ${messageData.company}</p>` : ''}
                        <p><strong>Message:</strong> ${messageData.message}</p>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Admin notification sent');
            return true;
        } catch (error) {
            console.error('❌ Error sending admin notification:', error.message);
            return false;
        }
    }
}

module.exports = new EmailService();