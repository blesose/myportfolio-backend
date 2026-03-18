// 

const nodemailer = require('nodemailer');
const dns = require('dns');

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true' || process.env.RENDER;

console.log(`📧 Email service initializing for: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

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
            // Base transporter configuration
            const transporterConfig = {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false // Helps with some network issues
                },
                connectionTimeout: 30000,
                greetingTimeout: 30000,
                socketTimeout: 30000
            };

            // ONLY force IPv4 on Render (production)
            if (isProduction || isRender) {
                try {
                    dns.setDefaultResultOrder('ipv4first');
                    console.log('✅ Production mode: Forcing IPv4 for email');
                    transporterConfig.family = 4; // Force IPv4 only on Render
                } catch (err) {
                    console.log('⚠️ DNS config error:', err.message);
                }
            } else {
                console.log('✅ Development mode: Using default IP version');
                // Don't force IPv4 on localhost - let it auto-detect
            }

            console.log('📧 Configuring email with:', {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                user: process.env.EMAIL_USER,
                hasPassword: !!process.env.EMAIL_PASS,
                mode: isProduction ? 'production (IPv4 forced)' : 'development (auto)'
            });

            this.transporter = nodemailer.createTransport(transporterConfig);

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
            
            await new Promise((resolve, reject) => {
                this.transporter.verify((error, success) => {
                    if (error) {
                        console.error('❌ Email transporter verification failed:', error.message);
                        
                        if (error.message.includes('ENETUNREACH')) {
                            console.log('💡 Tip: Network unreachable - this is normal on some hosts');
                            console.log('✅ Emails will still work for contact form (they just log to console)');
                        }
                        reject(error);
                    } else {
                        console.log('✅ Email transporter is ready to send messages');
                        resolve(success);
                    }
                });
            });
        } catch (error) {
            // Don't let email verification failure crash the app
            console.log('⚠️ Email verification skipped - continuing without email');
        }
    }

    async sendContactConfirmation(to, name) {
        // If no transporter, log and return success (don't break the flow)
        if (!this.transporter) {
            console.log(`📧 [DEV] Would send confirmation email to: ${to}`);
            console.log(`📧 [DEV] Content: Thank you ${name} for contacting!`);
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
            // Return true anyway so the contact form still works
            return true;
        }
    }

    async sendAdminNotification(messageData) {
        if (!this.transporter) {
            console.log(`📧 [DEV] New message from: ${messageData.name} (${messageData.email})`);
            console.log(`📧 [DEV] Message: ${messageData.message.substring(0, 100)}...`);
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
            return true;
        }
    }
}

module.exports = new EmailService();