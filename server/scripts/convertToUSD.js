// scripts/convertToUSD.js
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import Product model - ADJUST THIS PATH IF NEEDED
const Product = require('../models/Product');

async function convertToUSD() {
  try {
    console.log('🔌 Connecting to database...');
    console.log('📍 Using connection:', process.env.MONGODB_URI?.substring(0, 30) + '...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!');

    // Get all products
    const products = await Product.find({});
    console.log(`\n📦 Found ${products.length} products in database\n`);

    if (products.length === 0) {
      console.log('⚠️ No products found. Exiting...');
      process.exit(0);
    }

    // Show first 3 products before update
    console.log('📋 First 3 products BEFORE update:');
    products.slice(0, 3).forEach(p => {
      console.log(`   - ${p.name}: ${p.price} (Currency: ${p.currency || 'Not set'})`);
    });

    console.log('\n🔄 Starting conversion...\n');

    let updatedCount = 0;

    // Update each product
    for (let product of products) {
      // Keep the same price number, just add USD currency
      await Product.updateOne(
        { _id: product._id },
        { 
          $set: { currency: 'USD' }
        }
      );

      console.log(`✅ Updated: ${product.name} - Price: $${product.price}`);
      updatedCount++;
    }

    console.log(`\n🎉 SUCCESS! Updated ${updatedCount} products to USD!`);
    console.log('💰 All prices are now in USD currency\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n💡 Common fixes:');
    console.error('   1. Check your .env file has MONGODB_URI');
    console.error('   2. Make sure MongoDB is running');
    console.error('   3. Check the Product model path is correct\n');
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('👋 Database connection closed');
    }
    process.exit(0);
  }
}

// Run the function
console.log('🚀 Starting USD Currency Migration...\n');
convertToUSD();
