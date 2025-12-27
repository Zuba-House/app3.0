import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI;

async function listAdmins() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const UserModel = (await import('../models/user.model.js')).default;

    // Delete the accidental 'check' user
    await UserModel.deleteOne({ email: 'check' });
    console.log('🧹 Cleaned up test user\n');

    // Find all admin users (case-insensitive)
    const admins = await UserModel.find({ 
      role: { $in: ['ADMIN', 'admin', 'Admin'] }
    }).select('name email role status');
    
    console.log('📋 Admin Users:');
    if (admins.length === 0) {
      console.log('   ❌ No admin users found!');
    } else {
      admins.forEach((admin, i) => {
        console.log(`   ${i + 1}. ${admin.email}`);
        console.log(`      Name: ${admin.name}`);
        console.log(`      Role: ${admin.role}`);
        console.log(`      Status: ${admin.status}`);
      });
    }

    // Show first 5 users for reference
    console.log('\n📋 Sample Users (first 5):');
    const users = await UserModel.find({}).select('name email role status').limit(5);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

listAdmins();

