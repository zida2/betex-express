# Backend Testing Guide - Quick Reference

## Prerequisites
1. Backend running: `npm run dev` in `/backend` folder
2. Database connected with demo data seeded
3. Valid JWT token from login

## Test Credentials
```
Email: livreur@betex.com
Password: livreur123
Role: driver (Jean Kouassi)

Email: admin@betex.com
Password: admin123
Role: admin
```

## Getting JWT Token for Tests

### Using cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"livreur@betex.com","password":"livreur123"}'
```

### Response
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "driver-uuid",
      "email": "livreur@betex.com",
      "role": "driver"
    }
  }
}
```

Copy the `token` value for use in all tests below.

---

## Test 1: Get Driver Statistics

### Request
```bash
curl -X GET http://localhost:3000/api/v1/driver-stats/DRIVER_UUID/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected Response (200)
```json
{
  "success": true,
  "data": {
    "driverId": "DRIVER_UUID",
    "totalDeliveries": 48,
    "successfulDeliveries": 48,
    "failedDeliveries": 0,
    "successRate": 1,
    "rating": 4.8,
    "completedToday": 5,
    "onTimeRate": 100,
    "lastDelivery": "2024-06-01T14:30:00.000Z",
    "joinDate": "2024-01-15T08:00:00.000Z"
  },
  "message": "Driver statistics retrieved successfully"
}
```

### What to Check
- ✅ Status is 200
- ✅ Data contains all required fields
- ✅ Success rate is between 0-1
- ✅ Rating is between 0-5

---

## Test 2: Get Delivery History (All)

### Request
```bash
curl -X GET "http://localhost:3000/api/v1/driver-stats/DRIVER_UUID/history" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected Response (200)
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "package-uuid",
      "customerName": "Jean Doe",
      "customerPhone": "+226 XXXXXXXX",
      "senderName": "ABC Corp",
      "address": "Rue de la Paix, Ouagadougou",
      "weight": 2.5,
      "status": "delivered",
      "notes": "Livré avec succès",
      "createdAt": "2024-05-28T09:00:00.000Z",
      "updatedAt": "2024-05-28T14:30:00.000Z"
    },
    ...
  ],
  "message": "Delivery history retrieved successfully"
}
```

### What to Check
- ✅ Status is 200
- ✅ Count matches array length
- ✅ Only shows delivered/failed packages (no pending)
- ✅ Sorted by most recent first

---

## Test 3: Get Delivery History (Filtered by Date)

### Request
```bash
curl -X GET "http://localhost:3000/api/v1/driver-stats/DRIVER_UUID/history?fromDate=2024-05-28T00:00:00Z&toDate=2024-06-04T23:59:59Z" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected Response (200)
```json
{
  "success": true,
  "count": 8,
  "data": [ /* Filtered packages only */ ],
  "message": "Delivery history retrieved successfully"
}
```

### What to Check
- ✅ Only returns packages within date range
- ✅ Count is less than or equal to full history

---

## Test 4: Get Delivery History (Filtered by Status)

### Request
```bash
curl -X GET "http://localhost:3000/api/v1/driver-stats/DRIVER_UUID/history?status=delivered" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected Response (200)
- Only packages with `status: "delivered"`

### What to Check
- ✅ All returned packages have status "delivered"
- ✅ No "delivery_failed" packages in response

---

## Test 5: Get All Drivers Workload

### Request
```bash
curl -X GET http://localhost:3000/api/v1/driver-stats/workload \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected Response (200)
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "driverId": "driver-1-uuid",
      "driverName": "Jean Kouassi",
      "status": "online",
      "assignedPackages": 3,
      "totalWeight": 15.5,
      "successRate": 0.96,
      "totalDeliveries": 48
    },
    {
      "driverId": "driver-2-uuid",
      "driverName": "Marie Traore",
      "status": "offline",
      "assignedPackages": 0,
      "totalWeight": 0,
      "successRate": 0.98,
      "totalDeliveries": 52
    },
    ...
  ],
  "message": "Drivers workload retrieved successfully"
}
```

### What to Check
- ✅ Status is 200
- ✅ Shows all active drivers
- ✅ Success rates between 0-1
- ✅ Assigned packages count is accurate

---

## Test 6: Get Driver Map Data

### Request
```bash
curl -X GET http://localhost:3000/api/v1/driver-stats/map/data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected Response (200)
```json
{
  "success": true,
  "data": {
    "driver": {
      "id": "driver-uuid",
      "name": "Jean Kouassi",
      "status": "in_delivery",
      "lastLatitude": 12.3714,
      "lastLongitude": -1.5197
    },
    "activePackages": [
      {
        "id": "package-uuid",
        "customerName": "Jean Doe",
        "customerPhone": "+226 XXXXXXXX",
        "address": "Rue de la Paix, Ouagadougou",
        "deliveryLatitude": 12.3650,
        "deliveryLongitude": -1.5250,
        "status": "in_delivery",
        "pickupAddress": "Centre de Distribution"
      },
      ...
    ]
  },
  "message": "Driver map data retrieved"
}
```

### What to Check
- ✅ Driver position is valid coordinates
- ✅ Active packages only (pending/collected/in_delivery)
- ✅ Delivery coordinates are within Ouagadougou bounds
- ✅ No completed packages in active list

---

## Test 7: Update Package Status

### Request
```bash
curl -X PATCH http://localhost:3000/api/v1/driver-stats/packages/PACKAGE_UUID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "collected",
    "notes": "Colis récupéré du centre"
  }'
```

### Expected Response (200)
```json
{
  "success": true,
  "data": {
    "id": "package-uuid",
    "status": "collected",
    "notes": "Colis récupéré du centre",
    "updatedAt": "2024-06-04T11:20:00.000Z",
    ...
  },
  "message": "Package status updated to collected"
}
```

### Valid Status Transitions
- `pending` → `collected`
- `collected` → `in_delivery`
- `in_delivery` → `delivered` or `delivery_failed`

### What to Check
- ✅ Status is 200
- ✅ Database is updated (verify with next history call)
- ✅ updatedAt timestamp is current
- ✅ Notes are saved

### Test Different Statuses
```bash
# Collect package
curl -X PATCH http://localhost:3000/api/v1/driver-stats/packages/PACKAGE_UUID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "collected"}'

# Start delivery
curl -X PATCH http://localhost:3000/api/v1/driver-stats/packages/PACKAGE_UUID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_delivery"}'

# Complete delivery
curl -X PATCH http://localhost:3000/api/v1/driver-stats/packages/PACKAGE_UUID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered", "notes": "Livré avec succès"}'
```

---

## Test 8: Get Package Tracking

### Request
```bash
curl -X GET http://localhost:3000/api/v1/driver-stats/packages/PACKAGE_UUID/tracking \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected Response (200)
```json
{
  "success": true,
  "data": {
    "id": "package-uuid",
    "customerName": "Jean Doe",
    "customerPhone": "+226 XXXXXXXX",
    "senderName": "ABC Corp",
    "senderPhone": "+226 XXXXXXXX",
    "senderAddress": "Centre de Distribution",
    "address": "Rue de la Paix, Ouagadougou",
    "deliveryLatitude": 12.3650,
    "deliveryLongitude": -1.5250,
    "weight": 2.5,
    "status": "in_delivery",
    "notes": "Livrer avant 17h",
    "createdAt": "2024-06-04T08:00:00.000Z",
    "updatedAt": "2024-06-04T11:20:00.000Z"
  },
  "message": "Package tracking information retrieved"
}
```

### What to Check
- ✅ All customer/sender information is present
- ✅ Delivery coordinates are valid
- ✅ Status matches current state
- ✅ Sender address is pickup location

---

## Authorization Tests

### Test 9: Unauthorized Access (No Token)

### Request
```bash
curl -X GET http://localhost:3000/api/v1/driver-stats/DRIVER_UUID/statistics
```

### Expected Response (401 or 403)
```json
{
  "success": false,
  "message": "Unauthorized",
  "status": 401
}
```

### What to Check
- ✅ Rejected without token

---

## Test 10: Forbidden Access (Driver accessing another driver's data)

### Request
```bash
# Using driver A's token
curl -X GET http://localhost:3000/api/v1/driver-stats/DRIVER_B_UUID/statistics \
  -H "Authorization: Bearer TOKEN_OF_DRIVER_A"
```

### Expected Response (403)
```json
{
  "success": false,
  "message": "Unauthorized to access this driver stats"
}
```

### What to Check
- ✅ Driver A cannot access Driver B's stats
- ✅ Only admin or the driver themselves can access stats

---

## Quick Test Script (Bash)

Save as `test-backend.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"
TOKEN="YOUR_TOKEN_HERE"
DRIVER_UUID="YOUR_DRIVER_UUID"
PACKAGE_UUID="YOUR_PACKAGE_UUID"

echo "=== Test 1: Get Driver Stats ==="
curl -X GET "$BASE_URL/driver-stats/$DRIVER_UUID/statistics" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== Test 2: Get Delivery History ==="
curl -X GET "$BASE_URL/driver-stats/$DRIVER_UUID/history" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== Test 3: Get Driver Workload ==="
curl -X GET "$BASE_URL/driver-stats/workload" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== Test 4: Get Map Data ==="
curl -X GET "$BASE_URL/driver-stats/map/data" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== Test 5: Get Package Tracking ==="
curl -X GET "$BASE_URL/driver-stats/packages/$PACKAGE_UUID/tracking" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\nAll tests completed!"
```

Usage:
```bash
chmod +x test-backend.sh
./test-backend.sh
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid token | Get new token with login endpoint |
| 403 Forbidden | Driver accessing wrong data | Use authenticated driver's own ID |
| 404 Not Found | Invalid UUID | Verify UUID exists in database |
| 500 Server Error | Database connection issue | Check backend logs, verify DB running |
| CORS Error | Frontend to backend | Check CORS settings in server.js |

---

## Database Verification

Before testing, verify test data exists:

```bash
# Connect to PostgreSQL
psql -U postgres -d betex_db

# Check drivers
SELECT id, name, email, status FROM drivers LIMIT 5;

# Check packages
SELECT id, "customerName", status, "driverId" FROM packages LIMIT 5;

# Check user (Jean Kouassi)
SELECT * FROM users WHERE email = 'livreur@betex.com';
```

---

## Performance Baselines

Expected response times:
- Get stats: < 100ms
- Get history: < 200ms (with 100 records)
- Get workload: < 300ms (with 5 drivers)
- Get map data: < 150ms
- Update status: < 100ms

If slower, check:
1. Database indexes
2. Network latency
3. Backend load
