import Banner from '../models/Banner.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

/**
 * Upload banner image
 * POST /api/banners/upload
 */
export async function uploadBannerImage(request, response) {
    try {
        // Drop unique index on type field if it exists (allows multiple banners per type)
        // This needs to happen before we try to save, but only if connection is ready
        try {
            if (Banner.db && Banner.db.readyState === 1) {
                const indexes = await Banner.collection.indexes();
                const typeIndex = indexes.find(idx => idx.name === 'type_1' && idx.unique === true);
                if (typeIndex) {
                    await Banner.collection.dropIndex('type_1');
                    console.log('✅ Dropped unique index on type field');
                }
            }
        } catch (indexError) {
            // Index doesn't exist or already dropped, that's fine
            // Continue with upload - don't block the request
        }

        if (!request.file) {
            return response.status(400).json({
                success: false,
                error: true,
                message: 'No image file provided'
            });
        }

        const { type } = request.body; // 'desktop' or 'mobile'

        if (!type || !['desktop', 'mobile'].includes(type)) {
            // Delete uploaded file if validation fails
            if (request.file.path) {
                fs.unlinkSync(request.file.path);
            }
            return response.status(400).json({
                success: false,
                error: true,
                message: 'Invalid banner type. Must be "desktop" or "mobile"'
            });
        }

        // Upload to Cloudinary
        const options = {
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            folder: 'banners', // Organize banners in a folder
        };

        const result = await cloudinary.uploader.upload(
            request.file.path,
            options
        );

        // Delete local file after Cloudinary upload
        if (fs.existsSync(request.file.path)) {
            fs.unlinkSync(request.file.path);
        }

        // Extract form data
        const { title, subtitle, ctaText, ctaLink, order, backgroundColor, textColor, ctaColor, ctaTextColor } = request.body;

        // Calculate order: use provided order, or count existing banners
        let orderValue = 0;
        if (order !== undefined && order !== null && order !== '') {
            orderValue = parseInt(order) || 0;
        } else {
            const bannerCount = await Banner.countDocuments();
            orderValue = bannerCount;
        }

        // Always create a new banner (supports multiple banners)
        const banner = new Banner({
            type,
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id,
            title: title || '',
            subtitle: subtitle || '',
            ctaText: ctaText || '',
            ctaLink: ctaLink || '',
            backgroundColor: backgroundColor || '',
            textColor: textColor || '',
            ctaColor: ctaColor || '',
            ctaTextColor: ctaTextColor || '',
            isActive: true,
            order: orderValue
        });

        await banner.save();

        return response.status(200).json({
            success: true,
            error: false,
            message: `${type} banner uploaded successfully`,
            imageUrl: banner.imageUrl,
            bannerId: banner._id
        });

    } catch (error) {
        console.error('Banner upload error:', error);
        console.error('Error stack:', error.stack);
        
        // Check if it's a duplicate key error (unique index still exists)
        if (error.code === 11000 || error.message?.includes('duplicate key')) {
            // Try to drop the index one more time
            try {
                await Banner.collection.dropIndex('type_1');
                console.log('✅ Dropped unique index after duplicate key error');
                // Return a helpful error message
                return response.status(500).json({
                    success: false,
                    error: true,
                    message: 'Failed to upload banner: Unique index still exists. Please try again.',
                    details: 'The database still has a unique constraint on the type field. The index has been dropped - please try uploading again.',
                    retry: true
                });
            } catch (dropError) {
                return response.status(500).json({
                    success: false,
                    error: true,
                    message: 'Failed to upload banner: Database constraint error',
                    details: 'Please contact support to remove the unique index on the banner type field.',
                });
            }
        }
        
        // Clean up uploaded file on error
        if (request.file && request.file.path && fs.existsSync(request.file.path)) {
            try {
                fs.unlinkSync(request.file.path);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }

        return response.status(500).json({
            success: false,
            error: true,
            message: 'Failed to upload banner',
            details: error.message || 'Unknown error occurred',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

/**
 * Update banner content (title, subtitle, CTA)
 * POST /api/banners/content
 */
export async function updateBannerContent(request, response) {
    try {
        const { type, title, subtitle, ctaText, ctaLink } = request.body;

        if (!type || !['desktop', 'mobile'].includes(type)) {
            return response.status(400).json({
                success: false,
                error: true,
                message: 'Invalid banner type'
            });
        }

        // Find banner or create if doesn't exist
        let banner = await Banner.findOne({ type });

        if (!banner) {
            banner = new Banner({
                type,
                isActive: true
            });
        }

        // Update content
        banner.title = title || '';
        banner.subtitle = subtitle || '';
        banner.ctaText = ctaText || '';
        banner.ctaLink = ctaLink || '';
        banner.updatedAt = new Date();

        await banner.save();

        return response.status(200).json({
            success: true,
            error: false,
            message: `${type} banner content updated successfully`,
            banner: {
                id: banner._id,
                type: banner.type,
                imageUrl: banner.imageUrl,
                title: banner.title,
                subtitle: banner.subtitle,
                ctaText: banner.ctaText,
                ctaLink: banner.ctaLink
            }
        });

    } catch (error) {
        console.error('Banner content update error:', error);
        return response.status(500).json({
            success: false,
            error: true,
            message: 'Failed to update banner content',
            details: error.message
        });
    }
}

/**
 * Get all banners (admin)
 * GET /api/banners
 */
export async function getAllBanners(request, response) {
    try {
        const banners = await Banner.find().sort({ type: 1 });

        // Structure response for frontend
        const responseData = {
            desktop: banners.find(b => b.type === 'desktop') || {
                id: null,
                imageUrl: '',
                title: '',
                subtitle: '',
                ctaText: '',
                ctaLink: ''
            },
            mobile: banners.find(b => b.type === 'mobile') || {
                id: null,
                imageUrl: '',
                title: '',
                subtitle: '',
                ctaText: '',
                ctaLink: ''
            }
        };

        return response.status(200).json({
            success: true,
            error: false,
            banners: responseData
        });

    } catch (error) {
        console.error('Error fetching banners:', error);
        return response.status(500).json({
            success: false,
            error: true,
            message: 'Failed to fetch banners',
            details: error.message
        });
    }
}

/**
 * Get active banners for public display
 * GET /api/banners/public
 */
export async function getPublicBanners(request, response) {
    try {
        const activeBanners = await Banner.find({ isActive: true })
            .select('-__v -cloudinaryId')
            .sort({ order: 1, createdAt: -1 });

        // Support array format for mobile endless loop
        if (request.query.format === 'array') {
            const bannersArray = activeBanners.map(banner => ({
                _id: banner._id,
                id: banner._id.toString(),
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                ctaText: banner.ctaText || '',
                ctaLink: banner.ctaLink || '',
                imageUrl: banner.imageUrl || '',
                mobileImage: banner.type === 'mobile' ? banner.imageUrl : null,
                desktopImage: banner.type === 'desktop' ? banner.imageUrl : null,
                altText: banner.title || 'Banner',
                isActive: banner.isActive,
                order: banner.order || 0,
                type: banner.type,
                backgroundColor: banner.backgroundColor || '',
                textColor: banner.textColor || '',
                ctaColor: banner.ctaColor || '',
                ctaTextColor: banner.ctaTextColor || ''
            }));

            return response.status(200).json({
                success: true,
                error: false,
                banners: bannersArray
            });
        }

        // Default format (backward compatible)
        const responseData = {
            desktop: activeBanners.find(b => b.type === 'desktop') || null,
            mobile: activeBanners.find(b => b.type === 'mobile') || null,
            all: activeBanners.map(banner => ({
                _id: banner._id,
                id: banner._id.toString(),
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                ctaText: banner.ctaText || '',
                ctaLink: banner.ctaLink || '',
                imageUrl: banner.imageUrl || '',
                mobileImage: banner.type === 'mobile' ? banner.imageUrl : null,
                desktopImage: banner.type === 'desktop' ? banner.imageUrl : null,
                altText: banner.title || 'Banner',
                isActive: banner.isActive,
                order: banner.order || 0,
                type: banner.type,
                backgroundColor: banner.backgroundColor || '',
                textColor: banner.textColor || '',
                ctaColor: banner.ctaColor || '',
                ctaTextColor: banner.ctaTextColor || ''
            }))
        };

        return response.status(200).json({
            success: true,
            error: false,
            banners: responseData
        });

    } catch (error) {
        console.error('Error fetching public banners:', error);
        return response.status(500).json({
            success: false,
            error: true,
            message: 'Failed to fetch banners'
        });
    }
}

/**
 * Get banner by ID
 * GET /api/banners/:id
 */
export async function getBannerById(request, response) {
    try {
        const { id } = request.params;

        const banner = await Banner.findById(id);

        if (!banner) {
            return response.status(404).json({
                success: false,
                error: true,
                message: 'Banner not found'
            });
        }

        return response.status(200).json({
            success: true,
            error: false,
            banner: {
                _id: banner._id,
                id: banner._id.toString(),
                type: banner.type,
                imageUrl: banner.imageUrl || '',
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                ctaText: banner.ctaText || '',
                ctaLink: banner.ctaLink || '',
                isActive: banner.isActive,
                order: banner.order || 0,
                backgroundColor: banner.backgroundColor || '',
                textColor: banner.textColor || '',
                ctaColor: banner.ctaColor || '',
                ctaTextColor: banner.ctaTextColor || ''
            }
        });

    } catch (error) {
        console.error('Error fetching banner:', error);
        return response.status(500).json({
            success: false,
            error: true,
            message: 'Failed to fetch banner',
            details: error.message
        });
    }
}

/**
 * Update banner by ID
 * PUT /api/banners/:id
 */
export async function updateBanner(request, response) {
    try {
        const { id } = request.params;
        const { title, subtitle, ctaText, ctaLink, order, isActive, backgroundColor, textColor, ctaColor, ctaTextColor } = request.body;

        const banner = await Banner.findById(id);

        if (!banner) {
            return response.status(404).json({
                success: false,
                error: true,
                message: 'Banner not found'
            });
        }

        // If new image uploaded, update it
        if (request.file) {
            // Delete old image from Cloudinary
            if (banner.cloudinaryId) {
                try {
                    await cloudinary.uploader.destroy(banner.cloudinaryId);
                } catch (error) {
                    console.error('Error deleting old banner image:', error);
                }
            }

            // Upload new image
            const options = {
                use_filename: true,
                unique_filename: true,
                overwrite: false,
                folder: 'banners',
            };

            const result = await cloudinary.uploader.upload(request.file.path, options);

            // Delete local file
            if (fs.existsSync(request.file.path)) {
                fs.unlinkSync(request.file.path);
            }

            banner.imageUrl = result.secure_url;
            banner.cloudinaryId = result.public_id;
        }

        // Update content
        if (title !== undefined) banner.title = title;
        if (subtitle !== undefined) banner.subtitle = subtitle;
        if (ctaText !== undefined) banner.ctaText = ctaText;
        if (ctaLink !== undefined) banner.ctaLink = ctaLink;
        if (order !== undefined) banner.order = parseInt(order) || 0;
        if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;
        if (backgroundColor !== undefined) banner.backgroundColor = backgroundColor;
        if (textColor !== undefined) banner.textColor = textColor;
        if (ctaColor !== undefined) banner.ctaColor = ctaColor;
        if (ctaTextColor !== undefined) banner.ctaTextColor = ctaTextColor;

        banner.updatedAt = new Date();
        await banner.save();

        return response.status(200).json({
            success: true,
            error: false,
            message: 'Banner updated successfully',
            banner: {
                _id: banner._id,
                id: banner._id.toString(),
                type: banner.type,
                imageUrl: banner.imageUrl,
                title: banner.title,
                subtitle: banner.subtitle,
                ctaText: banner.ctaText,
                ctaLink: banner.ctaLink,
                isActive: banner.isActive,
                order: banner.order,
                backgroundColor: banner.backgroundColor,
                textColor: banner.textColor,
                ctaColor: banner.ctaColor,
                ctaTextColor: banner.ctaTextColor
            }
        });

    } catch (error) {
        console.error('Banner update error:', error);
        
        // Clean up uploaded file on error
        if (request.file && fs.existsSync(request.file.path)) {
            fs.unlinkSync(request.file.path);
        }

        return response.status(500).json({
            success: false,
            error: true,
            message: 'Failed to update banner',
            details: error.message
        });
    }
}

/**
 * Delete banner by ID
 * DELETE /api/banners/:id
 */
export async function deleteBanner(request, response) {
    try {
        const { id } = request.params;

        const banner = await Banner.findById(id);

        if (!banner) {
            return response.status(404).json({
                success: false,
                error: true,
                message: 'Banner not found'
            });
        }

        // Delete image from Cloudinary
        if (banner.cloudinaryId) {
            try {
                await cloudinary.uploader.destroy(banner.cloudinaryId);
            } catch (error) {
                console.error('Error deleting banner image from Cloudinary:', error);
            }
        }

        // Delete banner from database
        await Banner.deleteOne({ _id: id });

        return response.status(200).json({
            success: true,
            error: false,
            message: 'Banner deleted successfully'
        });

    } catch (error) {
        console.error('Banner deletion error:', error);
        return response.status(500).json({
            success: false,
            error: true,
            message: 'Failed to delete banner',
            details: error.message
        });
    }
}

/**
 * Toggle banner active status
 * PUT /api/banners/:type/toggle
 */
export async function toggleBannerStatus(request, response) {
    try {
        const { type } = request.params;

        if (!['desktop', 'mobile'].includes(type)) {
            return response.status(400).json({
                success: false,
                error: true,
                message: 'Invalid banner type'
            });
        }

        const banner = await Banner.findOne({ type });

        if (!banner) {
            return response.status(404).json({
                success: false,
                error: true,
                message: 'Banner not found'
            });
        }

        banner.isActive = !banner.isActive;
        banner.updatedAt = new Date();

        await banner.save();

        return response.status(200).json({
            success: true,
            error: false,
            message: `${type} banner ${banner.isActive ? 'activated' : 'deactivated'}`,
            isActive: banner.isActive
        });

    } catch (error) {
        console.error('Banner toggle error:', error);
        return response.status(500).json({
            success: false,
            error: true,
            message: 'Failed to toggle banner status',
            details: error.message
        });
    }
}

