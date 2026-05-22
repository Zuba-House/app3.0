import { sendEmail } from "./emailService.js";

const sendEmailFun = async ({ sendTo, subject, text, html }) => {
  try {
    // Handle both string and array inputs
    const recipients = Array.isArray(sendTo) ? sendTo : [sendTo];
    
    console.log('📧 Attempting to send email to:', recipients);
    
    // Send email to all recipients
    const results = await Promise.all(
      recipients.map(recipient => sendEmail(recipient, subject, text, html))
    );
    
    // Check if all emails were sent successfully
    const allSuccess = results.every(result => result.success);
    
    if (allSuccess) {
      console.log('✅ Email(s) sent successfully to:', recipients);
      return true;
    } else {
      const errors = results.filter(r => !r.success).map(r => r.error);
      console.error('❌ Some emails failed to send:', errors);
      return false;
    }
  } catch (error) {
    console.error('❌ Error in sendEmailFun:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

export default sendEmailFun;