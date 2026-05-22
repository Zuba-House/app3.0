import ProductModel from '../models/product.model.js';
import ProductRAMSModel from '../models/productRAMS.js';
import ProductWEIGHTModel from '../models/productWEIGHT.js';
import ProductSIZEModel from '../models/productSIZE.js';
import Media from '../models/media.model.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { request } from 'http';


cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});


/**
 * Helper: Ensure product.attributes is populated from variations
 * This fixes the issue where attributes array might be empty
 */
const ensureAttributesFromVariations = (productData) => {
    // If attributes already exist and are populated, return as-is
    if (Array.isArray(productData.attributes) && productData.attributes.length > 0) {
        return productData;
    }

    // Extract attributes from variations
    if (Array.isArray(productData.variations) && productData.variations.length > 0) {
        const attributesMap = new Map();

        productData.variations.forEach(variation => {
            if (Array.isArray(variation.attributes)) {
                variation.attributes.forEach(attr => {
                    if (attr && attr.name) {
                        if (!attributesMap.has(attr.name)) {
                            attributesMap.set(attr.name, {
                                name: attr.name,
                                slug: attr.slug || attr.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                values: new Set()
                            });
                        }

                        // Add value to this attribute
                        if (attr.value) {
                            const attrData = attributesMap.get(attr.name);
                            attrData.values.add(JSON.stringify({
                                label: attr.value,
                                slug: attr.valueSlug || attr.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                            }));
                        }
                    }
                });
            }
        });

        // Convert Map to array
        productData.attributes = Array.from(attributesMap.values()).map(attr => ({
            name: attr.name,
            slug: attr.slug,
            values: Array.from(attr.values).map(v => JSON.parse(v)),
            visible: true,
            variation: true
        }));
    }

    return productData;
};

//image upload
var imagesArr = [];
export async function uploadImages(request, response) {
    try {
        imagesArr = [];

        const image = request.files;

        if (!image || image.length === 0) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "No images provided"
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        // Use Promise.all to wait for all uploads to complete
        const uploadPromises = [];
        const uploadedBy = response.locals.user?.id || request.user?.id || null;
        
        for (let i = 0; i < image.length; i++) {
            uploadPromises.push(
                cloudinary.uploader.upload(image[i].path, options)
                    .then(async (result) => {
                        // Delete the temporary file
                        try {
                            fs.unlinkSync(`uploads/${image[i].filename}`);
                        } catch (unlinkError) {
                            console.error('Error deleting temp file:', unlinkError);
                        }
                        
                        // Save to media library
                        try {
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
                                await Media.create({
                                    publicId: result.public_id,
                                    url: result.url,
                                    secureUrl: result.secure_url,
                                    filename: result.original_filename || image[i].originalname,
                                    originalName: image[i].originalname,
                                    format: result.format,
                                    width: result.width,
                                    height: result.height,
                                    bytes: result.bytes,
                                    folder: result.folder || 'products',
                                    uploadedBy: uploadedBy
                                });
                            }
                        } catch (mediaError) {
                            console.error('Error saving to media library:', mediaError);
                            // Continue even if media library save fails
                        }
                        
                        return result.secure_url;
                    })
                    .catch((error) => {
                        console.error('Cloudinary upload error:', error);
                        // Delete temp file even on error
                        try {
                            fs.unlinkSync(`uploads/${image[i].filename}`);
                        } catch (unlinkError) {
                            console.error('Error deleting temp file:', unlinkError);
                        }
                        throw error;
                    })
            );
        }

        // Wait for all uploads to complete
        const uploadedUrls = await Promise.all(uploadPromises);
        imagesArr = uploadedUrls;

        return response.status(200).json({
            error: false,
            success: true,
            data: {
                images: imagesArr
            }
        });

    } catch (error) {
        console.error('Upload images error:', error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

var bannerImage = [];
export async function uploadBannerImages(request, response) {
    try {
        bannerImage = [];

        const image = request.files;

        if (!image || image.length === 0) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "No images provided"
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        // Use Promise.all to wait for all uploads to complete
        const uploadPromises = [];
        for (let i = 0; i < image.length; i++) {
            uploadPromises.push(
                cloudinary.uploader.upload(image[i].path, options)
                    .then((result) => {
                        // Delete the temporary file
                        try {
                            fs.unlinkSync(`uploads/${image[i].filename}`);
                        } catch (unlinkError) {
                            console.error('Error deleting temp file:', unlinkError);
                        }
                        return result.secure_url;
                    })
                    .catch((error) => {
                        console.error('Cloudinary upload error:', error);
                        // Delete temp file even on error
                        try {
                            fs.unlinkSync(`uploads/${image[i].filename}`);
                        } catch (unlinkError) {
                            console.error('Error deleting temp file:', unlinkError);
                        }
                        throw error;
                    })
            );
        }

        // Wait for all uploads to complete
        const uploadedUrls = await Promise.all(uploadPromises);
        bannerImage = uploadedUrls;

        return response.status(200).json({
            error: false,
            success: true,
            data: {
                images: bannerImage
            }
        });

    } catch (error) {
        console.error('Upload banner images error:', error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//create product
export async function createProduct(request, response) {
    try {
        // Get images from request body (form) or from global imagesArr (upload endpoint)
        let productImages = [];
        
        // Check request body first (from form submission)
        if (request.body.images) {
            if (Array.isArray(request.body.images) && request.body.images.length > 0) {
                productImages = request.body.images;
            } else if (typeof request.body.images === 'string') {
                // Handle case where images might be a JSON string
                try {
                    const parsed = JSON.parse(request.body.images);
                    if (Array.isArray(parsed)) {
                        productImages = parsed;
                    }
                } catch (e) {
                    // Not JSON, treat as single URL
                    productImages = [request.body.images];
                }
            }
        }
        
        // Fallback to global imagesArr if no images in request body
        if (productImages.length === 0 && imagesArr && imagesArr.length > 0) {
            productImages = imagesArr;
        }
        
        // Transform images array to new format
        const imagesFormatted = productImages
            .filter(img => img && (typeof img === 'string' || (typeof img === 'object' && img.url))) // Filter out invalid entries
            .map((img, index) => {
                // If already an object, use it
                if (typeof img === 'object' && img.url) {
                    return {
                        url: img.url,
                        alt: img.alt || '',
                        title: img.title || '',
                        position: img.position !== undefined ? img.position : index,
                        isFeatured: img.isFeatured !== undefined ? img.isFeatured : index === 0
                    };
                }
                // If string URL, convert to object
                return {
                    url: typeof img === 'string' ? img : '',
                    alt: '',
                    title: '',
                    position: index,
                    isFeatured: index === 0
                };
            });

        // Get banner images
        let bannerImages = [];
        if (request.body.bannerimages && Array.isArray(request.body.bannerimages) && request.body.bannerimages.length > 0) {
            bannerImages = request.body.bannerimages;
        } else if (bannerImage && bannerImage.length > 0) {
            bannerImages = bannerImage;
        }

        // Handle pricing - support both new structure and legacy
        let pricingData = {};
        if (request.body.pricing && typeof request.body.pricing === 'object') {
            pricingData = {
                regularPrice: request.body.pricing.regularPrice || request.body.oldPrice || request.body.price || 0,
                salePrice: request.body.pricing.salePrice || null,
                price: request.body.pricing.salePrice || request.body.pricing.regularPrice || request.body.price || request.body.oldPrice || 0,
                currency: request.body.pricing.currency || request.body.currency || 'USD',
                onSale: request.body.pricing.onSale || (request.body.pricing.salePrice && request.body.pricing.salePrice < request.body.pricing.regularPrice),
                taxStatus: request.body.pricing.taxStatus || 'taxable',
                taxClass: request.body.pricing.taxClass || 'standard'
            };
        } else {
            pricingData = {
                regularPrice: request.body.oldPrice || request.body.price || 0,
                salePrice: request.body.oldPrice && request.body.price && request.body.price < request.body.oldPrice ? request.body.price : null,
                price: request.body.price || request.body.oldPrice || 0,
                currency: request.body.currency || 'USD',
                onSale: request.body.oldPrice && request.body.price && request.body.price < request.body.oldPrice,
                taxStatus: 'taxable',
                taxClass: 'standard'
            };
        }

        // Handle inventory - support both new structure and legacy
        let inventoryData = {};
        if (request.body.inventory && typeof request.body.inventory === 'object') {
            inventoryData = {
                stock: request.body.inventory.endlessStock ? 999999 : (request.body.inventory.stock || request.body.countInStock || 0),
                stockStatus: request.body.inventory.endlessStock ? 'in_stock' : (request.body.inventory.stockStatus || ((request.body.inventory.stock || request.body.countInStock || 0) > 0 ? 'in_stock' : 'out_of_stock')),
                endlessStock: request.body.inventory.endlessStock || false,
                manageStock: request.body.inventory.manageStock !== false,
                allowBackorders: request.body.inventory.allowBackorders || 'no',
                lowStockThreshold: request.body.inventory.lowStockThreshold || 5,
                soldIndividually: request.body.inventory.soldIndividually || false
            };
        } else {
            inventoryData = {
                stock: request.body.countInStock || 0,
                stockStatus: (request.body.countInStock || 0) > 0 ? 'in_stock' : 'out_of_stock',
                manageStock: true,
                allowBackorders: 'no',
                lowStockThreshold: 5,
                soldIndividually: false
            };
        }

        // Handle shipping
        let shippingData = {};
        if (request.body.shipping && typeof request.body.shipping === 'object') {
            shippingData = {
                weight: request.body.shipping.weight || null,
                weightUnit: request.body.shipping.weightUnit || 'kg',
                dimensions: request.body.shipping.dimensions || {
                    length: null,
                    width: null,
                    height: null,
                    unit: 'cm'
                },
                shippingClass: request.body.shipping.shippingClass || 'standard',
                freeShipping: request.body.shipping.freeShipping || false
            };
        }

        // Handle SEO - support both new structure and legacy
        let seoData = {};
        if (request.body.seo && typeof request.body.seo === 'object') {
            seoData = {
                metaTitle: request.body.seo.metaTitle || request.body.name || '',
                metaDescription: request.body.seo.metaDescription || request.body.description?.substring(0, 160) || '',
                metaKeywords: request.body.seo.metaKeywords || [],
                slug: request.body.seo.slug || null
            };
        } else {
            seoData = {
                metaTitle: request.body.metaTitle || request.body.name || '',
                metaDescription: request.body.metaDescription || request.body.description?.substring(0, 160) || '',
                metaKeywords: request.body.metaKeywords || [],
                slug: request.body.slug || null
            };
        }

        // Build product data with backward compatibility
        let productData = {
            name: request.body.name,
            description: request.body.description,
            shortDescription: request.body.shortDescription || '',
            brand: request.body.brand || '',
            category: request.body.category || request.body.catId || (request.body.categories && request.body.categories.length > 0 ? request.body.categories[0] : null),
            categories: request.body.categories || (request.body.category || request.body.catId ? [request.body.category || request.body.catId] : []),
            catName: request.body.catName || '',
            catId: request.body.catId || '',
            subCatId: request.body.subCatId || '',
            subCat: request.body.subCat || '',
            thirdsubCat: request.body.thirdsubCat || '',
            thirdsubCatId: request.body.thirdsubCatId || '',
            isFeatured: request.body.isFeatured || false,
            bannerimages: bannerImages,
            bannerTitleName: request.body.bannerTitleName || '',
            isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner || false,
            bannerLink: request.body.bannerLink || '',
            bannerButtonLink: request.body.bannerButtonLink || '',
            bannerButtonText: request.body.bannerButtonText || 'SHOP NOW',
            productRam: request.body.productRam || [],
            size: request.body.size || [],
            productWeight: request.body.productWeight || [],
            // New structure
            productType: request.body.productType || 'simple',
            status: request.body.status || 'draft',
            visibility: request.body.visibility || 'visible',
            // Images in new format
            images: imagesFormatted,
            // Pricing (new structure)
            pricing: pricingData,
            // Inventory (new structure)
            inventory: inventoryData,
            // Shipping (new structure)
            shipping: Object.keys(shippingData).length > 0 ? shippingData : undefined,
            // Tags
            tags: request.body.tags || [],
            // Attributes and Variations (for variable products)
            // Normalize attributes to ensure proper structure
            attributes: (request.body.attributes || []).map(attr => ({
                attributeId: attr.attributeId || null, // Optional
                name: attr.name,
                slug: attr.slug || attr.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                values: (attr.values || []).map(val => ({
                    valueId: val.valueId || null, // Optional
                    label: val.label || val,
                    slug: val.slug || (val.label || val).toLowerCase().replace(/[^a-z0-9]+/g, '-')
                })),
                visible: attr.visible !== false,
                variation: attr.variation !== false
            })),
            // Normalize variations to ensure proper structure
            variations: (request.body.variations || []).map(variation => {
                // Validate that at least one price field exists and is > 0
                const regularPrice = variation.regularPrice && variation.regularPrice > 0 
                    ? Number(variation.regularPrice) 
                    : (variation.price && variation.price > 0 ? Number(variation.price) : null);
                const salePrice = variation.salePrice && variation.salePrice > 0 
                    ? Number(variation.salePrice) 
                    : null;
                
                // Ensure we have a valid price - don't default to 0
                if (!regularPrice && !salePrice) {
                    throw new Error(`Variation must have a valid price (regularPrice or price). Variation attributes: ${JSON.stringify(variation.attributes || [])}`);
                }
                
                // Calculate current price (sale price if active, otherwise regular price)
                let currentPrice = regularPrice;
                if (salePrice && regularPrice && salePrice < regularPrice) {
                    // Check if sale is active
                    const now = new Date();
                    const saleStart = variation.saleStartDate ? new Date(variation.saleStartDate) : null;
                    const saleEnd = variation.saleEndDate ? new Date(variation.saleEndDate) : null;
                    const isSaleActive = (!saleStart || saleStart <= now) && (!saleEnd || saleEnd >= now);
                    
                    if (isSaleActive) {
                        currentPrice = salePrice;
                    }
                }
                
                return {
                    ...variation,
                    // Ensure required fields have valid values
                    regularPrice: regularPrice || currentPrice,
                    price: currentPrice,
                    salePrice: salePrice || null,
                    stock: variation.endlessStock ? 999999 : (variation.stock || 0),
                    stockStatus: variation.endlessStock ? 'in_stock' : (variation.stockStatus || (variation.stock > 0 ? 'in_stock' : 'out_of_stock')),
                    manageStock: variation.manageStock !== false,
                    endlessStock: variation.endlessStock || false,
                    image: variation.image || (variation.images && variation.images.length > 0 ? variation.images[0] : ''), // Legacy field
                    images: variation.images && Array.isArray(variation.images) ? variation.images : (variation.image ? [variation.image] : []), // New images array
                    weight: variation.weight || null,
                    weightUnit: variation.weightUnit || 'kg',
                    dimensions: variation.dimensions ? {
                        length: variation.dimensions.length || null,
                        width: variation.dimensions.width || null,
                        height: variation.dimensions.height || null,
                        unit: variation.dimensions.unit || 'cm'
                    } : null,
                    isActive: variation.isActive !== false,
                    isDefault: variation.isDefault || false,
                // Normalize variation attributes to ensure proper structure
                attributes: (variation.attributes || []).map(attr => ({
                    name: attr.name || attr,
                    slug: attr.slug || (attr.name || attr).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    value: attr.value || attr.label || attr,
                    valueSlug: attr.valueSlug || (attr.value || attr.label || attr).toLowerCase().replace(/[^a-z0-9]+/g, '-')
                }))
                };
            }),
            // Legacy fields for backward compatibility
            price: pricingData.price,
            oldPrice: pricingData.regularPrice,
            countInStock: inventoryData.stock,
            rating: request.body.rating || 0,
            discount: request.body.discount || null,
            currency: pricingData.currency,
            // SEO
            seo: seoData,
            // SKU
            sku: request.body.sku || null,
            barcode: request.body.barcode || null
        };

        // NEW: Ensure attributes are populated for variable products
        if (productData.productType === 'variable' || productData.type === 'variable') {
            productData = ensureAttributesFromVariations(productData);

            // Validate that we have attributes
            if (!productData.attributes || productData.attributes.length === 0) {
                return response.status(400).json({
                    error: true,
                    success: false,
                    message: 'Variable products must have at least one attribute'
                });
            }

            // Validate that we have variations
            if (!productData.variations || productData.variations.length === 0) {
                return response.status(400).json({
                    error: true,
                    success: false,
                    message: 'Variable products must have at least one variation'
                });
            }
        }

        // Validate that we have at least one image
        if (imagesFormatted.length === 0) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "At least one product image is required"
            });
        }

        let product = new ProductModel(productData);
        product = await product.save();

        console.log('Product created with images:', product.images?.length || 0, 'images');

        if (!product) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Product Not created"
            });
        }


        imagesArr = [];

        return response.status(200).json({
            message: "Product Created successfully",
            error: false,
            success: true,
            product: product
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//get all products
export async function getAllProducts(request, response) {
    try {
        const { page = 1, limit = 50, status } = request.query;
        
        // Build query filters
        const query = {};
        
        // Filter by status (default to published for public, allow all for admin)
        if (status) {
            query.status = status;
        } else if (!request.userId || request.user?.role !== 'ADMIN') {
            // Public users only see published products
            query.status = 'published';
        }

        const totalProducts = await ProductModel.find(query);
        const products = await ProductModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await ProductModel.countDocuments(query);

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCount: totalProducts?.length,
            totalProducts: totalProducts
        });

    } catch (error) {
        console.error('Get all products error:', error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


//get all products by category id
export async function getAllProductsByCatId(request, response) {
    try {
        const categoryId = request.params.id;

        // Validate category ID
        if (!categoryId || categoryId === 'undefined' || categoryId === 'null') {
            return response.status(400).json({
                message: "Category ID is required",
                success: false,
                error: true
            });
        }

        // Validate ObjectId format if using MongoDB ObjectId
        const mongoose = (await import('mongoose')).default;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return response.status(400).json({
                message: "Invalid category ID format",
                success: false,
                error: true
            });
        }

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;

        // Build query - support both single category and multiple categories
        // Only show published and approved products to public users
        const query = {
            $and: [
                {
                    $or: [
                        { catId: categoryId },
                        { category: categoryId },
                        { categories: { $in: [categoryId] } } // Use $in for array field
                    ]
                },
                { status: 'published' },
                { 
                    $or: [
                        { approvalStatus: 'APPROVED' },
                        { approvalStatus: { $exists: false } },
                        { productOwnerType: { $ne: 'VENDOR' } }
                    ]
                }
            ]
        };

        const totalPosts = await ProductModel.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages && totalPages > 0) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        // Support both single category and multiple categories
        const products = await ProductModel.find(query)
            .populate("category")
            .populate("categories")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        return response.status(200).json({
            error: false,
            success: true,
            products: products || [],
            totalPages: totalPages,
            page: page,
        });

    } catch (error) {
        console.error('getAllProductsByCatId error:', error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


//get all products by category name
export async function getAllProductsByCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }


        const products = await ProductModel.find({
            catName: request.query.catName
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//get all products by sub category id
export async function getAllProductsBySubCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;

        // Only show published and approved products
        const query = {
            subCatId: request.params.id,
            status: 'published',
            $or: [
                { approvalStatus: 'APPROVED' },
                { approvalStatus: { $exists: false } },
                { productOwnerType: { $ne: 'VENDOR' } }
            ]
        };

        const totalPosts = await ProductModel.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages && totalPages > 0) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find(query).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by sub category name
export async function getAllProductsBySubCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }


        const products = await ProductModel.find({
            subCat: request.query.subCat
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}




//get all products by sub category id
export async function getAllProductsByThirdLavelCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            thirdsubCatId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by sub category name
export async function getAllProductsByThirdLavelCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }


        const products = await ProductModel.find({
            thirdsubCat: request.query.thirdsubCat
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by price

export async function getAllProductsByPrice(request, response) {
    let productList = [];

    if (request.query.catId !== "" && request.query.catId !== undefined) {
        const productListArr = await ProductModel.find({
            catId: request.query.catId,
        }).populate("category");

        productList = productListArr;
    }

    if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
        const productListArr = await ProductModel.find({
            subCatId: request.query.subCatId,
        }).populate("category");

        productList = productListArr;
    }


    if (request.query.thirdsubCatId !== "" && request.query.thirdsubCatId !== undefined) {
        const productListArr = await ProductModel.find({
            thirdsubCatId: request.query.thirdsubCatId,
        }).populate("category");

        productList = productListArr;
    }



    const filteredProducts = productList.filter((product) => {
        if (request.query.minPrice && product.price < parseInt(+request.query.minPrice)) {
            return false;
        }
        if (request.query.maxPrice && product.price > parseInt(+request.query.maxPrice)) {
            return false;
        }
        return true;
    });

    return response.status(200).json({
        error: false,
        success: true,
        products: filteredProducts,
        totalPages: 0,
        page: 0,
    });

}



//get all products by rating
export async function getAllProductsByRating(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }

        console.log(request.query.subCatId)

        let products = [];

        if (request.query.catId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                catId: request.query.catId,

            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        if (request.query.subCatId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                subCatId: request.query.subCatId,

            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }


        if (request.query.thirdsubCatId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                thirdsubCatId: request.query.thirdsubCatId,

            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }


        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products count

export async function getProductsCount(request, response) {
    try {
        const productsCount = await ProductModel.countDocuments();

        if (!productsCount) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            productCount: productsCount
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//get all features products
export async function getAllFeaturedProducts(request, response) {
    try {
        // Only show published and approved featured products
        const products = await ProductModel.find({
            isFeatured: true,
            status: 'published',
            $or: [
                { approvalStatus: 'APPROVED' },
                { approvalStatus: { $exists: false } },
                { productOwnerType: { $ne: 'VENDOR' } }
            ]
        }).populate("category");

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


/**
 * Get all products currently on sale
 * GET /api/product/getSaleProducts
 * Works with both legacy (oldPrice/price) and new (pricing.regularPrice/salePrice) structures
 */
export async function getSaleProducts(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const limit = parseInt(request.query.limit) || 12;
        const skip = (page - 1) * limit;

        // First, get all published products
        const baseQuery = {
            status: 'published'
        };

        // Fetch more products than needed to filter
        let products = await ProductModel.find(baseQuery)
            .populate("category")
            .sort({ createdAt: -1 })
            .limit(100);

        console.log(`📦 getSaleProducts: Found ${products.length} published products to check`);

        // Filter products that are actually on sale and calculate discounts
        const saleProducts = products
            .map(product => {
                const productObj = product.toObject();
                let discountPercentage = 0;
                let regularPrice = 0;
                let salePrice = 0;
                let isOnSale = false;

                // Method 1: Check pricing object (new structure)
                if (product.pricing?.onSale === true && product.pricing?.salePrice > 0) {
                    regularPrice = product.pricing.regularPrice || 0;
                    salePrice = product.pricing.salePrice || 0;
                    isOnSale = true;
                }
                // Method 2: Check pricing with regularPrice > salePrice
                else if (product.pricing?.regularPrice > 0 && product.pricing?.salePrice > 0) {
                    if (product.pricing.salePrice < product.pricing.regularPrice) {
                        regularPrice = product.pricing.regularPrice;
                        salePrice = product.pricing.salePrice;
                        isOnSale = true;
                    }
                }
                // Method 3: Check oldPrice and price (legacy structure)
                else if (product.oldPrice > 0 && product.price > 0) {
                    if (product.price < product.oldPrice) {
                        regularPrice = product.oldPrice;
                        salePrice = product.price;
                        isOnSale = true;
                    }
                }
                // Method 4: Check discount field
                else if (product.discount && product.discount > 0) {
                    discountPercentage = product.discount;
                    isOnSale = true;
                }
                // Method 5: Check variable product variations
                else if (product.productType === 'variable' && product.variations?.length > 0) {
                    const saleVariation = product.variations.find(v => 
                        v.salePrice > 0 && v.regularPrice > 0 && v.salePrice < v.regularPrice
                    );
                    if (saleVariation) {
                        regularPrice = saleVariation.regularPrice;
                        salePrice = saleVariation.salePrice;
                        isOnSale = true;
                    }
                }

                // Calculate discount percentage if not already set
                if (discountPercentage === 0 && regularPrice > 0 && salePrice > 0 && salePrice < regularPrice) {
                    discountPercentage = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
                }

                // Only include if actually on sale
                if (!isOnSale) {
                    return null;
                }

                return {
                    ...productObj,
                    discountPercentage,
                    isOnSale: true,
                    // Ensure price fields are populated for display
                    oldPrice: regularPrice || productObj.oldPrice,
                    price: salePrice || productObj.price
                };
            })
            .filter(Boolean);

        console.log(`🔥 getSaleProducts: ${saleProducts.length} products are on sale`);

        // Apply pagination
        const paginatedProducts = saleProducts.slice(skip, skip + limit);
        const totalProducts = saleProducts.length;
        const totalPages = Math.ceil(totalProducts / limit);

        return response.status(200).json({
            error: false,
            success: true,
            products: paginatedProducts,
            totalProducts,
            totalPages,
            currentPage: page,
            hasMore: page < totalPages
        });

    } catch (error) {
        console.error('Get sale products error:', error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

/**
 * Get active promotions/coupons for display
 * GET /api/product/getActivePromotions
 */
export async function getActivePromotions(request, response) {
    try {
        const now = new Date();
        
        // Import CouponModel dynamically to avoid circular dependency
        const CouponModel = (await import('../models/coupon.model.js')).default;
        
        // Get active coupons that can be publicly displayed
        const coupons = await CouponModel.find({
            isActive: true,
            startDate: { $lte: now },
            $or: [
                { endDate: null },
                { endDate: { $gte: now } }
            ],
            // Only show coupons without email restrictions (public coupons)
            allowedEmails: { $size: 0 }
        })
        .select('code description discountType discountAmount minimumAmount freeShipping endDate')
        .limit(10)
        .sort({ discountAmount: -1 });

        // Get count of products on sale
        const saleProductsCount = await ProductModel.countDocuments({
            status: 'published',
            $or: [
                { 'pricing.onSale': true },
                { $expr: { $lt: ['$price', '$oldPrice'] } },
                { discount: { $gt: 0 } }
            ]
        });

        return response.status(200).json({
            error: false,
            success: true,
            promotions: {
                coupons: coupons.map(c => ({
                    code: c.code,
                    description: c.description,
                    discountType: c.discountType,
                    discountAmount: c.discountAmount,
                    minimumAmount: c.minimumAmount,
                    freeShipping: c.freeShipping,
                    endsAt: c.endDate
                })),
                saleProductsCount,
                hasActiveSale: saleProductsCount > 0
            }
        });

    } catch (error) {
        console.error('Get active promotions error:', error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//get all features products have banners
export async function getAllProductsBanners(request, response) {
    try {
        // Only show published and approved products for banners
        const products = await ProductModel.find({
            isDisplayOnHomeBanner: true,
            status: 'published',
            $or: [
                { approvalStatus: 'APPROVED' },
                { approvalStatus: { $exists: false } },
                { productOwnerType: { $ne: 'VENDOR' } }
            ]
        }).populate("category");

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//delete product
export async function deleteProduct(request, response) {

    const product = await ProductModel.findById(request.params.id).populate("category");

    if (!product) {
        return response.status(404).json({
            message: "Product Not found",
            error: true,
            success: false
        })
    }

    const images = product.images;

    // Helper function to safely extract image URL
    const getImageUrl = (imgUrl) => {
        if (!imgUrl) return '';
        if (typeof imgUrl === 'string') return imgUrl;
        if (imgUrl && typeof imgUrl === 'object' && imgUrl.url) return imgUrl.url;
        if (Array.isArray(imgUrl) && imgUrl.length > 0) {
            return typeof imgUrl[0] === 'string' ? imgUrl[0] : imgUrl[0]?.url || '';
        }
        return '';
    };

    if (images && Array.isArray(images)) {
        for (let img of images) {
            const imageUrl = getImageUrl(img);
            
            if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('/')) {
                try {
                    const urlArr = imageUrl.split("/");
                    const image = urlArr[urlArr.length - 1];

                    if (image) {
                        const imageName = image.split(".")[0];

                        if (imageName) {
                            cloudinary.uploader.destroy(imageName, (error, result) => {
                                if (error) {
                                    console.error('Error deleting image from Cloudinary:', error);
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error processing image URL:', error, 'Image:', img);
                }
            }
        }
    }

    const deletedProduct = await ProductModel.findByIdAndDelete(request.params.id);

    if (!deletedProduct) {
        response.status(404).json({
            message: "Product not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Product Deleted!",
    });
}


//delete multiple products
export async function deleteMultipleProduct(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }


    // Helper function to safely extract image URL
    const getImageUrl = (imgUrl) => {
        if (!imgUrl) return '';
        if (typeof imgUrl === 'string') return imgUrl;
        if (imgUrl && typeof imgUrl === 'object' && imgUrl.url) return imgUrl.url;
        if (Array.isArray(imgUrl) && imgUrl.length > 0) {
            return typeof imgUrl[0] === 'string' ? imgUrl[0] : imgUrl[0]?.url || '';
        }
        return '';
    };

    for (let i = 0; i < ids?.length; i++) {
        const product = await ProductModel.findById(ids[i]);

        if (!product) continue;

        const images = product.images;

        if (images && Array.isArray(images)) {
            for (let img of images) {
                const imageUrl = getImageUrl(img);
                
                if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('/')) {
                    try {
                        const urlArr = imageUrl.split("/");
                        const image = urlArr[urlArr.length - 1];

                        if (image) {
                            const imageName = image.split(".")[0];

                            if (imageName) {
                                cloudinary.uploader.destroy(imageName, (error, result) => {
                                    if (error) {
                                        console.error('Error deleting image from Cloudinary:', error);
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Error processing image URL:', error, 'Image:', img);
                    }
                }
            }
        }
    }

    try {
        await ProductModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "Product delete successfully",
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

//get single product 
export async function getProduct(request, response) {
    try {
        // Fetch product with all fields including variations and attributes
        // Variations and attributes are embedded documents, so they're automatically included
        const product = await ProductModel.findById(request.params.id)
            .populate("category")
            .populate("vendor", "storeName storeSlug");

        if (!product) {
            return response.status(404).json({
                message: "The product is not found",
                error: true,
                success: false
            })
        }

        // Check if product is available for public viewing
        // Vendor products must be approved AND published
        const isVendorProduct = product.productOwnerType === 'VENDOR';
        const isApproved = product.approvalStatus === 'APPROVED' || !product.approvalStatus;
        const isPublished = product.status === 'published';
        
        if (isVendorProduct && (!isApproved || !isPublished)) {
            // Product is not available for public viewing
            return response.status(404).json({
                message: "This product is not available",
                error: true,
                success: false
            })
        }

        // Convert to plain object to ensure all fields are serialized
        const productObj = product.toObject ? product.toObject() : product;

        // Debug logging
        console.log('getProduct - Returning product:', {
            id: productObj._id,
            name: productObj.name,
            productType: productObj.productType,
            variationsCount: productObj.variations?.length || 0,
            attributesCount: productObj.attributes?.length || 0,
            hasVariations: !!productObj.variations && productObj.variations.length > 0
        });

        return response.status(200).json({
            error: false,
            success: true,
            product: productObj
        })

    } catch (error) {
        console.error('getProduct error:', error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//delete images
export async function removeImageFromCloudinary(request, response) {
    try {
        const imgUrl = request.query.img;

        if (!imgUrl) {
            return response.status(400).json({
                success: false,
                error: true,
                message: 'Image URL is required'
            });
        }

        // Helper function to safely extract image URL
        const getImageUrl = (imgUrl) => {
            if (!imgUrl) return '';
            if (typeof imgUrl === 'string') return imgUrl;
            if (imgUrl && typeof imgUrl === 'object' && imgUrl.url) return imgUrl.url;
            if (Array.isArray(imgUrl) && imgUrl.length > 0) {
                return typeof imgUrl[0] === 'string' ? imgUrl[0] : imgUrl[0]?.url || '';
            }
            return '';
        };

        const imageUrl = getImageUrl(imgUrl);

        if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes('/')) {
            return response.status(400).json({
                success: false,
                error: true,
                message: 'Invalid image URL format'
            });
        }

        const urlArr = imageUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        if (!image) {
            return response.status(400).json({
                success: false,
                error: true,
                message: 'Could not extract image name from URL'
            });
        }

        const imageName = image.split(".")[0];

        if (imageName) {
            const res = await cloudinary.uploader.destroy(
                imageName,
                (error, result) => {
                    if (error) {
                        console.error('Error deleting image from Cloudinary:', error);
                    }
                }
            );

            if (res) {
                return response.status(200).json({
                    success: true,
                    error: false,
                    message: 'Image deleted successfully',
                    result: res
                });
            }
        }

        return response.status(400).json({
            success: false,
            error: true,
            message: 'Could not extract image name'
        });
    } catch (error) {
        console.error('Error in removeImageFromCloudinary:', error);
        return response.status(500).json({
            success: false,
            error: true,
            message: 'Error deleting image',
            details: error.message
        });
    }
}


//updated product 
export async function updateProduct(request, response) {
    try {
        const productId = request.params.id;
        
        // Check if product exists
        const existingProduct = await ProductModel.findById(productId);
        if (!existingProduct) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        // Handle images - transform to new format if needed
        let imagesFormatted = [];
        let featuredImageUrl = '';
        
        // Check if images array is explicitly provided (even if empty)
        if (request.body.images !== undefined && Array.isArray(request.body.images)) {
            // Filter out any null/undefined/empty entries
            const validImages = request.body.images.filter(img => img != null && img !== '');
            
            imagesFormatted = validImages.map((img, index) => {
                // If already an object, use it
                if (typeof img === 'object' && img.url) {
                    return {
                        url: img.url,
                        alt: img.alt || '',
                        title: img.title || '',
                        position: img.position !== undefined ? img.position : index,
                        isFeatured: img.isFeatured !== undefined ? img.isFeatured : index === 0
                    };
                }
                // If string URL, convert to object
                return {
                    url: typeof img === 'string' ? img : '',
                    alt: '',
                    title: '',
                    position: index,
                    isFeatured: index === 0
                };
            }).filter(img => img.url && img.url !== ''); // Filter out any with empty URLs
            
            // Set featuredImage from first image
            if (imagesFormatted.length > 0) {
                featuredImageUrl = imagesFormatted[0].url;
            } else {
                // No images - clear featuredImage
                featuredImageUrl = '';
            }
        } else {
            // Images not provided in request - keep existing or use featuredImage from request
            if (request.body.featuredImage !== undefined) {
                featuredImageUrl = request.body.featuredImage || '';
            } else if (existingProduct.images && existingProduct.images.length > 0) {
                // Use existing first image as featured
                const firstImg = existingProduct.images[0];
                featuredImageUrl = typeof firstImg === 'string' ? firstImg : (firstImg?.url || '');
            }
        }
        
        // Find and delete removed images from Cloudinary
        if (existingProduct.images && Array.isArray(existingProduct.images)) {
            const existingImageUrls = existingProduct.images.map(img => {
                if (typeof img === 'string') return img;
                if (typeof img === 'object' && img.url) return img.url;
                return '';
            }).filter(url => url !== '');
            
            const newImageUrls = imagesFormatted.map(img => img.url).filter(url => url !== '');
            
            // Find images that were removed
            const removedImages = existingImageUrls.filter(url => !newImageUrls.includes(url));
            
            // Delete removed images from Cloudinary
            for (const imageUrl of removedImages) {
                if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('/')) {
                    try {
                        const urlArr = imageUrl.split("/");
                        const image = urlArr[urlArr.length - 1];
                        if (image) {
                            const imageName = image.split(".")[0];
                            if (imageName) {
                                cloudinary.uploader.destroy(imageName, (error, result) => {
                                    if (error) {
                                        console.error('Error deleting removed image from Cloudinary:', error);
                                    } else {
                                        console.log('Successfully deleted removed image from Cloudinary:', imageName);
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Error processing removed image URL:', error, 'Image:', imageUrl);
                    }
                }
            }
        }

        // Handle banner images
        let bannerImages = [];
        if (request.body.bannerimages && Array.isArray(request.body.bannerimages)) {
            bannerImages = request.body.bannerimages.filter(img => img != null && img !== '');
        }

        // Build update data - include all fields
        let updateData = {
            name: request.body.name,
            description: request.body.description,
            shortDescription: request.body.shortDescription || '',
            brand: request.body.brand || '',
            // Categories
            category: request.body.category || request.body.catId || (request.body.categories && request.body.categories.length > 0 ? request.body.categories[0] : undefined),
            categories: request.body.categories || (request.body.category || request.body.catId ? [request.body.category || request.body.catId] : undefined),
            catId: request.body.catId || '',
            catName: request.body.catName || '',
            subCat: request.body.subCat || '',
            subCatId: request.body.subCatId || '',
            thirdsubCat: request.body.thirdsubCat || '',
            thirdsubCatId: request.body.thirdsubCatId || '',
            // Status
            status: request.body.status || existingProduct.status || 'draft',
            visibility: request.body.visibility || existingProduct.visibility || 'visible',
            isFeatured: request.body.isFeatured !== undefined ? request.body.isFeatured : existingProduct.isFeatured || false,
            // Images - always update (even if empty array)
            images: request.body.images !== undefined ? imagesFormatted : undefined,
            featuredImage: featuredImageUrl || (request.body.featuredImage !== undefined ? request.body.featuredImage : undefined),
            bannerimages: bannerImages.length > 0 ? bannerImages : undefined,
            bannerTitleName: request.body.bannerTitleName || '',
            isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner || false,
            bannerLink: request.body.bannerLink || '',
            bannerButtonLink: request.body.bannerButtonLink || '',
            bannerButtonText: request.body.bannerButtonText || 'SHOP NOW',
            // Identification
            sku: request.body.sku || null,
            barcode: request.body.barcode || null,
            // Product Type
            productType: request.body.productType || existingProduct.productType || 'simple',
            // Legacy fields for backward compatibility
            price: request.body.price !== undefined ? request.body.price : (request.body.pricing?.salePrice || request.body.pricing?.regularPrice || existingProduct.price),
            oldPrice: request.body.oldPrice !== undefined ? request.body.oldPrice : (request.body.pricing?.regularPrice || existingProduct.oldPrice),
            countInStock: request.body.countInStock !== undefined ? request.body.countInStock : (request.body.inventory?.stock || existingProduct.countInStock),
            rating: request.body.rating !== undefined ? request.body.rating : existingProduct.rating || 0,
            // Legacy arrays
            productRam: request.body.productRam || [],
            size: request.body.size || [],
            productWeight: request.body.productWeight || [],
            // Tags
            tags: request.body.tags || [],
        };

        // Update pricing structure (new format)
        if (request.body.pricing || request.body.price !== undefined || request.body.oldPrice !== undefined) {
            updateData.pricing = {
                regularPrice: request.body.pricing?.regularPrice || request.body.oldPrice || request.body.price || existingProduct.pricing?.regularPrice || 0,
                salePrice: request.body.pricing?.salePrice || (request.body.oldPrice && request.body.price && request.body.price < request.body.oldPrice ? request.body.price : null),
                price: request.body.pricing?.price || request.body.price || request.body.pricing?.salePrice || request.body.pricing?.regularPrice || request.body.oldPrice || 0,
                currency: request.body.pricing?.currency || request.body.currency || existingProduct.pricing?.currency || 'USD',
                onSale: request.body.pricing?.onSale !== undefined ? request.body.pricing.onSale : (request.body.pricing?.salePrice && request.body.pricing.salePrice < request.body.pricing.regularPrice),
                taxStatus: request.body.pricing?.taxStatus || existingProduct.pricing?.taxStatus || 'taxable',
                taxClass: request.body.pricing?.taxClass || existingProduct.pricing?.taxClass || 'standard'
            };
        }

        // Update inventory structure (new format)
        if (request.body.inventory || request.body.countInStock !== undefined) {
            updateData.inventory = {
                stock: request.body.inventory?.endlessStock ? 999999 : (request.body.inventory?.stock || request.body.countInStock !== undefined ? request.body.countInStock : existingProduct.inventory?.stock || 0),
                stockStatus: request.body.inventory?.endlessStock ? 'in_stock' : (request.body.inventory?.stockStatus || ((request.body.inventory?.stock || request.body.countInStock || 0) > 0 ? 'in_stock' : 'out_of_stock')),
                endlessStock: request.body.inventory?.endlessStock !== undefined ? request.body.inventory.endlessStock : (existingProduct.inventory?.endlessStock || false),
                manageStock: request.body.inventory?.manageStock !== undefined ? request.body.inventory.manageStock : (existingProduct.inventory?.manageStock !== undefined ? existingProduct.inventory.manageStock : true),
                allowBackorders: request.body.inventory?.allowBackorders || existingProduct.inventory?.allowBackorders || 'no',
                lowStockThreshold: request.body.inventory?.lowStockThreshold || existingProduct.inventory?.lowStockThreshold || 5,
                soldIndividually: request.body.inventory?.soldIndividually !== undefined ? request.body.inventory.soldIndividually : (existingProduct.inventory?.soldIndividually || false)
            };
        }

        // Update shipping structure
        if (request.body.shipping) {
            updateData.shipping = {
                weight: request.body.shipping.weight || null,
                weightUnit: request.body.shipping.weightUnit || 'kg',
                dimensions: request.body.shipping.dimensions || {
                    length: null,
                    width: null,
                    height: null,
                    unit: 'cm'
                },
                shippingClass: request.body.shipping.shippingClass || 'standard',
                freeShipping: request.body.shipping.freeShipping || false
            };
        }

        // Update SEO structure
        if (request.body.seo) {
            updateData.seo = {
                metaTitle: request.body.seo.metaTitle || '',
                metaDescription: request.body.seo.metaDescription || '',
                metaKeywords: request.body.seo.metaKeywords || [],
                slug: request.body.seo.slug || request.body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || existingProduct.seo?.slug || ''
            };
        }

        // Handle attributes and variations for variable products
        if (request.body.productType === 'variable' || request.body.type === 'variable' || updateData.productType === 'variable') {
            // Normalize attributes
            if (request.body.attributes && Array.isArray(request.body.attributes)) {
                updateData.attributes = request.body.attributes.map(attr => ({
                    attributeId: attr.attributeId || null,
                    name: attr.name,
                    slug: attr.slug || attr.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    values: (attr.values || []).map(val => ({
                        valueId: val.valueId || null,
                        label: val.label || val,
                        slug: val.slug || (val.label || val).toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    })),
                    visible: attr.visible !== false,
                    variation: attr.variation !== false
                }));
            }

            // Normalize variations
            if (request.body.variations && Array.isArray(request.body.variations)) {
                updateData.variations = request.body.variations.map(variation => {
                    // Validate that at least one price field exists and is > 0
                    const regularPrice = variation.regularPrice && variation.regularPrice > 0 
                        ? Number(variation.regularPrice) 
                        : (variation.price && variation.price > 0 ? Number(variation.price) : null);
                    const salePrice = variation.salePrice && variation.salePrice > 0 
                        ? Number(variation.salePrice) 
                        : null;
                    
                    // If updating existing variation, try to preserve existing price if new price is missing
                    if (!regularPrice && !salePrice) {
                        const existingVariation = existingProduct.variations?.find(v => 
                            v._id?.toString() === variation._id?.toString() || 
                            v.id?.toString() === variation._id?.toString()
                        );
                        if (existingVariation) {
                            const existingRegularPrice = existingVariation.regularPrice && existingVariation.regularPrice > 0 
                                ? Number(existingVariation.regularPrice) 
                                : (existingVariation.price && existingVariation.price > 0 ? Number(existingVariation.price) : null);
                            if (existingRegularPrice) {
                                return {
                                    ...variation,
                                    regularPrice: existingRegularPrice,
                                    price: existingRegularPrice,
                                    salePrice: existingVariation.salePrice && existingVariation.salePrice > 0 ? Number(existingVariation.salePrice) : null,
                                    stock: variation.endlessStock ? 999999 : (variation.stock !== undefined ? variation.stock : existingVariation.stock || 0),
                                    stockStatus: variation.endlessStock ? 'in_stock' : (variation.stockStatus || existingVariation.stockStatus || (variation.stock > 0 ? 'in_stock' : 'out_of_stock')),
                                    manageStock: variation.manageStock !== undefined ? variation.manageStock : existingVariation.manageStock !== false,
                                    endlessStock: variation.endlessStock !== undefined ? variation.endlessStock : (existingVariation.endlessStock || false),
                                    image: variation.image || (variation.images && variation.images.length > 0 ? variation.images[0] : '') || existingVariation.image || '', // Legacy field
                                    images: variation.images && Array.isArray(variation.images) && variation.images.length > 0 
                                        ? variation.images 
                                        : (existingVariation.images && Array.isArray(existingVariation.images) && existingVariation.images.length > 0 
                                            ? existingVariation.images 
                                            : (variation.image ? [variation.image] : (existingVariation.image ? [existingVariation.image] : []))), // New images array
                                    weight: variation.weight !== undefined ? (variation.weight ? parseFloat(variation.weight) : null) : (existingVariation.weight || null),
                                    weightUnit: variation.weightUnit || existingVariation.weightUnit || 'kg',
                                    dimensions: variation.dimensions ? {
                                        length: variation.dimensions.length ? parseFloat(variation.dimensions.length) : null,
                                        width: variation.dimensions.width ? parseFloat(variation.dimensions.width) : null,
                                        height: variation.dimensions.height ? parseFloat(variation.dimensions.height) : null,
                                        unit: variation.dimensions.unit || 'cm'
                                    } : (existingVariation.dimensions || null),
                                    isActive: variation.isActive !== undefined ? variation.isActive : existingVariation.isActive !== false,
                                    isDefault: variation.isDefault || existingVariation.isDefault || false,
                                    attributes: (variation.attributes || existingVariation.attributes || []).map(attr => ({
                                        name: attr.name || attr,
                                        slug: attr.slug || (attr.name || attr).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                        value: attr.value || attr.label || attr,
                                        valueSlug: attr.valueSlug || (attr.value || attr.label || attr).toLowerCase().replace(/[^a-z0-9]+/g, '-')
                                    }))
                                };
                            }
                        }
                        // If no existing price found, skip this variation (don't add with 0 price)
                        console.warn(`Skipping variation with no valid price. Variation attributes: ${JSON.stringify(variation.attributes || [])}`);
                        return null;
                    }
                    
                    // Calculate current price (sale price if active, otherwise regular price)
                    let currentPrice = regularPrice;
                    if (salePrice && regularPrice && salePrice < regularPrice) {
                        // Check if sale is active
                        const now = new Date();
                        const saleStart = variation.saleStartDate ? new Date(variation.saleStartDate) : null;
                        const saleEnd = variation.saleEndDate ? new Date(variation.saleEndDate) : null;
                        const isSaleActive = (!saleStart || saleStart <= now) && (!saleEnd || saleEnd >= now);
                        
                        if (isSaleActive) {
                            currentPrice = salePrice;
                        }
                    }
                    
                    return {
                        ...variation,
                        // Ensure required fields have valid values
                        regularPrice: regularPrice || currentPrice,
                        price: currentPrice,
                        salePrice: salePrice || null,
                    stock: variation.endlessStock ? 999999 : (variation.stock || 0),
                    stockStatus: variation.endlessStock ? 'in_stock' : (variation.stockStatus || (variation.stock > 0 ? 'in_stock' : 'out_of_stock')),
                    manageStock: variation.manageStock !== false,
                    endlessStock: variation.endlessStock || false,
                    image: variation.image || (variation.images && variation.images.length > 0 ? variation.images[0] : ''), // Legacy field
                    images: variation.images && Array.isArray(variation.images) ? variation.images : (variation.image ? [variation.image] : []), // New images array
                    weight: variation.weight || null,
                    weightUnit: variation.weightUnit || 'kg',
                    dimensions: variation.dimensions ? {
                        length: variation.dimensions.length || null,
                        width: variation.dimensions.width || null,
                        height: variation.dimensions.height || null,
                        unit: variation.dimensions.unit || 'cm'
                    } : null,
                    isActive: variation.isActive !== false,
                    isDefault: variation.isDefault || false,
                        attributes: (variation.attributes || []).map(attr => ({
                            name: attr.name || attr,
                            slug: attr.slug || (attr.name || attr).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            value: attr.value || attr.label || attr,
                            valueSlug: attr.valueSlug || (attr.value || attr.label || attr).toLowerCase().replace(/[^a-z0-9]+/g, '-')
                        }))
                    };
                }).filter(v => v !== null); // Remove variations with no valid price
            }

            // Ensure attributes are populated from variations if needed
            updateData = ensureAttributesFromVariations(updateData);
        }

        // Handle empty images array - explicitly set to empty array and clear featuredImage
        if (request.body.images !== undefined && Array.isArray(request.body.images) && imagesFormatted.length === 0) {
            updateData.images = [];
            updateData.featuredImage = '';
        }
        
        // Remove undefined fields to avoid overwriting with undefined
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        // Use findByIdAndUpdate with runValidators and return updated document
        const product = await ProductModel.findByIdAndUpdate(
            productId,
            updateData,
            { 
                new: true, 
                runValidators: true,
                setDefaultsOnInsert: false
            }
        );

        if (!product) {
            return response.status(404).json({
                message: "Product not found or could not be updated",
                error: true,
                success: false
            });
        }

        imagesArr = [];

        return response.status(200).json({
            message: "Product updated successfully",
            error: false,
            success: true,
            product: product
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}




export async function createProductRAMS(request, response) {
    try {
        let productRAMS = new ProductRAMSModel({
            name: request.body.name
        })

        productRAMS = await productRAMS.save();

        if (!productRAMS) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Product RAMS Not created"
            });
        }

        return response.status(200).json({
            message: "Product RAMS Created successfully",
            error: false,
            success: true,
            product: productRAMS
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function deleteProductRAMS(request, response) {
    const productRams = await ProductRAMSModel.findById(request.params.id);

    if (!productRams) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    const deletedProductRams = await ProductRAMSModel.findByIdAndDelete(request.params.id);

    if (!deletedProductRams) {
        response.status(404).json({
            message: "Item not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Product Ram Deleted!",
    });
}

export async function updateProductRam(request, response) {

    try {

        const productRam = await ProductRAMSModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
            },
            { new: true }
        );


        if (!productRam) {
            return response.status(404).json({
                message: "the product Ram can not be updated!",
                status: false,
            });
        }

        return response.status(200).json({
            message: "The product Ram is updated",
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


export async function getProductRams(request, response) {

    try {

        const productRam = await ProductRAMSModel.find();

        if (!productRam) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productRam
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getProductRamsById(request, response) {

    try {

        const productRam = await ProductRAMSModel.findById(request.params.id);

        if (!productRam) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productRam
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function createProductWEIGHT(request, response) {
    try {
        let productWeight = new ProductWEIGHTModel({
            name: request.body.name
        })

        productWeight = await productWeight.save();

        if (!productWeight) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Product WEIGHT Not created"
            });
        }

        return response.status(200).json({
            message: "Product WEIGHT Created successfully",
            error: false,
            success: true,
            product: productWeight
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function deleteProductWEIGHT(request, response) {
    const productWeight = await ProductWEIGHTModel.findById(request.params.id);

    if (!productWeight) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    const deletedProductWeight = await ProductWEIGHTModel.findByIdAndDelete(request.params.id);

    if (!deletedProductWeight) {
        response.status(404).json({
            message: "Item not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Product Weight Deleted!",
    });
}


export async function updateProductWeight(request, response) {

    try {

        const productWeight = await ProductWEIGHTModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
            },
            { new: true }
        );


        if (!productWeight) {
            return response.status(404).json({
                message: "the product weight can not be updated!",
                status: false,
            });
        }

        return response.status(200).json({
            message: "The product weight is updated",
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


export async function getProductWeight(request, response) {

    try {

        const productWeight = await ProductWEIGHTModel.find();

        if (!productWeight) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productWeight
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getProductWeightById(request, response) {

    try {

        const productWeight = await ProductWEIGHTModel.findById(request.params.id);

        if (!productWeight) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productWeight
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function createProductSize(request, response) {
    try {
        let productSize = new ProductSIZEModel({
            name: request.body.name
        })

        productSize = await productSize.save();

        if (!productSize) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Product size Not created"
            });
        }

        return response.status(200).json({
            message: "Product size Created successfully",
            error: false,
            success: true,
            product: productSize
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function deleteProductSize(request, response) {
    const productSize = await ProductSIZEModel.findById(request.params.id);

    if (!productSize) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    const deletedProductSize = await ProductSIZEModel.findByIdAndDelete(request.params.id);

    if (!deletedProductSize) {
        response.status(404).json({
            message: "Item not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Product size Deleted!",
    });
}


export async function updateProductSize(request, response) {

    try {

        const productSize = await ProductSIZEModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
            },
            { new: true }
        );


        if (!productSize) {
            return response.status(404).json({
                message: "the product size can not be updated!",
                status: false,
            });
        }

        return response.status(200).json({
            message: "The product size is updated",
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


export async function getProductSize(request, response) {

    try {

        const productSize = await ProductSIZEModel.find();

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productSize
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getProductSizeById(request, response) {

    try {

        const productSize = await ProductSIZEModel.findById(request.params.id);

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productSize
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function filters(request, response) {
    const { catId, subCatId, thirdsubCatId, minPrice, maxPrice, rating, brand, stockStatus, productType, page, limit } = request.body;

    const filters = {}

    if (catId?.length) {
        // Support both single category and multiple categories
        filters.$or = [
            { catId: { $in: catId } },
            { category: { $in: catId } },
            { categories: { $in: catId } }
        ];
    }

    if (subCatId?.length) {
        filters.subCatId = { $in: subCatId }
    }

    if (thirdsubCatId?.length) {
        filters.thirdsubCatId = { $in: thirdsubCatId }
    }

    if (minPrice || maxPrice) {
        // Use pricing.price for new model, fallback to price for legacy
        const priceFilter = {
            $or: [
                { 'pricing.price': { $gte: +minPrice || 0, $lte: +maxPrice || Infinity } },
                { price: { $gte: +minPrice || 0, $lte: +maxPrice || Infinity } }
            ]
        };
        
        // If we already have $or for categories, combine with $and
        if (filters.$or && filters.$or.length > 0) {
            const existingOr = filters.$or;
            filters.$and = [
                { $or: existingOr },
                priceFilter
            ];
            delete filters.$or;
        } else {
            // No existing $or, just add price filter directly
            Object.assign(filters, priceFilter);
        }
    }

    if (rating?.length) {
        filters.rating = { $in: rating }
    }

    if (brand?.length) {
        // Case-insensitive brand matching - use $or with regex for each brand
        const brandFilters = brand.map(b => ({
            brand: { $regex: `^${b}$`, $options: 'i' }
        }));
        
        // If we already have $or conditions (from categories), combine with $and
        if (filters.$or && filters.$or.length > 0) {
            filters.$and = filters.$and || [];
            filters.$and.push({ $or: brandFilters });
        } else {
            // No existing $or, just use $or for brands
            filters.$or = brandFilters;
        }
    }

    if (productType?.length) {
        filters.productType = { $in: productType }
    }

    if (stockStatus?.length) {
        // Handle stock status filtering
        const stockFilters = [];
        stockStatus.forEach(status => {
            if (status === 'in_stock') {
                stockFilters.push({
                    $or: [
                        { 'inventory.stockStatus': 'in_stock' },
                        { 'inventory.stock': { $gt: 0 } },
                        { countInStock: { $gt: 0 } },
                        { stock: { $gt: 0 } }
                    ]
                });
            } else if (status === 'out_of_stock') {
                stockFilters.push({
                    $or: [
                        { 'inventory.stockStatus': 'out_of_stock' },
                        { 'inventory.stock': 0 },
                        { countInStock: 0 },
                        { stock: 0 }
                    ]
                });
            }
        });
        if (stockFilters.length > 0) {
            if (filters.$and) {
                filters.$and.push({ $or: stockFilters });
            } else {
                filters.$or = filters.$or || [];
                filters.$and = [
                    ...(filters.$or.length > 0 ? [{ $or: filters.$or }] : []),
                    { $or: stockFilters }
                ];
                if (filters.$or.length > 0) delete filters.$or;
            }
        }
    }

    // Always filter by published status and approved vendor products
    filters.status = 'published';
    
    // For vendor products, require approval
    if (!filters.$and) {
        filters.$and = [];
    }
    filters.$and.push({
        $or: [
            { approvalStatus: 'APPROVED' },
            { approvalStatus: { $exists: false } },
            { productOwnerType: { $ne: 'VENDOR' } }
        ]
    });

    try {
        const products = await ProductModel.find(filters).populate("category").populate("categories").skip((page - 1) * limit).limit(parseInt(limit));

        const total = await ProductModel.countDocuments(filters);

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }


}


// Sort function
const sortItems = (products, sortBy, order) => {
    return products.sort((a, b) => {
        if (sortBy === 'name') {
            return order === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        if (sortBy === 'price') {
            return order === 'asc' ? a.price - b.price : b.price - a.price;
        }
        return 0; // Default
    });
};


export async function sortBy(request, response) {
    const { products, sortBy, order } = request.body;
    const sortedItems = sortItems([...products?.products], sortBy, order);
    return response.status(200).json({
        error: false,
        success: true,
        products: sortedItems,
        totalPages: 0,
        page: 0,
    });
}




export async function searchProductController(request, response) {
    try {

        const {query, page, limit } = request.body;

        if (!query) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Query is required"
            });
        }


        const products = await ProductModel.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { shortDescription: { $regex: query, $options: "i" } },
                { brand: { $regex: query, $options: "i" } },
                { catName: { $regex: query, $options: "i" } },
                { subCat: { $regex: query, $options: "i" } },
                { thirdsubCat: { $regex: query, $options: "i" } },
                { tags: { $regex: query, $options: "i" } },
            ],
        }).populate("category").populate("categories")

        const total = await products?.length

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            total: 1,
            page: parseInt(page),
            totalPages: 1
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}