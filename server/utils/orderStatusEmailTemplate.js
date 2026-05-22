// Order Status Update Email Template
const OrderStatusEmailTemplate = (order, newStatus) => {
  // Get frontend URL - ensure it's always zubahouse.com (not old vercel domain)
  const getFrontendUrl = () => {
    const envUrl = process.env.FRONTEND_URL;
    // If FRONTEND_URL is set to old vercel domain, use zubahouse.com instead
    if (envUrl && (envUrl.includes('zuba-web2-0.vercel.app') || envUrl.includes('vercel.app'))) {
      return 'https://zubahouse.com';
    }
    return envUrl || 'https://zubahouse.com';
  };
  
  const frontendUrl = getFrontendUrl();
  
  // Get logo URL from environment or use default
  const logoUrl = process.env.ZUBA_LOGO_URL || 
                 process.env.LOGO_URL || 
                 'https://res.cloudinary.com/dimtdehjp/image/upload/v1763333609/1_wwx8sr.png';
  
  // Get customer name and email
  const customerName = order.guestCustomer?.name || order.name || 'Valued Customer';
  const customerEmail = order.guestCustomer?.email || order.email || '';
  
  // Status messages and colors
  const statusMessages = {
    'Received': {
      subject: '✅ Order Received',
      message: 'We have received your order and it is being processed.',
      color: '#3498db',
      icon: '📦'
    },
    'Processing': {
      subject: '⚙️ Order Processing',
      message: 'Your order is being prepared for shipment.',
      color: '#f39c12',
      icon: '⚙️'
    },
    'Shipped': {
      subject: '📦 Order Shipped',
      message: 'Your order has been shipped! Track your package below.',
      color: '#9b59b6',
      icon: '📦'
    },
    'Out for Delivery': {
      subject: '🚚 Out for Delivery',
      message: 'Your order is out for delivery and will arrive soon!',
      color: '#e67e22',
      icon: '🚚'
    },
    'Delivered': {
      subject: '🎉 Order Delivered',
      message: 'Your order has been delivered! Thank you for shopping with us.',
      color: '#27ae60',
      icon: '🎉'
    }
  };

  const statusInfo = statusMessages[newStatus] || statusMessages['Received'];
  // Use full order ID for consistency - same as order confirmation email
  const orderId = order._id.toString();
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Format price
  const formatPrice = (price) => {
    if (!price) return '0.00';
    return parseFloat(price).toFixed(2);
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${statusInfo.subject} - Zuba House</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: ${statusInfo.color};
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header .order-id {
            margin-top: 10px;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .status-box {
            background: #f8f9fa;
            border-left: 4px solid ${statusInfo.color};
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .status-box h2 {
            color: ${statusInfo.color};
            margin-top: 0;
            font-size: 20px;
        }
        .status-box p {
            font-size: 16px;
            margin-bottom: 0;
            color: #333;
        }
        .order-details {
            background: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .order-details h3 {
            margin-top: 0;
            color: #0b2735;
            font-size: 18px;
        }
        .order-details table {
            width: 100%;
            border-collapse: collapse;
        }
        .order-details td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        .order-details td:first-child {
            font-weight: 600;
            color: #7f8c8d;
            width: 40%;
        }
        .product-item {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            display: flex;
            align-items: center;
            border: 1px solid #e0e0e0;
        }
        .product-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 5px;
            margin-right: 15px;
        }
        .product-info {
            flex: 1;
        }
        .product-name {
            font-weight: 600;
            color: #0b2735;
            margin-bottom: 5px;
        }
        .product-details {
            color: #7f8c8d;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            background: ${statusInfo.color};
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            opacity: 0.9;
        }
        .tracking-notice {
            background: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            background: #0b2735;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
        }
        .footer a {
            color: #efb291;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 20px;
            }
            .product-item {
                flex-direction: column;
                text-align: center;
            }
            .product-image {
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>${statusInfo.icon} ${statusInfo.subject}</h1>
            <div class="order-id">Order #${orderId}</div>
        </div>
        
        <div class="content">
            <p>Hello ${customerName},</p>
            
            <div class="status-box">
                <h2>Status Update</h2>
                <p>${statusInfo.message}</p>
            </div>

            <div class="order-details">
                <h3>Order Details</h3>
                <table>
                    <tr>
                        <td>Order ID:</td>
                        <td><strong>#${orderId}</strong></td>
                    </tr>
                    <tr>
                        <td>Status:</td>
                        <td><strong style="color: ${statusInfo.color};">${newStatus}</strong></td>
                    </tr>
                    <tr>
                        <td>Order Date:</td>
                        <td>${orderDate}</td>
                    </tr>
                    <tr>
                        <td>Total Amount:</td>
                        <td><strong>$${formatPrice(order.totalAmt || 0)}</strong></td>
                    </tr>
                    ${order.trackingNumber ? `
                    <tr>
                        <td>Tracking Number:</td>
                        <td><strong>${order.trackingNumber}</strong></td>
                    </tr>
                    ` : ''}
                    ${order.estimatedDelivery ? `
                    <tr>
                        <td>Estimated Delivery:</td>
                        <td>${new Date(order.estimatedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>

            ${order.products && order.products.length > 0 ? `
            <div class="order-details">
                <h3>Products Ordered</h3>
                ${order.products.map(item => `
                    <div class="product-item">
                        ${item.image ? `
                            <img src="${item.image}" alt="${item.productTitle || 'Product'}" class="product-image" />
                        ` : ''}
                        <div class="product-info">
                            <div class="product-name">${item.productTitle || 'Product'}</div>
                            <div class="product-details">
                                Quantity: ${item.quantity || 1} × $${formatPrice(item.price || 0)} = $${formatPrice((item.price || 0) * (item.quantity || 1))}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <div style="text-align: center;">
                <a href="${frontendUrl}/order-tracking" class="button">
                    Track Your Order
                </a>
            </div>

            ${newStatus === 'Shipped' || newStatus === 'Out for Delivery' ? `
            <div class="tracking-notice">
                <strong>📍 Track Your Package:</strong> Use your Order ID (#${orderId}) and email address on our 
                <a href="${frontendUrl}/order-tracking" style="color: #007bff;">Order Tracking Page</a> 
                to see real-time updates.
            </div>
            ` : ''}

            <p style="margin-top: 30px;">
                If you have any questions about your order, please contact us at 
                <a href="mailto:orders@zubahouse.com">orders@zubahouse.com</a> or reply to this email.
            </p>

            <p>Thank you for shopping with Zuba House!</p>
        </div>

        <div class="footer">
            <p><strong>Zuba House</strong></p>
            <p>This is an automated notification from Zuba House.</p>
            <p>
                <a href="${frontendUrl}">Visit Our Store</a> | 
                <a href="mailto:orders@zubahouse.com">Contact Us</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                &copy; ${new Date().getFullYear()} Zuba House. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
};

export default OrderStatusEmailTemplate;

