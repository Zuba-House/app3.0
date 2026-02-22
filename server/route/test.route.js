import express from 'express';
import { transporter, sendEmail } from '../config/emailService.js';
import sgMail from '@sendgrid/mail';

const router = express.Router();

// Test email configuration endpoint
router.get('/test-email', async (req, res) => {
  try {
    console.log('📧 Testing SendGrid email configuration...');
    
    // Check SendGrid API key
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'SENDGRID_API_KEY environment variable is not set',
        troubleshooting: [
          '1. Go to Render Dashboard → Environment',
          '2. Add SENDGRID_API_KEY with your SendGrid API key',
          '3. Save and redeploy'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // Show what environment variables are loaded
    const config = {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? '✓ SET (hidden)' : '❌ NOT SET',
      EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.EMAIL || 'NOT SET',
      EMAIL_SENDER_NAME: process.env.EMAIL_SENDER_NAME || 'NOT SET',
      TEST_EMAIL: process.env.TEST_EMAIL || 'NOT SET',
    };

    console.log('📋 SendGrid Configuration:', {
      ...config,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? `✓ SET (${process.env.SENDGRID_API_KEY.length} chars)` : '❌ NOT SET'
    });

    // Send test email using SendGrid
    const testEmail = req.query.to || process.env.TEST_EMAIL || 'olivier.niyo250@gmail.com';
    const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.EMAIL || 'orders@zubahouse.com';
    const senderName = process.env.EMAIL_SENDER_NAME || 'Zuba House';

    console.log('📧 Sending test email via SendGrid...');
    console.log('   From:', `${senderName} <${senderEmail}>`);
    console.log('   To:', testEmail);

    const msg = {
      to: testEmail,
      from: {
        email: senderEmail,
        name: senderName
      },
      subject: '✅ Zuba House Email Test - SendGrid',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #4CAF50; margin-bottom: 20px;">🎉 Email Configuration Working!</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your SendGrid email system is properly configured and working! 🚀
            </p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>📅 Time:</strong> ${new Date().toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>📧 Provider:</strong> SendGrid API</p>
              <p style="margin: 5px 0;"><strong>👤 From:</strong> ${senderName} &lt;${senderEmail}&gt;</p>
              <p style="margin: 5px 0;"><strong>📬 To:</strong> ${testEmail}</p>
            </div>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated test email from Zuba House backend. 
              Your order confirmations and notifications will be sent via SendGrid.
            </p>
          </div>
        </div>
      `,
      text: `Email Configuration Working! Your SendGrid email system is properly configured. From: ${senderName} <${senderEmail}>, To: ${testEmail}`
    };

    const response = await sgMail.send(msg);
    const messageId = response[0]?.headers?.['x-message-id'] || 'sendgrid-' + Date.now();
    const statusCode = response[0]?.statusCode || 202;

    console.log('✅ Test email sent successfully via SendGrid!');
    console.log('   Status Code:', statusCode);
    console.log('   Message ID:', messageId);

    res.status(200).json({
      success: true,
      message: '✅ Email sent successfully via SendGrid!',
      details: {
        from: `${senderName} <${senderEmail}>`,
        to: testEmail,
        subject: msg.subject,
        statusCode: statusCode,
        messageId: messageId,
        provider: 'SendGrid'
      },
      config: config,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ SendGrid test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.body || error.response,
      statusCode: error.response?.statusCode
    });
    
    // Detailed error analysis for SendGrid
    let troubleshooting = 'Unknown error. Check server logs for details.';
    
    if (error.response?.statusCode === 401) {
      troubleshooting = '⚠️ Unauthorized. Your SENDGRID_API_KEY is invalid or expired. Generate a new API key at https://app.sendgrid.com/settings/api_keys';
    } else if (error.response?.statusCode === 403) {
      troubleshooting = '⚠️ Forbidden. Your API key does not have "Mail Send" permissions. Update permissions at https://app.sendgrid.com/settings/api_keys';
    } else if (error.response?.body?.errors?.[0]?.message?.includes('sender')) {
      troubleshooting = '⚠️ Sender verification required. Verify orders@zubahouse.com at https://app.sendgrid.com/settings/sender_auth/senders';
    } else if (!process.env.SENDGRID_API_KEY) {
      troubleshooting = '⚠️ SENDGRID_API_KEY not set. Add it to Render environment variables.';
    } else {
      troubleshooting = '⚠️ SendGrid error. Check: 1) API key is correct, 2) Sender email is verified, 3) API key has Mail Send permissions.';
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.response?.statusCode,
      details: error.response?.body?.errors || [],
      config: {
        SENDGRID_API_KEY_SET: !!process.env.SENDGRID_API_KEY,
        SENDGRID_API_KEY_LENGTH: process.env.SENDGRID_API_KEY?.length || 0,
        EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.EMAIL || 'NOT SET',
        EMAIL_SENDER_NAME: process.env.EMAIL_SENDER_NAME || 'NOT SET',
      },
      troubleshooting: troubleshooting,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Email test route is working',
    timestamp: new Date().toISOString(),
  });
});

export default router;
