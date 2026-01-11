#!/usr/bin/env python3
"""
Zuba House E-Commerce Backend API Test Suite
Tests the FastAPI proxy server that forwards requests to the live Zuba API
"""

import requests
import sys
import json
from datetime import datetime

class ZubaAPITester:
    def __init__(self, base_url="https://zuba-api.onrender.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []

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

    def test_category_endpoints(self):
        """Test category-related endpoints"""
        print("\n" + "="*50)
        print("🏷️ TESTING CATEGORY ENDPOINTS")
        print("="*50)
        
        # Test categories list
        success, response = self.run_test("Get Categories", "GET", "/api/category")
        
        if success and response:
            try:
                data = response.json()
                if isinstance(data, dict) and 'data' in data:
                    categories = data['data']
                    if len(categories) > 0:
                        print(f"   Found {len(categories)} categories")
                        # Test first category details if available
                        first_cat = categories[0]
                        if '_id' in first_cat:
                            self.run_test("Get Category Details", "GET", f"/api/category/{first_cat['_id']}")
            except Exception as e:
                print(f"   Could not parse category response: {e}")

    def test_product_endpoints(self):
        """Test product-related endpoints"""
        print("\n" + "="*50)
        print("🛍️ TESTING PRODUCT ENDPOINTS")
        print("="*50)
        
        # Test products list
        success, response = self.run_test("Get Products", "GET", "/api/products")
        
        if success and response:
            try:
                data = response.json()
                products = []
                
                if isinstance(data, dict) and 'data' in data:
                    products = data['data']
                elif isinstance(data, list):
                    products = data
                
                if len(products) > 0:
                    print(f"   Found {len(products)} products")
                    # Test first product details if available
                    first_product = products[0]
                    if '_id' in first_product:
                        self.run_test("Get Product Details", "GET", f"/api/products/{first_product['_id']}")
                    elif 'id' in first_product:
                        self.run_test("Get Product Details", "GET", f"/api/products/{first_product['id']}")
                else:
                    print("   No products found in response")
            except Exception as e:
                print(f"   Could not parse products response: {e}")
        
        # Test product search
        self.run_test("Search Products", "GET", "/api/products?search=shirt")
        
        # Test products with pagination
        self.run_test("Products with Pagination", "GET", "/api/products?page=1&limit=10")

    def test_brand_endpoints(self):
        """Test brand-related endpoints"""
        print("\n" + "="*50)
        print("🏢 TESTING BRAND ENDPOINTS")
        print("="*50)
        
        # Test brands list
        success, response = self.run_test("Get Brands", "GET", "/api/brands")
        
        if success and response:
            try:
                data = response.json()
                if isinstance(data, dict) and 'data' in data:
                    brands = data['data']
                    if len(brands) > 0:
                        print(f"   Found {len(brands)} brands")
            except Exception as e:
                print(f"   Could not parse brands response: {e}")

    def test_auth_endpoints(self):
        """Test authentication endpoints (without actual login)"""
        print("\n" + "="*50)
        print("🔐 TESTING AUTH ENDPOINTS")
        print("="*50)
        
        # Test login endpoint structure (should return error for missing credentials)
        self.run_test("Login Endpoint Structure", "POST", "/api/auth/login", 
                     expected_status=400, data={})
        
        # Test register endpoint structure (should return error for missing data)
        self.run_test("Register Endpoint Structure", "POST", "/api/auth/register", 
                     expected_status=400, data={})

    def test_cart_endpoints(self):
        """Test cart endpoints (without authentication)"""
        print("\n" + "="*50)
        print("🛒 TESTING CART ENDPOINTS")
        print("="*50)
        
        # Test cart get (should require auth)
        self.run_test("Get Cart (No Auth)", "GET", "/api/cart/get", expected_status=401)
        
        # Test cart add (should require auth)
        self.run_test("Add to Cart (No Auth)", "POST", "/api/cart/add", 
                     expected_status=401, data={"productId": "test"})

    def test_error_handling(self):
        """Test error handling for invalid endpoints"""
        print("\n" + "="*50)
        print("❌ TESTING ERROR HANDLING")
        print("="*50)
        
        # Test 404 for non-existent endpoint
        self.run_test("Non-existent Endpoint", "GET", "/api/nonexistent", expected_status=404)
        
        # Test invalid product ID
        self.run_test("Invalid Product ID", "GET", "/api/products/invalid-id", expected_status=404)

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Zuba API Test Suite")
        print(f"📡 Testing API at: {self.base_url}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run all test suites
        self.test_health_endpoints()
        self.test_category_endpoints()
        self.test_product_endpoints()
        self.test_brand_endpoints()
        self.test_auth_endpoints()
        self.test_cart_endpoints()
        self.test_error_handling()
        
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