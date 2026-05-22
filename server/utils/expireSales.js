import ProductModel from '../models/product.model.js';

/**
 * Automatically expire sales that have passed their end date
 * This function should be called periodically (e.g., every hour or daily)
 */
export async function expireSales() {
    try {
        const now = new Date();
        let expiredCount = 0;

        console.log(`🕐 Starting sale expiration check at ${now.toISOString()}`);

        // Find all products with active sales that should be expired
        const products = await ProductModel.find({
            status: 'published',
            $or: [
                // Simple products with expired sales
                {
                    'pricing.salePrice': { $ne: null },
                    'pricing.saleEndDate': { $lt: now }
                },
                // Variable products with expired variation sales
                {
                    'variations.salePrice': { $ne: null },
                    'variations.saleEndDate': { $lt: now }
                }
            ]
        });

        console.log(`📦 Found ${products.length} products to check for expired sales`);

        for (const product of products) {
            let updated = false;

            // Check simple product pricing
            if (product.productType === 'simple' && product.pricing) {
                if (product.pricing.saleEndDate && product.pricing.saleEndDate < now) {
                    // Sale has expired - reset to regular price
                    product.pricing.price = product.pricing.regularPrice;
                    product.pricing.salePrice = null;
                    product.pricing.onSale = false;
                    product.pricing.saleStartDate = null;
                    product.pricing.saleEndDate = null;
                    
                    // Update legacy fields
                    product.price = product.pricing.regularPrice;
                    product.oldPrice = null;
                    
                    updated = true;
                    expiredCount++;
                    console.log(`✅ Expired sale for simple product: ${product.name} (${product._id})`);
                }
            }

            // Check variable product variations
            if (product.productType === 'variable' && product.variations) {
                product.variations.forEach((variation, index) => {
                    if (variation.saleEndDate && variation.saleEndDate < now && variation.salePrice) {
                        // Sale has expired - reset to regular price
                        variation.price = variation.regularPrice;
                        variation.salePrice = null;
                        variation.saleStartDate = null;
                        variation.saleEndDate = null;
                        updated = true;
                        expiredCount++;
                        console.log(`✅ Expired sale for variation ${index} of product: ${product.name} (${product._id})`);
                    }
                });

                // Recalculate price range after variation updates
                if (updated) {
                    product.calculatePriceRange();
                }
            }

            // Save if any updates were made
            if (updated) {
                await product.save();
            }
        }

        console.log(`✨ Sale expiration complete. Expired ${expiredCount} sale(s) across ${products.length} product(s)`);
        
        return {
            success: true,
            expiredCount,
            checkedProducts: products.length
        };

    } catch (error) {
        console.error('❌ Error expiring sales:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Activate sales that should start now
 * This function activates sales that have a start date in the past but haven't been activated yet
 */
export async function activateScheduledSales() {
    try {
        const now = new Date();
        let activatedCount = 0;

        console.log(`🕐 Starting scheduled sale activation at ${now.toISOString()}`);

        // Find products with sales that should be activated
        const products = await ProductModel.find({
            status: 'published',
            $or: [
                // Simple products with scheduled sales that should start
                {
                    'pricing.salePrice': { $ne: null },
                    'pricing.saleStartDate': { $lte: now },
                    'pricing.onSale': false
                },
                // Variable products with scheduled variation sales
                {
                    'variations.salePrice': { $ne: null },
                    'variations.saleStartDate': { $lte: now }
                }
            ]
        });

        console.log(`📦 Found ${products.length} products to check for scheduled sales`);

        for (const product of products) {
            let updated = false;

            // Check simple product pricing
            if (product.productType === 'simple' && product.pricing) {
                if (product.pricing.salePrice && 
                    product.pricing.saleStartDate && 
                    product.pricing.saleStartDate <= now &&
                    (!product.pricing.saleEndDate || product.pricing.saleEndDate >= now) &&
                    !product.pricing.onSale) {
                    
                    // Activate the sale
                    product.pricing.price = product.pricing.salePrice;
                    product.pricing.onSale = true;
                    
                    // Update legacy fields
                    product.price = product.pricing.salePrice;
                    product.oldPrice = product.pricing.regularPrice;
                    
                    updated = true;
                    activatedCount++;
                    console.log(`✅ Activated scheduled sale for product: ${product.name} (${product._id})`);
                }
            }

            // Check variable product variations
            if (product.productType === 'variable' && product.variations) {
                product.variations.forEach((variation, index) => {
                    if (variation.salePrice && 
                        variation.saleStartDate && 
                        variation.saleStartDate <= now &&
                        (!variation.saleEndDate || variation.saleEndDate >= now) &&
                        variation.price !== variation.salePrice) {
                        
                        // Activate the sale
                        variation.price = variation.salePrice;
                        updated = true;
                        activatedCount++;
                        console.log(`✅ Activated scheduled sale for variation ${index} of product: ${product.name} (${product._id})`);
                    }
                });

                // Recalculate price range after variation updates
                if (updated) {
                    product.calculatePriceRange();
                }
            }

            // Save if any updates were made
            if (updated) {
                await product.save();
            }
        }

        console.log(`✨ Scheduled sale activation complete. Activated ${activatedCount} sale(s) across ${products.length} product(s)`);
        
        return {
            success: true,
            activatedCount,
            checkedProducts: products.length
        };

    } catch (error) {
        console.error('❌ Error activating scheduled sales:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

