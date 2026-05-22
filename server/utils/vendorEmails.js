/**
 * Vendor Email Notifications
 * Uses the existing SendGrid email service
 */

import sendEmailFun from '../config/sendEmail.js';

// Get frontend URL from environment
const getClientUrl = () => process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://zubahouse.com';
const getVendorUrl = () => process.env.VENDOR_URL || 'https://vendor.zubahouse.com';

/**
 * Send vendor welcome email after approval
 */
export const sendVendorWelcome = async (vendor) => {
  try {
    const vendorUrl = getVendorUrl();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0b2735; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; background: #e67e22; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Zuba House Marketplace!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${vendor.storeName || 'Vendor'}</strong>,</p>
            <p>Great news! Your vendor account has been <strong style="color: #27ae60;">approved</strong>!</p>
            <p>You can now:</p>
            <ul>
              <li>✅ Add and manage your products</li>
              <li>✅ Receive and fulfill orders</li>
              <li>✅ Track your earnings and request withdrawals</li>
              <li>✅ Create coupons for your products</li>
            </ul>
            <center>
              <a href="${vendorUrl}/dashboard" class="button">Go to Your Dashboard</a>
            </center>
            <p>If you have any questions, our support team is here to help.</p>
            <p>Best regards,<br>The Zuba House Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailFun({
      sendTo: vendor.email,
      subject: '🎉 Welcome to Zuba House - Vendor Account Approved!',
      html
    });

    console.log('✅ Vendor welcome email sent to:', vendor.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send vendor welcome email:', error);
    return false;
  }
};

/**
 * Send vendor new order notification
 */
export const sendVendorNewOrder = async (vendor, order, vendorItems) => {
  try {
    const vendorUrl = getVendorUrl();
    
    const itemsHtml = vendorItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productTitle || 'Product'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.vendorEarning || item.subTotal || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const totalEarning = vendorItems.reduce((sum, item) => sum + (item.vendorEarning || item.subTotal || 0), 0);
    const orderNumber = order.orderNumber || order._id?.toString().slice(-8).toUpperCase() || 'N/A';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #0b2735; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #0b2735; color: white; padding: 12px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; color: #27ae60; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 New Order Received!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${vendor.storeName || 'Vendor'}</strong>,</p>
            <p>You have a new order! Here are the details:</p>
            
            <div class="order-info">
              <p><strong>Order #:</strong> ${orderNumber}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
              
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Your Earning</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <p class="total" style="text-align: right; margin-top: 15px;">
                Total Earning: $${totalEarning.toFixed(2)}
              </p>
            </div>
            
            <center>
              <a href="${vendorUrl}/orders/${order._id}" class="button">View Order Details</a>
            </center>
            
            <p style="margin-top: 20px;"><strong>Next Steps:</strong></p>
            <ol>
              <li>Review the order details</li>
              <li>Prepare the items for shipping</li>
              <li>Update the order status when shipped</li>
            </ol>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailFun({
      sendTo: vendor.email,
      subject: `📦 New Order #${orderNumber} - Zuba House`,
      html
    });

    console.log('✅ Vendor new order email sent to:', vendor.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send vendor new order email:', error);
    return false;
  }
};

/**
 * Send vendor withdrawal approved notification
 */
export const sendVendorWithdrawalApproved = async (vendor, withdrawal) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .amount { font-size: 32px; font-weight: bold; color: #27ae60; text-align: center; margin: 20px 0; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Withdrawal Approved!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${vendor.storeName || 'Vendor'}</strong>,</p>
            <p>Great news! Your withdrawal request has been <strong style="color: #27ae60;">approved</strong>.</p>
            
            <div class="amount">$${(withdrawal.amount || 0).toFixed(2)}</div>
            
            <div class="info-box">
              <p><strong>Payment Method:</strong> ${withdrawal.paymentMethodSnapshot?.payoutMethod || 'N/A'}</p>
              <p><strong>Request Date:</strong> ${new Date(withdrawal.requestedAt || withdrawal.createdAt).toLocaleDateString()}</p>
              <p><strong>Approved Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>The funds will be transferred to your account within <strong>3-5 business days</strong>.</p>
            <p>You will receive another notification once the payment has been processed.</p>
            
            <p>Best regards,<br>The Zuba House Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailFun({
      sendTo: vendor.email,
      subject: '✅ Withdrawal Approved - Zuba House',
      html
    });

    console.log('✅ Vendor withdrawal approved email sent to:', vendor.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send withdrawal approved email:', error);
    return false;
  }
};

/**
 * Send vendor withdrawal rejected notification
 */
export const sendVendorWithdrawalRejected = async (vendor, withdrawal) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .amount { font-size: 24px; font-weight: bold; color: #333; text-align: center; margin: 20px 0; }
          .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .refund-notice { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Withdrawal Request Update</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${vendor.storeName || 'Vendor'}</strong>,</p>
            <p>Unfortunately, your withdrawal request for <strong>$${(withdrawal.amount || 0).toFixed(2)}</strong> has been rejected.</p>
            
            <div class="reason-box">
              <p><strong>Reason:</strong></p>
              <p>${withdrawal.rejectionReason || 'No reason provided. Please contact support for more information.'}</p>
            </div>
            
            <div class="refund-notice">
              <p>✅ <strong>Good news:</strong> The amount has been automatically refunded to your available balance.</p>
              <p>Your current available balance: <strong>$${(vendor.availableBalance || 0).toFixed(2)}</strong></p>
            </div>
            
            <p>If you believe this was an error or have questions, please contact our support team.</p>
            
            <p>Best regards,<br>The Zuba House Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailFun({
      sendTo: vendor.email,
      subject: 'Withdrawal Request Update - Zuba House',
      html
    });

    console.log('✅ Vendor withdrawal rejected email sent to:', vendor.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send withdrawal rejected email:', error);
    return false;
  }
};

/**
 * Send vendor withdrawal paid notification
 */
export const sendVendorWithdrawalPaid = async (vendor, withdrawal) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .amount { font-size: 32px; font-weight: bold; color: #27ae60; text-align: center; margin: 20px 0; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .success-icon { font-size: 48px; text-align: center; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Payment Sent!</h1>
          </div>
          <div class="content">
            <div class="success-icon">🎉</div>
            <p>Hi <strong>${vendor.storeName || 'Vendor'}</strong>,</p>
            <p>Your withdrawal has been <strong style="color: #27ae60;">processed and sent</strong>!</p>
            
            <div class="amount">$${(withdrawal.amount || 0).toFixed(2)}</div>
            
            <div class="info-box">
              <p><strong>Payment Method:</strong> ${withdrawal.paymentMethodSnapshot?.payoutMethod || 'N/A'}</p>
              <p><strong>Transaction Reference:</strong> ${withdrawal.transactionRef || 'N/A'}</p>
              <p><strong>Paid On:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>The funds should arrive in your account within 1-3 business days depending on your bank.</p>
            
            <p>Thank you for being a valued vendor on Zuba House! 🙏</p>
            
            <p>Best regards,<br>The Zuba House Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailFun({
      sendTo: vendor.email,
      subject: '💰 Payment Sent - Zuba House',
      html
    });

    console.log('✅ Vendor withdrawal paid email sent to:', vendor.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send withdrawal paid email:', error);
    return false;
  }
};

/**
 * Send vendor product approved notification
 */
export const sendVendorProductApproved = async (vendor, product) => {
  try {
    const clientUrl = getClientUrl();
    const vendorUrl = getVendorUrl();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .product-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; display: flex; align-items: center; }
          .product-image { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
          .button { display: inline-block; background: #0b2735; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 5px; }
          .button-secondary { background: #27ae60; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Product Approved!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${vendor.storeName || 'Vendor'}</strong>,</p>
            <p>Your product has been approved and is now <strong>live on the marketplace</strong>!</p>
            
            <div class="product-box">
              ${product.images?.[0] ? `<img src="${product.images[0]}" alt="${product.name}" class="product-image">` : ''}
              <div>
                <h3 style="margin: 0;">${product.name || 'Product'}</h3>
                <p style="margin: 5px 0; color: #666;">SKU: ${product.sku || 'N/A'}</p>
                <p style="margin: 5px 0; font-weight: bold; color: #27ae60;">$${(product.pricing?.price || product.price || 0).toFixed(2)}</p>
              </div>
            </div>
            
            <center>
              <a href="${clientUrl}/product/${product._id}" class="button button-secondary">View on Store</a>
              <a href="${vendorUrl}/products/${product._id}" class="button">Manage Product</a>
            </center>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailFun({
      sendTo: vendor.email,
      subject: `✅ Product Approved: ${product.name || 'Your Product'} - Zuba House`,
      html
    });

    console.log('✅ Vendor product approved email sent to:', vendor.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send product approved email:', error);
    return false;
  }
};

/**
 * Send vendor product rejected notification
 */
export const sendVendorProductRejected = async (vendor, product, reason) => {
  try {
    const vendorUrl = getVendorUrl();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #0b2735; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Product Review Update</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${vendor.storeName || 'Vendor'}</strong>,</p>
            <p>Your product <strong>"${product.name || 'Product'}"</strong> was not approved.</p>
            
            <div class="reason-box">
              <p><strong>Reason:</strong></p>
              <p>${reason || 'Please review our product guidelines and update your listing.'}</p>
            </div>
            
            <p>You can edit and resubmit your product for review.</p>
            
            <center>
              <a href="${vendorUrl}/products/${product._id}/edit" class="button">Edit Product</a>
            </center>
            
            <p style="margin-top: 20px;">If you have questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailFun({
      sendTo: vendor.email,
      subject: `Product Update: ${product.name || 'Your Product'} - Zuba House`,
      html
    });

    console.log('✅ Vendor product rejected email sent to:', vendor.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send product rejected email:', error);
    return false;
  }
};

/**
 * Send vendor status change notification
 */
export const sendVendorStatusChange = async (vendor, newStatus, reason = '') => {
  try {
    let subject, headerBg, headerText, bodyText;

    switch (newStatus) {
      case 'APPROVED':
        // Use dedicated welcome email instead
        return sendVendorWelcome(vendor);
      
      case 'SUSPENDED':
        subject = '⚠️ Vendor Account Suspended - Zuba House';
        headerBg = '#e74c3c';
        headerText = 'Account Suspended';
        bodyText = `Your vendor account has been suspended. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`;
        break;
      
      case 'REJECTED':
        subject = 'Vendor Application Update - Zuba House';
        headerBg = '#95a5a6';
        headerText = 'Application Not Approved';
        bodyText = `Unfortunately, your vendor application was not approved at this time. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`;
        break;
      
      default:
        return false;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${headerBg}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${headerText}</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${vendor.storeName || 'Vendor'}</strong>,</p>
            <p>${bodyText}</p>
            <p>If you have any questions or believe this is an error, please contact our support team.</p>
            <p>Best regards,<br>The Zuba House Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailFun({
      sendTo: vendor.email,
      subject,
      html
    });

    console.log(`✅ Vendor status change email sent to:`, vendor.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send vendor status change email:', error);
    return false;
  }
};

/**
 * Send admin notification when vendor submits a product
 */
export const sendAdminProductSubmission = async (vendor, product) => {
  try {
    const adminUrl = process.env.ADMIN_URL || 'https://zuba-admin.vercel.app';
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'support@zubahouse.com';
    
    const productImage = product.images?.[0]?.url || product.images?.[0] || product.featuredImage || '';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0b2735; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .product-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee; }
          .product-image { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; }
          .vendor-badge { background: #efb291; color: #0b2735; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .button { display: inline-block; background: #27ae60; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .stats { display: flex; gap: 20px; margin: 15px 0; }
          .stat { text-align: center; }
          .stat-value { font-size: 18px; font-weight: bold; color: #0b2735; }
          .stat-label { font-size: 12px; color: #666; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 New Product Submission</h1>
            <p style="margin: 5px 0; opacity: 0.9;">Requires your review</p>
          </div>
          <div class="content">
            <div class="urgent">
              <strong>⏰ Action Required:</strong> A vendor has submitted a new product for approval.
            </div>
            
            <div class="product-card">
              <table width="100%">
                <tr>
                  <td width="120" valign="top">
                    ${productImage ? `<img src="${productImage}" alt="${product.name}" class="product-image">` : '<div style="width:100px;height:100px;background:#eee;border-radius:8px;display:flex;align-items:center;justify-content:center;">No Image</div>'}
                  </td>
                  <td valign="top" style="padding-left: 15px;">
                    <h2 style="margin: 0 0 10px 0;">${product.name || 'Untitled Product'}</h2>
                    <p style="margin: 5px 0;"><span class="vendor-badge">🏪 ${vendor.storeName || 'Unknown Vendor'}</span></p>
                    <p style="margin: 5px 0; color: #666;">SKU: ${product.sku || 'N/A'}</p>
                  </td>
                </tr>
              </table>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-value">$${(product.pricing?.price || product.price || 0).toFixed(2)}</div>
                  <div class="stat-label">Price</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${product.inventory?.stock || product.countInStock || 0}</div>
                  <div class="stat-label">Stock</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${product.category?.name || 'N/A'}</div>
                  <div class="stat-label">Category</div>
                </div>
              </div>
            </div>
            
            <center>
              <a href="${adminUrl}/vendor-products" class="button">Review Products</a>
            </center>
            
            <p style="margin-top: 25px; color: #666; font-size: 13px;">
              <strong>Vendor Contact:</strong> ${vendor.email || 'N/A'}<br>
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zuba House Admin. This is an automated notification.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailFun({
      sendTo: adminEmail,
      subject: `📦 New Product Pending Review: ${product.name || 'Product'} from ${vendor.storeName || 'Vendor'}`,
      html
    });

    console.log('✅ Admin product submission notification sent to:', adminEmail);
    return true;
  } catch (error) {
    console.error('❌ Failed to send admin product submission email:', error);
    return false;
  }
};

/**
 * Send vendor notification that product is under review
 */
export const sendVendorProductSubmitted = async (vendor, product) => {
  try {
    const vendorUrl = getVendorUrl();
    
    const productImage = product.images?.[0]?.url || product.images?.[0] || product.featuredImage || '';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3498db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .product-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee; }
          .product-image { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
          .status-badge { background: #fff3cd; color: #856404; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; display: inline-block; }
          .timeline { margin: 20px 0; padding-left: 20px; border-left: 3px solid #3498db; }
          .timeline-item { margin: 15px 0; }
          .timeline-done { color: #27ae60; }
          .timeline-current { color: #3498db; font-weight: bold; }
          .timeline-pending { color: #999; }
          .button { display: inline-block; background: #0b2735; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📤 Product Submitted!</h1>
            <p style="margin: 5px 0; opacity: 0.9;">Under Review</p>
          </div>
          <div class="content">
            <p>Hi <strong>${vendor.storeName || 'Vendor'}</strong>,</p>
            <p>Your product has been submitted and is now <span class="status-badge">⏳ Pending Review</span></p>
            
            <div class="product-card">
              <table width="100%">
                <tr>
                  <td width="90" valign="top">
                    ${productImage ? `<img src="${productImage}" alt="${product.name}" class="product-image">` : ''}
                  </td>
                  <td valign="top" style="padding-left: 15px;">
                    <h3 style="margin: 0;">${product.name || 'Your Product'}</h3>
                    <p style="margin: 5px 0; color: #666;">SKU: ${product.sku || 'N/A'}</p>
                    <p style="margin: 5px 0; font-weight: bold; color: #27ae60;">$${(product.pricing?.price || product.price || 0).toFixed(2)}</p>
                  </td>
                </tr>
              </table>
            </div>
            
            <h4>What happens next?</h4>
            <div class="timeline">
              <div class="timeline-item timeline-done">✅ Product submitted</div>
              <div class="timeline-item timeline-current">⏳ Admin review (usually within 24-48 hours)</div>
              <div class="timeline-item timeline-pending">📧 You'll receive an email notification</div>
              <div class="timeline-item timeline-pending">🎉 Product goes live on the marketplace</div>
            </div>
            
            <center>
              <a href="${vendorUrl}/products" class="button">View My Products</a>
            </center>
            
            <p style="margin-top: 20px; color: #666; font-size: 13px;">
              If you need to make changes, you can edit your product from your dashboard.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailFun({
      sendTo: vendor.email,
      subject: `📤 Product Submitted for Review: ${product.name || 'Your Product'}`,
      html
    });

    console.log('✅ Vendor product submitted email sent to:', vendor.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send vendor product submitted email:', error);
    return false;
  }
};

export default {
  sendVendorWelcome,
  sendVendorNewOrder,
  sendVendorWithdrawalApproved,
  sendVendorWithdrawalRejected,
  sendVendorWithdrawalPaid,
  sendVendorProductApproved,
  sendVendorProductRejected,
  sendVendorStatusChange,
  sendAdminProductSubmission,
  sendVendorProductSubmitted
};

