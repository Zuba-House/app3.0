import jwt from 'jsonwebtoken'

const auth = async(request, response, next) => {
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1];

        if(!token){
            return response.status(401).json({
                error: true,
                success: false,
                message: "Authentication token required"
            })
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

        if(!decode){
            return response.status(401).json({
                error: true,
                success: false,
                message: "Invalid token"
            })
        }

        // Get user details to include role and vendorId
        const UserModel = (await import('../models/user.model.js')).default;
        const user = await UserModel.findById(decode.id).select('role vendorId');
        
        request.userId = decode.id;
        request.userRole = user?.role || 'USER';
        request.vendorId = user?.vendorId || null;
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
        // Try multiple ways to get the token
        let token = request.cookies?.accessToken;
        
        // Check Authorization header (Bearer token)
        if (!token && request?.headers?.authorization) {
            const authHeader = request.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            } else if (authHeader.includes(' ')) {
                token = authHeader.split(' ')[1];
            } else {
                token = authHeader;
            }
        }

        if (token) {
            try {
                const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
                if (decode && decode.id) {
                    request.userId = decode.id;
                    request.userRole = decode.role || 'USER';
                    request.vendorId = decode.vendorId || null;
                    
                    // Get user details to include role and vendorId
                    try {
                        const UserModel = (await import('../models/user.model.js')).default;
                        const user = await UserModel.findById(decode.id).select('role vendor vendorId');
                        if (user) {
                            request.userId = user._id.toString();
                            request.userRole = user.role || 'USER';
                            request.vendorId = user.vendorId || user.vendor || null;
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
        
        // Continue regardless of auth status
        next();
    } catch (error) {
        // If any error occurs, just continue without user
        console.error('Optional auth error:', error);
        next();
    }
}

export default auth