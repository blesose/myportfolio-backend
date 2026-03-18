// const nodemailer = require('nodemailer');
// class EmailService {
//     constructor() {
//         this.transporter = null;
//         this.isInitialized = false;
//         this.initialize();
//     }

//     initialize() {
//         // Skip if already initialized
//         if (this.isInitialized) return;

//         // Check if email credentials exist
//         if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//             console.log('⚠️ Email credentials not found. Emails will be logged to console only.');
//             return;
//         }

//         try {
//             // Log configuration (without password)
//             console.log('📧 Configuring email with:', {
//                 host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//                 port: 465,
//                 secure: true,
//                 user: process.env.EMAIL_USER,
//                 hasPassword: !!process.env.EMAIL_PASS
//             });

//             // FIXED: Hardcode port 465 and secure: true as per Gmail requirements [citation:2][citation:7]
//             this.transporter = nodemailer.createTransport({
//                 host: 'smtp.gmail.com', // Hardcode to ensure correct
//                 port: 465,
//                 secure: true, // CRITICAL: Must be true for port 465 [citation:7][citation:9]
//                 auth: {
//                     user: process.env.EMAIL_USER,
//                     pass: process.env.EMAIL_PASS // 16-char app password
//                 },
//                 tls: {
//                     rejectUnauthorized: true, // Keep true for security
//                     minVersion: 'TLSv1.2' // Force minimum TLS version [citation:9]
//                 },
//                 connectionTimeout: 30000, // 30 seconds (increased from 10)
//                 greetingTimeout: 30000,
//                 socketTimeout: 30000,
//                 debug: process.env.NODE_ENV === 'development'
//             });

//             // Verify connection asynchronously
//             this.verifyConnection();
            
//             this.isInitialized = true;
//         } catch (error) {
//             console.error('❌ Failed to initialize email transporter:', error.message);
//             this.transporter = null;
//         }
//     }

//     async verifyConnection() {
//         if (!this.transporter) return;

//         try {
//             console.log('⏳ Verifying email connection...');
            
//             // Use Promise version of verify for better error handling
//             await new Promise((resolve, reject) => {
//                 this.transporter.verify((error, success) => {
//                     if (error) {
//                         console.error('❌ Email transporter verification failed:', error.message);
                        
//                         // Specific error guidance [citation:1][citation:5]
//                         if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
//                             console.log('💡 Tip: This is often due to:');
//                             console.log('   1. Antivirus/firewall blocking SSL connections [citation:3]');
//                             console.log('   2. ISP blocking port 465 (use VPN to test) [citation:3]');
//                             console.log('   3. Google account security flags (visit: https://accounts.google.com/DisplayUnlockCaptcha) [citation:4]');
//                         } else if (error.message.includes('auth') || error.code === 'EAUTH') {
//                             console.log('💡 Tip: Authentication failed - check app password (16 chars, no spaces)');
//                         }
                        
//                         reject(error);
//                     } else {
//                         console.log('✅ Email transporter is ready to send messages');
//                         resolve(success);
//                     }
//                 });
//             });
//         } catch (error) {
//             console.error('❌ Email verification error:', error.message);
//         }
//     }

//     async sendContactConfirmation(to, name) {
//         // If no transporter, log and return success
//         if (!this.transporter) {
//             console.log(`📧 [DEV] Would send confirmation email to: ${to}`);
//             return true;
//         }

//         try {
//             const mailOptions = {
//                 from: `"Blessing Oga" <${process.env.EMAIL_USER}>`,
//                 to: to,
//                 subject: 'Thank You for Contacting Blessing Oga',
//                 html: `
//                     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//                         <h2 style="color: #964B2F;">Thank You for Reaching Out!</h2>
//                         <p>Hi ${name},</p>
//                         <p>I've received your message and will get back to you within 24 hours.</p>
//                         <p>Best regards,<br><strong>Blessing Oga</strong></p>
//                     </div>
//                 `
//             };

//             const info = await this.transporter.sendMail(mailOptions);
//             console.log('✅ Contact confirmation email sent to:', to);
//             return true;
//         } catch (error) {
//             console.error('❌ Error sending contact confirmation:', error.message);
//             return false;
//         }
//     }

//     async sendAdminNotification(messageData) {
//         if (!this.transporter) {
//             console.log(`📧 [DEV] New message from: ${messageData.name} (${messageData.email})`);
//             return true;
//         }

//         try {
//             const mailOptions = {
//                 from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
//                 to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
//                 subject: '🔔 New Contact Form Submission',
//                 html: `
//                     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                         <h2 style="color: #964B2F;">New Message Received</h2>
//                         <p><strong>Name:</strong> ${messageData.name}</p>
//                         <p><strong>Email:</strong> ${messageData.email}</p>
//                         ${messageData.company ? `<p><strong>Company:</strong> ${messageData.company}</p>` : ''}
//                         <p><strong>Message:</strong> ${messageData.message}</p>
//                     </div>
//                 `
//             };

//             const info = await this.transporter.sendMail(mailOptions);
//             console.log('✅ Admin notification sent');
//             return true;
//         } catch (error) {
//             console.error('❌ Error sending admin notification:', error.message);
//             return false;
//         }
//     }
// }

// module.exports = new EmailService();

const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 for all email connections (critical for Render)
try {
    dns.setDefaultResultOrder('ipv4first');
    console.log('✅ DNS configured to prefer IPv4 for email');
} catch (err) {
    console.log('⚠️ DNS configuration error:', err.message);
}

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
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                user: process.env.EMAIL_USER,
                hasPassword: !!process.env.EMAIL_PASS,
                ipVersion: 'IPv4 (forced)'
            });

            // Create transporter with IPv4 forced
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // CRITICAL: Must be true for port 465
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS // 16-char app password
                },
                // Force IPv4 only - this is the key fix for Render
                family: 4,
                tls: {
                    rejectUnauthorized: false, // Changed to false for Render compatibility
                    minVersion: 'TLSv1.2'
                },
                connectionTimeout: 30000,
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
            console.log('⏳ Verifying email connection (IPv4)...');
            
            // Use Promise version of verify for better error handling
            await new Promise((resolve, reject) => {
                this.transporter.verify((error, success) => {
                    if (error) {
                        console.error('❌ Email transporter verification failed:', error.message);
                        
                        // Specific error guidance
                        if (error.message.includes('ENETUNREACH')) {
                            console.log('💡 Tip: Network unreachable - this is often an IPv6 issue on Render');
                            console.log('✅ Fix: Added family:4 to force IPv4 - should resolve this!');
                        } else if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
                            console.log('💡 Tip: Timeout - check firewall or network settings');
                            console.log('   1. If on Render, IPv4 fix should help');
                            console.log('   2. Verify Gmail app password is correct');
                        } else if (error.message.includes('auth') || error.code === 'EAUTH') {
                            console.log('💡 Tip: Authentication failed - check app password (16 chars, no spaces)');
                            console.log('   1. Visit: https://myaccount.google.com/apppasswords');
                            console.log('   2. Generate new 16-char password');
                        }
                        
                        reject(error);
                    } else {
                        console.log('✅ Email transporter is ready to send messages (IPv4)');
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
            console.log(`📧 [DEV] Content: Thank you ${name} for contacting!`);
            return true;
        }

        try {
            const mailOptions = {
                from: `"Blessing Oga" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: 'Thank You for Contacting Blessing Oga',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <div style="background-color: #964B2F; padding: 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Blessing Oga</h1>
                                <p style="color: #ffffff; margin: 5px 0 0; opacity: 0.9;">Junior Full Stack Developer</p>
                            </div>
                            
                            <div style="padding: 30px;">
                                <h2 style="color: #964B2F; margin-top: 0;">Thank You for Reaching Out!</h2>
                                
                                <p>Hi <strong>${name}</strong>,</p>
                                
                                <p>I've received your message and will get back to you within <strong>24 hours</strong>. I appreciate your interest in working with me!</p>
                                
                                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #964B2F;">
                                    <p style="margin: 0 0 10px 0;"><strong>In the meantime, you can:</strong></p>
                                    <ul style="margin: 0; padding-left: 20px;">
                                        <li>Check out my <a href="https://github.com/blesose" style="color: #964B2F;">GitHub</a></li>
                                        <li>Connect on <a href="https://linkedin.com/in/blessing-oga-53bb443a7/" style="color: #964B2F;">LinkedIn</a></li>
                                        <li>View my <a href="https://myportfolio-frontend.vercel.app" style="color: #964B2F;">portfolio</a></li>
                                    </ul>
                                </div>
                                
                                <p>Best regards,</p>
                                <p style="font-size: 18px; margin: 5px 0;"><strong>Blessing Oga</strong></p>
                                <p style="color: #666; margin: 0;">Junior Full Stack Developer</p>
                            </div>
                            
                            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                                <p style="margin: 0;">© 2026 Blessing Oga. All rights reserved.</p>
                                <p style="margin: 5px 0 0;">This is an automated response, please do not reply to this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `Thank you ${name} for contacting Blessing Oga. I'll respond within 24 hours.`
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Contact confirmation email sent to:', to);
            console.log('📧 Message ID:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Error sending contact confirmation:', error.message);
            if (error.code === 'EENVELOPE') {
                console.error('❌ Invalid email address format');
            } else if (error.code === 'EAUTH') {
                console.error('❌ Authentication failed - check app password');
            }
            return false;
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
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>New Contact</title>
                    </head>
                    <body style="font-family: Arial, sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden;">
                            <div style="background: #964B2F; padding: 20px; color: white;">
                                <h2 style="margin: 0;">📬 New Message Received</h2>
                            </div>
                            
                            <div style="padding: 30px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 10px; background: #f5f5f5; font-weight: bold; width: 30%;">Name:</td>
                                        <td style="padding: 10px;">${messageData.name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">Email:</td>
                                        <td style="padding: 10px;">
                                            <a href="mailto:${messageData.email}" style="color: #964B2F;">${messageData.email}</a>
                                        </td>
                                    </tr>
                                    ${messageData.company ? `
                                    <tr>
                                        <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">Company:</td>
                                        <td style="padding: 10px;">${messageData.company}</td>
                                    </tr>
                                    ` : ''}
                                    <tr>
                                        <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">Message:</td>
                                        <td style="padding: 10px;">${messageData.message}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">Received:</td>
                                        <td style="padding: 10px;">${new Date().toLocaleString()}</td>
                                    </tr>
                                </table>
                                
                                <div style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
                                    <a href="mailto:${messageData.email}?subject=Re: Your message to Blessing Oga" 
                                       style="display: inline-block; background: #964B2F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `New message from ${messageData.name} (${messageData.email}): ${messageData.message}`
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Admin notification sent');
            console.log('📧 Message ID:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Error sending admin notification:', error.message);
            return false;
        }
    }

    // Test method to verify email configuration
    async testConnection() {
        if (!this.transporter) {
            console.log('⚠️ Email not configured');
            return false;
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"Test" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: 'Test Email from Portfolio',
                text: 'If you receive this, email is working correctly with IPv4!',
                html: '<p>If you receive this, email is working correctly with <strong>IPv4</strong>!</p>'
            });
            console.log('✅ Test email sent successfully');
            console.log('📧 Message ID:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Test email failed:', error.message);
            return false;
        }
    }
}

module.exports = new EmailService();