import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import UserModel from '../models/user.model.js';
import { sendError } from '../utils/response.js';

/** Requires auth middleware to run first (sets req.userRole), or valid Bearer JWT with ADMIN role. */
export const adminOnly = async (req, res, next) => {
    if (req.userRole === 'ADMIN') {
        return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader?.split(' ')[1];

    if (!token) {
        return sendError(res, 403, 'Admin access required');
    }

    try {
        const decoded = jwt.verify(token, env.jwtAccessSecret);
        const user = await UserModel.findById(decoded.id).select('role email');
        if (!user || user.role !== 'ADMIN') {
            return sendError(res, 403, 'Admin access required');
        }
        req.user = user;
        req.userId = String(user._id);
        req.userRole = 'ADMIN';
        req.userEmail = user.email;
        return next();
    } catch {
        return sendError(res, 401, 'Invalid token');
    }
};
