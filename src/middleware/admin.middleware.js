import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandlers.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Access denied. Please login first.");
    }
    
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Access denied. Admin privileges required.");
    }
    
    next();
});

export const verifyAdminOrOwner = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Access denied. Please login first.");
    }
    
    // Allow if user is admin or if they're accessing their own data
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.params.userId === req.user._id.toString();
    
    if (!isAdmin && !isOwner) {
        throw new ApiError(403, "Access denied. You can only access your own data or admin privileges required.");
    }
    
    next();
});
