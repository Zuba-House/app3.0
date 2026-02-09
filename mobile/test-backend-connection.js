/**
 * Test Backend Connection
 * Run this to verify your backend is accessible and has products
 * 
 * Usage: node test-backend-connection.js
 */

const API_URL = 'https://zuba-api.onrender.com';

async function testBackend() {
  console.log('🔍 Testing Backend Connection...\n');
  console.log('Backend URL:', API_URL);
  console.log('─'.repeat(50));

  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing Health Endpoint...');
    const healthResponse = await fetch(API_URL);
    const healthData = await healthResponse.json();
    console.log('✅ Backend is running!');
    console.log('   Response:', JSON.stringify(healthData, null, 2));

    // Test 2: Get products
    console.log('\n2️⃣ Testing Products Endpoint...');
    const productsResponse = await fetch(`${API_URL}/api/product/getAllProducts?limit=5`);
    const productsData = await productsResponse.json();
    
    if (productsData.success) {
      const products = Array.isArray(productsData.data) 
        ? productsData.data 
        : (productsData.data?.products || []);
      console.log('✅ Products endpoint works!');
      console.log(`   Found ${products.length} products`);
      if (products.length > 0) {
        console.log('   Sample product:', products[0].name || 'N/A');
      }
    } else {
      console.log('⚠️  Products endpoint returned error:', productsData.message);
    }

    // Test 3: Get categories
    console.log('\n3️⃣ Testing Categories Endpoint...');
    const categoriesResponse = await fetch(`${API_URL}/api/category`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      const categories = Array.isArray(categoriesData.data) ? categoriesData.data : [];
      console.log('✅ Categories endpoint works!');
      console.log(`   Found ${categories.length} categories`);
    } else {
      console.log('⚠️  Categories endpoint returned error:', categoriesData.message);
    }

    console.log('\n' + '─'.repeat(50));
    console.log('✅ Backend connection test complete!');
    console.log('📱 Your mobile app should be able to load products!');

  } catch (error) {
    console.error('\n❌ Backend test failed!');
    console.error('   Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if backend is running');
    console.error('   2. Check internet connection');
    console.error('   3. Verify backend URL is correct');
    console.error('   4. Check if backend CORS allows requests');
  }
}

testBackend();
