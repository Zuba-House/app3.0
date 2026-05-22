import mongoose from 'mongoose';
import ProductModel from '../models/product.model.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

async function deleteAllProducts() {
    try {
        // Connect to MongoDB (using same logic as main app)
        const PRIMARY_URI = process.env.MONGODB_URI;
        const LOCAL_FALLBACK = process.env.MONGODB_LOCAL_URI;

        if (!PRIMARY_URI && !LOCAL_FALLBACK) {
            throw new Error('No MongoDB connection string found. Please set MONGODB_URI or MONGODB_LOCAL_URI in .env file');
        }

        if (PRIMARY_URI) {
            await mongoose.connect(PRIMARY_URI);
            console.log('✅ Connected to MongoDB (Atlas)');
        } else if (LOCAL_FALLBACK) {
            await mongoose.connect(LOCAL_FALLBACK);
            console.log('✅ Connected to MongoDB (Local)');
        }

        // Get all products
        const products = await ProductModel.find({});
        console.log(`📦 Found ${products.length} products to delete`);

        if (products.length === 0) {
            console.log('ℹ️  No products to delete');
            await mongoose.disconnect();
            return;
        }

        // Delete images from Cloudinary and products from database
        let deletedCount = 0;
        let errorCount = 0;

        for (const product of products) {
            try {
                // Handle images (both old string format and new object format)
                const images = product.images || [];
                
                for (const img of images) {
                    try {
                        // Get image URL (handle both string and object formats)
                        const imgUrl = typeof img === 'string' ? img : (img.url || '');
                        
                        if (imgUrl) {
                            const urlArr = imgUrl.split("/");
                            const image = urlArr[urlArr.length - 1];
                            const imageName = image.split(".")[0];

                            if (imageName) {
                                await cloudinary.uploader.destroy(imageName);
                            }
                        }
                    } catch (imgError) {
                        console.error(`⚠️  Error deleting image for product ${product._id}:`, imgError.message);
                    }
                }

                // Delete banner images if they exist
                if (product.bannerimages && Array.isArray(product.bannerimages)) {
                    for (const bannerImg of product.bannerimages) {
                        try {
                            const imgUrl = typeof bannerImg === 'string' ? bannerImg : (bannerImg.url || '');
                            if (imgUrl) {
                                const urlArr = imgUrl.split("/");
                                const image = urlArr[urlArr.length - 1];
                                const imageName = image.split(".")[0];
                                if (imageName) {
                                    await cloudinary.uploader.destroy(imageName);
                                }
                            }
                        } catch (bannerError) {
                            console.error(`⚠️  Error deleting banner image:`, bannerError.message);
                        }
                    }
                }

                // Delete product from database
                await ProductModel.findByIdAndDelete(product._id);
                deletedCount++;
                console.log(`✅ Deleted product: ${product.name} (${deletedCount}/${products.length})`);

            } catch (error) {
                errorCount++;
                console.error(`❌ Error deleting product ${product._id}:`, error.message);
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Successfully deleted: ${deletedCount} products`);
        console.log(`❌ Errors: ${errorCount} products`);
        console.log(`📦 Total processed: ${products.length} products`);

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Fatal error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the script
deleteAllProducts();

