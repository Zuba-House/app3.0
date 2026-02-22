import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import sendEmailFun from '../config/sendEmail.js';
import VerificationEmail from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import genertedRefreshToken from '../utils/generatedRefreshToken.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ReviewModel from '../models/reviews.model.js.js';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});


export async function registerUserController(request, response) {
    try {
        let user;

        const { name, email, password } = request.body;
        if (!name || !email || !password) {
            return response.status(400).json({
                message: "provide email, name, password",
                error: true,
                success: false
            })
        }

        user = await UserModel.findOne({ email: email });

        if (user) {
            return response.json({
                message: "User already Registered with this email",
                error: true,
                success: false
            })
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();


        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new UserModel({
            email: email,
            password: hashPassword,
            name: name,
            otp: verifyCode,
            otpExpires: Date.now() + 600000,

        });

        await user.save();

        // Send verification email
        console.log('📧 Sending OTP email to:', email);
        const emailSent = await sendEmailFun({
            sendTo: email,
            subject: "Verify Your Email - Zuba House",
            text: "",
            html: VerificationEmail(name, verifyCode)
        });

        if (emailSent) {
            console.log('✅ OTP email sent successfully to:', email);
        } else {
            console.error('❌ Failed to send OTP email to:', email);
            // Don't fail registration, but log the error
        }

        // Create a JWT token for verification purposes
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        );


        return response.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully! ",
            token: token, // Optional: include this if needed for verification
        });



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function verifyEmailController(request, response) {
    try {
        const { email, otp } = request.body;

        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return response.status(400).json({ error: true, success: false, message: "User not found" });
        }

        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otpExpires > Date.now();

        if (isCodeValid && isNotExpired) {
            user.verify_email = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return response.status(200).json({ error: false, success: true, message: "Email verified successfully" });
        } else if (!isCodeValid) {
            return response.status(400).json({ error: true, success: false, message: "Invalid OTP" });
        } else {
            return response.status(400).json({ error: true, success: false, message: "OTP expired" });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function authWithGoogle(request, response) {
    const { name, email, password, avatar, mobile, role } = request.body;

    try {
        const existingUser = await UserModel.findOne({ email: email });

        if (!existingUser) {
            const user = await UserModel.create({
                name: name,
                mobile: mobile,
                email: email,
                password: "null",
                avatar: avatar,
                role: role,
                verify_email: true,
                signUpWithGoogle: true
            });

            await user.save();

            const accesstoken = await generatedAccessToken(user._id);
            const refreshToken = await genertedRefreshToken(user._id);

            await UserModel.findByIdAndUpdate(user?._id, {
                last_login_date: new Date()
            })


            const cookiesOption = {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            }
            response.cookie('accessToken', accesstoken, cookiesOption)
            response.cookie('refreshToken', refreshToken, cookiesOption)


            return response.json({
                message: "Login successfully",
                error: false,
                success: true,
                data: {
                    accesstoken,
                    refreshToken
                }
            })

        } else {
            const accesstoken = await generatedAccessToken(existingUser._id);
            const refreshToken = await genertedRefreshToken(existingUser._id);

            await UserModel.findByIdAndUpdate(existingUser?._id, {
                last_login_date: new Date()
            })


            const cookiesOption = {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            }
            response.cookie('accessToken', accesstoken, cookiesOption)
            response.cookie('refreshToken', refreshToken, cookiesOption)


            return response.json({
                message: "Login successfully",
                error: false,
                success: true,
                data: {
                    accesstoken,
                    refreshToken
                }
            })
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }


}


export async function loginUserController(request, response) {
    try {
        const { email, password } = request.body;

        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return response.status(400).json({
                message: "User not register",
                error: true,
                success: false
            })
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact to admin",
                error: true,
                success: false
            })
        }

        if (user.verify_email !== true) {
            return response.status(400).json({
                message: "Your Email is not verify yet please verify your email first",
                error: true,
                success: false
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password);

        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            })
        }


        const accesstoken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);

        const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
            last_login_date: new Date()
        })


        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }
        response.cookie('accessToken', accesstoken, cookiesOption)
        response.cookie('refreshToken', refreshToken, cookiesOption)


        return response.json({
            message: "Login successfully",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken
            }
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}



//logout controller
export async function logoutController(request, response) {
    try {
        const userid = request.userId //middleware

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.clearCookie("accessToken", cookiesOption)
        response.clearCookie("refreshToken", cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        return response.json({
            message: "Logout successfully",
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
            return response.status(400).send('The user cannot be Updated!');


        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                name: name,
                mobile: mobile,
                email: email,
            },
            { new: true }
        )



        return response.json({
            message: "User Updated successfully",
            error: false,
            success: true,
            user: {
                name: updateUser?.name,
                _id: updateUser?._id,
                email: updateUser?.email,
                mobile: updateUser?.mobile,
                avatar: updateUser?.avatar
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//forgot password
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body

        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        else {
            let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

            user.otp = verifyCode;
            user.otpExpires = Date.now() + 600000;

            await user.save();

            console.log('📧 Sending forgot password OTP email to:', email);
            const emailSent = await sendEmailFun({
                sendTo: email,
                subject: "Password Reset OTP - Zuba House",
                text: "",
                html: VerificationEmail(user.name, verifyCode)
            });

            if (emailSent) {
                console.log('✅ Forgot password OTP email sent successfully to:', email);
            } else {
                console.error('❌ Failed to send forgot password OTP email to:', email);
            }

            return response.json({
                message: "check your email",
                error: false,
                success: true
            })

        }



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body;

        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide required field email, otp.",
                error: true,
                success: false
            })
        }

        if (otp !== user.otp) {
            return response.status(400).json({
                message: "Invailid OTP",
                error: true,
                success: false
            })
        }


        const currentTime = new Date().toISOString()

        if (user.otpExpires < currentTime) {
            return response.status(400).json({
                message: "Otp is expired",
                error: true,
                success: false
            })
        }


        user.otp = "";
        user.otpExpires = "";

        await user.save();

        return response.status(200).json({
            message: "Verify OTP successfully",
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


//reset password
export async function resetpassword(request, response) {
    try {
        const { email, oldPassword, newPassword, confirmPassword } = request.body;
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


        if (user?.signUpWithGoogle === false) {
            const checkPassword = await bcryptjs.compare(oldPassword, user.password);
            if (!checkPassword) {
                return response.status(400).json({
                    message: "your old password is wrong",
                    error: true,
                    success: false,
                })
            }
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
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
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
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//refresh token controler
export async function refreshToken(request, response) {
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }


        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)
        if (!verifyToken) {
            return response.status(401).json({
                message: "token is expired",
                error: true,
                success: false
            })
        }

        const userId = verifyToken?._id;
        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accessToken', newAccessToken, cookiesOption)

        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.userId

        const user = await UserModel.findById(userId).select('-password -refresh_token').populate('address_details')

        return response.json({
            message: 'user details',
            data: user,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
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
            const adminEmail = process.env.ADMIN_EMAIL || 'sales@zubahouse.com';
            const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
            
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
        const adminId = request.userId;
        
        // Check if user is admin
        const user = await UserModel.findById(adminId);
        if (!user || user.role !== 'ADMIN') {
            return response.status(403).json({
                error: true,
                success: false,
                message: 'Admin access required'
            });
        }
        
        const { productId } = request.params;
        
        if (!productId) {
            return response.status(400).json({
                error: true,
                success: false,
                message: 'Product ID is required'
            });
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
        
        return response.status(200).json({
            error: false,
            success: true,
            reviews: reviews,
            statusCounts: statusCounts
        });
        
    } catch (error) {
        console.error('Get Product Reviews Admin Error:', error);
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to fetch product reviews'
        });
    }
}

//get all reviews (admin only - includes pending/rejected)
export async function getAllReviews(request, response) {
    try {
        const adminId = request.userId;
        
        // Check if user is admin (case-insensitive)
        const user = await UserModel.findById(adminId);
        const userRole = (user?.role || '').toUpperCase();
        
        console.log('🔐 Reviews admin check:', { userId: adminId, role: user?.role, isAdmin: userRole === 'ADMIN' });
        
        if (!user || userRole !== 'ADMIN') {
            return response.status(403).json({
                error: true,
                success: false,
                message: 'Admin access required',
                debug: { userRole: user?.role }
            });
        }
        
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

        return response.status(200).json({
            error: false,
            success: true,
            reviews: reviews,
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
        return response.status(500).json({
            message: error.message || "Something is wrong",
            error: true,
            success: false
        })
    }
}

// Approve review (admin only)
export async function approveReview(request, response) {
    try {
        const { reviewId } = request.params;
        const adminId = request.userId;
        
        // Check if user is admin
        const user = await UserModel.findById(adminId);
        if (!user || user.role !== 'ADMIN') {
            return response.status(403).json({
                error: true,
                success: false,
                message: 'Admin access required'
            });
        }
        
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return response.status(404).json({
                error: true,
                success: false,
                message: 'Review not found'
            });
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
        
        return response.status(200).json({
            error: false,
            success: true,
            message: 'Review approved successfully',
            review: review
        });
    } catch (error) {
        console.error('Approve Review Error:', error);
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to approve review'
        });
    }
}

// Reject review (admin only)
export async function rejectReview(request, response) {
    try {
        const { reviewId } = request.params;
        const { reason } = request.body;
        const adminId = request.userId;
        
        // Check if user is admin
        const user = await UserModel.findById(adminId);
        if (!user || user.role !== 'ADMIN') {
            return response.status(403).json({
                error: true,
                success: false,
                message: 'Admin access required'
            });
        }
        
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return response.status(404).json({
                error: true,
                success: false,
                message: 'Review not found'
            });
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
        
        return response.status(200).json({
            error: false,
            success: true,
            message: 'Review rejected',
            review: review
        });
    } catch (error) {
        console.error('Reject Review Error:', error);
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to reject review'
        });
    }
}

// Mark review as spam (admin only)
export async function markReviewAsSpam(request, response) {
    try {
        const { reviewId } = request.params;
        const adminId = request.userId;
        
        // Check if user is admin
        const user = await UserModel.findById(adminId);
        if (!user || user.role !== 'ADMIN') {
            return response.status(403).json({
                error: true,
                success: false,
                message: 'Admin access required'
            });
        }
        
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return response.status(404).json({
                error: true,
                success: false,
                message: 'Review not found'
            });
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
        
        return response.status(200).json({
            error: false,
            success: true,
            message: 'Review marked as spam',
            review: review
        });
    } catch (error) {
        console.error('Mark Spam Error:', error);
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to mark review as spam'
        });
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
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            users:users,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalUsersCount:totalUsers?.length,
            totalUsers:totalUsers
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
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