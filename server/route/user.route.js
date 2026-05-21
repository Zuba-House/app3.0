import { Router } from 'express'
import {addReview, approveReview, changePasswordController, deleteMultiple, deleteOwnAccount, deleteUser, forgotPasswordController, getAllReviews, getAllUsers, getGeoBreakdown, getProductReviewsAdmin, getReviews, loginUserController, logoutController, markReviewAsSpam, refreshToken, registerUserController, rejectReview, removeImageFromCloudinary, resetpassword, updateUserDetails, userAvatarController, userDetails, verifyEmailController, verifyForgotPasswordOtp} from '../controllers/user.controller.js';
import auth, { optionalAuth } from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import { basicRateLimit } from '../middlewares/basicRateLimit.js';
import { adminOnly } from '../middlewares/adminOnly.js';

const userRouter = Router()
const authLimiter = basicRateLimit({ windowMs: 60 * 1000, max: 12, keyPrefix: 'auth' });
const otpLimiter = basicRateLimit({ windowMs: 60 * 1000, max: 8, keyPrefix: 'otp' });

userRouter.post('/register', authLimiter, registerUserController)
userRouter.post('/verifyEmail', otpLimiter, verifyEmailController)
userRouter.post('/login', authLimiter, loginUserController)
userRouter.post('/logout', auth, logoutController);
userRouter.put('/user-avatar',auth,upload.array('avatar'),userAvatarController);
userRouter.delete('/deteleImage',auth,removeImageFromCloudinary);
userRouter.put('/me', auth, updateUserDetails);
userRouter.put('/:id',auth,updateUserDetails);
userRouter.post('/forgot-password', otpLimiter, forgotPasswordController)
userRouter.post('/verify-forgot-password-otp', otpLimiter, verifyForgotPasswordOtp)
userRouter.post('/reset-password',resetpassword)
userRouter.post('/forgot-password/change-password',changePasswordController)
userRouter.post('/refresh-token',refreshToken)
userRouter.get('/user-details',auth,userDetails);
userRouter.get('/me', auth, userDetails);
userRouter.delete('/delete-account', auth, deleteOwnAccount);
// Allow both guests and logged-in users to add reviews
userRouter.post('/addReview', optionalAuth, addReview);
userRouter.get('/getReviews',getReviews);
userRouter.get('/getAllReviews',auth, getAllReviews); // Admin only
userRouter.get('/getProductReviewsAdmin/:productId', auth, getProductReviewsAdmin); // Admin only - get reviews for specific product
userRouter.get('/getAllUsers', auth, adminOnly, getAllUsers);
userRouter.get('/geo-breakdown', auth, adminOnly, getGeoBreakdown);
userRouter.delete('/deleteMultiple', auth, adminOnly, deleteMultiple);
userRouter.delete('/deleteUser/:id', auth, adminOnly, deleteUser);
// Admin review management routes
userRouter.post('/reviews/:reviewId/approve', auth, adminOnly, approveReview);
userRouter.post('/reviews/:reviewId/reject', auth, adminOnly, rejectReview);
userRouter.post('/reviews/:reviewId/spam', auth, adminOnly, markReviewAsSpam);


export default userRouter