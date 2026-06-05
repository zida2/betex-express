# Frontend-Backend Integration Guide

## Updated API Endpoints

### Driver Statistics

#### Get Driver Performance Stats
```
GET /api/v1/driver-stats/:driverId/statistics
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "driverId": "uuid",
    "totalDeliveries": 48,
    "successfulDeliveries": 48,
    "failedDeliveries": 0,
    "successRate": 1.00,
    "rating": 4.8,
    "completedToday": 5,
    "onTimeRate": 100,
    "lastDelivery": "2024-06-04T10:30:00Z",
    "joinDate": "2024-01-15T08:00:00Z"
  }
}
```

**Frontend Integration:**
- Used in: `DriverStatsPage.js`
- Replace mock data call with:
```javascript
const response = await fetch(`/api/v1/driver-stats/${driverId}/statistics`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

#### Get Driver Delivery History
```
GET /api/v1/driver-stats/:driverId/history?status=delivered&fromDate=2024-05-28&toDate=2024-06-04
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "uuid",
      "customerName": "Jean Doe",
      "customerPhone": "+226 XX XX XX XX",
      "senderName": "ABC Corp",
      "address": "Rue de la Paix, Ouagadougou",
      "weight": 2.5,
      "status": "delivered",
      "notes": "Livraison effectuée",
      "createdAt": "2024-05-28T09:00:00Z",
      "updatedAt": "2024-05-28T14:30:00Z"
    },
    ...
  ]
}
```

**Query Parameters:**
- `status` (optional): 'delivered', 'delivery_failed', or omit for all
- `fromDate` (optional): ISO date string
- `toDate` (optional): ISO date string

**Frontend Integration:**
- Used in: `DriverHistoryPage.js`
- Replace mock data with:
```javascript
const response = await fetch(
  `/api/v1/driver-stats/${driverId}/history?status=${filter}&fromDate=${fromDate}&toDate=${toDate}`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

---

#### Get All Drivers Workload
```
GET /api/v1/driver-stats/workload
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "driverId": "uuid",
      "driverName": "Jean Kouassi",
      "status": "in_delivery",
      "assignedPackages": 3,
      "totalWeight": 15.5,
      "successRate": 0.96,
      "totalDeliveries": 48
    },
    ...
  ]
}
```

**Frontend Integration:**
- Used in: `AdminDashboard.js` or optimization pages
- Replace mock data with:
```javascript
const response = await fetch('/api/v1/driver-stats/workload', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### Package Management

#### Update Package Status
```
PATCH /api/v1/driver-stats/packages/:packageId/status
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "status": "collected",  // or "in_delivery", "delivered", "delivery_failed"
  "notes": "Optional delivery notes"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "collected",
    "updatedAt": "2024-06-04T11:20:00Z",
    ...
  },
  "message": "Package status updated to collected"
}
```

**Frontend Integration:**
- Used in: `DriverDashboard.js` when driver updates status
```javascript
const response = await fetch(`/api/v1/driver-stats/packages/${packageId}/status`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: newStatus,
    notes: deliveryNotes
  })
});
```

---

#### Get Package Tracking
```
GET /api/v1/driver-stats/packages/:packageId/tracking
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerName": "Jean Doe",
    "customerPhone": "+226 XX XX XX XX",
    "senderName": "ABC Corp",
    "senderPhone": "+226 XX XX XX XX",
    "senderAddress": "Centre de Distribution",
    "address": "Rue de la Paix, Ouagadougou",
    "deliveryLatitude": 12.3650,
    "deliveryLongitude": -1.5250,
    "weight": 2.5,
    "status": "in_delivery",
    "notes": "Livrer avant 17h",
    "createdAt": "2024-06-04T08:00:00Z",
    "updatedAt": "2024-06-04T11:20:00Z"
  }
}
```

**Frontend Integration:**
- Used in: `DriverMapPage.js` for full package details
```javascript
const response = await fetch(`/api/v1/driver-stats/packages/${packageId}/tracking`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### Map & Navigation

#### Get Driver Map Data
```
GET /api/v1/driver-stats/map/data
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "driver": {
      "id": "uuid",
      "name": "Jean Kouassi",
      "status": "in_delivery",
      "lastLatitude": 12.3714,
      "lastLongitude": -1.5197
    },
    "activePackages": [
      {
        "id": "uuid",
        "customerName": "Jean Doe",
        "customerPhone": "+226 XX XX XX XX",
        "address": "Rue de la Paix, Ouagadougou",
        "deliveryLatitude": 12.3650,
        "deliveryLongitude": -1.5250,
        "status": "in_delivery",
        "pickupAddress": "Centre de Distribution"
      },
      ...
    ]
  }
}
```

**Frontend Integration:**
- Used in: `DriverMapPage.js` for real-time map display
```javascript
const response = await fetch('/api/v1/driver-stats/map/data', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Use response.data.driver for driver position
// Use response.data.activePackages for delivery markers
```

---

## Frontend Pages Updates

### 1. DriverStatsPage.js
**Current Implementation:** Mock data from mockData.js  
**Update To:**
```javascript
useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/v1/driver-stats/${driverId}/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      // Fall back to mock data in demo mode
      setStats(mockStats);
    }
  };
  
  fetchStats();
}, [driverId]);
```

### 2. DriverHistoryPage.js
**Current Implementation:** Mock data from mockData.js  
**Update To:**
```javascript
useEffect(() => {
  const fetchHistory = async () => {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    
    const url = new URL('/api/v1/driver-stats/' + driverId + '/history', window.location.origin);
    url.searchParams.append('status', filterStatus);
    url.searchParams.append('fromDate', fromDate.toISOString());
    
    try {
      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setHistory(data.data);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory(mockHistory);
    }
  };
  
  fetchHistory();
}, [driverId, filterStatus]);
```

### 3. DriverMapPage.js
**Current Implementation:** Mock data from mockData.js  
**Update To:**
```javascript
useEffect(() => {
  const fetchMapData = async () => {
    try {
      const response = await fetch('/api/v1/driver-stats/map/data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      setDriverPosition([data.data.driver.lastLatitude, data.data.driver.lastLongitude]);
      setPackages(data.data.activePackages);
      updateMapMarkers(data.data);
    } catch (error) {
      console.error('Error fetching map data:', error);
      // Use mock data in demo mode
      setMapData(mockMapData);
    }
  };
  
  fetchMapData();
  const interval = setInterval(fetchMapData, 30000); // Refresh every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

### 4. DriverDashboard.js - Status Update
**Current Implementation:** Updates mock data locally  
**Update To:**
```javascript
const handleStatusUpdate = async (packageId, newStatus) => {
  try {
    const response = await fetch(`/api/v1/driver-stats/packages/${packageId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: newStatus,
        notes: userNotes
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update local package state with server response
      updatePackageState(packageId, data.data);
      showNotification('Status mis à jour avec succès');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    showErrorNotification('Erreur lors de la mise à jour');
  }
};
```

---

## Authentication Notes

All endpoints require the `Authorization` header with a valid JWT token:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

Get the token from:
- `localStorage.getItem('token')` after login
- Or from Redux/Context state: `authContext.token`

---

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "status": 400
}
```

Common Status Codes:
- 200: Success
- 400: Bad request or validation error
- 403: Unauthorized (invalid permissions)
- 404: Resource not found
- 500: Server error

**Frontend Error Handling:**
```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API Error');
  }
  return await response.json();
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
  showErrorNotification(error.message);
}
```

---

## Demo Mode Fallback

All frontend pages should include fallback to mock data:
```javascript
const [data, setData] = useState(null);
const [isDemo, setIsDemo] = useState(false);

useEffect(() => {
  if (apiToken) {
    fetchFromApi(); // Try real API
  } else {
    fetchMockData(); // Use demo mode
    setIsDemo(true);
  }
}, [apiToken]);
```

This ensures the frontend works in both:
- **Production:** Connected to backend API
- **Demo Mode:** Using mock data for client presentations

---

## Testing Checklist

- [ ] All API endpoints tested with valid token
- [ ] Error handling works for 403 (unauthorized)
- [ ] Pagination works if implemented
- [ ] Status update persists data
- [ ] Map refresh shows updated driver position
- [ ] History filtering by date and status works
- [ ] Mock data fallback works when API is unavailable
- [ ] No CORS errors in browser console
