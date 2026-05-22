/**
 * Script to delete all vendors from the database
 * Run with: node server/scripts/deleteAllVendors.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
import VendorModel from '../models/vendor.model.js';
import UserModel from '../models/user.model.js';
import PayoutModel from '../models/payout.model.js';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function deleteAllVendors() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get count before deletion
    const vendorCount = await VendorModel.countDocuments();
    console.log(`📊 Found ${vendorCount} vendors to delete`);

    if (vendorCount === 0) {
      console.log('ℹ️ No vendors to delete');
      process.exit(0);
    }

    // Get all vendor IDs
    const vendors = await VendorModel.find({}).select('_id ownerUser storeName');
    const vendorIds = vendors.map(v => v._id);
    const ownerUserIds = vendors.map(v => v.ownerUser).filter(Boolean);

    console.log('\n📋 Vendors to be deleted:');
    vendors.forEach(v => {
      console.log(`   - ${v.storeName || 'N/A'} (ID: ${v._id})`);
    });

    // Delete all payouts associated with vendors
    const payoutDeleteResult = await PayoutModel.deleteMany({ vendor: { $in: vendorIds } });
    console.log(`\n🗑️ Deleted ${payoutDeleteResult.deletedCount} payout records`);

    // Update users - remove vendor references and change role back to USER
    const userUpdateResult = await UserModel.updateMany(
      { _id: { $in: ownerUserIds } },
      {
        $set: { role: 'USER' },
        $unset: { vendor: 1, vendorId: 1 }
      }
    );
    console.log(`👤 Updated ${userUpdateResult.modifiedCount} user(s) - role changed to USER`);

    // Delete all vendors
    const vendorDeleteResult = await VendorModel.deleteMany({});
    console.log(`🗑️ Deleted ${vendorDeleteResult.deletedCount} vendor(s)`);

    console.log('\n✅ All vendors deleted successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Vendors deleted: ${vendorDeleteResult.deletedCount}`);
    console.log(`   - Users updated: ${userUpdateResult.modifiedCount}`);
    console.log(`   - Payouts deleted: ${payoutDeleteResult.deletedCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
deleteAllVendors();

