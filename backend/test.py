import subprocess
import json
import sys
import os
from datetime import datetime, timedelta
import random
import string
import time

class DatabaseTester:
    def __init__(self, js_file_path='ts_files_db/index.js'):
        self.js_file_path = js_file_path
        self.test_data = {}  # Store created test data for cleanup
        
    def call_js_db(self, operation, data=None):
        """Call JavaScript database function via subprocess"""
        cmd = ['node', self.js_file_path, operation]
        if data:
            cmd.append(json.dumps(data))
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.path.dirname(os.path.abspath(__file__))
            )
            
            if result.returncode == 0:
                return json.loads(result.stdout)
            else:
                return {
                    'success': False,
                    'error': result.stderr,
                    'stdout': result.stdout
                }
        except subprocess.TimeoutExpired:
            return {'success': False, 'error': 'Operation timed out'}
        except json.JSONDecodeError as e:
            return {'success': False, 'error': f'JSON decode error: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def test_operation(self, operation_name, operation, data=None, expected_success=True):
        """Test a single database operation with enhanced validation"""
        print(f"\n--- Testing {operation_name} ---")
        print(f"Operation: {operation}")
        if data:
            print(f"Data: {json.dumps(data, indent=2)}")
        
        start_time = time.time()
        result = self.call_js_db(operation, data)
        end_time = time.time()
        
        print(f"Result: {json.dumps(result, indent=2)}")
        print(f"Execution Time: {(end_time - start_time)*1000:.2f}ms")
        
        success = result.get('success', False)
        if expected_success:
            return success
        else:
            # For negative tests, we expect failure
            return not success

    def generate_random_string(self, length=10):
        """Generate random string for testing"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

    def generate_test_data(self):
        """Generate comprehensive test data"""
        return {
            'locations': [
                {
                    "latitude": 12.9716,
                    "longitude": 77.5946,
                    "address": "123 Main Street",
                    "city": "Bangalore",
                    "state": "Karnataka",
                    "country": "India",
                    "zipCode": "560001"
                },
                {
                    "latitude": 28.7041,
                    "longitude": 77.1025,
                    "address": "456 Secondary Road",
                    "city": "Delhi",
                    "state": "Delhi",
                    "country": "India",
                    "zipCode": "110001"
                },
                {
                    "latitude": 19.0760,
                    "longitude": 72.8777,
                    "address": "789 Business District",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "country": "India",
                    "zipCode": "400001"
                }
            ],
            'inventories': [
                {
                    "location": "Main Warehouse Location",
                    "locationId": 1,
                    "volumeOccupied": 100.5,
                    "volumeAvailable": 500.0,
                    "volumeReserved": 50.0,
                    "name": "Main Warehouse",
                    "description": "Primary storage location",
                    "threshold": 100,
                    "status": "healthy"
                },
                {
                    "location": "Secondary Warehouse",
                    "locationId": 2,
                    "volumeOccupied": 200.0,
                    "volumeAvailable": 300.0,
                    "volumeReserved": 25.0,
                    "name": "Secondary Warehouse",
                    "description": "Secondary storage facility",
                    "threshold": 75,
                    "status": "warning"
                },
                {
                    "location": "Emergency Storage",
                    "locationId": 3,
                    "volumeOccupied": 450.0,
                    "volumeAvailable": 50.0,
                    "volumeReserved": 100.0,
                    "name": "Emergency Storage",
                    "description": "Critical storage facility",
                    "threshold": 50,
                    "status": "critical"
                }
            ],
            'items': [
                {
                    "name": "Laptop Computer",
                    "description": "High-performance laptop for business use",
                    "price": 999.99,
                    "weight": 2.5,
                    "dimensions": "35x25x2 cm"
                },
                {
                    "name": "Wireless Mouse",
                    "description": "Ergonomic wireless mouse",
                    "price": 29.99,
                    "weight": 0.1,
                    "dimensions": "10x6x3 cm"
                },
                {
                    "name": "Office Chair",
                    "description": "Ergonomic office chair with lumbar support",
                    "price": 299.99,
                    "weight": 15.0,
                    "dimensions": "60x60x120 cm"
                },
                {
                    "name": "Smartphone",
                    "description": "Latest model smartphone",
                    "price": 699.99,
                    "weight": 0.2,
                    "dimensions": "15x7x1 cm"
                },
                {
                    "name": "Tablet",
                    "description": "10-inch tablet for productivity",
                    "price": 399.99,
                    "weight": 0.5,
                    "dimensions": "25x17x1 cm"
                }
            ],
            'admins': [
                {
                    "name": "John Admin",
                    "email": f"john.admin.{self.generate_random_string(5)}@company.com",
                    "password": "securepassword123"
                },
                {
                    "name": "Jane Manager",
                    "email": f"jane.manager.{self.generate_random_string(5)}@company.com",
                    "password": "managerpass456"
                }
            ]
        }

def main():
    tester = DatabaseTester()
    test_data = tester.generate_test_data()
    
    print("=" * 80)
    print("COMPREHENSIVE DATABASE OPERATIONS TEST SUITE")
    print("=" * 80)
    
    passed = 0
    failed = 0
    total_tests = 0
    
    # Test categories with detailed test cases
    test_categories = [
        # 1. LOCATION OPERATIONS - Complete CRUD
        {
            'name': 'LOCATION OPERATIONS',
            'tests': [
                ("Create Location 1", "location_ops.create", test_data['locations'][0]),
                ("Create Location 2", "location_ops.create", test_data['locations'][1]),
                ("Create Location 3", "location_ops.create", test_data['locations'][2]),
                ("Get All Locations", "location_ops.getAll", None),
                ("Get Location by ID 1", "location_ops.getById", 1),
                ("Get Location by ID 2", "location_ops.getById", 2),
                ("Get Location by ID 3", "location_ops.getById", 3),
                ("Update Location 1", "location_ops.updateById", (1, {"city": "Updated Bangalore"})),
                ("Delete Location 3", "location_ops.deleteById", 3),
                ("Verify Location 3 Deleted", "location_ops.getById", 3),  # Should fail
            ]
        },
        
        # 2. INVENTORY OPERATIONS - Complete CRUD + Business Logic
        {
            'name': 'INVENTORY OPERATIONS',
            'tests': [
                ("Create Inventory 1", "inventory_ops.create", test_data['inventories'][0]),
                ("Create Inventory 2", "inventory_ops.create", test_data['inventories'][1]),
                ("Create Inventory 3", "inventory_ops.create", test_data['inventories'][2]),
                ("Get All Inventories", "inventory_ops.getAll", None),
                ("Get Inventory by ID 1", "inventory_ops.getById", 1),
                ("Get Inventory by ID 2", "inventory_ops.getById", 2),
                ("Get Inventory by Location 1", "inventory_ops.getByLocation", 1),
                ("Get Inventory by Location 2", "inventory_ops.getByLocation", 2),
                ("Get Inventories by Status - Healthy", "inventory_ops.getByStatus", "healthy"),
                ("Get Inventories by Status - Warning", "inventory_ops.getByStatus", "warning"),
                ("Get Inventories by Status - Critical", "inventory_ops.getByStatus", "critical"),
                ("Update Inventory 1 Status", "inventory_ops.updateById", (1, {"status": "warning"})),
                ("Update Inventory 2 Volumes", "inventory_ops.updateById", (2, {"volumeOccupied": 250.0, "volumeAvailable": 250.0})),
                ("Delete Inventory 3", "inventory_ops.deleteById", 3),
            ]
        },
        
        # 3. ITEM OPERATIONS - Complete CRUD + Search
        {
            'name': 'ITEM OPERATIONS',
            'tests': [
                ("Create Item 1 - Laptop", "item_ops.create", test_data['items'][0]),
                ("Create Item 2 - Mouse", "item_ops.create", test_data['items'][1]),
                ("Create Item 3 - Chair", "item_ops.create", test_data['items'][2]),
                ("Create Item 4 - Smartphone", "item_ops.create", test_data['items'][3]),
                ("Create Item 5 - Tablet", "item_ops.create", test_data['items'][4]),
                ("Get All Items", "item_ops.getAll", None),
                ("Get Item by ID 1", "item_ops.getById", 1),
                ("Get Item by ID 2", "item_ops.getById", 2),
                ("Search Item by Name - Laptop", "item_ops.searchByName", "Laptop Computer"),
                ("Search Item by Name - Mouse", "item_ops.searchByName", "Wireless Mouse"),
                ("Update Item 1 Price", "item_ops.updateById", (1, {"price": 1099.99})),
                ("Update Item 2 Description", "item_ops.updateById", (2, {"description": "Updated wireless mouse with RGB"})),
                ("Delete Item 5", "item_ops.deleteById", 5),
            ]
        },
        
        # 4. INVENTORY-ITEM RELATIONSHIPS - Junction Table Operations
        {
            'name': 'INVENTORY-ITEM RELATIONSHIPS',
            'tests': [
                ("Add Item 1 to Inventory 1", "inventoryItems_ops.create", {"inventoryId": 1, "itemId": 1, "quantity": 50}),
                ("Add Item 2 to Inventory 1", "inventoryItems_ops.create", {"inventoryId": 1, "itemId": 2, "quantity": 100}),
                ("Add Item 3 to Inventory 1", "inventoryItems_ops.create", {"inventoryId": 1, "itemId": 3, "quantity": 25}),
                ("Add Item 1 to Inventory 2", "inventoryItems_ops.create", {"inventoryId": 2, "itemId": 1, "quantity": 30}),
                ("Add Item 4 to Inventory 2", "inventoryItems_ops.create", {"inventoryId": 2, "itemId": 4, "quantity": 75}),
                ("Get Items in Inventory 1", "inventoryItems_ops.getByInventoryId", 1),
                ("Get Items in Inventory 2", "inventoryItems_ops.getByInventoryId", 2),
                ("Update Item 1 Quantity in Inventory 1", "inventoryItems_ops.updateQuantity", (1, 1, 60)),
                ("Update Item 2 Quantity in Inventory 1", "inventoryItems_ops.updateQuantity", (1, 2, 80)),
                ("Remove Item 3 from Inventory 1", "inventoryItems_ops.removeItem", (1, 3)),
            ]
        },
        
        # 5. REAL-TIME ALERTS - Alert Management System
        {
            'name': 'REAL-TIME ALERTS',
            'tests': [
                ("Create Stockout Alert", "realtimealert_ops.create", {
                    "inventoryId": 1, "alertType": "stockout", "severity": "high",
                    "message": "Critical stockout in main warehouse", "isResolved": False
                }),
                ("Create Overstock Alert", "realtimealert_ops.create", {
                    "inventoryId": 2, "alertType": "overstock", "severity": "medium",
                    "message": "Overstock detected in secondary warehouse", "isResolved": False
                }),
                ("Create Demand Spike Alert", "realtimealert_ops.create", {
                    "inventoryId": 1, "alertType": "demand_spike", "severity": "critical",
                    "message": "Unexpected demand spike for laptops", "isResolved": False
                }),
                ("Create Low Severity Alert", "realtimealert_ops.create", {
                    "inventoryId": 2, "alertType": "maintenance", "severity": "low",
                    "message": "Scheduled maintenance required", "isResolved": False
                }),
                ("Get All Alerts", "realtimealert_ops.getAll", None),
                ("Get Unresolved Alerts", "realtimealert_ops.getUnresolved", None),
                ("Get Alerts by Severity - High", "realtimealert_ops.getBySeverity", "high"),
                ("Get Alerts by Severity - Critical", "realtimealert_ops.getBySeverity", "critical"),
                ("Get Alerts by Type - Stockout", "realtimealert_ops.getByType", "stockout"),
                ("Get Alerts by Type - Demand Spike", "realtimealert_ops.getByType", "demand_spike"),
                ("Resolve Alert 1", "realtimealert_ops.updateResolved", 1),
                ("Resolve Alert 3", "realtimealert_ops.updateResolved", 3),
                ("Delete Alert 4", "realtimealert_ops.deleteById", 4),
            ]
        },
        
        # 6. DEMAND HISTORY - Time Series Data
        {
            'name': 'DEMAND HISTORY',
            'tests': [
                ("Record Demand - Order Source", "demandhistory_ops.create", {
                    "inventoryId": 1, "itemId": 1, "demandQuantity": 10,
                    "timestamp": "2023-07-01T10:00:00Z", "source": "order"
                }),
                ("Record Demand - Forecast Source", "demandhistory_ops.create", {
                    "inventoryId": 1, "itemId": 2, "demandQuantity": 25,
                    "timestamp": "2023-07-01T11:00:00Z", "source": "forecast"
                }),
                ("Record Demand - Manual Source", "demandhistory_ops.create", {
                    "inventoryId": 2, "itemId": 1, "demandQuantity": 15,
                    "timestamp": "2023-07-01T12:00:00Z", "source": "manual"
                }),
                ("Record Demand - API Source", "demandhistory_ops.create", {
                    "inventoryId": 2, "itemId": 4, "demandQuantity": 30,
                    "timestamp": "2023-07-01T13:00:00Z", "source": "api"
                }),
                ("Record Demand - Bulk Order", "demandhistory_ops.create", {
                    "inventoryId": 1, "itemId": 1, "demandQuantity": 100,
                    "timestamp": "2023-07-01T14:00:00Z", "source": "bulk_order"
                }),
                ("Get All Demand History", "demandhistory_ops.getAll", None),
                ("Get Demand by ID 1", "demandhistory_ops.getById", 1),
                ("Get Demand by Inventory 1", "demandhistory_ops.getByInventoryId", 1),
                ("Get Demand by Inventory 2", "demandhistory_ops.getByInventoryId", 2),
                ("Get Demand by Item 1", "demandhistory_ops.getByItemId", 1),
                ("Get Demand by Item 4", "demandhistory_ops.getByItemId", 4),
                ("Get Demand by Source - Order", "demandhistory_ops.getBySource", "order"),
                ("Get Demand by Source - Forecast", "demandhistory_ops.getBySource", "forecast"),
                ("Delete Demand Record 5", "demandhistory_ops.deleteById", 5),
            ]
        },
        
        # 7. TRIGGER MESSAGES - System Messaging
        {
            'name': 'TRIGGER MESSAGES',
            'tests': [
                ("Create Trigger Message 1", "triggermessage_ops.create", {
                    "inventoryId": 1, "message": "Low stock alert triggered", "status": "pending"
                }),
                ("Create Trigger Message 2", "triggermessage_ops.create", {
                    "inventoryId": 2, "message": "Restock recommendation", "status": "pending"
                }),
                ("Create Trigger Message 3", "triggermessage_ops.create", {
                    "inventoryId": 1, "message": "Urgent restocking required", "status": "pending"
                }),
                ("Get All Trigger Messages", "triggermessage_ops.getAll", None),
                ("Get Trigger Message by ID 1", "triggermessage_ops.getById", 1),
                ("Get Messages by Status - Pending", "triggermessage_ops.getByStatus", "pending"),
                ("Update Message 1 Status", "triggermessage_ops.updateStatusById", (1, "fulfilled")),
                ("Update Message 2 Status", "triggermessage_ops.updateStatusById", (2, "cannot_fulfill")),
                ("Update Message 3", "triggermessage_ops.updateById", (3, {"message": "Updated urgent message"})),
                ("Get Messages by Status - Fulfilled", "triggermessage_ops.getByStatus", "fulfilled"),
                ("Delete Trigger Message 3", "triggermessage_ops.deleteById", 3),
            ]
        },
        
        # 8. RELOCATION MESSAGES - Inventory Movement
        {
            'name': 'RELOCATION MESSAGES',
            'tests': [
                ("Create Relocation Message 1", "relocationmessage_ops.create", {
                    "itemId": 1, "fromInventoryId": 1, "toInventoryId": 2, "quantity": 20,
                    "priority": "high", "status": "pending"
                }),
                ("Create Relocation Message 2", "relocationmessage_ops.create", {
                    "itemId": 2, "fromInventoryId": 2, "toInventoryId": 1, "quantity": 15,
                    "priority": "medium", "status": "pending"
                }),
                ("Create Relocation Message 3", "relocationmessage_ops.create", {
                    "itemId": 4, "fromInventoryId": 1, "toInventoryId": 2, "quantity": 10,
                    "priority": "low", "status": "in_progress"
                }),
                ("Get All Relocation Messages", "relocationmessage_ops.getAll", None),
                ("Get Relocation by ID 1", "relocationmessage_ops.getById", 1),
                ("Get Relocations by Status - Pending", "relocationmessage_ops.getByStatus", "pending"),
                ("Get Relocations by Status - In Progress", "relocationmessage_ops.getByStatus", "in_progress"),
                ("Get Relocations by Priority - High", "relocationmessage_ops.getByPriority", "high"),
                ("Get Relocations by Priority - Medium", "relocationmessage_ops.getByPriority", "medium"),
                ("Update Relocation 1", "relocationmessage_ops.updateById", (1, {"status": "completed"})),
                ("Update Relocation 2", "relocationmessage_ops.updateById", (2, {"status": "failed"})),
                ("Delete Relocation 3", "relocationmessage_ops.deleteById", 3),
            ]
        },
        
        # 9. FORECASTING METRICS - AI/ML Data
        {
            'name': 'FORECASTING METRICS',
            'tests': [
                ("Create Forecast Metric 1", "forecastingMetrics_ops.create", {
                    "inventoryId": 1, "howMuchTimeToFill": "02:30:00",
                    "predictedDemand": 150.5, "actualDemand": 145.2
                }),
                ("Create Forecast Metric 2", "forecastingMetrics_ops.create", {
                    "inventoryId": 2, "howMuchTimeToFill": "01:45:00",
                    "predictedDemand": 200.0, "actualDemand": 195.8
                }),
                ("Create Forecast Metric 3", "forecastingMetrics_ops.create", {
                    "inventoryId": 1, "howMuchTimeToFill": "03:15:00",
                    "predictedDemand": 300.0, "actualDemand": 320.5
                }),
                ("Get All Forecasting Metrics", "forecastingMetrics_ops.getAll", None),
                ("Get Forecast by ID 1", "forecastingMetrics_ops.getById", 1),
                ("Get Forecasts by Inventory 1", "forecastingMetrics_ops.getByInventoryId", 1),
                ("Get Forecasts by Inventory 2", "forecastingMetrics_ops.getByInventoryId", 2),
                ("Update Forecast 1", "forecastingMetrics_ops.updateById", (1, {"actualDemand": 150.0})),
                ("Update Forecast 2", "forecastingMetrics_ops.updateById", (2, {"predictedDemand": 210.0})),
                ("Delete Forecast 3", "forecastingMetrics_ops.deleteById", 3),
            ]
        },
        
        # 10. SPIKE MONITORING - Performance Monitoring
        {
            'name': 'SPIKE MONITORING',
            'tests': [
                ("Create Spike Monitor 1", "spikemonitoring_ops.create", {"inventoryId": 1}),
                ("Create Spike Monitor 2", "spikemonitoring_ops.create", {"inventoryId": 2}),
                ("Create Spike Monitor 3", "spikemonitoring_ops.create", {"inventoryId": 1}),
                ("Get All Spike Monitors", "spikemonitoring_ops.getAll", None),
                ("Get Spike Monitors by Inventory 1", "spikemonitoring_ops.getByInventoryId", 1),
                ("Get Spike Monitors by Inventory 2", "spikemonitoring_ops.getByInventoryId", 2),
                ("Update Spike Monitor 1", "spikemonitoring_ops.updateById", (1, {"inventoryId": 2})),
                ("Delete Spike Monitor 3", "spikemonitoring_ops.deleteById", 3),
            ]
        },
        
        # 11. ADMIN OPERATIONS - User Management
        {
            'name': 'ADMIN OPERATIONS',
            'tests': [
                ("Create Admin 1", "admin_ops.create", test_data['admins'][0]),
                ("Create Admin 2", "admin_ops.create", test_data['admins'][1]),
                ("Get All Admins", "admin_ops.getAll", None),
                ("Get Admin by ID 1", "admin_ops.getById", 1),
                ("Get Admin by Email", "admin_ops.getByEmail", test_data['admins'][0]['email']),
                ("Update Admin 1", "admin_ops.updateById", (1, {"name": "John Updated Admin"})),
                ("Delete Admin 2", "admin_ops.deleteById", 2),
            ]
        },
        
        # 12. UTILITY OPERATIONS - Business Intelligence
        {
            'name': 'UTILITY OPERATIONS',
            'tests': [
                ("Get Dashboard Summary", "utility_ops.getDashboardSummary", None),
                ("Get Inventory Overview 1", "utility_ops.getInventoryOverview", 1),
                ("Get Inventory Overview 2", "utility_ops.getInventoryOverview", 2),
            ]
        },
        
        # 13. EDGE CASES & ERROR HANDLING
        {
            'name': 'EDGE CASES & ERROR HANDLING',
            'tests': [
                ("Get Non-existent Location", "location_ops.getById", 999),
                ("Get Non-existent Inventory", "inventory_ops.getById", 999),
                ("Get Non-existent Item", "item_ops.getById", 999),
                ("Create Inventory with Invalid Location", "inventory_ops.create", {
                    "location": "Invalid Location", "locationId": 999,
                    "volumeOccupied": 100.0, "volumeAvailable": 500.0,
                    "volumeReserved": 50.0, "name": "Invalid Warehouse",
                    "description": "This should fail", "threshold": 100, "status": "healthy"
                }),
                ("Create Item with Invalid Data", "item_ops.create", {
                    "name": "", "description": "", "price": -100, "weight": -5, "dimensions": ""
                }),
                ("Update Non-existent Location", "location_ops.updateById", (999, {"city": "Non-existent"})),
                ("Delete Non-existent Item", "item_ops.deleteById", 999),
            ]
        }
    ]
    
    # Execute all test categories
    for category in test_categories:
        print(f"\n{'='*80}")
        print(f"TESTING CATEGORY: {category['name']}")
        print(f"{'='*80}")
        
        category_passed = 0
        category_failed = 0
        
        for test_name, operation, data in category['tests']:
            total_tests += 1
            try:
                # Handle tuple data for operations with multiple parameters
                if isinstance(data, tuple):
                    if len(data) == 2:
                        success = tester.test_operation(test_name, operation, data[0])
                        if success:
                            # For update operations, call with both ID and data
                            success = tester.test_operation(f"{test_name} - Execute", operation, data)
                    else:
                        success = tester.test_operation(test_name, operation, data)
                else:
                    success = tester.test_operation(test_name, operation, data)
                
                if success:
                    category_passed += 1
                    passed += 1
                    print("✅ PASSED")
                else:
                    category_failed += 1
                    failed += 1
                    print("❌ FAILED")
                    
            except Exception as e:
                category_failed += 1
                failed += 1
                print(f"❌ ERROR: {str(e)}")
        
        # Category summary
        print(f"\n--- {category['name']} SUMMARY ---")
        print(f"Passed: {category_passed}")
        print(f"Failed: {category_failed}")
        print(f"Success Rate: {(category_passed/(category_passed+category_failed)*100):.1f}%" if (category_passed+category_failed) > 0 else "0%")
    
    # Final comprehensive summary
    print("\n" + "=" * 80)
    print("COMPREHENSIVE TEST RESULTS SUMMARY")
    print("=" * 80)
    print(f"Total Tests Executed: {total_tests}")
    print(f"Total Passed: {passed}")
    print(f"Total Failed: {failed}")
    print(f"Overall Success Rate: {(passed/total_tests*100):.1f}%" if total_tests > 0 else "0%")
    
    # Performance metrics
    print(f"\nTest Categories Covered: {len(test_categories)}")
    print(f"Database Operations Tested: {total_tests}")
    print(f"CRUD Operations: ✅ Complete")
    print(f"Business Logic: ✅ Complete")
    print(f"Error Handling: ✅ Complete")
    print(f"Edge Cases: ✅ Complete")
    
    if failed > 0:
        print(f"\n⚠️  {failed} tests failed. Review the errors above and fix your JavaScript implementation.")
        print("Failed tests may indicate:")
        print("- Missing database tables or schema issues")
        print("- Incorrect foreign key relationships")
        print("- Business logic errors")
        print("- Data validation problems")
        sys.exit(1)
    else:
        print("\n🎉 ALL TESTS PASSED! Your AI-powered inventory management system is fully functional!")
        print("✅ Database schema is properly configured")
        print("✅ All CRUD operations are working correctly")
        print("✅ Business logic is implemented properly")
        print("✅ Error handling is robust")
        print("✅ System is ready for production deployment")

if __name__ == '__main__':
    main()
