const FailedOrderEmailTemplate = ({ customerName, orderId, websiteUrl = 'https://zubahouse.com' }) => {
    // Get logo URL from environment or use default Zuba House logo
    const logoUrl = process.env.ZUBA_LOGO_URL || 
                   process.env.LOGO_URL || 
                   'https://res.cloudinary.com/dimtdehjp/image/upload/v1763333609/1_wwx8sr.png';
    
    // Minimalist design to avoid spam filters
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Update - Zuba House</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background: #ffffff;
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
        }
        .logo-container img {
            max-width: 120px;
            height: auto;
        }
        .content {
            padding: 30px 20px;
        }
        .message {
            color: #333;
            font-size: 15px;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2c3e50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 15px;
        }
        .button:hover {
            background-color: #1a252f;
        }
        .support {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666;
        }
        .support a {
            color: #2c3e50;
            text-decoration: none;
        }
        .footer {
            background: #f8f9fa;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-container">
                <img src="${logoUrl}" alt="Zuba House" />
            </div>
        </div>
        <div class="content">
            <div class="message">
                <p>Hello ${customerName || 'Customer'},</p>
                <p>We wanted to let you know that your recent order attempt was unsuccessful.</p>
                <p>We'd love to help you complete your purchase. Please try again using the link below:</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${websiteUrl}" class="button">Visit Our Store</a>
            </div>
            
            <div class="message">
                <p>If you have any questions or need assistance, please don't hesitate to reach out:</p>
                <ul style="list-style: none; padding: 0;">
                    <li>📧 Email: <a href="mailto:sales@zubahouse.com">sales@zubahouse.com</a></li>
                    <li>💬 WhatsApp: <a href="https://wa.me/14375577487">+1 437-557-7487</a></li>
                </ul>
            </div>
            
            <div class="support">
                <p>You can reply directly to this email or contact us using the information above. We're here to help!</p>
            </div>
        </div>
        <div class="footer">
            <p>Zuba House &copy; ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>`;
};

export { FailedOrderEmailTemplate };
export default FailedOrderEmailTemplate;
