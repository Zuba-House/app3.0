/**
 * Email template for review request
 * @param {Object} data - Review request data
 * @param {string} data.customerName - Customer name
 * @param {string} data.productName - Product name
 * @param {string} data.productImage - Product image URL
 * @param {string} data.reviewLink - Link to review page
 * @param {string} data.orderNumber - Order number
 * @returns {string} HTML email template
 */
export const ReviewRequestEmailTemplate = ({
    customerName,
    productName,
    productImage,
    reviewLink,
    orderNumber,
    productLink
}) => {
    /**
     * Get customer frontend URL (never vendor URL)
     * Used for footer links in email template
     */
    const getCustomerFrontendUrl = () => {
        const vendorUrl = process.env.VENDOR_URL || 'https://vendor.zubahouse.com';
        let clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
        
        // Safety check: If CLIENT_URL is accidentally set to vendor URL, use fallback
        if (clientUrl.includes('vendor.zubahouse.com') || clientUrl.includes('/vendor')) {
            clientUrl = process.env.FRONTEND_URL || 'https://zubahouse.com';
        }
        
        // Additional check: If it's still vendor URL, use production customer URL
        if (clientUrl.includes('vendor')) {
            clientUrl = 'https://zubahouse.com';
        }
        
        return clientUrl;
    };
    
    const baseUrl = getCustomerFrontendUrl();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Share Your Experience - Zuba House</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
        }
        .product-section {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .product-image {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
        }
        .product-info {
            flex: 1;
        }
        .product-name {
            font-size: 18px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 5px;
        }
        .order-number {
            font-size: 14px;
            color: #666666;
        }
        .message {
            font-size: 16px;
            color: #555555;
            line-height: 1.8;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        .benefits {
            background-color: #f0f7ff;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
        }
        .benefits h3 {
            font-size: 16px;
            color: #333333;
            margin-bottom: 15px;
        }
        .benefits ul {
            list-style: none;
            padding: 0;
        }
        .benefits li {
            padding: 8px 0;
            padding-left: 25px;
            position: relative;
            color: #555555;
        }
        .benefits li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            font-size: 14px;
            color: #666666;
            margin: 5px 0;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .expiry-notice {
            font-size: 12px;
            color: #999999;
            text-align: center;
            margin-top: 20px;
            font-style: italic;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .product-section {
                flex-direction: column;
                text-align: center;
            }
            .product-image {
                width: 120px;
                height: 120px;
            }
            .cta-button {
                padding: 14px 30px;
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🌟 Share Your Experience</h1>
            <p>We'd love to hear from you!</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hi ${customerName || 'Valued Customer'},
            </div>
            
            <div class="message">
                Thank you for your recent purchase! We hope you're enjoying your new product. 
                Your feedback helps us improve and helps other customers make informed decisions.
            </div>
            
            <div class="product-section">
                ${productImage ? `<a href="${productLink || '#'}" style="text-decoration: none; display: block;"><img src="${productImage}" alt="${productName}" class="product-image" /></a>` : ''}
                <div class="product-info">
                    <a href="${productLink || '#'}" style="text-decoration: none; color: inherit;">
                        <div class="product-name">${productName}</div>
                    </a>
                    ${orderNumber ? `<div class="order-number">Order #${orderNumber}</div>` : ''}
                </div>
            </div>
            
            <div class="benefits">
                <h3>Why your review matters:</h3>
                <ul>
                    <li>Help other customers make better decisions</li>
                    <li>Share your honest experience</li>
                    <li>Help us improve our products and service</li>
                    <li>It only takes a minute!</li>
                </ul>
            </div>
            
            <div class="button-container">
                <a href="${reviewLink}" class="cta-button">Write a Review</a>
            </div>
            
            <div class="expiry-notice">
                This review request expires in 30 days. We appreciate your time!
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Zuba House</strong></p>
            <p>Thank you for being a valued customer!</p>
            <p>
                <a href="${baseUrl}">Visit Our Store</a> | 
                <a href="${baseUrl}/contact">Contact Us</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #999999;">
                If you have any questions about your order, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

export default ReviewRequestEmailTemplate;

