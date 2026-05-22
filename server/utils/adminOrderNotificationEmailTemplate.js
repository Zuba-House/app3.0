const AdminOrderNotificationEmail = (order, customerInfo, shippingAddress) => {
    // Get logo URL from environment or use default Zuba House logo
    const logoUrl = process.env.ZUBA_LOGO_URL || 
                   process.env.LOGO_URL || 
                   'https://res.cloudinary.com/dimtdehjp/image/upload/v1763333609/1_wwx8sr.png';
    
    // Helper function to format price
    const formatPrice = (price) => {
        if (!price) return 0;
        const numPrice = parseFloat(price);
        return isNaN(numPrice) ? 0 : numPrice;
    };

    const products = order?.products || [];
    const subtotal = products.reduce((sum, item) => {
        const itemPrice = formatPrice(item.subTotal || item.price || 0);
        const quantity = item.quantity || 1;
        return sum + (itemPrice * quantity);
    }, 0);
    
    const shippingCost = formatPrice(order?.shippingCost || 0);
    const total = formatPrice(order?.totalAmt || 0) || (subtotal + shippingCost);

    // Format customer info - prioritize customerName from order
    const customerName = order?.customerName || customerInfo?.name || order?.guestCustomer?.name || 'N/A';
    const customerEmail = customerInfo?.email || order?.guestCustomer?.email || 'N/A';
    // Get phone from multiple sources: order.phone, customerInfo, shippingAddress, or guestCustomer
    const customerPhone = order?.phone || 
                         customerInfo?.mobile || 
                         customerInfo?.phone || 
                         shippingAddress?.contactInfo?.phone ||
                         order?.guestCustomer?.phone || 
                         'N/A';
    // Get apartment/unit number and delivery note
    const apartmentNumber = order?.apartmentNumber || '';
    const deliveryNote = order?.deliveryNote || '';

    // Format shipping address - check order.shippingAddress first, then shippingAddress parameter
    let addressText = 'N/A';
    let addressPhone = order?.phone || shippingAddress?.contactInfo?.phone || 'N/A';
    
    // Priority: order.shippingAddress > shippingAddress parameter
    const addrData = order?.shippingAddress || shippingAddress?.address || shippingAddress;
    
    if (addrData) {
        const parts = [];
        if (addrData.addressLine1) parts.push(addrData.addressLine1);
        // Include apartment number in address if available
        if (apartmentNumber) parts.push(`Apt/Unit: ${apartmentNumber}`);
        if (addrData.addressLine2) parts.push(addrData.addressLine2);
        if (addrData.city) parts.push(addrData.city);
        if (addrData.province || addrData.provinceCode) parts.push(addrData.province || addrData.provinceCode);
        if (addrData.postalCode || addrData.postal_code) parts.push(addrData.postalCode || addrData.postal_code);
        if (addrData.country) parts.push(addrData.country);
        addressText = parts.length > 0 ? parts.join(', ') : 'Address not available';
    }

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification - Zuba House</title>
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
            max-width: 700px;
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
            .content {
                padding: 20px 15px !important;
            }
            .header {
                padding: 20px 15px !important;
            }
            .header h1 {
                font-size: 22px !important;
            }
            .header p {
                font-size: 14px !important;
            }
            .logo-container img {
                max-width: 150px !important;
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
            font-size: 16px;
            opacity: 0.95;
        }
        .content {
            padding: 30px 20px;
        }
        .alert-box {
            background: #fff3cd;
            border-left: 4px solid #f39c12;
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
        }
        .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0b2735;
        }
        .info-section h3 {
            margin: 0 0 15px 0;
            color: #0b2735;
            font-size: 18px;
            border-bottom: 2px solid #0b2735;
            padding-bottom: 8px;
        }
        .info-row {
            display: flex;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e8e8e8;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #0b2735;
            width: 180px;
            flex-shrink: 0;
        }
        .info-value {
            color: #1a3d52;
            flex: 1;
            word-break: break-word;
        }
        @media only screen and (max-width: 600px) {
            .info-row {
                flex-direction: column;
                margin: 15px 0;
                padding: 10px 0;
            }
            .info-label {
                width: 100%;
                margin-bottom: 5px;
                font-size: 13px;
            }
            .info-value {
                width: 100%;
                font-size: 14px;
            }
            .info-section {
                padding: 15px !important;
            }
            .info-section h3 {
                font-size: 16px !important;
            }
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
            background: #0b2735;
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
            word-break: break-word;
        }
        @media only screen and (max-width: 600px) {
            .order-details {
                font-size: 12px;
                display: block;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }
            .order-details thead {
                display: none;
            }
            .order-details tbody {
                display: block;
            }
            .order-details tr {
                display: block;
                margin-bottom: 15px;
                border: 1px solid #e8e8e8;
                border-radius: 8px;
                padding: 10px;
                background: #f8f9fa;
            }
            .order-details td {
                display: block;
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
                text-align: left !important;
            }
            .order-details td:last-child {
                border-bottom: none;
            }
            .order-details td:before {
                content: attr(data-label);
                font-weight: 600;
                color: #0b2735;
                display: block;
                margin-bottom: 5px;
            }
            .order-details .total-row td {
                font-size: 14px;
                padding: 12px 0;
            }
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
            color: #0b2735;
            padding: 15px 12px;
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
        .footer {
            background: #0b2735;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 13px;
        }
        .action-button {
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
        @media only screen and (max-width: 600px) {
            .action-button {
                display: block;
                text-align: center;
                padding: 14px 20px;
                font-size: 14px;
            }
            .alert-box {
                padding: 12px !important;
                font-size: 13px !important;
            }
            h3 {
                font-size: 18px !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-container">
                <img src="${logoUrl}" alt="Zuba House Logo" style="max-width: 180px; height: auto; background: white; padding: 10px; border-radius: 8px;" />
            </div>
            <h1>NEW ORDER RECEIVED</h1>
            <p>Order #${order?._id}</p>
        </div>
        <div class="content">
            <div class="alert-box">
                <strong>⚠️ Action Required:</strong> A new order has been placed and requires your attention.
            </div>

            <div class="info-section">
                <h3>📋 Order Information</h3>
                <div class="info-row">
                    <div class="info-label">Order ID:</div>
                    <div class="info-value"><strong>#${order?._id}</strong></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Order Date:</div>
                    <div class="info-value">${order?.date || new Date().toLocaleString()}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Payment Status:</div>
                    <div class="info-value">
                        <strong style="color: ${order?.payment_status === 'COMPLETED' ? '#27ae60' : order?.payment_status === 'CASH ON DELIVERY' ? '#f39c12' : '#e74c3c'};">
                            ${order?.payment_status || 'Pending'}
                        </strong>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Order Status:</div>
                    <div class="info-value">${order?.status || order?.order_status || 'Received'}</div>
                </div>
                ${order?.paymentId ? `
                <div class="info-row">
                    <div class="info-label">Payment ID:</div>
                    <div class="info-value">${order.paymentId}</div>
                </div>
                ` : ''}
                ${order?.isGuestOrder ? `
                <div class="info-row">
                    <div class="info-label">Order Type:</div>
                    <div class="info-value"><strong style="color: #f39c12;">Guest Order</strong></div>
                </div>
                ` : ''}
            </div>

            <div class="info-section">
                <h3>👤 Customer Information</h3>
                <div class="info-row">
                    <div class="info-label">Name:</div>
                    <div class="info-value"><strong>${customerName}</strong></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div class="info-value"><a href="mailto:${customerEmail}" style="color: #3498db;">${customerEmail}</a></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Phone:</div>
                    <div class="info-value"><a href="tel:${customerPhone}" style="color: #3498db;">${customerPhone}</a></div>
                </div>
                ${order?.userId ? `
                <div class="info-row">
                    <div class="info-label">User ID:</div>
                    <div class="info-value">${order.userId}</div>
                </div>
                ` : ''}
            </div>

            <div class="info-section">
                <h3>📍 Shipping Address</h3>
                <div class="info-row">
                    <div class="info-label">Address:</div>
                    <div class="info-value">${addressText}</div>
                </div>
                ${apartmentNumber ? `
                <div class="info-row">
                    <div class="info-label">Apt/Unit Number:</div>
                    <div class="info-value"><strong style="color: #e74c3c;">${apartmentNumber}</strong></div>
                </div>
                ` : ''}
                <div class="info-row">
                    <div class="info-label">Phone:</div>
                    <div class="info-value"><a href="tel:${addressPhone}" style="color: #3498db;">${addressPhone}</a></div>
                </div>
            </div>

            ${deliveryNote ? `
            <div class="info-section" style="border-left-color: #f39c12; background: #fff9e6;">
                <h3>📝 Delivery Instructions</h3>
                <div class="info-row">
                    <div class="info-label">Customer Note:</div>
                    <div class="info-value" style="font-style: italic; color: #2c3e50;">"${deliveryNote}"</div>
                </div>
            </div>
            ` : ''}

            <h3 style="color: #0b2735; margin: 30px 0 15px 0; font-size: 20px;">🛍️ Order Items</h3>
            <table class="order-details">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th style="text-align: right;">Price (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map((product) => {
                        const productPrice = formatPrice(product.subTotal || product.price || 0);
                        const quantity = product.quantity || 1;
                        const lineTotal = productPrice * quantity;
                        
                        // Get product variations
                        const variations = [];
                        if (product.variation?.attributes && product.variation.attributes.length > 0) {
                            product.variation.attributes.forEach(attr => {
                                if (attr.name && attr.value) {
                                    variations.push(`${attr.name}: ${attr.value}`);
                                }
                            });
                        }
                        if (variations.length === 0) {
                            if (product.size) variations.push(`Size: ${product.size}`);
                            if (product.weight) variations.push(`Weight: ${product.weight}`);
                            if (product.ram) variations.push(`RAM: ${product.ram}`);
                        }
                        
                        const sku = product.variation?.sku || product.sku || 'N/A';
                        
                        return `
                        <tr>
                            <td data-label="Product">
                                <strong>${product?.productTitle || product?.title || 'Product'}</strong>
                                <div style="font-size: 11px; color: #999; margin-top: 2px;">Product ID: ${product.productId}</div>
                                ${variations.length > 0 ? `
                                <div class="product-variations">
                                    ${variations.join(' • ')}
                                </div>
                                ` : ''}
                                <div class="product-sku">SKU: ${sku}</div>
                            </td>
                            <td data-label="Quantity">${quantity}</td>
                            <td data-label="Price (USD)" style="text-align: right;">$${lineTotal.toFixed(2)}</td>
                        </tr>`;
                    }).join('')}
                    
                    <tr>
                        <td data-label="Subtotal" colspan="2"><strong>Subtotal</strong></td>
                        <td data-label="Amount" style="text-align: right;"><strong>$${subtotal.toFixed(2)}</strong></td>
                    </tr>
                    
                    ${shippingCost > 0 ? `
                    <tr style="background: #fff9e6;">
                        <td data-label="Shipping Cost" colspan="2"><strong>Shipping Cost</strong></td>
                        <td data-label="Amount" style="text-align: right;"><strong>$${shippingCost.toFixed(2)}</strong></td>
                    </tr>
                    ` : `
                    <tr style="background: #f0f0f0;">
                        <td data-label="Shipping" colspan="2"><strong>Shipping</strong></td>
                        <td data-label="Amount" style="text-align: right;"><strong>Free</strong></td>
                    </tr>
                    `}
                    
                    <tr class="total-row">
                        <td data-label="Total" colspan="2"><strong>TOTAL AMOUNT</strong></td>
                        <td data-label="Amount" style="text-align: right;"><strong>$${total.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.ADMIN_URL || 'http://localhost:5174'}/orders" class="action-button">
                    View Order in Admin Panel
                </a>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 13px; color: #666;">
                <strong>Note:</strong> Please process this order promptly. Customer expects delivery within 5-12 business days.
            </div>
        </div>
        <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>Zuba House - Admin Notification</strong></p>
            <p style="margin: 0; opacity: 0.8;">&copy; ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

export default AdminOrderNotificationEmail;

