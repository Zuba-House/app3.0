// Vendor authentication middleware
// Must be used AFTER auth middleware that sets req.userId, req.userRole, req.vendorId

import VendorModel from '../models/vendor.model.js';

/**
 * Middleware to require vendor access
 * Checks if user is authenticated and has vendor role
 * Also validates vendor status (blocks suspended/rejected vendors)
 */
const requireVendor = async (req, res, next) => {
  try {
    // Check if user is authenticated (from auth middleware)
    if (!req.userId) {
      return res.status(401).json({ 
        error: true,
        success: false,
        message: 'Not authenticated' 
      });
    }

    // Check role and vendorId (set by auth middleware)
    if (req.userRole !== 'VENDOR' || !req.vendorId) {
      return res.status(403).json({ 
        error: true,
        success: false,
        message: 'Vendor access only' 
      });
    }

    // Fetch vendor and validate status
    const vendor = await VendorModel.findById(req.vendorId);
    
    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor account not found. Please contact support.',
        code: 'VENDOR_NOT_FOUND'
      });
    }

    // Block suspended vendors
    if (vendor.status === 'SUSPENDED') {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Your vendor account has been suspended. Please contact support for more information.',
        code: 'VENDOR_SUSPENDED',
        status: 'SUSPENDED'
      });
    }

    // Block rejected vendors
    if (vendor.status === 'REJECTED') {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Your vendor application was rejected. Please contact support if you believe this is an error.',
        code: 'VENDOR_REJECTED',
        status: 'REJECTED'
      });
    }

    // Block pending vendors from most operations
    if (vendor.status === 'PENDING') {
      // Allow access to profile view and limited endpoints for pending vendors
      const allowedPathsForPending = ['/me', '/application-status'];
      const currentPath = req.path;
      
      const isAllowed = allowedPathsForPending.some(path => 
        currentPath === path || currentPath.endsWith(path)
      );
      
      if (!isAllowed) {
        return res.status(403).json({
          error: true,
          success: false,
          message: 'Your vendor account is pending approval. You will be notified once your application is reviewed.',
          code: 'VENDOR_PENDING',
          status: 'PENDING'
        });
      }
    }

    // Attach vendor to request for use in controllers
    req.vendor = vendor;
    req.vendorId = vendor._id;

    next();
  } catch (error) {
    console.error('Vendor auth middleware error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional vendor middleware - attaches vendor if available but doesn't require it
 * Useful for endpoints that can work with or without vendor context
 */
const optionalVendor = async (req, res, next) => {
  try {
    if (req.vendorId) {
      const vendor = await VendorModel.findById(req.vendorId);
      if (vendor && vendor.status === 'APPROVED') {
        req.vendor = vendor;
      }
    }
    next();
  } catch (error) {
    console.error('Optional vendor middleware error:', error);
    // Continue without vendor context
    next();
  }
};

/**
 * Middleware to check vendor ownership of a resource
 * Use after requireVendor middleware
 * @param {String} resourceField - The field name containing the vendor ID in the resource
 */
const checkVendorOwnership = (resourceField = 'vendor') => {
  return (req, res, next) => {
    const resource = req.resource || req.body;
    const resourceVendorId = resource[resourceField]?.toString() || resource.vendorId?.toString();
    const requestVendorId = req.vendorId?.toString();

    if (!resourceVendorId || !requestVendorId) {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Access denied: Cannot verify ownership'
      });
    }

    if (resourceVendorId !== requestVendorId) {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Access denied: You do not own this resource'
      });
    }

    next();
  };
};

export { requireVendor, optionalVendor, checkVendorOwnership };
export default { requireVendor, optionalVendor, checkVendorOwnership };
