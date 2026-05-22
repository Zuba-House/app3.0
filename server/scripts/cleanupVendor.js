/**
 * Script to clean up vendor and user data for re-registration
 * Usage: node scripts/cleanupVendor.js <email>
 * Example: node scripts/cleanupVendor.js niolivier250@gmail.com
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI || process.env.MONGODB_URL || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MongoDB URI not found in environment variables');
  console.log('   Please ensure MONGODB_URI is set in server/.env file');
  process.exit(1);
}

async function cleanupVendor(email) {
  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node scripts/cleanupVendor.js <email>');
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  console.log(`\n🔍 Looking for vendor data for: ${normalizedEmail}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import models
    const UserModel = (await import('../models/user.model.js')).default;
    const VendorModel = (await import('../models/vendor.model.js')).default;
    
    let PayoutModel;
    try {
      PayoutModel = (await import('../models/payout.model.js')).default;
    } catch (e) {
      console.log('⚠️ Payout model not found, skipping payout cleanup');
    }

    // Find user
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (user) {
      console.log('📋 Found User:');
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Vendor ID: ${user.vendor || user.vendorId || 'None'}`);
    } else {
      console.log('❌ No user found with this email');
    }

    // Find vendor by email
    const vendorByEmail = await VendorModel.findOne({ email: normalizedEmail });
    if (vendorByEmail) {
      console.log('\n📋 Found Vendor (by email):');
      console.log(`   - ID: ${vendorByEmail._id}`);
      console.log(`   - Store Name: ${vendorByEmail.storeName}`);
      console.log(`   - Status: ${vendorByEmail.status}`);
    }

    // Find vendor by owner user
    let vendorByOwner = null;
    if (user) {
      vendorByOwner = await VendorModel.findOne({ ownerUser: user._id });
      if (vendorByOwner && (!vendorByEmail || vendorByOwner._id.toString() !== vendorByEmail._id.toString())) {
        console.log('\n📋 Found Vendor (by owner):');
        console.log(`   - ID: ${vendorByOwner._id}`);
        console.log(`   - Store Name: ${vendorByOwner.storeName}`);
        console.log(`   - Status: ${vendorByOwner.status}`);
      }
    }

    // Confirmation
    console.log('\n' + '='.repeat(50));
    console.log('🗑️  CLEANUP ACTIONS:');
    console.log('='.repeat(50));
    
    let deletedCount = 0;

    // Delete payouts
    if (PayoutModel && (vendorByEmail || vendorByOwner)) {
      const vendorIds = [vendorByEmail?._id, vendorByOwner?._id].filter(Boolean);
      const payoutsDeleted = await PayoutModel.deleteMany({ vendor: { $in: vendorIds } });
      console.log(`✅ Deleted ${payoutsDeleted.deletedCount} payout records`);
      deletedCount += payoutsDeleted.deletedCount;
    }

    // Delete vendor by email
    if (vendorByEmail) {
      await VendorModel.findByIdAndDelete(vendorByEmail._id);
      console.log(`✅ Deleted vendor: ${vendorByEmail.storeName} (${vendorByEmail._id})`);
      deletedCount++;
    }

    // Delete vendor by owner (if different)
    if (vendorByOwner && (!vendorByEmail || vendorByOwner._id.toString() !== vendorByEmail._id.toString())) {
      await VendorModel.findByIdAndDelete(vendorByOwner._id);
      console.log(`✅ Deleted vendor: ${vendorByOwner.storeName} (${vendorByOwner._id})`);
      deletedCount++;
    }

    // Delete user
    if (user) {
      await UserModel.findByIdAndDelete(user._id);
      console.log(`✅ Deleted user: ${user.name} (${user._id})`);
      deletedCount++;
    }

    console.log('\n' + '='.repeat(50));
    if (deletedCount > 0) {
      console.log(`🎉 CLEANUP COMPLETE! Deleted ${deletedCount} records.`);
      console.log(`📧 Email ${normalizedEmail} can now be used for new registration.`);
    } else {
      console.log('ℹ️  No data found to delete for this email.');
    }
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Get email from command line
const email = process.argv[2];
cleanupVendor(email);

