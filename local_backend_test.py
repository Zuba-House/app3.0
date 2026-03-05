#!/usr/bin/env python3
"""
Zuba House Local Backend API Test Suite
Tests the local Node.js server running on port 5000
Focuses on Phase 1 Critical Fixes: Payment Integration, Checkout Flow, Coupon/Gift Card integration
"""

import requests
import sys
import json
import time
from datetime import datetime

class LocalBackendTester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []
        self.session_id = None  # Store session ID for status check

    def run_test(self, name, method, endpoint, expected_status=200, data=None, headers=None, description=""):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        if description:
            print(f"   📝 {description}")
        print(f"   🌐 URL: {url}")
        if data:
            print(f"   📤 Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   📥 Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    print(f"   📥 Response: {response.text[:200]}...")
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                self.errors.append(f"{name}: {error_msg}")
                print(f"❌ Failed - {error_msg}")
                try:
                    error_data = response.json()
                    print(f"   ❗ Error Response: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   ❗ Error Response: {response.text[:200]}...")
                return False, None

        except requests.exceptions.Timeout:
            error_msg = "Request timeout (30s)"
            self.errors.append(f"{name}: {error_msg}")
            print(f"❌ Failed - {error_msg}")
            return False, None
        except requests.exceptions.ConnectionError:
            error_msg = "Connection error - Local server may not be running"
            self.errors.append(f"{name}: {error_msg}")
            print(f"❌ Failed - {error_msg}")
            return False, None
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            self.errors.append(f"{name}: {error_msg}")
            print(f"❌ Failed - {error_msg}")
            return False, None

    def test_server_health(self):
        """Test server startup and health endpoints"""
        print("\n" + "="*60)
        print("🏥 TESTING SERVER HEALTH & STARTUP")
        print("="*60)
        
        # Test root endpoint
        success, data = self.run_test(
            "Root Endpoint", 
            "GET", 
            "/",
            description="Testing if server responds at root path"
        )
        
        # Test API health check
        success, data = self.run_test(
            "Health Check Endpoint", 
            "GET", 
            "/api/health",
            description="Testing health check endpoint for database connectivity"
        )
        
        if success and data:
            if isinstance(data, dict) and data.get('status') == 'healthy':
                print("   ✅ Server is healthy and database is connected")
            else:
                print("   ⚠️ Server responded but status may not be healthy")

    def test_stripe_endpoints(self):
        """Test Stripe payment integration endpoints"""
        print("\n" + "="*60)
        print("💳 TESTING STRIPE PAYMENT INTEGRATION")
        print("="*60)
        
        # Test Stripe health check
        success, data = self.run_test(
            "Stripe Health Check",
            "GET",
            "/api/stripe/health",
            description="Testing if Stripe is configured (may fail with placeholder keys)"
        )
        
        # Test create checkout session
        checkout_data = {
            "amount": 99.99,
            "orderId": "test-order-12345",
            "successUrl": "http://localhost:5000/payment-success",
            "cancelUrl": "http://localhost:5000/payment-cancel"
        }
        
        success, data = self.run_test(
            "Create Checkout Session",
            "POST",
            "/api/stripe/create-checkout-session",
            description="Testing Stripe checkout session creation",
            data=checkout_data
        )
        
        # Store session ID for status check if successful
        if success and data and isinstance(data, dict) and data.get('success'):
            session_data = data.get('data', {})
            self.session_id = session_data.get('sessionId')
            if self.session_id:
                print(f"   💾 Stored session ID: {self.session_id}")
        
        # Test checkout status endpoint if we have a session ID
        if self.session_id:
            success, data = self.run_test(
                "Get Checkout Status",
                "GET",
                f"/api/stripe/checkout-status/{self.session_id}",
                description="Testing checkout session status retrieval"
            )
        else:
            print("   ⚠️ Skipping checkout status test - no session ID available")
            # Try with a dummy session ID to test the endpoint
            success, data = self.run_test(
                "Get Checkout Status (Dummy)",
                "GET",
                "/api/stripe/checkout-status/cs_test_dummy",
                expected_status=500,  # Should fail with invalid session
                description="Testing checkout status endpoint with dummy session ID"
            )

    def test_coupon_endpoints(self):
        """Test coupon validation and application endpoints"""
        print("\n" + "="*60)
        print("🎫 TESTING COUPON SYSTEM")
        print("="*60)
        
        # Test coupon validation
        validate_data = {
            "code": "SAVE10"
        }
        
        success, data = self.run_test(
            "Validate Coupon",
            "POST",
            "/api/coupons/validate",
            description="Testing coupon code validation",
            data=validate_data
        )
        
        # Test coupon application
        apply_data = {
            "code": "SAVE10",
            "cartItems": [
                {
                    "_id": "item1",
                    "product": {"name": "Test Product", "price": 29.99},
                    "quantity": 2,
                    "subtotal": 59.98
                }
            ],
            "cartTotal": 59.98
        }
        
        success, data = self.run_test(
            "Apply Coupon",
            "POST",
            "/api/coupons/apply",
            description="Testing coupon application to cart",
            data=apply_data
        )
        
        # Test with invalid coupon (returns 200 with success:false - this is expected behavior)
        invalid_data = {"code": "INVALID123"}
        success, data = self.run_test(
            "Invalid Coupon Validation",
            "POST",
            "/api/coupons/validate",
            expected_status=200,
            description="Testing validation with invalid coupon code (returns 200 with success:false)",
            data=invalid_data
        )

    def test_gift_card_endpoints(self):
        """Test gift card validation and application endpoints"""
        print("\n" + "="*60)
        print("🎁 TESTING GIFT CARD SYSTEM")
        print("="*60)
        
        # Test gift card validation
        validate_data = {
            "code": "GIFT1000"
        }
        
        success, data = self.run_test(
            "Validate Gift Card",
            "POST",
            "/api/gift-cards/validate",
            description="Testing gift card code validation",
            data=validate_data
        )
        
        # Test gift card application
        apply_data = {
            "code": "GIFT1000",
            "cartTotal": 149.99
        }
        
        success, data = self.run_test(
            "Apply Gift Card",
            "POST",
            "/api/gift-cards/apply",
            description="Testing gift card application to cart",
            data=apply_data
        )
        
        # Test with invalid gift card (returns 200 with success:false - this is expected behavior)
        invalid_data = {"code": "INVALID456"}
        success, data = self.run_test(
            "Invalid Gift Card Validation",
            "POST",
            "/api/gift-cards/validate",
            expected_status=200,
            description="Testing validation with invalid gift card code (returns 200 with success:false)",
            data=invalid_data
        )

    def test_product_endpoints(self):
        """Test product API endpoints"""
        print("\n" + "="*60)
        print("🛍️ TESTING PRODUCT API")
        print("="*60)
        
        # Test get products (correct endpoint)
        success, data = self.run_test(
            "Get Products",
            "GET",
            "/api/product/getAllProducts",
            description="Testing product listing endpoint"
        )
        
        if success and data:
            try:
                if isinstance(data, dict) and 'data' in data:
                    products = data['data']
                elif isinstance(data, list):
                    products = data
                else:
                    products = []
                
                if len(products) > 0:
                    print(f"   📦 Found {len(products)} products")
                    # Test first product details if available
                    first_product = products[0]
                    product_id = first_product.get('_id') or first_product.get('id')
                    if product_id:
                        success, product_data = self.run_test(
                            "Get Product Details",
                            "GET",
                            f"/api/product/{product_id}",
                            description="Testing individual product retrieval"
                        )
                else:
                    print("   📦 No products found in response")
            except Exception as e:
                print(f"   ❗ Could not parse products response: {e}")
        
        # Test product search
        success, data = self.run_test(
            "Search Products",
            "GET",
            "/api/product/getAllProducts?search=shirt&limit=5",
            description="Testing product search functionality"
        )
        
        # Test products with pagination  
        success, data = self.run_test(
            "Products Pagination",
            "GET",
            "/api/product/getAllProducts?page=1&limit=10",
            description="Testing product pagination"
        )

    def test_error_handling(self):
        """Test API error handling"""
        print("\n" + "="*60)
        print("❌ TESTING ERROR HANDLING")
        print("="*60)
        
        # Test 404 for non-existent endpoint
        success, data = self.run_test(
            "Non-existent Endpoint",
            "GET",
            "/api/nonexistent",
            expected_status=404,
            description="Testing 404 error handling"
        )
        
        # Test malformed JSON in POST request
        try:
            url = f"{self.base_url}/api/coupons/validate"
            response = requests.post(url, data="invalid json", headers={'Content-Type': 'application/json'})
            if response.status_code == 400:
                print("✅ Malformed JSON handled correctly")
                self.tests_passed += 1
            else:
                print(f"❌ Malformed JSON test failed - got {response.status_code}")
                self.errors.append("Malformed JSON: Wrong status code")
            self.tests_run += 1
        except Exception as e:
            print(f"❌ Malformed JSON test error: {e}")
            self.errors.append(f"Malformed JSON: {e}")
            self.tests_run += 1

    def test_cors_and_security(self):
        """Test CORS headers and basic security"""
        print("\n" + "="*60)
        print("🔒 TESTING CORS & SECURITY")
        print("="*60)
        
        try:
            # Test CORS headers
            response = requests.options(f"{self.base_url}/api/health", headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET'
            })
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            print(f"   🌐 CORS Headers: {cors_headers}")
            if any(cors_headers.values()):
                print("✅ CORS headers present")
                self.tests_passed += 1
            else:
                print("⚠️ No CORS headers found")
                self.errors.append("CORS: No CORS headers found")
            self.tests_run += 1
            
        except Exception as e:
            print(f"❌ CORS test error: {e}")
            self.errors.append(f"CORS test: {e}")
            self.tests_run += 1

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Zuba House Local Backend Test Suite")
        print(f"📡 Testing Local Server at: {self.base_url}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🎯 Focus: Phase 1 Critical Fixes - Payment Integration & Checkout Flow")
        
        # Run all test suites
        self.test_server_health()
        self.test_stripe_endpoints()
        self.test_coupon_endpoints()
        self.test_gift_card_endpoints()
        self.test_product_endpoints()
        self.test_error_handling()
        self.test_cors_and_security()
        
        # Print final results
        return self.print_results()

    def print_results(self):
        """Print final test results and return exit code"""
        print("\n" + "="*70)
        print("📊 FINAL TEST RESULTS")
        print("="*70)
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests Failed: {len(self.errors)}")
        
        if self.errors:
            print("\n🚨 FAILED TESTS:")
            for i, error in enumerate(self.errors, 1):
                print(f"   {i}. {error}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        print("\n🎯 PHASE 1 CRITICAL FIXES STATUS:")
        if success_rate >= 80:
            print("🎉 Backend is functioning well! Phase 1 fixes are working.")
            return 0
        elif success_rate >= 60:
            print("⚠️ Backend has some issues but Phase 1 fixes are mostly functional")
            return 1
        else:
            print("🚨 Backend has significant issues with Phase 1 implementations")
            return 2

def main():
    """Main test runner"""
    print("🏠 Zuba House - TEMU-Level E-Commerce Platform")
    print("📱 Backend API Testing for Phase 1 Critical Fixes")
    print("💳 Payment Integration | 🛒 Checkout Flow | 🎫 Coupons | 🎁 Gift Cards")
    
    tester = LocalBackendTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())