const OrderCancellationEmail = (username, order, cancellationReason = '') => {
    // Get logo URL from environment or use default Zuba House logo
    const logoUrl = process.env.ZUBA_LOGO_URL || 
                   process.env.LOGO_URL || 
                   'https://res.cloudinary.com/dimtdehjp/image/upload/v1763333609/1_wwx8sr.png';
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>Order Cancellation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #0b2735 0%, #1a3d52 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .logo-container {
            margin-bottom: 15px;
        }
        .logo-container img {
            max-width: 180px;
            height: auto;
            background: white;
            padding: 10px;
            border-radius: 8px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 1px;
        }
        .content {
            padding: 20px;
        }
        .order-details {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .order-details th, .order-details td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        .order-details th {
            background: #f8f8f8;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #666;
        }
        .warning-box {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-container">
                <img src="${logoUrl}" alt="Zuba House Logo" style="max-width: 180px; height: auto; background: white; padding: 10px; border-radius: 8px;" />
            </div>
            <h1>Order Cancelled</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${username}</strong>,</p>
            <p>We regret to inform you that your order has been cancelled.</p>

            ${cancellationReason ? `
            <div class="warning-box">
                <strong>Reason for Cancellation:</strong><br>
                ${cancellationReason}
            </div>
            ` : ''}

            <p><strong>Order ID:</strong> #${order?._id}</p>
            <p><strong>Order Date:</strong> ${order?.date || new Date().toLocaleDateString()}</p>
            
            <table class="order-details">
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
    
              ${order?.products?.map(
        (product) => `
             <tr>
        <td>${product?.productTitle || product?.title || 'Product'}</td>
                <td>${product?.quantity || 1}</td>
                        <td>$${(product?.subTotal || product?.price || 0).toFixed(2)}</td>
        </tr>
                    `
    ).join('') || ''}

              <tr>
                <td colspan="2"><strong>Subtotal</strong></td>
                <td><strong>$${(order?.products?.reduce((sum, item) => {
                    return sum + (parseFloat(item.subTotal || item.price || 0) * (item.quantity || 1));
                }, 0) || 0).toFixed(2)}</strong></td>
              </tr>
              
              ${order?.shippingCost ? `
              <tr>
                <td colspan="2"><strong>Shipping</strong></td>
                <td><strong>$${parseFloat(order.shippingCost).toFixed(2)}</strong></td>
              </tr>
              ` : ''}
              
              <tr>
                <td colspan="2"><strong>Total</strong></td>
                <td><strong>$${(parseFloat(order?.totalAmt || 0)).toFixed(2)}</strong></td>
              </tr>
          </table>
          
          <p><strong>Payment Status:</strong> ${order?.payment_status || 'N/A'}</p>
          
          ${order?.payment_status === 'COMPLETED' ? `
          <div class="warning-box">
            <strong>Refund Information:</strong><br>
            If payment was already processed, a refund will be issued to your original payment method within 5-10 business days.
          </div>
          ` : ''}
          
            <p>If you have any questions about this cancellation, please contact our customer service.</p>
            <p>We apologize for any inconvenience this may cause.</p>
        </div>
    <div class="footer">
        &copy; ${new Date().getFullYear()} Zuba House. All rights reserved.
    </div>
    </div>
</body>
</html>`;
};

export default OrderCancellationEmail;

