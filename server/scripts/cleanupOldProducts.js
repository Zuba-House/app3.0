import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductModel from '../models/product.model.js';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '../config/connectDb.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

/**
 * Script to delete all products and clean up Cloudinary
 * WARNING: This will delete ALL products from the database
 * Use only if you want to start fresh with the new product system
 */
async function cleanupOldProducts() {
    try {
        console.log('🔄 Connecting to database...');
        await connectDB();
        
        console.log('🔍 Finding all products...');
        const products = await ProductModel.find({});
        console.log(`📦 Found ${products.length} products`);
        
        if (products.length === 0) {
            console.log('✅ No products to delete. Database is already clean.');
            process.exit(0);
        }
        
        console.log('🗑️  Starting deletion process...');
        console.log('⚠️  WARNING: This will delete ALL products!');
        console.log('⏳ Deleting products and cleaning up Cloudinary...');
        
        let deletedCount = 0;
        let cloudinaryDeleted = 0;
        let cloudinaryErrors = 0;
        
        for (const product of products) {
            try {
                // Delete images from Cloudinary
                if (product.images && Array.isArray(product.images)) {
                    for (const image of product.images) {
                        try {
                            let imageUrl = typeof image === 'string' ? image : image.url;
                            if (imageUrl) {
                                // Extract public_id from Cloudinary URL
                                const urlParts = imageUrl.split('/');
                                const filename = urlParts[urlParts.length - 1];
                                const publicId = filename.split('.')[0];
                                
                                if (publicId) {
                                    await cloudinary.uploader.destroy(publicId);
                                    cloudinaryDeleted++;
                                }
                            }
                        } catch (cloudinaryError) {
                            cloudinaryErrors++;
                            console.error(`Error deleting image from Cloudinary:`, cloudinaryError.message);
                        }
                    }
                }
                
                // Delete banner images
                if (product.bannerimages && Array.isArray(product.bannerimages)) {
                    for (const banner of product.bannerimages) {
                        try {
                            let bannerUrl = typeof banner === 'string' ? banner : banner.url;
                            if (bannerUrl) {
                                const urlParts = bannerUrl.split('/');
                                const filename = urlParts[urlParts.length - 1];
                                const publicId = filename.split('.')[0];
                                
                                if (publicId) {
                                    await cloudinary.uploader.destroy(publicId);
                                    cloudinaryDeleted++;
                                }
                            }
                        } catch (cloudinaryError) {
                            cloudinaryErrors++;
                            console.error(`Error deleting banner from Cloudinary:`, cloudinaryError.message);
                        }
                    }
                }
                
                // Delete product from database
                await ProductModel.findByIdAndDelete(product._id);
                deletedCount++;
                
                if (deletedCount % 10 === 0) {
                    console.log(`✅ Deleted ${deletedCount}/${products.length} products...`);
                }
            } catch (error) {
                console.error(`Error deleting product ${product._id}:`, error.message);
            }
        }
        
        console.log('\n✅ Cleanup Complete!');
        console.log(`📊 Summary:`);
        console.log(`   - Products deleted: ${deletedCount}`);
        console.log(`   - Cloudinary images deleted: ${cloudinaryDeleted}`);
        console.log(`   - Cloudinary errors: ${cloudinaryErrors}`);
        console.log('\n🎉 Database is now clean. You can start creating new products with the enhanced system!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

// Run the cleanup
cleanupOldProducts();

