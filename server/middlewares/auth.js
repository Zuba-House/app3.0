import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js';
import { env } from '../config/env.js';

function readBearerToken(request) {
    const authHeader = request?.headers?.authorization;
    const cookieToken = request?.cookies?.accessToken;
    if (cookieToken) return cookieToken;
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
    }
    const parts = authHeader.split(' ');
    return parts.length > 1 ? parts[1].trim() : authHeader.trim();
}

function attachResolvedAuth(request, user) {
    request.user = user || null;
    request.userId = user?._id ? String(user._id) : null;
    request.userRole = user?.role || 'USER';
    request.vendorId = user?.vendorId || user?.vendor || null;
}

const auth = async(request, response, next) => {
    try {
        const token = readBearerToken(request);

        if(!token){
            return response.status(401).json({
                error: true,
                success: false,
                message: "Authentication token required"
            })
        }

        const decode = jwt.verify(token, env.jwtAccessSecret);

        if(!decode){
            return response.status(401).json({
                error: true,
                success: false,
                message: "Invalid token"
            })
        }

        // Get user details to include role and vendorId
        const user = await UserModel.findById(decode.id).select('role vendorId status');
        if (!user) {
            return response.status(401).json({
                error: true,
                success: false,
                message: "User not found for this token"
            })
        }
        
        attachResolvedAuth(request, user);
        next()

    } catch (error) {
        // Handle JWT specific errors
        if (error.name === 'JsonWebTokenError') {
            return response.status(401).json({
                error: true,
                success: false,
                message: "Invalid token"
            })
        }
        
        if (error.name === 'TokenExpiredError') {
            return response.status(401).json({
                error: true,
                success: false,
                message: "Token expired"
            })
        }

        // Other errors (server errors)
        return response.status(500).json({
            error: true,
            success: false,
            message: "Authentication failed"
        })
    }
}

// Optional auth - attaches user if token exists, but doesn't require it
export const optionalAuth = async (request, response, next) => {
    try {
        const token = readBearerToken(request);
        request.authResolved = false;
        request.authTokenPresent = Boolean(token);
        attachResolvedAuth(request, null);

        if (token) {
            try {
                const decode = jwt.verify(token, env.jwtAccessSecret);
                if (decode && decode.id) {
                    // Get user details to include role and vendorId
                    try {
                        const user = await UserModel.findById(decode.id).select('role vendor vendorId');
                        if (user) {
                            attachResolvedAuth(request, user);
                            request.authResolved = true;
                        }
                    } catch (userError) {
                        // If user lookup fails, continue with token data
                        console.error('Optional auth - user lookup failed:', userError);
                    }
                }
            } catch (error) {
                // If token is invalid, just continue without user
                // Don't throw error for optional auth
                console.log('Optional auth - invalid token, continuing as guest:', error.message);
            }
        }

        if (env.nodeEnv !== 'production') {
            console.log('[optionalAuth]', {
                tokenPresent: request.authTokenPresent,
                authResolved: request.authResolved,
                userId: request.userId || null,
            });
        }

        // Continue regardless of auth status
        next();
    } catch (error) {
        // If any error occurs, just continue without user
        console.error('Optional auth error:', error);
        next();
    }
}

export default auth