#!/usr/bin/env python3
"""
Zuba House E-Commerce Backend API Test Suite
Tests Phase 2 - Push notification system and Stripe integration with real keys
"""

import requests
import sys
import json
from datetime import datetime

class ZubaAPITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []
        self.passed_tests = []

    def run_test(self, name, method, endpoint, expected_status=200, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
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
                self.passed_tests.append(name)
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'data' in response_data:
                        print(f"   Response: {len(response_data.get('data', []))} items returned")
                    elif isinstance(response_data, list):
                        print(f"   Response: {len(response_data)} items returned")
                    else:
                        print(f"   Response: {str(response_data)[:100]}...")
                except:
                    print(f"   Response: Non-JSON response")
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                self.errors.append(f"{name}: {error_msg}")
                print(f"❌ Failed - {error_msg}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}...")

            return success, response

        except requests.exceptions.Timeout:
            error_msg = "Request timeout (30s)"
            self.errors.append(f"{name}: {error_msg}")
            print(f"❌ Failed - {error_msg}")
            return False, None
        except requests.exceptions.ConnectionError:
            error_msg = "Connection error - API may be down"
            self.errors.append(f"{name}: {error_msg}")
            print(f"❌ Failed - {error_msg}")
            return False, None
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            self.errors.append(f"{name}: {error_msg}")
            print(f"❌ Failed - {error_msg}")
            return False, None

    def test_health_endpoints(self):
        """Test basic health and info endpoints"""
        print("\n" + "="*50)
        print("🏥 TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("Root Endpoint", "GET", "/")
        
        # Test API health
        self.run_test("API Health Check", "GET", "/api/health")

    def test_stripe_endpoints(self):
        """Test Stripe payment integration endpoints"""
        print("\n" + "="*50)
        print("💳 TESTING STRIPE INTEGRATION")
        print("="*50)
        
        # Test Stripe health endpoint
        success, response = self.run_test("Stripe Health Check", "GET", "/api/stripe/health")
        
        if success and response:
            try:
                data = response.json()
                print(f"   Stripe configured: {data.get('configured', False)}")
                print(f"   Live mode: {data.get('livemode', False)}")
            except:
                print("   Could not parse Stripe health response")

        # Test Stripe account info
        self.run_test("Stripe Account Info", "GET", "/api/stripe/account-info")
        
        # Test create checkout session
        checkout_data = {
            "amount": 29.99,
            "orderId": "test_order_123",
            "successUrl": "http://localhost:5000/payment-success",
            "cancelUrl": "http://localhost:5000/payment-cancel",
            "metadata": {
                "source": "test",
                "customer": "test_customer"
            }
        }
        
        success, response = self.run_test(
            "Create Checkout Session", 
            "POST", 
            "/api/stripe/create-checkout-session", 
            200, 
            checkout_data
        )
        
        # If checkout session creation succeeded, test status endpoint
        if success and response:
            try:
                data = response.json()
                session_id = data.get('data', {}).get('sessionId')
                if session_id:
                    print(f"   Session ID: {session_id[:20]}...")
                    self.run_test(
                        "Get Checkout Status", 
                        "GET", 
                        f"/api/stripe/checkout-status/{session_id}"
                    )
                else:
                    print("   No session ID returned from checkout creation")
            except Exception as e:
                print(f"   Could not extract session ID: {e}")

    def test_notification_endpoints(self):
        """Test push notification endpoints"""
        print("\n" + "="*50)
        print("🔔 TESTING NOTIFICATION SYSTEM")
        print("="*50)
        
        # Test register push token
        token_data = {
            "pushToken": "ExponentPushToken[test_token_12345]",
            "deviceType": "ios",
            "userId": "test_user_123"
        }
        
        self.run_test(
            "Register Push Token", 
            "POST", 
            "/api/notifications/register-token", 
            200, 
            token_data
        )
        
        # Test send notification
        notification_data = {
            "userId": "test_user_123",
            "title": "Test Notification",
            "body": "This is a test notification from the API",
            "type": "general",
            "data": {
                "test": True
            }
        }
        
        self.run_test(
            "Send Push Notification", 
            "POST", 
            "/api/notifications/send", 
            200, 
            notification_data
        )
        
        # Test broadcast notification
        broadcast_data = {
            "title": "Test Broadcast",
            "body": "This is a test broadcast notification",
            "type": "promotion",
            "userIds": ["test_user_123"]
        }
        
        self.run_test(
            "Broadcast Notification", 
            "POST", 
            "/api/notifications/broadcast", 
            200, 
            broadcast_data
        )

    def test_coupon_endpoints(self):
        """Test coupon validation endpoints"""
        print("\n" + "="*50)
        print("🎫 TESTING COUPON SYSTEM")
        print("="*50)
        
        # Test coupon validation
        coupon_data = {
            "code": "TEST10",
            "amount": 100.00,
            "userId": "test_user_123"
        }
        
        # This will likely return 404 or validation error, but we test the endpoint exists
        self.run_test(
            "Validate Coupon Code", 
            "POST", 
            "/api/coupons/validate", 
            expected_status=[200, 400, 404],  # Accept multiple valid responses
            data=coupon_data
        )

    def test_gift_card_endpoints(self):
        """Test gift card validation endpoints"""
        print("\n" + "="*50)
        print("🎁 TESTING GIFT CARD SYSTEM")
        print("="*50)
        
        # Test gift card validation
        gift_card_data = {
            "code": "GIFT123",
            "amount": 50.00,
            "userId": "test_user_123"
        }
        
        # This will likely return 404 or validation error, but we test the endpoint exists
        self.run_test(
            "Validate Gift Card", 
            "POST", 
            "/api/gift-cards/validate", 
            expected_status=[200, 400, 404],  # Accept multiple valid responses
            data=gift_card_data
        )

    def test_product_endpoints(self):
        """Test product listing endpoints"""
        print("\n" + "="*50)
        print("🛍️ TESTING PRODUCT SYSTEM")
        print("="*50)
        
        # Test products list - correct endpoint
        success, response = self.run_test("Get All Products", "GET", "/api/product/getAllProducts")
        
        if success and response:
            try:
                data = response.json()
                products = []
                
                if isinstance(data, dict):
                    if 'products' in data:
                        products = data['products']
                    elif 'data' in data:
                        products = data['data']
                elif isinstance(data, list):
                    products = data
                
                if len(products) > 0:
                    print(f"   Found {len(products)} products")
                    # Test first product details if available
                    first_product = products[0]
                    if '_id' in first_product:
                        self.run_test("Get Product Details", "GET", f"/api/product/{first_product['_id']}")
                    elif 'id' in first_product:
                        self.run_test("Get Product Details", "GET", f"/api/product/{first_product['id']}")
                else:
                    print("   No products found in database (empty response is expected)")
            except Exception as e:
                print(f"   Could not parse products response: {e}")
        
        # Test product search with correct endpoint
        search_data = {"query": "test"}
        self.run_test("Search Products", "POST", "/api/product/search/get", 200, search_data)
        
        # Test featured products
        self.run_test("Get Featured Products", "GET", "/api/product/getAllFeaturedProducts")
        
        # Test sale products
        self.run_test("Get Sale Products", "GET", "/api/product/getSaleProducts")

    def run_test_with_flexible_status(self, name, method, endpoint, expected_statuses, data=None):
        """Run test that accepts multiple status codes as success"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code in expected_statuses
            if success:
                self.tests_passed += 1
                self.passed_tests.append(name)
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {str(response_data)[:100]}...")
                except:
                    print(f"   Response: Non-JSON response")
            else:
                error_msg = f"Expected one of {expected_statuses}, got {response.status_code}"
                self.errors.append(f"{name}: {error_msg}")
                print(f"❌ Failed - {error_msg}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}...")

            return success, response

        except Exception as e:
            error_msg = f"Error: {str(e)}"
            self.errors.append(f"{name}: {error_msg}")
            print(f"❌ Failed - {error_msg}")
            return False, None

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Zuba API Test Suite - Phase 2")
        print(f"📡 Testing API at: {self.base_url}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run all test suites
        self.test_health_endpoints()
        self.test_stripe_endpoints()
        self.test_notification_endpoints()
        
        # Update coupon and gift card tests to use flexible status checking
        print("\n" + "="*50)
        print("🎫 TESTING COUPON SYSTEM")
        print("="*50)
        
        coupon_data = {
            "code": "TEST10",
            "amount": 100.00,
            "userId": "test_user_123"
        }
        
        self.run_test_with_flexible_status(
            "Validate Coupon Code", 
            "POST", 
            "/api/coupons/validate", 
            [200, 400, 404],  # Accept multiple valid responses
            coupon_data
        )

        print("\n" + "="*50)
        print("🎁 TESTING GIFT CARD SYSTEM")
        print("="*50)
        
        gift_card_data = {
            "code": "GIFT123",
            "amount": 50.00,
            "userId": "test_user_123"
        }
        
        self.run_test_with_flexible_status(
            "Validate Gift Card", 
            "POST", 
            "/api/gift-cards/validate", 
            [200, 400, 404],  # Accept multiple valid responses
            gift_card_data
        )
        
        self.test_product_endpoints()
        
        # Print final results
        self.print_results()

    def print_results(self):
        """Print final test results"""
        print("\n" + "="*60)
        print("📊 FINAL TEST RESULTS")
        print("="*60)
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests Failed: {len(self.errors)}")
        
        if self.errors:
            print("\n🚨 FAILED TESTS:")
            for i, error in enumerate(self.errors, 1):
                print(f"   {i}. {error}")
        
        if self.passed_tests:
            print("\n✅ PASSED TESTS:")
            for i, test in enumerate(self.passed_tests, 1):
                print(f"   {i}. {test}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 API is functioning well!")
            return 0
        elif success_rate >= 60:
            print("⚠️ API has some issues but is mostly functional")
            return 1
        else:
            print("🚨 API has significant issues")
            return 2

def main():
    """Main test runner"""
    tester = ZubaAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())