import Media from '../models/media.model.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

/**
 * Upload images and save to media library
 */
export const uploadMedia = async (req, res) => {
    try {
        const files = req.files;
        const uploadedBy = res.locals.user?.id || req.user?.id || null;

        if (!files || files.length === 0) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "No files provided"
            });
        }

        const options = {
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            folder: 'media-library'
        };

        const uploadPromises = files.map(async (file) => {
            try {
                const result = await cloudinary.uploader.upload(file.path, options);
                
                // Delete temporary file
                try {
                    fs.unlinkSync(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temp file:', unlinkError);
                }

                // Check if media already exists (by public_id)
                let media = await Media.findOne({ publicId: result.public_id });
                
                if (media) {
                    // Update existing media
                    media.url = result.url;
                    media.secureUrl = result.secure_url;
                    media.format = result.format;
                    media.width = result.width;
                    media.height = result.height;
                    media.bytes = result.bytes;
                    await media.save();
                } else {
                    // Create new media entry
                    media = await Media.create({
                        publicId: result.public_id,
                        url: result.url,
                        secureUrl: result.secure_url,
                        filename: result.original_filename || file.originalname,
                        originalName: file.originalname,
                        format: result.format,
                        width: result.width,
                        height: result.height,
                        bytes: result.bytes,
                        folder: result.folder || 'media-library',
                        uploadedBy: uploadedBy
                    });
                }

                return media;
            } catch (error) {
                console.error('Cloudinary upload error:', error);
                // Delete temp file even on error
                try {
                    fs.unlinkSync(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temp file:', unlinkError);
                }
                throw error;
            }
        });

        const uploadedMedia = await Promise.all(uploadPromises);

        // Extract URLs for compatibility with UploadBox component
        const imageUrls = uploadedMedia.map(item => item.secureUrl || item.url);

        return res.status(200).json({
            error: false,
            success: true,
            message: 'Media uploaded successfully',
            data: {
                images: imageUrls, // For UploadBox compatibility
                media: uploadedMedia // Full media objects
            }
        });
    } catch (error) {
        console.error('Upload media error:', error);
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to upload media'
        });
    }
};

/**
 * Get all media with pagination and filtering
 */
export const getAllMedia = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            search = '',
            type = '', // Filter by usage type
            sortBy = 'uploadedAt',
            sortOrder = 'desc',
            isActive = true
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        const query = {};
        
        if (isActive !== 'all') {
            query.isActive = isActive === 'true';
        }

        // Search by filename, originalName, or tags
        if (search) {
            query.$or = [
                { filename: { $regex: search, $options: 'i' } },
                { originalName: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Filter by usage type
        if (type) {
            query['usedIn.type'] = type;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const [media, total] = await Promise.all([
            Media.find(query)
                .populate('uploadedBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Media.countDocuments(query)
        ]);

        return res.status(200).json({
            error: false,
            success: true,
            data: {
                media,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalItems: total,
                    itemsPerPage: limitNum
                }
            }
        });
    } catch (error) {
        console.error('Get all media error:', error);
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to fetch media'
        });
    }
};

/**
 * Get single media by ID
 */
export const getMediaById = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await Media.findById(id)
            .populate('uploadedBy', 'name email')
            .lean();

        if (!media) {
            return res.status(404).json({
                error: true,
                success: false,
                message: 'Media not found'
            });
        }

        return res.status(200).json({
            error: false,
            success: true,
            data: { media }
        });
    } catch (error) {
        console.error('Get media by ID error:', error);
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to fetch media'
        });
    }
};

/**
 * Update media metadata
 */
export const updateMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { alt, description, tags, isActive } = req.body;

        const media = await Media.findById(id);

        if (!media) {
            return res.status(404).json({
                error: true,
                success: false,
                message: 'Media not found'
            });
        }

        // Update fields
        if (alt !== undefined) media.alt = alt;
        if (description !== undefined) media.description = description;
        if (tags !== undefined) media.tags = Array.isArray(tags) ? tags : [];
        if (isActive !== undefined) media.isActive = isActive;

        await media.save();

        return res.status(200).json({
            error: false,
            success: true,
            message: 'Media updated successfully',
            data: { media }
        });
    } catch (error) {
        console.error('Update media error:', error);
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to update media'
        });
    }
};

/**
 * Delete media from library and Cloudinary
 */
export const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await Media.findById(id);

        if (!media) {
            return res.status(404).json({
                error: true,
                success: false,
                message: 'Media not found'
            });
        }

        // Check if media is being used
        if (media.usageCount > 0) {
            return res.status(400).json({
                error: true,
                success: false,
                message: `Cannot delete media. It is currently being used in ${media.usageCount} resource(s).`
            });
        }

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(media.publicId);
        } catch (cloudinaryError) {
            console.error('Cloudinary delete error:', cloudinaryError);
            // Continue with database deletion even if Cloudinary deletion fails
        }

        // Delete from database
        await Media.findByIdAndDelete(id);

        return res.status(200).json({
            error: false,
            success: true,
            message: 'Media deleted successfully'
        });
    } catch (error) {
        console.error('Delete media error:', error);
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to delete media'
        });
    }
};

/**
 * Delete multiple media
 */
export const deleteMultipleMedia = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                error: true,
                success: false,
                message: 'No media IDs provided'
            });
        }

        // Find all media
        const mediaItems = await Media.find({ _id: { $in: ids } });

        // Check for media in use
        const inUse = mediaItems.filter(m => m.usageCount > 0);
        if (inUse.length > 0) {
            return res.status(400).json({
                error: true,
                success: false,
                message: `Cannot delete ${inUse.length} media item(s) that are currently in use.`
            });
        }

        // Delete from Cloudinary
        const deletePromises = mediaItems.map(async (media) => {
            try {
                await cloudinary.uploader.destroy(media.publicId);
            } catch (error) {
                console.error(`Error deleting ${media.publicId} from Cloudinary:`, error);
            }
        });

        await Promise.all(deletePromises);

        // Delete from database
        await Media.deleteMany({ _id: { $in: ids } });

        return res.status(200).json({
            error: false,
            success: true,
            message: `${ids.length} media item(s) deleted successfully`
        });
    } catch (error) {
        console.error('Delete multiple media error:', error);
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to delete media'
        });
    }
};

