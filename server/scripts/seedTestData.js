/**
 * Seed Test Data Script
 * Creates test products, coupons, and gift cards for development/testing
 * 
 * Usage: node server/scripts/seedTestData.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductModel from '../models/product.model.js';
import CategoryModel from '../models/category.model.js';
import CouponModel from '../models/coupon.model.js';
import GiftCardModel from '../models/giftCard.model.js';
import connectDB from '../config/connectDb.js';

dotenv.config();

const seedProducts = async () => {
  console.log('📦 Seeding test products...');
  
  // Get or create a category
  let category = await CategoryModel.findOne({ name: 'Test Category' });
  if (!category) {
    category = await CategoryModel.create({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test category for development',
    });
  }

  const products = [
    {
      name: 'Test Product - Simple',
      description: 'A simple test product for testing checkout flow',
      shortDescription: 'Simple test product',
      price: 29.99,
      salePrice: 24.99,
      sku: 'TEST-SIMPLE-001',
      stock: 100,
      stockStatus: 'in_stock',
      status: 'published',
      productType: 'simple',
      category: category._id,
      images: ['https://via.placeholder.com/500x500?text=Test+Product'],
      featured: true,
    },
    {
      name: 'Test Product - Variable (Color & Size)',
      description: 'A variable product with color and size variations',
      shortDescription: 'Variable test product',
      price: 49.99,
      salePrice: 39.99,
      sku: 'TEST-VAR-001',
      stock: 0, // Stock managed by variations
      stockStatus: 'in_stock',
      status: 'published',
      productType: 'variable',
      category: category._id,
      images: ['https://via.placeholder.com/500x500?text=Variable+Product'],
      attributes: [
        {
          name: 'Color',
          values: ['Red', 'Blue', 'Green'],
        },
        {
          name: 'Size',
          values: ['S', 'M', 'L', 'XL'],
        },
      ],
      variations: [
        { attributes: { Color: 'Red', Size: 'S' }, price: 39.99, stock: 10 },
        { attributes: { Color: 'Red', Size: 'M' }, price: 39.99, stock: 15 },
        { attributes: { Color: 'Red', Size: 'L' }, price: 39.99, stock: 8 },
        { attributes: { Color: 'Blue', Size: 'S' }, price: 39.99, stock: 12 },
        { attributes: { Color: 'Blue', Size: 'M' }, price: 39.99, stock: 20 },
        { attributes: { Color: 'Blue', Size: 'L' }, price: 39.99, stock: 5 },
        { attributes: { Color: 'Green', Size: 'M' }, price: 39.99, stock: 0 }, // Out of stock
        { attributes: { Color: 'Green', Size: 'L' }, price: 39.99, stock: 7 },
      ],
      featured: true,
    },
    {
      name: 'Test Product - On Sale',
      description: 'A product with a sale price for testing discounts',
      shortDescription: 'Sale product',
      price: 99.99,
      salePrice: 79.99,
      sku: 'TEST-SALE-001',
      stock: 50,
      stockStatus: 'in_stock',
      status: 'published',
      productType: 'simple',
      category: category._id,
      images: ['https://via.placeholder.com/500x500?text=Sale+Product'],
      featured: false,
    },
  ];

  for (const productData of products) {
    const existing = await ProductModel.findOne({ sku: productData.sku });
    if (!existing) {
      await ProductModel.create(productData);
      console.log(`  ✅ Created: ${productData.name}`);
    } else {
      console.log(`  ⏭️  Skipped (exists): ${productData.name}`);
    }
  }
};

const seedCoupons = async () => {
  console.log('🎫 Seeding test coupons...');
  
  const coupons = [
    {
      code: 'TEST10',
      discountType: 'percentage',
      discountAmount: 10,
      minimumAmount: 50,
      usageLimit: 100,
      usageCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActive: true,
    },
    {
      code: 'SAVE20',
      discountType: 'percentage',
      discountAmount: 20,
      minimumAmount: 100,
      usageLimit: 50,
      usageCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'FIXED5',
      discountType: 'fixed',
      discountAmount: 5,
      minimumAmount: 25,
      usageLimit: 200,
      usageCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      freeShipping: false,
    },
    {
      code: 'FREESHIP',
      discountType: 'percentage',
      discountAmount: 0,
      minimumAmount: 75,
      usageLimit: 1000,
      usageCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      freeShipping: true,
    },
  ];

  for (const couponData of coupons) {
    const existing = await CouponModel.findOne({ code: couponData.code });
    if (!existing) {
      await CouponModel.create(couponData);
      console.log(`  ✅ Created coupon: ${couponData.code} (${couponData.discountAmount}${couponData.discountType === 'percentage' ? '%' : '$'})`);
    } else {
      console.log(`  ⏭️  Skipped (exists): ${couponData.code}`);
    }
  }
};

const seedGiftCards = async () => {
  console.log('🎁 Seeding test gift cards...');
  
  const giftCards = [
    {
      code: 'GIFT-001-002',
      initialBalance: 25.00,
      currentBalance: 25.00,
      currency: 'USD',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
    },
    {
      code: 'GIFT-050-100',
      initialBalance: 50.00,
      currentBalance: 50.00,
      currency: 'USD',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'GIFT-100-200',
      initialBalance: 100.00,
      currentBalance: 100.00,
      currency: 'USD',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  for (const giftCardData of giftCards) {
    const existing = await GiftCardModel.findOne({ code: giftCardData.code });
    if (!existing) {
      await GiftCardModel.create(giftCardData);
      console.log(`  ✅ Created gift card: ${giftCardData.code} ($${giftCardData.currentBalance})`);
    } else {
      console.log(`  ⏭️  Skipped (exists): ${giftCardData.code}`);
    }
  }
};

const main = async () => {
  try {
    console.log('🌱 Starting seed data script...\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database\n');
    
    // Seed data
    await seedProducts();
    console.log('');
    await seedCoupons();
    console.log('');
    await seedGiftCards();
    console.log('');
    
    console.log('✅ Seed data script completed successfully!');
    console.log('\n📝 Test Data Summary:');
    console.log('  Products: 3 (1 simple, 1 variable, 1 on sale)');
    console.log('  Coupons: 4 (TEST10, SAVE20, FIXED5, FREESHIP)');
    console.log('  Gift Cards: 3 ($25, $50, $100)');
    console.log('\n💡 You can now test the checkout flow with these items!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

main();
