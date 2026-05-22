import VendorModel from '../models/vendor.model.js';
import UserModel from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import sendEmailFun from '../config/sendEmail.js';
import VerificationEmail from '../utils/verifyEmailTemplate.js';

// In-memory OTP storage for unregistered users
// Key: email, Value: { otp, expires, verified }
const pendingOTPStore = new Map();

// Cleanup expired OTPs every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of pendingOTPStore.entries()) {
    if (now > data.expires) {
      pendingOTPStore.delete(email);
    }
  }
}, 15 * 60 * 1000);

/**
 * POST /api/vendor/send-otp
 * Public endpoint - Send OTP for vendor registration
 * Works for both new users AND existing users who need to verify
 */
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid email format'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      // Check if already has an active vendor account - check BOTH user references AND vendor collection
      let existingVendor = null;
      
      // Method 1: Check via user's vendor/vendorId field
      if (existingUser.vendor || existingUser.vendorId) {
        existingVendor = await VendorModel.findById(existingUser.vendor || existingUser.vendorId);
        if (!existingVendor) {
          // Orphan reference - clear it
          console.log('🧹 Clearing orphan vendor reference for:', normalizedEmail);
          existingUser.vendor = null;
          existingUser.vendorId = null;
          await existingUser.save();
        }
      }
      
      // Method 2: Check vendor collection directly by ownerUser
      if (!existingVendor) {
        existingVendor = await VendorModel.findOne({ ownerUser: existingUser._id });
        if (existingVendor) {
          // Link vendor to user if not linked
          console.log('🔗 Linking found vendor to user:', normalizedEmail);
          existingUser.vendor = existingVendor._id;
          existingUser.vendorId = existingVendor._id;
          await existingUser.save();
        }
      }
      
      // If vendor exists, tell them to login
      if (existingVendor) {
        return res.status(400).json({
          error: true,
          success: false,
          message: `You already have a vendor account "${existingVendor.storeName}". Please login instead.`,
          data: { 
            hasVendorAccount: true,
            vendorStatus: existingVendor.status,
            storeName: existingVendor.storeName
          }
        });
      }
      
      // User exists but NO vendor account - check if email is verified
      if (existingUser.verify_email) {
        // Email already verified, they can proceed to registration
        return res.status(200).json({
          error: false,
          success: true,
          message: 'Email already verified. You can proceed with registration.',
          data: { emailVerified: true }
        });
      }
      
      // Send OTP to existing unverified user
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      existingUser.otp = verifyCode;
      existingUser.otpExpires = Date.now() + 600000; // 10 minutes
      await existingUser.save();
      
      console.log(`\n🔐 ====== OTP GENERATED FOR EXISTING USER ======`);
      console.log(`📧 Email: ${normalizedEmail}`);
      console.log(`👤 Name: ${existingUser.name || 'Vendor'}`);
      console.log(`🔑 OTP Code: ${verifyCode}`);
      console.log(`⏰ Expires in: 10 minutes`);
      console.log(`================================================\n`);

      // Check SendGrid configuration before attempting to send
      const hasSendGridKey = !!process.env.SENDGRID_API_KEY;
      const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.EMAIL;
      
      console.log(`📧 SendGrid Config: API_KEY=${hasSendGridKey ? 'SET' : 'NOT SET'}, FROM=${senderEmail || 'NOT SET'}`);

      // Try to send email
      let emailSent = false;
      let emailError = null;
      
      if (!hasSendGridKey) {
        console.error('❌ SENDGRID_API_KEY not configured - cannot send email');
        emailError = 'Email service not configured';
      } else {
        try {
          emailSent = await sendOTPEmail(normalizedEmail, existingUser.name || 'Vendor', verifyCode);
        } catch (err) {
          console.error('❌ Email sending failed:', err.message);
          emailError = err.message;
        }
      }
      
    // Return response - include OTP when email fails for local testing
    const isLocal = !process.env.RENDER && !process.env.VERCEL;
    
    return res.status(200).json({
      error: false,
      success: true,
      message: emailSent 
        ? 'Verification code sent to your email. Please check your inbox (and spam folder).'
        : `Verification code generated.${isLocal ? ' Check your server console for the OTP code.' : ' Email delivery issue - please contact support.'}`,
      data: { 
        email: normalizedEmail,
        emailSent: emailSent,
        // Include OTP in response when email fails (for local testing)
        ...(!emailSent ? { otp: verifyCode } : {}),
        ...(emailError ? { emailError: emailError } : {})
      }
    });
  }

  // New user - store OTP in memory
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    pendingOTPStore.set(normalizedEmail, {
      otp: verifyCode,
      expires: Date.now() + 600000, // 10 minutes
      verified: false
    });

    console.log(`\n🔐 ====== OTP GENERATED FOR NEW USER ======`);
    console.log(`📧 Email: ${normalizedEmail}`);
    console.log(`🔑 OTP Code: ${verifyCode}`);
    console.log(`⏰ Expires in: 10 minutes`);
    console.log(`==========================================\n`);

    // Check SendGrid configuration before attempting to send
    const hasSendGridKey = !!process.env.SENDGRID_API_KEY;
    const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.EMAIL;
    
    console.log(`📧 SendGrid Config: API_KEY=${hasSendGridKey ? 'SET' : 'NOT SET'}, FROM=${senderEmail || 'NOT SET'}`);

    // Try to send email
    let emailSent = false;
    let emailError = null;
    
    if (!hasSendGridKey) {
      console.error('❌ SENDGRID_API_KEY not configured - cannot send email');
      emailError = 'Email service not configured';
    } else {
      try {
        emailSent = await sendOTPEmail(normalizedEmail, 'Vendor', verifyCode);
      } catch (err) {
        console.error('❌ Email sending failed:', err.message);
        emailError = err.message;
      }
    }

    // Return response - include OTP when email fails for local testing
    const isLocal = !process.env.RENDER && !process.env.VERCEL;
    
    return res.status(200).json({
      error: false,
      success: true,
      message: emailSent 
        ? 'Verification code sent to your email. Please check your inbox (and spam folder).'
        : `Verification code generated.${isLocal ? ' Check your server console for the OTP code.' : ' Email delivery issue - please contact support.'}`,
      data: { 
        email: normalizedEmail,
        emailSent: emailSent,
        // Include OTP in response when email fails (for local testing)
        ...(!emailSent ? { otp: verifyCode } : {}),
        ...(emailError ? { emailError: emailError } : {})
      }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
};

/**
 * POST /api/vendor/verify-otp
 * Public endpoint - Verify OTP before registration
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedOTP = otp.trim();

    // Check if existing user
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      // Verify OTP for existing user
      const isCodeValid = existingUser.otp === trimmedOTP;
      const isNotExpired = existingUser.otpExpires && existingUser.otpExpires > Date.now();

      if (!isCodeValid) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'Invalid OTP code'
        });
      }

      if (!isNotExpired) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'OTP expired. Please request a new one.'
        });
      }

      // Mark as verified
      existingUser.verify_email = true;
      existingUser.otp = null;
      existingUser.otpExpires = null;
      await existingUser.save();

      return res.status(200).json({
        error: false,
        success: true,
        message: 'Email verified successfully! You can proceed with registration.',
        data: { email: normalizedEmail, verified: true }
      });
    }

    // Check pending OTP store for new users
    const pendingData = pendingOTPStore.get(normalizedEmail);
    
    if (!pendingData) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'No OTP found for this email. Please request a new one.'
      });
    }

    if (Date.now() > pendingData.expires) {
      pendingOTPStore.delete(normalizedEmail);
      return res.status(400).json({
        error: true,
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
    }

    if (pendingData.otp !== trimmedOTP) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid OTP code'
      });
    }

    // Mark as verified in pending store
    pendingOTPStore.set(normalizedEmail, {
      ...pendingData,
      verified: true,
      verifiedAt: Date.now()
    });

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Email verified successfully! You can proceed with registration.',
      data: { email: normalizedEmail, verified: true }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Failed to verify OTP'
    });
  }
};

/**
 * POST /api/vendor/apply
 * Public endpoint - Apply to become a vendor
 * Requires email to be verified first
 */
export const applyToBecomeVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      storeName,
      storeSlug,
      description,
      phone,
      whatsapp,
      country,
      city,
      addressLine1,
      addressLine2,
      postalCode,
      categories
    } = req.body;

    // Validate required fields
    if (!storeName || !storeSlug || !email) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Store name, store URL slug, and email are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // CHECK IF EMAIL IS VERIFIED
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    const pendingData = pendingOTPStore.get(normalizedEmail);

    let isEmailVerified = false;
    
    if (existingUser) {
      isEmailVerified = existingUser.verify_email === true;
    } else if (pendingData) {
      isEmailVerified = pendingData.verified === true;
    }

    if (!isEmailVerified) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Please verify your email first. Click "Send OTP" and enter the code sent to your email.',
        data: { requiresEmailVerification: true }
      });
    }

    // Validate store slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(storeSlug.toLowerCase())) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Store URL slug can only contain lowercase letters, numbers, and hyphens'
      });
    }

    // Check if slug is already taken
    const existingVendor = await VendorModel.findOne({ 
      storeSlug: storeSlug.toLowerCase().trim() 
    });
    if (existingVendor) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Store URL slug already taken. Please choose another.'
      });
    }

    // Get or create user account
    let user = existingUser;
    
    if (user) {
      console.log('📝 Processing existing user for vendor application:', normalizedEmail);
      
      // Check if already has an ACTIVE vendor account - check BOTH methods
      let existingVendorAccount = null;
      
      // Method 1: Check via user's vendor/vendorId field
      if (user.vendor || user.vendorId) {
        existingVendorAccount = await VendorModel.findById(user.vendor || user.vendorId);
        if (!existingVendorAccount) {
          // Orphan reference - clear it
          console.log('🧹 Clearing orphan vendor reference for:', normalizedEmail);
          user.vendor = null;
          user.vendorId = null;
        }
      }
      
      // Method 2: Check vendor collection directly by ownerUser
      if (!existingVendorAccount) {
        existingVendorAccount = await VendorModel.findOne({ ownerUser: user._id });
        if (existingVendorAccount) {
          // Link to user
          console.log('🔗 Found unlinked vendor for user:', normalizedEmail);
          user.vendor = existingVendorAccount._id;
          user.vendorId = existingVendorAccount._id;
          await user.save();
        }
      }
      
      // Method 3: Check by email in vendor collection
      if (!existingVendorAccount) {
        existingVendorAccount = await VendorModel.findOne({ email: normalizedEmail });
        if (existingVendorAccount) {
          console.log('🔗 Found vendor by email for user:', normalizedEmail);
          user.vendor = existingVendorAccount._id;
          user.vendorId = existingVendorAccount._id;
          existingVendorAccount.ownerUser = user._id;
          await Promise.all([user.save(), existingVendorAccount.save()]);
        }
      }
      
      // If vendor exists, tell them to login
      if (existingVendorAccount) {
        return res.status(400).json({
          error: true,
          success: false,
          message: `You already have a vendor account "${existingVendorAccount.storeName}". Please login to access your dashboard.`,
          data: { 
            hasVendorAccount: true,
            vendorStatus: existingVendorAccount.status,
            storeName: existingVendorAccount.storeName
          }
        });
      }
      
      console.log('✅ No existing vendor found - proceeding with application');
      
      // Update existing user to become vendor
      user.role = 'VENDOR';
      user.verify_email = true; // Ensure email is marked as verified
      user.status = 'Active'; // Ensure account is active
      
      // Update name if provided
      if (name) {
        user.name = name;
      }
      
      // Update password if provided (for existing users who want to set/change password)
      if (password && password.length >= 6) {
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(password, salt);
        console.log('✅ Password updated for existing user:', normalizedEmail);
      }
      
      await user.save();
      console.log('✅ Existing user updated to VENDOR:', normalizedEmail);
    } else {
      // Create new user account
      if (!password || password.length < 6) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'Password is required and must be at least 6 characters'
        });
      }

      if (!name) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'Full name is required'
        });
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      user = await UserModel.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'VENDOR',
        status: 'Active',
        verify_email: true // Already verified via OTP
      });
    }

    // Validate user._id exists before creating vendor
    if (!user || !user._id) {
      return res.status(500).json({
        error: true,
        success: false,
        message: 'User account error. Please try again.'
      });
    }

    // Double-check no vendor exists (safety check - should be caught earlier)
    const existingVendorByEmail = await VendorModel.findOne({ email: normalizedEmail });
    if (existingVendorByEmail) {
      // Vendor exists with this email but different owner - update the owner
      console.log('🔧 Found vendor by email, updating owner reference');
      existingVendorByEmail.ownerUser = user._id;
      await existingVendorByEmail.save();
      
      user.vendor = existingVendorByEmail._id;
      user.vendorId = existingVendorByEmail._id;
      await user.save();
      
      return res.status(400).json({
        error: true,
        success: false,
        message: 'You already have a vendor account. Please login to access your vendor dashboard.',
        data: { 
          hasVendorAccount: true,
          vendorStatus: existingVendorByEmail.status,
          storeName: existingVendorByEmail.storeName
        }
      });
    }

    // Create vendor profile
    let vendor;
    try {
      vendor = await VendorModel.create({
        ownerUser: user._id,
        storeName: storeName.trim(),
        storeSlug: storeSlug.toLowerCase().trim(),
        description: description || '',
        email: normalizedEmail,
        phone: phone || '',
        whatsapp: whatsapp || '',
        country: country || '',
        city: city || '',
        addressLine1: addressLine1 || '',
        addressLine2: addressLine2 || '',
        postalCode: postalCode || '',
        categories: categories || [],
        status: 'PENDING' // Requires admin approval
      });
    } catch (createError) {
      // Handle duplicate key error
      if (createError.code === 11000) {
        if (createError.keyPattern?.ownerUser) {
          return res.status(400).json({
            error: true,
            success: false,
            message: 'You already have a vendor account'
          });
        }
        if (createError.keyPattern?.storeSlug) {
          return res.status(400).json({
            error: true,
            success: false,
            message: 'Store URL slug already taken. Please choose another.'
          });
        }
        return res.status(400).json({
          error: true,
          success: false,
          message: 'A vendor account with these details already exists'
        });
      }
      throw createError;
    }

    // Link vendor to user
    user.vendor = vendor._id;
    user.vendorId = vendor._id;
    await user.save();

    // Clear pending OTP data
    pendingOTPStore.delete(normalizedEmail);

    return res.status(201).json({
      error: false,
      success: true,
      message: 'Vendor application submitted successfully! Your application is under review. You will be notified once approved.',
      data: {
        vendorId: vendor._id,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        status: vendor.status,
        emailVerified: true
      }
    });
  } catch (error) {
    console.error('Apply to become vendor error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Failed to submit vendor application'
    });
  }
};

/**
 * POST /api/vendor/verify-email
 * Public endpoint - Verify vendor email with OTP (alias for verifyOTP for backward compatibility)
 */
export const verifyVendorEmail = verifyOTP;

/**
 * POST /api/vendor/resend-otp
 * Public endpoint - Resend OTP for vendor email verification (alias for sendOTP)
 */
export const resendVendorOTP = sendOTP;

/**
 * GET /api/vendor/application-status/:email
 * Public endpoint - Check vendor application status
 */
export const getApplicationStatus = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check pending OTP verification
    const pendingData = pendingOTPStore.get(normalizedEmail);
    
    const user = await UserModel.findOne({ 
      email: normalizedEmail 
    }).populate('vendor');

    if (!user || !user.vendor) {
      return res.status(200).json({
        error: false,
        success: true,
        message: 'No vendor application found for this email',
        data: {
          hasApplication: false,
          emailVerified: pendingData?.verified || false
        }
      });
    }

    const vendor = await VendorModel.findById(user.vendor);

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        hasApplication: true,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        status: vendor.status,
        emailVerified: user.verify_email,
        createdAt: vendor.createdAt
      }
    });
  } catch (error) {
    console.error('Get application status error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Failed to check application status'
    });
  }
};

/**
 * POST /api/vendor/login
 * Public endpoint - Vendor login
 */
export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔐 Vendor login attempt:', normalizedEmail);

    // Find user with vendor role
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is a vendor
    if (user.role !== 'VENDOR') {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'No vendor account found for this email. Please register as a vendor first.'
      });
    }

    // Check account status
    if (user.status !== 'Active') {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Your account is inactive. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get vendor profile
    const vendor = await VendorModel.findOne({ ownerUser: user._id });
    if (!vendor) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Vendor profile not found. Please contact support.'
      });
    }

    // Check vendor status
    if (vendor.status === 'SUSPENDED') {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Your vendor account has been suspended. Please contact support.',
        vendorStatus: 'SUSPENDED'
      });
    }

    // Import token generator
    const generatedAccessToken = (await import('../utils/generatedAccessToken.js')).default;
    const genertedRefreshToken = (await import('../utils/generatedRefreshToken.js')).default;

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await genertedRefreshToken(user._id);

    // Update last login
    user.last_login_date = new Date();
    await user.save();

    console.log('✅ Vendor login successful:', normalizedEmail);

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Login successful',
      data: {
        accesstoken: accessToken,
        refreshToken: refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        vendor: {
          id: vendor._id,
          storeName: vendor.storeName,
          storeSlug: vendor.storeSlug,
          status: vendor.status
        }
      }
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

/**
 * POST /api/vendor/forgot-password
 * Public endpoint - Send password reset OTP
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔐 Forgot password request for:', normalizedEmail);

    // Find user
    const user = await UserModel.findOne({ email: normalizedEmail, role: 'VENDOR' });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        error: false,
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.'
      });
    }

    // Generate OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in user document
    user.otp = resetOTP;
    user.otpExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    console.log(`🔐 Password reset OTP for ${normalizedEmail}: ${resetOTP}`);

    // Send email
    try {
      await sendEmailFun({
        sendTo: normalizedEmail,
        subject: "🔐 Reset Your Password - Zuba House Vendor",
        text: `Your password reset code is: ${resetOTP}. This code expires in 10 minutes.`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 20px; }
              .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #0b2735, #1a3d52); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; color: #efb291; }
              .content { padding: 30px; text-align: center; }
              .otp-box { background: linear-gradient(135deg, #efb291, #eeb190); border-radius: 10px; padding: 25px; margin: 20px 0; }
              .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0b2735; font-family: monospace; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; text-align: left; font-size: 14px; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Zuba House Vendor Portal</p>
              </div>
              <div class="content">
                <p>Hello ${user.name || 'Vendor'},</p>
                <p>You requested to reset your password. Use the code below:</p>
                <div class="otp-box">
                  <div class="otp-code">${resetOTP}</div>
                </div>
                <div class="warning">
                  <strong>⏰ This code expires in 10 minutes.</strong><br>
                  If you didn't request this, please ignore this email.
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Zuba House. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
      console.log('✅ Password reset email sent to:', normalizedEmail);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'If an account exists with this email, you will receive a password reset code.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Failed to process request'
    });
  }
};

/**
 * POST /api/vendor/reset-password
 * Public endpoint - Reset password with OTP
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await UserModel.findOne({ email: normalizedEmail, role: 'VENDOR' });

    if (!user) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid request'
      });
    }

    // Verify OTP
    if (user.otp !== otp.trim()) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid OTP code'
      });
    }

    if (!user.otpExpires || Date.now() > user.otpExpires) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    console.log('✅ Password reset successful for:', normalizedEmail);

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
};

/**
 * GET /api/vendor/me
 * Get vendor profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const vendor = await VendorModel.findById(req.vendorId)
      .populate('ownerUser', 'name email')
      .populate('categories', 'name slug');

    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('getMyProfile error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/vendor/me
 * Update vendor profile
 */
export const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      'storeName',
      'storeSlug',
      'logoUrl',
      'bannerUrl',
      'description',
      'shortDescription',
      'country',
      'city',
      'addressLine1',
      'addressLine2',
      'postalCode',
      'phone',
      'whatsapp',
      'email',
      'shippingPolicy',
      'returnPolicy',
      'handlingTimeDays',
      'seoTitle',
      'seoDescription',
      'seoKeywords',
      'categories',
      'socialLinks'
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    });

    // Validate store slug if provided
    if (updates.storeSlug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(updates.storeSlug.toLowerCase())) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'Store slug can only contain lowercase letters, numbers, and hyphens'
        });
      }

      // Check if slug is already taken by another vendor
      const existingVendor = await VendorModel.findOne({
        storeSlug: updates.storeSlug.toLowerCase().trim(),
        _id: { $ne: req.vendorId }
      });

      if (existingVendor) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'Store slug already taken'
        });
      }

      updates.storeSlug = updates.storeSlug.toLowerCase().trim();
    }

    const vendor = await VendorModel.findOneAndUpdate(
      { _id: req.vendorId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('ownerUser', 'name email');

    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Profile updated successfully',
      data: vendor
    });
  } catch (error) {
    console.error('updateMyProfile error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/vendor/dashboard
 * Get vendor dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const OrderModel = (await import('../models/order.model.js')).default;
    const ProductModel = (await import('../models/product.model.js')).default;

    // Get orders with vendor items (match by either vendor or vendorId)
    const orders = await OrderModel.find({
      $or: [
        { 'products.vendor': vendorId },
        { 'products.vendorId': vendorId }
      ]
    }).select('products createdAt order_status payment_status');

    let totalOrders = 0;
    let totalRevenue = 0;
    let todayOrders = 0;
    let todayRevenue = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orderStatusCounts = {
      RECEIVED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0
    };

    orders.forEach((order) => {
      const isToday = new Date(order.createdAt) >= today;
      
      order.products.forEach((item) => {
        const itemVendorId = item.vendor || item.vendorId;
        if (itemVendorId && itemVendorId.toString() === String(vendorId)) {
          totalOrders += 1;
          const earning = item.vendorEarning || item.subTotal || 0;
          totalRevenue += earning;

          if (isToday) {
            todayOrders += 1;
            todayRevenue += earning;
          }

          // Count by vendor status
          if (item.vendorStatus && orderStatusCounts[item.vendorStatus] !== undefined) {
            orderStatusCounts[item.vendorStatus]++;
          }
        }
      });
    });

    // Get product counts
    const totalProducts = await ProductModel.countDocuments({ vendor: vendorId });
    const publishedProducts = await ProductModel.countDocuments({
      vendor: vendorId,
      status: 'PUBLISHED',
      approvalStatus: 'APPROVED'
    });

    // Get vendor for balance info
    const vendor = await VendorModel.findById(vendorId).select('totalSales totalEarnings availableBalance pendingBalance');

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        stats: {
          totalOrders,
          totalRevenue,
          todayOrders,
          todayRevenue,
          totalProducts,
          publishedProducts,
          orderStatusCounts
        },
        earnings: {
          totalSales: vendor?.totalSales || 0,
          totalEarnings: vendor?.totalEarnings || 0,
          availableBalance: vendor?.availableBalance || 0,
          pendingBalance: vendor?.pendingBalance || 0
        }
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Helper function to send OTP email
async function sendOTPEmail(email, name, otp) {
  console.log('\n📧 ====== SENDING VENDOR OTP EMAIL ======');
  console.log('📧 Recipient:', email);
  console.log('👤 Name:', name);
  console.log('🔐 OTP:', otp);
  
  try {
    const result = await sendEmailFun({
      sendTo: email, // Can be string or array
      subject: "🔐 Verify Your Email - Zuba House Vendor Registration",
      text: `Hi ${name},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nZuba House Team`,
      html: VerificationEmail(name, otp)
    });
    
    if (result) {
      console.log('✅ Vendor OTP email sent successfully to:', email);
      console.log('====================================\n');
      return true;
    } else {
      console.log('⚠️ SendEmailFun returned false for:', email);
      console.log('====================================\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send vendor OTP email:', {
      to: email,
      error: error.message,
      stack: error.stack
    });
    console.log('====================================\n');
    throw error;
  }
}
