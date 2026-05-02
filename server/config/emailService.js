import sgMail from '@sendgrid/mail';
import { env } from './env.js';

const sendGridApiKey = env.sendgridApiKey;
const DEFAULT_FROM_EMAIL = env.emailFrom || 'orders@zubahouse.com';
const DEFAULT_FROM_NAME = env.emailSenderName || 'Zuba House';

if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
  console.log(`✅ SendGrid configured (${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>)`);
} else {
  console.error('❌ SENDGRID_API_KEY is missing. Email sending is disabled.');
}

const logEmailFailure = (context, error) => {
  console.error(`❌ Email failure [${context}]`, {
    message: error?.message,
    code: error?.code,
    statusCode: error?.response?.statusCode,
    details: error?.response?.body?.errors || error?.response?.body || null,
  });
};

const getSender = (from) => {
  if (!from) {
    return { email: DEFAULT_FROM_EMAIL, name: DEFAULT_FROM_NAME };
  }
  if (typeof from === 'object') {
    return {
      email: from.email || DEFAULT_FROM_EMAIL,
      name: from.name || DEFAULT_FROM_NAME,
    };
  }
  return {
    email: from,
    name: DEFAULT_FROM_NAME,
  };
};

export const buildOtpEmailTemplate = ({
  customerName = 'there',
  otp,
  purpose = 'verification',
  expiryMinutes = 10,
}) => {
  const purposeLabel = purpose === 'reset' ? 'Password Reset' : 'Email Verification';
  return `
  <div style="font-family: Arial, sans-serif; background:#f5f6f8; padding:24px; color:#1f2937;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:10px; padding:24px; border:1px solid #e5e7eb;">
      <h2 style="margin:0 0 12px; color:#0b2735;">${purposeLabel} OTP</h2>
      <p style="margin:0 0 16px;">Hi ${customerName},</p>
      <p style="margin:0 0 16px;">Use the one-time password below to continue:</p>
      <div style="font-size:28px; font-weight:700; letter-spacing:6px; text-align:center; padding:14px; background:#f3f4f6; border-radius:8px; color:#111827; margin:0 0 16px;">
        ${otp}
      </div>
      <p style="margin:0 0 8px;">This OTP expires in ${expiryMinutes} minutes.</p>
      <p style="margin:0; color:#6b7280; font-size:13px;">If you did not request this, you can safely ignore this email.</p>
    </div>
  </div>`;
};

export async function sendEmail(to, subject, text = '', html = '', options = {}) {
  try {
    if (!to || !subject) {
      return { success: false, error: 'Recipient and subject are required' };
    }
    if (!sendGridApiKey) {
      return { success: false, error: 'SENDGRID_API_KEY environment variable is not set' };
    }

    const from = getSender(options.from);
    const msg = {
      to,
      from,
      subject,
      text: text || (html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''),
      html: html || text,
    };

    const [response] = await sgMail.send(msg);
    return {
      success: true,
      messageId: response?.headers?.['x-message-id'] || `sendgrid-${Date.now()}`,
      statusCode: response?.statusCode || 202,
    };
  } catch (error) {
    logEmailFailure(subject, error);
    return { success: false, error: error?.message || 'Unknown email error' };
  }
}

export async function sendOtpEmail({
  to,
  customerName,
  otp,
  purpose = 'verification',
  expiryMinutes = env.otpExpiryMinutes,
}) {
  const isReset = purpose === 'reset';
  const subject = isReset ? 'Password Reset OTP - Zuba House' : 'Verify Your Email - Zuba House';
  const html = buildOtpEmailTemplate({ customerName, otp, purpose, expiryMinutes });
  const text = `${subject}\nYour OTP is ${otp}. It expires in ${expiryMinutes} minutes.`;
  return sendEmail(to, subject, text, html);
}

const transporter = {
  sendMail: async (mailOptions = {}) => {
    const result = await sendEmail(
      mailOptions.to,
      mailOptions.subject,
      mailOptions.text,
      mailOptions.html,
      { from: mailOptions.from }
    );
    if (!result.success) {
      throw new Error(result.error || 'Send email failed');
    }
    return {
      messageId: result.messageId,
      response: `SendGrid: ${result.statusCode || 202}`,
      accepted: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
      rejected: [],
    };
  },
  verify: async () => {
    if (!sendGridApiKey) {
      throw new Error('SENDGRID_API_KEY is not set');
    }
    return true;
  },
};

export { transporter };