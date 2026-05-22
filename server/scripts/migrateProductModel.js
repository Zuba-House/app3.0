// Migration script to upgrade existing products to new model structure
// Run this once after deploying the new model

import mongoose from 'mongoose';
import ProductModel from '../models/product.model.js';
import connectDB from '../config/connectDb.js';

async function migrateProducts() {
  try {
    await connectDB();
    
    console.log('🔄 Starting product model migration...');
    
    // Get all products
    const products = await ProductModel.find({});
    console.log(`📦 Found ${products.length} products to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const product of products) {
      try {
        let needsUpdate = false;
        const updates = {};
        
        // 1. Generate SKU if missing
        if (!product.sku) {
          updates.sku = `ZH-${product._id.toString().slice(-8).toUpperCase()}`;
          needsUpdate = true;
        }
        
        // 2. Set status to published if missing (for existing products)
        if (!product.status) {
          updates.status = 'published';
          updates.publishedAt = product.createdAt || new Date();
          needsUpdate = true;
        }
        
        // 3. Generate slug if missing
        if (!product.seo || !product.seo.slug) {
          if (!updates.seo) updates.seo = product.seo || {};
          const baseSlug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          updates.seo.slug = `${baseSlug}-${product._id.toString().slice(-6)}`;
          needsUpdate = true;
        }
        
        // 4. Convert images array to new format
        if (product.images && product.images.length > 0 && typeof product.images[0] === 'string') {
          updates.images = product.images.map((url, index) => ({
            url: url,
            alt: '',
            title: '',
            position: index,
            isFeatured: index === 0
          }));
          needsUpdate = true;
        }
        
        // 5. Set featured image
        if (!product.featuredImage && product.images && product.images.length > 0) {
          const firstImage = typeof product.images[0] === 'string' 
            ? product.images[0] 
            : product.images[0].url;
          updates.featuredImage = firstImage;
          needsUpdate = true;
        }
        
        // 6. Migrate pricing structure
        if (!product.pricing && (product.price || product.oldPrice)) {
          updates.pricing = {
            regularPrice: product.oldPrice || product.price || 0,
            salePrice: product.oldPrice && product.price < product.oldPrice ? product.price : null,
            price: product.price || product.oldPrice || 0,
            currency: product.currency || 'USD',
            onSale: product.oldPrice && product.price < product.oldPrice
          };
          needsUpdate = true;
        }
        
        // 7. Migrate inventory structure
        if (!product.inventory && product.countInStock !== undefined) {
          updates.inventory = {
            stock: product.countInStock || 0,
            stockStatus: (product.countInStock || 0) > 0 ? 'in_stock' : 'out_of_stock',
            manageStock: true,
            allowBackorders: 'no',
            lowStockThreshold: 5
          };
          needsUpdate = true;
        }
        
        // 8. Set categories array from category if empty
        if (product.category && (!product.categories || product.categories.length === 0)) {
          updates.categories = [product.category];
          needsUpdate = true;
        }
        
        // 9. Set SEO fields if missing
        if (!product.seo || !product.seo.metaTitle) {
          if (!updates.seo) updates.seo = product.seo || {};
          updates.seo.metaTitle = product.name || '';
          updates.seo.metaDescription = (product.description || '').substring(0, 160);
          updates.seo.metaKeywords = [];
          needsUpdate = true;
        }
        
        // 10. Set default shipping
        if (!product.shipping) {
          updates.shipping = {
            required: true,
            shippingClass: 'standard',
            freeShipping: false
          };
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await ProductModel.findByIdAndUpdate(product._id, { $set: updates }, { new: true });
          migrated++;
          console.log(`✅ Migrated product: ${product.name}`);
        } else {
          skipped++;
        }
        
      } catch (error) {
        console.error(`❌ Error migrating product ${product._id}:`, error.message);
      }
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`   Migrated: ${migrated} products`);
    console.log(`   Skipped: ${skipped} products (already up to date)`);
    
    // Create indexes
    console.log('\n📊 Creating indexes...');
    try {
      await ProductModel.collection.createIndex({ sku: 1 }, { unique: true, sparse: true });
      await ProductModel.collection.createIndex({ status: 1 });
      await ProductModel.collection.createIndex({ 'seo.slug': 1 }, { unique: true, sparse: true });
      await ProductModel.collection.createIndex({ brand: 1, status: 1 });
      await ProductModel.collection.createIndex({ categories: 1, status: 1 });
      await ProductModel.collection.createIndex({ price: 1 });
      await ProductModel.collection.createIndex({ isFeatured: 1, status: 1 });
      await ProductModel.collection.createIndex({ createdAt: -1 });
      await ProductModel.collection.createIndex({ rating: -1 });
      await ProductModel.collection.createIndex({ name: 'text', description: 'text' });
      console.log('✅ Indexes created successfully');
    } catch (error) {
      console.log('⚠️  Some indexes may already exist:', error.message);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateProducts();

