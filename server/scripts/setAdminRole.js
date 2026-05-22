/**
 * Script to set or verify admin user role
 * Usage: node scripts/setAdminRole.js <email>
 * Example: node scripts/setAdminRole.js admin@zubahouse.com
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI;

async function setAdminRole(email) {
  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node scripts/setAdminRole.js <email>');
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  console.log(`\n🔍 Looking for user: ${normalizedEmail}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const UserModel = (await import('../models/user.model.js')).default;

    const user = await UserModel.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log('❌ User not found with this email');
      console.log('\n📋 Creating new admin user...');
      
      const bcryptjs = (await import('bcryptjs')).default;
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash('admin123', salt);
      
      const newAdmin = await UserModel.create({
        name: 'Admin',
        email: normalizedEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'Active',
        verify_email: true
      });
      
      console.log('✅ Admin user created:');
      console.log(`   - ID: ${newAdmin._id}`);
      console.log(`   - Email: ${newAdmin.email}`);
      console.log(`   - Role: ${newAdmin.role}`);
      console.log(`   - Default Password: admin123 (CHANGE THIS!)`);
    } else {
      console.log('📋 Current User:');
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Current Role: ${user.role}`);
      console.log(`   - Status: ${user.status}`);
      
      if (user.role === 'ADMIN') {
        console.log('\n✅ User is already an admin!');
      } else {
        // Update to admin
        user.role = 'ADMIN';
        user.status = 'Active';
        user.verify_email = true;
        await user.save();
        
        console.log('\n✅ User role updated to ADMIN!');
        console.log(`   - New Role: ${user.role}`);
      }
    }

    // List all admin users
    console.log('\n📋 All Admin Users:');
    const admins = await UserModel.find({ role: 'ADMIN' }).select('name email role status');
    if (admins.length === 0) {
      console.log('   No admin users found');
    } else {
      admins.forEach((admin, i) => {
        console.log(`   ${i + 1}. ${admin.email} (${admin.name}) - Status: ${admin.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

const email = process.argv[2];
setAdminRole(email);

