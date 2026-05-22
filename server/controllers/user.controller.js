import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import crypto from 'crypto'
import { sendOtpEmail } from '../config/emailService.js';
import { env } from '../config/env.js';
import { sendError, sendSuccess } from '../utils/response.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import genertedRefreshToken from '../utils/generatedRefreshToken.js';
import { checkOtpRateLimit } from '../utils/rateLimitOtp.js';
import CartProductModel from '../models/cartProduct.modal.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ReviewModel from '../models/reviews.model.js';
import {
    buildCountryBreakdown,
    collectUserCountriesFromDb,
} from '../utils/geoBreakdown.js';

cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
});

const OTP_EXPIRY_MINUTES = env.otpExpiryMinutes;
const COOKIE_DOMAIN = env.cookieDomain;

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function generateOtp() {
    return String(crypto.randomInt(100000, 1000000));
}

function getCookieOptions() {
    const isProduction = env.nodeEnv === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        path: '/',
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    };
}

async function issueAuthTokens(response, userId) {
    const accessToken = await generatedAccessToken(userId);
    const refreshToken = await genertedRefreshToken(userId);
    const cookiesOption = getCookieOptions();
    response.cookie('accessToken', accessToken, cookiesOption);
    response.cookie('refreshToken', refreshToken, cookiesOption);
    return { accessToken, refreshToken };
}

function getRefreshTokenFromRequest(request) {
    const cookieToken = request.cookies?.refreshToken;
    const authHeader = request?.headers?.authorization;
    if (cookieToken) return cookieToken;
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) return authHeader.substring(7).trim();
    const parts = authHeader.split(' ');
    return parts.length > 1 ? parts[1].trim() : authHeader.trim();
}

async function sendOtpEmailOrThrow({ email, name, otp, purpose }) {
    const result = await sendOtpEmail({
        to: email,
        customerName: name,
        otp,
        purpose,
        expiryMinutes: OTP_EXPIRY_MINUTES,
    });
    if (!result?.success) {
        throw new Error(result?.error || 'Failed to deliver OTP email. Please try again.');
    }
}

const buildTokenData = (accessToken, refreshToken, user = null) => {
    const data = { accessToken, refreshToken };
    if (user) data.user = user;
    return data;
};

async function mergeGuestCartForUser(userId, guestCart = []) {
    if (!Array.isArray(guestCart) || guestCart.length === 0) {
        return;
    }

    for (const item of guestCart) {
        if (!item?.productId) continue;

        const query = {
            userId: String(userId),
            productId: item.productId,
            variationId: item.variationId || null
        };
        const qtyToAdd = Math.max(1, parseInt(item.quantity) || 1);
        const existing = await CartProductModel.findOne(query);

        if (existing) {
            existing.quantity += qtyToAdd;
            existing.subTotal = parseFloat(existing.price) * existing.quantity;
            await existing.save();
            continue;
        }

        const payload = {
            productTitle: item.productTitle || item.product?.name || 'Product',
            image: item.image || item.product?.images?.[0] || '',
            rating: parseFloat(item.rating || 0),
            price: parseFloat(item.price || 0),
            oldPrice: item.oldPrice ? parseFloat(item.oldPrice) : null,
            quantity: qtyToAdd,
            subTotal: parseFloat(item.price || 0) * qtyToAdd,
            productId: item.productId,
            countInStock: parseInt(item.countInStock) || 0,
            userId: String(userId),
            discount: parseFloat(item.discount || 0),
            brand: item.brand || '',
            productType: item.productType || 'simple',
            variationId: item.variationId || null,
            variation: item.variation || null,
            size: item.size || null,
            weight: item.weight || null,
            ram: item.ram || null
        };

        try {
            await CartProductModel.create(payload);
        } catch (error) {
            if (error?.code === 11000) {
                const racedItem = await CartProductModel.findOne(query);
                if (racedItem) {
                    racedItem.quantity += qtyToAdd;
                    racedItem.subTotal = parseFloat(racedItem.price) * racedItem.quantity;
                    await racedItem.save();
                }
            } else {
                throw error;
            }
        }
    }
}


export async function registerUserController(request, response) {
    try {
        const { name, email, password } = request.body;
        const normalizedEmail = normalizeEmail(email);

        if (!name || !normalizedEmail || !password) {
            return sendError(response, 400, "provide email, name, password");
        }

        if (password.length < 6) {
            return sendError(response, 400, "Password must be at least 6 characters");
        }

        const rateLimit = checkOtpRateLimit(normalizedEmail);
        if (!rateLimit.allowed) {
            return sendError(response, 429, `Too many OTP requests. Try again in ${rateLimit.retryAfter} seconds.`);
        }

        let user = await UserModel.findOne({ email: normalizedEmail });

        if (user) {
            return sendError(response, 409, "Account already exists");
        }

        const verifyCode = generateOtp();


        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new UserModel({
            email: normalizedEmail,
            password: hashPassword,
            name: name,
            otp: verifyCode,
            otpExpires: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,

        });

        await user.save();

        try {
            await sendOtpEmailOrThrow({
                email: normalizedEmail,
                name,
                otp: verifyCode,
                purpose: 'verification'
            });
        } catch (emailError) {
            await UserModel.findByIdAndDelete(user._id);
            return sendError(response, 502, emailError.message || 'Could not send verification email');
        }

        // Create a JWT token for verification purposes
        const token = jwt.sign(
            { email: user.email, id: user._id },
            env.jwtLegacySecret
        );


        return sendSuccess(response, 200, "User registered successfully!", { verificationToken: token });



    } catch (error) {
        return sendError(response, 500, error.message || "Failed to register user");
    }
}

export async function verifyEmailController(request, response) {
    try {
        const { email, otp } = request.body;
        const normalizedEmail = normalizeEmail(email);
        const normalizedOtp = String(otp || '').trim();

        if (!normalizedEmail || normalizedOtp.length !== 6) {
            return sendError(response, 400, "Provide valid email and 6-digit OTP");
        }

        const user = await UserModel.findOne({ email: normalizedEmail });
        if (!user) {
            return sendError(response, 404, "User not found");
        }

        if (!user.otp || String(user.otp) !== normalizedOtp) {
            return sendError(response, 400, "Invalid OTP");
        }
        const expiresAt = user.otpExpires ? new Date(user.otpExpires).getTime() : 0;
        if (expiresAt < Date.now()) {
            return sendError(response, 400, "OTP expired");
        }
        user.verify_email = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        return sendSuccess(response, 200, "Email verified successfully");

    } catch (error) {
        return sendError(response, 500, error.message || "Failed to verify email");
    }
}


export async function authWithGoogle(request, response) {
    try {
        const { name, email, avatar, mobile, role } = request.body;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return sendError(response, 400, 'Email is required for Google sign-in');
        }

        let user = await UserModel.findOne({ email: normalizedEmail });

        if (!user) {
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(crypto.randomBytes(32).toString('hex'), salt);
            user = await UserModel.create({
                name: name || normalizedEmail.split('@')[0] || 'User',
                mobile: mobile || null,
                email: normalizedEmail,
                password: hashPassword,
                avatar: avatar || '',
                role: role || 'USER',
                verify_email: true,
                signUpWithGoogle: true,
                status: 'Active',
            });
        } else {
            const status = String(user.status || 'Active').trim().toLowerCase();
            if (status !== 'active') {
                return sendError(response, 403, 'Contact to admin');
            }
            user.verify_email = true;
            user.signUpWithGoogle = true;
            if (avatar && !user.avatar) user.avatar = avatar;
            await user.save();
        }

        const { accessToken, refreshToken } = await issueAuthTokens(response, user._id);
        await UserModel.findByIdAndUpdate(user._id, { last_login_date: new Date() });

        const tokenData = buildTokenData(accessToken, refreshToken);
        tokenData.accesstoken = accessToken;
        return sendSuccess(response, 200, 'Login successfully', tokenData);
    } catch (error) {
        return sendError(response, 500, error.message || 'Google sign-in failed');
    }
}

export async function loginUserController(request, response) {
    try {
        const { email, password, guestCart } = request.body;
        const normalizedEmail = normalizeEmail(email);

        const user = await UserModel.findOne({ email: normalizedEmail });

        if (!user) {
            return sendError(response, 401, "Invalid email or password");
        }

        const status = String(user.status || 'Active').trim().toLowerCase();
        if (status !== 'active') {
            return sendError(response, 403, "Contact to admin");
        }

        if (user.verify_email !== true) {
            return sendError(response, 403, "Your Email is not verify yet please verify your email first");
        }

        if (user.signUpWithGoogle) {
            return sendError(response, 400, "This account uses Google sign-in. Please continue with Google.");
        }

        const checkPassword = await bcryptjs.compare(password, user.password);

        if (!checkPassword) {
            return sendError(response, 401, "Invalid email or password");
        }


        const { accessToken, refreshToken } = await issueAuthTokens(response, user._id);

        await UserModel.findByIdAndUpdate(user?._id, {
            last_login_date: new Date()
        })


        await mergeGuestCartForUser(user._id, guestCart);

        return sendSuccess(response, 200, "Login successfully", buildTokenData(accessToken, refreshToken))
    } catch (error) {
        return sendError(response, 500, error.message || "Login failed");
    }

}



//logout controller
export async function logoutController(request, response) {
    try {
        const userid = request.userId //middleware

        const cookiesOption = getCookieOptions();

        response.clearCookie("accessToken", cookiesOption)
        response.clearCookie("refreshToken", cookiesOption)

        await UserModel.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        return sendSuccess(response, 200, "Logout successfully")
    } catch (error) {
        return sendError(response, 500, error.message || "Logout failed");
    }
}


//image upload
var imagesArr = [];
export async function userAvatarController(request, response) {
    try {
        imagesArr = [];

        const userId = request.userId;  //auth middleware
        const image = request.files;


        const user = await UserModel.findOne({ _id: userId });

        if (!user) {
            return response.status(500).json({
                message: "User not found",
                error: true,
                success: false
            })
        }




        //first remove image from cloudinary
        const imgUrl = user.avatar;

        const urlArr = imgUrl.split("/");
        const avatar_image = urlArr[urlArr.length - 1];

        const imageName = avatar_image.split(".")[0];

        if (imageName) {
            const res = await cloudinary.uploader.destroy(
                imageName,
                (error, result) => {
                    // console.log(error, res)
                }
            );
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image?.length; i++) {

            const img = await cloudinary.uploader.upload(
                image[i].path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        user.avatar = imagesArr[0];
        await user.save();

        return response.status(200).json({
            _id: userId,
            avtar: imagesArr[0]
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function removeImageFromCloudinary(request, response) {
    const imgUrl = request.query.img;

    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
        const res = await cloudinary.uploader.destroy(
            imageName,
            (error, result) => {
                // console.log(error, res)
            }
        );

        if (res) {
            response.status(200).send(res);
        }
    }

}

//update user details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId //auth middleware
        const { name, email, mobile, password } = request.body;

        const userExist = await UserModel.findById(userId);
        if (!userExist)
            return sendError(response, 400, 'The user cannot be Updated!');


        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                name: name,
                mobile: mobile,
                email: email,
            },
            { new: true }
        )



        return sendSuccess(response, 200, 'User Updated successfully', {
            user: {
                name: updateUser?.name,
                _id: updateUser?._id,
                email: updateUser?.email,
                mobile: updateUser?.mobile,
                avatar: updateUser?.avatar
            }
        })

    } catch (error) {
        return sendError(response, 500, error.message || error)
    }
}

//forgot password
export async function forgotPasswordController(request, response) {
    try {
        const normalizedEmail = normalizeEmail(request.body?.email);
        if (!normalizedEmail) {
            return sendError(response, 400, "Email is required");
        }

        const rateLimit = checkOtpRateLimit(normalizedEmail);
        if (!rateLimit.allowed) {
            return sendError(response, 429, `Too many OTP requests. Try again in ${rateLimit.retryAfter} seconds.`);
        }

        const user = await UserModel.findOne({ email: normalizedEmail })

        if (!user) {
            return sendError(response, 404, "Email not available");
        }

        else {
            const verifyCode = generateOtp();

            user.otp = verifyCode;
            user.otpExpires = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
            user.forgotPasswordVerifiedAt = null;

            await user.save();

            try {
                await sendOtpEmailOrThrow({
                    email: normalizedEmail,
                    name: user.name,
                    otp: verifyCode,
                    purpose: 'reset'
                });
            } catch (emailError) {
                return sendError(response, 502, emailError.message || "Failed to send OTP email");
            }

            return sendSuccess(response, 200, "check your email")

        }



    } catch (error) {
        return sendError(response, 500, error.message || "Forgot password failed");
    }
}


export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body;
        const normalizedEmail = normalizeEmail(email);
        const normalizedOtp = String(otp || '').trim();

        const user = await UserModel.findOne({ email: normalizedEmail })

        if (!user) {
            return sendError(response, 404, "Email not available");
        }

        if (!normalizedEmail || normalizedOtp.length !== 6) {
            return sendError(response, 400, "Provide required field email, otp.");
        }

        if (!user.otp || String(user.otp) !== normalizedOtp) {
            return sendError(response, 400, "Invalid OTP");
        }

        const expiresAt = user.otpExpires ? new Date(user.otpExpires).getTime() : 0;
        if (expiresAt < Date.now()) {
            return sendError(response, 400, "OTP expired");
        }

        user.forgotPasswordVerifiedAt = new Date();
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        return sendSuccess(response, 200, "Verify OTP successfully")
    } catch (error) {
        return sendError(response, 500, error.message || "OTP verification failed");
    }

}


//reset password (forgot-password flow: email + newPassword + confirmPassword; or change-password: + oldPassword)
export async function resetpassword(request, response) {
    try {
        const { email, newPassword, confirmPassword } = request.body;
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !newPassword || !confirmPassword) {
            return sendError(response, 400, "Please provide email and both password fields");
        }

        const user = await UserModel.findOne({ email: normalizedEmail });
        if (!user) {
            return sendError(response, 404, "We could not find an account with this email");
        }

        if (!user.forgotPasswordVerifiedAt) {
            return sendError(response, 400, "Please confirm your reset code first");
        }

        const verifiedAt = new Date(user.forgotPasswordVerifiedAt).getTime();
        const fifteenMin = 15 * 60 * 1000;
        if (Date.now() - verifiedAt > fifteenMin) {
            user.forgotPasswordVerifiedAt = null;
            await user.save();
            return sendError(response, 400, "Your reset code has expired. Please request a new one");
        }

        if (newPassword !== confirmPassword) {
            return sendError(response, 400, "Passwords do not match");
        }

        if (String(newPassword).length < 8) {
            return sendError(response, 400, "Password must be at least 8 characters");
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(confirmPassword, salt);

        user.password = hashPassword;
        user.signUpWithGoogle = false;
        user.forgotPasswordVerifiedAt = null;
        await user.save();

        return sendSuccess(response, 200, "Password updated successfully");


    } catch (error) {
        return sendError(response, 500, "We could not reset your password right now. Please try again.");
    }
}



//change password
export async function changePasswordController(request, response) {
    try {
        const { email, newPassword, confirmPassword } = request.body;
        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "Email is not available",
                error: true,
                success: false
            })
        }


        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same.",
                error: true,
                success: false,
            })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(confirmPassword, salt);

        user.password = hashPassword;
        user.signUpWithGoogle = false;
        await user.save();

        return response.json({
            message: "Password updated successfully.",
            error: false,
            success: true
        })


    } catch (error) {
        return sendError(response, 500, error.message || "Password change failed");
    }
}


//refresh token controller (with rotation: new access + new refresh, old refresh invalidated)
export async function refreshToken(request, response) {
    try {
        const refreshToken = getRefreshTokenFromRequest(request);

        if (!refreshToken) {
            return sendError(response, 401, "Refresh token is required");
        }

        const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
        const userId = decoded?.id || decoded?.userId || decoded?._id;
        if (!userId) {
            return sendError(response, 401, "Invalid token");
        }

        const user = await UserModel.findById(userId).select('refresh_token status');
        if (!user) {
            return sendError(response, 401, "User not found for refresh token");
        }

        if (user.status !== 'Active') {
            return sendError(response, 403, "Account is not active");
        }

        if (!user.refresh_token || user.refresh_token !== refreshToken) {
            return sendError(response, 401, "Refresh token invalidated");
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await issueAuthTokens(response, userId);

        return sendSuccess(response, 200, "Tokens refreshed", buildTokenData(newAccessToken, newRefreshToken))
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return sendError(response, 401, "Token expired or invalid");
        }
        return sendError(response, 500, error.message || "Token refresh failed");
    }
}


//get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.userId

        const user = await UserModel.findById(userId).select('-password -refresh_token').populate('address_details')

        return sendSuccess(response, 200, 'user details', user)
    } catch (error) {
        return sendError(response, 500, "Something is wrong");
    }
}


//review controller
export async function addReview(request, response) {
    // Allow both guests and logged-in users to submit reviews
    // userId is optional (from optionalAuth middleware)
    try {
        const {image, userName, review, rating, productId, title, customerEmail} = request.body;
        
        // Get userId from request (set by optionalAuth middleware) or from body
        const userId = request.userId || request.body.userId;

        // Validate required fields
        if (!userName || !review || !rating || !productId) {
            return response.status(400).json({
                message: "Please provide userName, review, rating, and productId",
                error: true,
                success: false
            });
        }

        // Check if product exists
        const Product = (await import('../models/product.model.js')).default;
        const product = await Product.findById(productId);
        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        // Check for duplicate review (logged-in users only)
        if (userId) {
            const existingReview = await ReviewModel.findOne({ productId, userId });
            if (existingReview) {
                return response.status(400).json({
                    message: "You have already reviewed this product",
                    error: true,
                    success: false
                });
            }
        }

        // Check verified purchase (if user is logged in)
        let isVerifiedPurchase = false;
        if (userId) {
            const OrderModel = (await import('../models/order.model.js')).default;
            const order = await OrderModel.findOne({
                userId,
                'products.productId': productId,
                status: 'Delivered'
            });
            isVerifiedPurchase = !!order;
        }

        const userReview = new ReviewModel({
            image: image || '',
            userName: userName,
            customerName: userName, // For email notifications
            customerEmail: customerEmail || null,
            review: review,
            title: title || review.substring(0, 100), // Use review as title if not provided
            rating: rating,
            userId: userId || null, // Allow null for guest reviews
            productId: productId,
            status: 'pending', // Requires admin approval
            isApproved: false,
            verifiedPurchase: isVerifiedPurchase
        })

        await userReview.save();

        // Send email notification to admin (non-blocking)
        try {
            const { sendEmail } = await import('../config/emailService.js');
            const adminEmail = env.adminEmail || 'sales@zubahouse.com';
            const adminUrl = env.adminUrl || 'http://localhost:3001';
            
            const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
                        .review-box { background: white; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; border-radius: 4px; }
                        .stars { color: #f39c12; font-size: 20px; }
                        .button { display: inline-block; padding: 12px 30px; background: #27ae60; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
                        .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🔔 New Product Review</h2>
                        </div>
                        <div class="content">
                            <h3>Product: ${product.name}</h3>
                            <div class="review-box">
                                <div class="stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
                                <p><strong>Customer:</strong> ${userName}</p>
                                ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
                                <p><strong>Review:</strong></p>
                                <p>${review}</p>
                                ${isVerifiedPurchase ? '<p><strong>✓ Verified Purchase</strong></p>' : ''}
                                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            <div style="text-align: center; margin-top: 20px;">
                                <a href="${adminUrl}/product/${productId}" class="button">View in Admin Panel</a>
                            </div>
                            <p style="margin-top: 20px; color: #7f8c8d; font-size: 13px;">
                                <strong>Quick Actions:</strong><br>
                                Log in to your admin panel to approve, reject, or mark this review as spam.
                            </p>
                        </div>
                        <div class="footer">
                            <p>Zuba House Admin Notifications</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            await sendEmail(
                adminEmail,
                `🔔 New Product Review - ${product.name}`,
                `New review submitted for ${product.name} by ${userName}. Rating: ${rating}/5. Review: ${review}`,
                emailHtml
            );
            console.log('✅ Admin notification email sent successfully');
        } catch (emailError) {
            console.error('❌ Email notification failed (non-critical):', emailError.message);
            // Don't fail the review submission if email fails
        }

        return response.json({
            message: "Review added successfully! Admin will review it shortly.",
            error: false,
            success: true
        })
        
    } catch (error) {
        console.error('Add Review Error:', error);
        return response.status(500).json({
            message: error.message || "Something is wrong",
            error: true,
            success: false
        })
    }
}

//get reviews - Only show approved reviews to customers
export async function getReviews(request, response) {
    try {
        const productId = request.query.productId;
        
        if (!productId) {
            return response.status(400).json({
                error: true,
                success: false,
                message: 'productId is required'
            });
        }

        // Only get approved reviews for public display
        const reviews = await ReviewModel.find({
            productId: productId,
            status: 'approved',
            isApproved: true
        }).sort({ createdAt: -1 }); // Latest first

        // Calculate rating statistics
        const stats = await ReviewModel.aggregate([
            { 
                $match: { 
                    productId: new mongoose.Types.ObjectId(productId), 
                    status: 'approved',
                    isApproved: true
                } 
            },
            {
                $group: {
                    _id: null,
                    average: { $avg: '$rating' },
                    count: { $sum: 1 },
                    breakdown: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        // Calculate breakdown percentages
        let breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let percentages = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        if (stats.length > 0 && stats[0].breakdown) {
            stats[0].breakdown.forEach(rating => {
                breakdown[rating] = (breakdown[rating] || 0) + 1;
            });
            
            const total = stats[0].count;
            Object.keys(breakdown).forEach(star => {
                percentages[star] = total > 0 ? Math.round((breakdown[star] / total) * 100) : 0;
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            reviews: reviews,
            stats: {
                average: stats.length > 0 ? Math.round(stats[0].average * 10) / 10 : 0,
                count: stats.length > 0 ? stats[0].count : 0,
                breakdown: breakdown,
                percentages: percentages
            }
        })
        
    } catch (error) {
        console.error('Get Reviews Error:', error);
        return response.status(500).json({
            message: error.message || "Something is wrong",
            error: true,
            success: false
        })
    }
}




// Get reviews for specific product (admin only)
export async function getProductReviewsAdmin(request, response) {
    try {
        const { productId } = request.params;
        
        if (!productId) {
            return sendError(response, 400, 'Product ID is required');
        }
        
        const reviews = await ReviewModel.find({ productId })
            .populate('userId', 'name email')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
        
        // Get counts by status
        const statusCounts = {
            all: reviews.length,
            pending: reviews.filter(r => r.status === 'pending').length,
            approved: reviews.filter(r => r.status === 'approved').length,
            rejected: reviews.filter(r => r.status === 'rejected').length,
            spam: reviews.filter(r => r.status === 'spam').length
        };
        
        return sendSuccess(response, 200, 'Product reviews', { reviews, statusCounts });
        
    } catch (error) {
        console.error('Get Product Reviews Admin Error:', error);
        return sendError(response, 500, error.message || 'Failed to fetch product reviews');
    }
}

//get all reviews (admin only - includes pending/rejected)
export async function getAllReviews(request, response) {
    try {
        const { status, page = 1, limit = 20 } = request.query;
        
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        const reviews = await ReviewModel.find(filter)
            .populate('productId', 'name images')
            .populate('userId', 'name email')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const totalCount = await ReviewModel.countDocuments(filter);
        
        // Get status counts
        const statusCounts = await ReviewModel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        const counts = {
            all: totalCount,
            pending: 0,
            approved: 0,
            rejected: 0,
            spam: 0
        };
        
        statusCounts.forEach(item => {
            counts[item._id] = item.count;
        });

        return sendSuccess(response, 200, 'Reviews list', {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalReviews: totalCount
            },
            statusCounts: counts
        })
        
    } catch (error) {
        console.error('Get All Reviews Error:', error);
        return sendError(response, 500, error.message || "Something is wrong")
    }
}

// Approve review (admin only)
export async function approveReview(request, response) {
    try {
        const { reviewId } = request.params;
        const adminId = request.userId;
        
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return sendError(response, 404, 'Review not found');
        }
        
        review.status = 'approved';
        review.isApproved = true;
        review.approvedBy = adminId;
        review.approvedAt = new Date();
        await review.save();
        
        // Update product rating
        if (review.updateProductRating) {
            await review.updateProductRating();
        }
        
        return sendSuccess(response, 200, 'Review approved successfully', { review });
    } catch (error) {
        console.error('Approve Review Error:', error);
        return sendError(response, 500, error.message || 'Failed to approve review');
    }
}

// Reject review (admin only)
export async function rejectReview(request, response) {
    try {
        const { reviewId } = request.params;
        const { reason } = request.body;
        const adminId = request.userId;
        
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return sendError(response, 404, 'Review not found');
        }
        
        review.status = 'rejected';
        review.isApproved = false;
        review.approvedBy = adminId;
        review.approvedAt = new Date();
        review.rejectionReason = reason || '';
        await review.save();
        
        // Update product rating (to remove this review)
        if (review.updateProductRating) {
            await review.updateProductRating();
        }
        
        return sendSuccess(response, 200, 'Review rejected', { review });
    } catch (error) {
        console.error('Reject Review Error:', error);
        return sendError(response, 500, error.message || 'Failed to reject review');
    }
}

// Mark review as spam (admin only)
export async function markReviewAsSpam(request, response) {
    try {
        const { reviewId } = request.params;
        const adminId = request.userId;
        
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return sendError(response, 404, 'Review not found');
        }
        
        review.status = 'spam';
        review.isApproved = false;
        review.approvedBy = adminId;
        review.approvedAt = new Date();
        await review.save();
        
        // Update product rating
        if (review.updateProductRating) {
            await review.updateProductRating();
        }
        
        return sendSuccess(response, 200, 'Review marked as spam', { review });
    } catch (error) {
        console.error('Mark Spam Error:', error);
        return sendError(response, 500, error.message || 'Failed to mark review as spam');
    }
}


//get all users
export async function getAllUsers(request, response) {
    try {
        const { page, limit } = request.query;

        const totalUsers = await UserModel.find();

        const users = await UserModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

        const total = await UserModel.countDocuments(users);

        if(!users){
            return sendError(response, 400, 'Invalid request')
        }

        return sendSuccess(response, 200, 'Users list', {
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalUsersCount: totalUsers?.length,
            totalUsers
        })
        
    } catch (error) {
        return sendError(response, 500, "Something is wrong")
    }
}

/** Country breakdown for admin analytics (saved addresses + order shipping). */
export async function getGeoBreakdown(request, response) {
    try {
        if (request.userRole !== 'ADMIN') {
            return sendError(response, 403, 'Unauthorized');
        }

        const userCountryMap = await collectUserCountriesFromDb(mongoose);
        const { countries, total } = buildCountryBreakdown(userCountryMap);

        return sendSuccess(response, 200, 'Geo breakdown', { countries, total });
    } catch (error) {
        console.error('Geo breakdown error:', error);
        return sendError(response, 500, error.message || 'Failed to load geo breakdown');
    }
}

/** Self-service account deletion for the authenticated user (mobile app). */
export async function deleteOwnAccount(request, response) {
    try {
        const userId = request.userId;
        if (!userId) {
            return sendError(response, 401, 'Authentication required');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return sendError(response, 404, 'User not found');
        }

        const cleanup = [
            CartProductModel.deleteMany({ userId }),
        ];

        try {
            const PushToken = (await import('../models/pushToken.model.js')).default;
            cleanup.push(PushToken.deleteMany({ userId }));
        } catch (pushErr) {
            console.warn('[Account] PushToken cleanup skipped:', pushErr?.message);
        }

        await Promise.allSettled(cleanup);

        const deletedUser = await UserModel.findByIdAndDelete(userId);
        if (!deletedUser) {
            return sendError(response, 500, 'Could not delete account');
        }

        console.log(`[Account] Deleted user: ${userId}`);

        return sendSuccess(response, 200, 'Account deleted successfully');
    } catch (error) {
        return sendError(response, 500, error?.message || 'Something went wrong');
    }
}

export async function deleteUser(request, response) {
    const user = await UserModel.findById(request.params.id);

    if (!user) {
        return response.status(404).json({
            message: "User Not found",
            error: true,
            success: false
        })
    }


    const deletedUser = await UserModel.findByIdAndDelete(request.params.id);

    if (!deletedUser) {
        response.status(404).json({
            message: "User not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "User Deleted!",
    });
}


//delete multiple products
export async function deleteMultiple(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }


    try {
        await UserModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "Users delete successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}