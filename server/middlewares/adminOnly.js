import { sendError } from '../utils/response.js';

/** Requires auth middleware to run first (sets req.userRole). */
export const adminOnly = (req, res, next) => {
    if (req.userRole !== 'ADMIN') {
        return sendError(res, 403, 'Forbidden');
    }
    next();
};
