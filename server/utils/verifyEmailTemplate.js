const VerificationEmail = (username, otp ) => {
    // Get logo URL from environment or use default Zuba House logo
    const logoUrl = process.env.ZUBA_LOGO_URL || 
                   process.env.LOGO_URL || 
                   'https://res.cloudinary.com/dimtdehjp/image/upload/v1763333609/1_wwx8sr.png';
    
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - Zuba House</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
              color: #333;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
          }
          .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(11, 39, 53, 0.15);
          }
          @media only screen and (max-width: 600px) {
              .email-container {
                  margin: 0;
                  border-radius: 0;
                  width: 100% !important;
              }
          }
          .header {
              background: linear-gradient(135deg, #0b2735 0%, #1a3d52 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
          }
          .logo-container {
              margin-bottom: 20px;
          }
          .logo-container img {
              max-width: 180px;
              height: auto;
              background: white;
              padding: 12px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 0.5px;
              color: #efb291;
          }
          .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.95;
          }
          .content {
              padding: 40px 30px;
              text-align: center;
          }
          .greeting {
              color: #0b2735;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              text-align: left;
          }
          .content p {
              font-size: 16px;
              line-height: 1.6;
              color: #1a252f;
              margin: 15px 0;
          }
          .otp-container {
              background: linear-gradient(135deg, #efb291 0%, #eeb190 100%);
              border-radius: 12px;
              padding: 30px;
              margin: 30px 0;
              box-shadow: 0 4px 12px rgba(239, 178, 145, 0.3);
          }
          .otp-label {
              font-size: 14px;
              color: #0b2735;
              font-weight: 600;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
          }
          .otp {
              font-size: 36px;
              font-weight: 700;
              color: #0b2735;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
              background: white;
              padding: 20px;
              border-radius: 8px;
              display: inline-block;
              min-width: 200px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .info-box {
              background: #f8f9fa;
              border-left: 4px solid #efb291;
              padding: 15px 20px;
              margin: 25px 0;
              border-radius: 6px;
              text-align: left;
          }
          .info-box p {
              margin: 0;
              font-size: 14px;
              color: #1a252f;
          }
          .footer {
              background: #0b2735;
              color: white;
              text-align: center;
              padding: 25px 30px;
              font-size: 13px;
          }
          .footer p {
              margin: 5px 0;
              color: #e5e2db;
          }
          .footer a {
              color: #efb291;
              text-decoration: none;
          }
          .footer a:hover {
              text-decoration: underline;
          }
          @media only screen and (max-width: 600px) {
              .header {
                  padding: 30px 20px !important;
              }
              .header h1 {
                  font-size: 24px !important;
              }
              .content {
                  padding: 30px 20px !important;
              }
              .otp {
                  font-size: 28px !important;
                  letter-spacing: 4px !important;
                  padding: 15px !important;
              }
              .logo-container img {
                  max-width: 150px !important;
              }
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="header">
              <div class="logo-container">
                  <img src="${logoUrl}" alt="Zuba House Logo" />
              </div>
              <h1>Verify Your Email Address</h1>
              <p>Welcome to Zuba House!</p>
          </div>
          <div class="content">
              <div class="greeting">
                  Hello ${username}! 👋
              </div>
              <p>Thank you for registering with <strong style="color: #0b2735;">Zuba House</strong>. We're excited to have you join our community!</p>
              
              <div class="otp-container">
                  <div class="otp-label">Your Verification Code</div>
                  <div class="otp">${otp}</div>
              </div>
              
              <p>Please enter this code in the verification page to complete your registration. This code will expire in <strong>10 minutes</strong>.</p>
              
              <div class="info-box">
                  <p><strong>🔒 Security Note:</strong> If you didn't create an account with Zuba House, you can safely ignore this email. No action is required.</p>
              </div>
          </div>
          <div class="footer">
              <p><strong>Zuba House</strong></p>
              <p>Your trusted partner for quality products</p>
              <p style="margin-top: 15px; opacity: 0.8;">&copy; ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  
    `;
  };


  export default VerificationEmail;