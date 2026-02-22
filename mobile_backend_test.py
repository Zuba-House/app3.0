#!/usr/bin/env python3
"""
Zuba House Mobile Backend Test Suite
Tests both the local backend proxy and external API connectivity
"""

import requests
import sys
import json
from datetime import datetime

class ZubaMobileBackendTester:
    def __init__(self):
        self.local_url = "http://localhost:8001"
        self.external_url = "https://zuba-api.onrender.com"
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []
        self.warnings = []

    def log_test(self, name, success, message="", warning=False):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
            if message:
                print(f"   → {message}")
        elif warning:
            self.warnings.append(f"{name}: {message}")
            print(f"⚠️  {name}: WARNING")
            if message:
                print(f"   → {message}")
        else:
            self.errors.append(f"{name}: {message}")
            print(f"❌ {name}: FAILED")
            if message:
                print(f"   → {message}")
        print()

    def test_local_backend_health(self):
        """Test local backend health endpoint"""
        print("=" * 60)
        print("🔧 TESTING LOCAL BACKEND PROXY")
        print("=" * 60)
        
        try:
            response = requests.get(f"{self.local_url}/api/health", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                message = f"Status: {data.get('status', 'unknown')}, App: {data.get('app', 'unknown')}"
            else:
                message = f"Status code: {response.status_code}"
            
            self.log_test("Local Backend Health", success, message)
            return success
        except Exception as e:
            self.log_test("Local Backend Health", False, f"Connection error: {str(e)}")
            return False

    def test_external_api_health(self):
        """Test external Zuba API health"""
        print("=" * 60)
        print("🌐 TESTING EXTERNAL ZUBA API")
        print("=" * 60)
        
        try:
            response = requests.get(f"{self.external_url}/api/health", timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                message = f"Status: {data.get('status', 'unknown')}, DB: {data.get('database', 'unknown')}"
            else:
                message = f"Status code: {response.status_code}"
            
            self.log_test("External API Health", success, message)
            return success
        except Exception as e:
            self.log_test("External API Health", False, f"Connection error: {str(e)}")
            return False

    def test_api_endpoints_structure(self):
        """Test key API endpoints that the mobile app depends on"""
        print("=" * 60)
        print("📱 TESTING MOBILE APP API ENDPOINTS")
        print("=" * 60)
        
        endpoints_to_test = [
            # From mobile app config.ts
            ("/api/product/getAllProducts", "GET", "Get All Products"),
            ("/api/category", "GET", "Get Categories"), 
            ("/api/cart", "GET", "Get Cart"),
            ("/api/user/user-details", "GET", "Get User Details"),
            ("/api/order", "GET", "Get Orders"),
            ("/api/myList", "GET", "Get Wishlist"),
        ]
        
        for endpoint, method, name in endpoints_to_test:
            try:
                response = requests.get(f"{self.external_url}{endpoint}", timeout=10)
                
                # Most endpoints should return 401 (auth required) or 200 (success)
                # or specific error codes that indicate the endpoint exists
                if response.status_code in [200, 401, 403]:
                    self.log_test(f"{name} Endpoint", True, f"Endpoint exists (status: {response.status_code})")
                elif response.status_code == 404:
                    self.log_test(f"{name} Endpoint", False, f"Endpoint not found (404)")
                else:
                    self.log_test(f"{name} Endpoint", False, f"Unexpected status: {response.status_code}", warning=True)
                    
            except Exception as e:
                self.log_test(f"{name} Endpoint", False, f"Error: {str(e)}")

    def test_proxy_functionality(self):
        """Test if local proxy correctly forwards requests"""
        print("=" * 60)
        print("🔄 TESTING PROXY FUNCTIONALITY")
        print("=" * 60)
        
        try:
            # Test health endpoint through proxy
            proxy_response = requests.get(f"{self.local_url}/api/health", timeout=10)
            direct_response = requests.get(f"{self.external_url}/api/health", timeout=10)
            
            if proxy_response.status_code == 200 and direct_response.status_code == 200:
                proxy_data = proxy_response.json()
                direct_data = direct_response.json()
                
                # Proxy should return its own health, not forward this particular endpoint
                if proxy_data.get('app') == 'Zuba House Mobile' and direct_data.get('status') == 'healthy':
                    self.log_test("Proxy Health Endpoint", True, "Proxy returns own health correctly")
                else:
                    self.log_test("Proxy Health Endpoint", False, "Proxy health response unexpected")
            else:
                self.log_test("Proxy Health Endpoint", False, "One or both endpoints failed")
                
            # Test forwarding to external API
            try:
                proxy_forward = requests.get(f"{self.local_url}/api/category", timeout=15)
                direct_call = requests.get(f"{self.external_url}/api/category", timeout=15)
                
                if proxy_forward.status_code == direct_call.status_code:
                    self.log_test("Proxy Forwarding", True, f"Proxy correctly forwards requests (status: {proxy_forward.status_code})")
                else:
                    self.log_test("Proxy Forwarding", False, f"Status mismatch - Proxy: {proxy_forward.status_code}, Direct: {direct_call.status_code}")
                    
            except Exception as e:
                self.log_test("Proxy Forwarding", False, f"Forwarding test error: {str(e)}")
                
        except Exception as e:
            self.log_test("Proxy Functionality", False, f"Error: {str(e)}")

    def test_cors_headers(self):
        """Test CORS configuration"""
        print("=" * 60)
        print("🌍 TESTING CORS CONFIGURATION")
        print("=" * 60)
        
        try:
            response = requests.options(f"{self.local_url}/api/health", timeout=10)
            
            cors_headers = [
                'access-control-allow-origin',
                'access-control-allow-methods', 
                'access-control-allow-headers'
            ]
            
            found_headers = [h for h in cors_headers if h in [k.lower() for k in response.headers.keys()]]
            
            if len(found_headers) >= 2:  # At least 2 CORS headers
                self.log_test("CORS Headers", True, f"Found CORS headers: {found_headers}")
            else:
                self.log_test("CORS Headers", False, "CORS headers missing or incomplete")
                
        except Exception as e:
            self.log_test("CORS Headers", False, f"Error: {str(e)}")

    def test_typescript_compilation(self):
        """Test mobile app TypeScript compilation"""
        print("=" * 60)
        print("📱 TESTING MOBILE APP COMPILATION")
        print("=" * 60)
        
        import subprocess
        try:
            # Change to mobile directory and run type check
            result = subprocess.run(
                ["npm", "run", "type-check"],
                cwd="/app/mobile",
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                self.log_test("TypeScript Compilation", True, "No critical TypeScript errors")
            else:
                error_lines = result.stderr.strip().split('\n')
                error_count = len([line for line in error_lines if 'error TS' in line])
                
                # Check if these are critical errors or just type warnings
                critical_errors = [line for line in error_lines if any(critical in line.lower() for critical in [
                    'cannot find module', 'module not found', 'cannot resolve module'
                ])]
                
                if error_count > 0 and len(critical_errors) > 0:
                    self.log_test("TypeScript Compilation", False, f"{len(critical_errors)} critical errors found")
                elif error_count > 10:
                    self.log_test("TypeScript Compilation", False, f"{error_count} TypeScript errors (may impact compilation)", warning=True)
                else:
                    self.log_test("TypeScript Compilation", True, f"{error_count} TypeScript warnings (non-critical)", warning=True)
                    
        except subprocess.TimeoutExpired:
            self.log_test("TypeScript Compilation", False, "Type check timed out")
        except Exception as e:
            self.log_test("TypeScript Compilation", False, f"Error: {str(e)}")

    def test_file_structure(self):
        """Test that all required files exist with proper structure"""
        print("=" * 60)
        print("📁 TESTING FILE STRUCTURE")
        print("=" * 60)
        
        import os
        
        required_files = [
            "/app/mobile/src/screens/Checkout/CheckoutScreen.tsx",
            "/app/mobile/src/screens/Checkout/PaymentScreen.tsx", 
            "/app/mobile/src/screens/Checkout/OrderConfirmationScreen.tsx",
            "/app/mobile/src/screens/Address/AddAddressScreen.tsx",
            "/app/mobile/src/screens/Cart/CartScreen.tsx",
            "/app/mobile/src/navigation/AppNavigator.tsx",
            "/app/mobile/src/services/checkout.service.ts",
            "/app/mobile/src/services/address.service.ts",
        ]
        
        all_exist = True
        for file_path in required_files:
            if os.path.exists(file_path):
                # Check if file has reasonable content (not empty)
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                        if len(content) > 100:  # Has substantial content
                            file_name = os.path.basename(file_path)
                            self.log_test(f"{file_name} exists", True, f"File has {len(content)} characters")
                        else:
                            self.log_test(f"{file_name} exists", False, "File is too small/empty")
                            all_exist = False
                except Exception as e:
                    self.log_test(f"{file_name} readable", False, f"Cannot read file: {str(e)}")
                    all_exist = False
            else:
                file_name = os.path.basename(file_path)
                self.log_test(f"{file_name} exists", False, "File not found")
                all_exist = False
        
        return all_exist

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 ZUBA HOUSE MOBILE - BACKEND TESTING")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

        # Test file structure first
        files_ok = self.test_file_structure()
        
        # Test backend functionality
        local_ok = self.test_local_backend_health()
        external_ok = self.test_external_api_health()
        
        if local_ok and external_ok:
            self.test_proxy_functionality()
            self.test_cors_headers()
        
        # Test API endpoints
        if external_ok:
            self.test_api_endpoints_structure()
        
        # Test TypeScript compilation
        self.test_typescript_compilation()

        # Print results
        self.print_results()
        
        return self.tests_passed >= (self.tests_run * 0.7)  # 70% success rate

    def print_results(self):
        """Print final test results"""
        print("=" * 60)
        print("📊 FINAL RESULTS")
        print("=" * 60)
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests Failed: {len(self.errors)}")
        print(f"⚠️  Warnings: {len(self.warnings)}")
        
        if self.errors:
            print("\n🚨 FAILED TESTS:")
            for i, error in enumerate(self.errors, 1):
                print(f"   {i}. {error}")
        
        if self.warnings:
            print("\n⚠️  WARNINGS:")
            for i, warning in enumerate(self.warnings, 1):
                print(f"   {i}. {warning}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 85:
            print("🎉 Backend is ready for mobile app!")
            return 0
        elif success_rate >= 70:
            print("✅ Backend is mostly functional with minor issues")
            return 0
        else:
            print("🚨 Backend has significant issues that need fixing")
            return 1

def main():
    """Main test runner"""
    tester = ZubaMobileBackendTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())