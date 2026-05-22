const OrderConfirmationEmail = (username, orders) => {
    // Get logo URL from environment or use default Zuba House logo
    const logoUrl = process.env.ZUBA_LOGO_URL || 
                   process.env.LOGO_URL || 
                   'https://res.cloudinary.com/dimtdehjp/image/upload/v1763333609/1_wwx8sr.png';
    
    // Helper function to ensure price is in USD (convert if needed)
    const formatPrice = (price) => {
        if (!price) return 0;
        // If price seems to be in cents or very large, divide by 100
        // Otherwise use as is
        const numPrice = parseFloat(price);
        // If price is > 1000, it might be in cents or wrong currency
        // For now, just ensure it's a valid number
        return isNaN(numPrice) ? 0 : numPrice;
    };

    // Calculate product prices correctly
    const products = orders?.products || [];
    const subtotal = products.reduce((sum, item) => {
        const itemPrice = formatPrice(item.subTotal || item.price || 0);
        const quantity = item.quantity || 1;
        return sum + (itemPrice * quantity);
    }, 0);
    
    const shippingCost = formatPrice(orders?.shippingCost || 0);
    const total = formatPrice(orders?.totalAmt || 0) || (subtotal + shippingCost);

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Zuba House</title>
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
            box-shadow: 0 4px 12px rgba(44, 62, 80, 0.1);
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
            padding: 30px 20px;
            text-align: center;
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
        .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .order-details {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .order-details th {
            background: #2c3e50;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        .order-details td {
            padding: 12px;
            border-bottom: 1px solid #e8e8e8;
            font-size: 14px;
            vertical-align: top;
        }
        .product-variations {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
            font-style: italic;
        }
        .product-sku {
            font-size: 11px;
            color: #999;
            margin-top: 2px;
        }
        .order-details tr:last-child td {
            border-bottom: none;
        }
        .order-details tr.total-row {
            background: #f8f9fa;
            font-weight: 700;
        }
        .order-details tr.total-row td {
            font-size: 16px;
            color: #2c3e50;
            padding: 15px 12px;
        }
        .order-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f39c12;
        }
        .order-info p {
            margin: 8px 0;
            color: #2c3e50;
            font-size: 14px;
        }
        .order-info strong {
            color: #1a252f;
        }
        .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 13px;
        }
        .footer a {
            color: #f39c12;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e8e8e8, transparent);
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-container">
                <img src="${logoUrl}" alt="Zuba House Logo" style="max-width: 180px; height: auto; background: white; padding: 10px; border-radius: 8px;" />
            </div>
            <h1>ZUBA HOUSE</h1>
            <p>Order Confirmation</p>
        </div>
        <div class="content">
            <div class="greeting">
                <p>Dear <strong>${username}</strong>,</p>
                <p>Thank you for your order! We're excited to get your items to you. Below are your order details:</p>
            </div>

            <table class="order-details">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th style="text-align: right;">Price (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map((product) => {
                        const productPrice = formatPrice(product.subTotal || product.price || 0);
                        const quantity = product.quantity || 1;
                        const lineTotal = productPrice * quantity;
                        
                        // Get product variations (size, color, etc.)
                        const variations = [];
                        if (product.variation?.attributes && product.variation.attributes.length > 0) {
                            product.variation.attributes.forEach(attr => {
                                if (attr.name && attr.value) {
                                    variations.push(`${attr.name}: ${attr.value}`);
                                }
                            });
                        }
                        // Fallback to old format (size, weight, ram)
                        if (variations.length === 0) {
                            if (product.size) variations.push(`Size: ${product.size}`);
                            if (product.weight) variations.push(`Weight: ${product.weight}`);
                            if (product.ram) variations.push(`RAM: ${product.ram}`);
                        }
                        
                        // Get SKU
                        const sku = product.variation?.sku || product.sku || 'N/A';
                        
                        return `
                        <tr>
                            <td>
                                <strong>${product?.productTitle || product?.title || 'Product'}</strong>
                                ${variations.length > 0 ? `
                                <div class="product-variations">
                                    ${variations.join(' • ')}
                                </div>
                                ` : ''}
                                <div class="product-sku">SKU: ${sku}</div>
                            </td>
                            <td>${quantity}</td>
                            <td style="text-align: right;">$${lineTotal.toFixed(2)}</td>
                        </tr>`;
                    }).join('')}
                    
                    <tr>
                        <td colspan="2"><strong>Subtotal</strong></td>
                        <td style="text-align: right;"><strong>$${subtotal.toFixed(2)}</strong></td>
                    </tr>
                    
                    ${shippingCost > 0 ? `
                    <tr style="background: #fff9e6;">
                        <td colspan="2"><strong>Shipping Cost</strong></td>
                        <td style="text-align: right;"><strong>$${shippingCost.toFixed(2)}</strong></td>
                    </tr>
                    ` : `
                    <tr style="background: #f0f0f0;">
                        <td colspan="2"><strong>Shipping</strong></td>
                        <td style="text-align: right;"><strong>Free</strong></td>
                    </tr>
                    `}
                    
                    <tr class="total-row">
                        <td colspan="2"><strong>Total</strong></td>
                        <td style="text-align: right;"><strong>$${total.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>

            <div class="order-info">
                <p><strong>Order ID:</strong> #${orders?._id}</p>
                <p><strong>Order Date:</strong> ${orders?.date || new Date().toLocaleDateString()}</p>
                <p><strong>Payment Status:</strong> ${orders?.payment_status || 'Pending'}</p>
                <p><strong>Estimated Delivery:</strong> ${orders?.shippingRate?.deliveryDays || orders?.shippingRate?.estimatedDelivery || '5-12 business days'}</p>
            </div>

            ${(() => {
                // Get shipping address from order
                const addr = orders?.shippingAddress;
                const phone = orders?.phone || 'N/A';
                const customerName = orders?.customerName || '';
                const apartmentNumber = orders?.apartmentNumber || '';
                const deliveryNote = orders?.deliveryNote || '';
                
                if (addr) {
                    const addressParts = [
                        addr.addressLine1,
                        apartmentNumber ? `Apt/Unit: ${apartmentNumber}` : null,
                        addr.addressLine2,
                        addr.city,
                        addr.province || addr.provinceCode,
                        addr.postalCode || addr.postal_code,
                        addr.country
                    ].filter(Boolean);
                    
                    if (addressParts.length > 0) {
                        return `
            <div class="order-info" style="background: #e8f4f8; border-left: 4px solid #3498db;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px;">📍 Shipping Address</h3>
                ${customerName ? `<p style="margin: 5px 0; color: #2c3e50;"><strong>Name:</strong> ${customerName}</p>` : ''}
                <p style="margin: 5px 0; color: #2c3e50;"><strong>Address:</strong> ${addressParts.join(', ')}</p>
                <p style="margin: 5px 0; color: #2c3e50;"><strong>Phone:</strong> ${phone}</p>
            </div>
            ${deliveryNote ? `
            <div class="order-info" style="background: #fff9e6; border-left: 4px solid #f39c12;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px;">📝 Your Delivery Instructions</h3>
                <p style="margin: 5px 0; color: #2c3e50; font-style: italic;">"${deliveryNote}"</p>
            </div>` : ''}`;
                    }
                }
                return '';
            })()}

            <div class="divider"></div>
            
            <p style="color: #2c3e50; font-size: 14px;">
                We'll send you a tracking number once your order ships. If you have any questions, feel free to contact our customer service team.
            </p>
        </div>
        <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>Zuba House</strong></p>
            <p style="margin: 0; opacity: 0.8;">&copy; ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

export default OrderConfirmationEmail;

