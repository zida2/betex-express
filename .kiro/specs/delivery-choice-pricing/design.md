# Design Document: Betex Express Delivery Choice & Pricing System

## Overview

This design establishes the technical architecture for Betex Express's dual delivery model: Express (distance-based, real-time driver selection) and Scheduled (zone-based, time-slot based). The system integrates multiple components for driver availability tracking, geographic zone management, dynamic pricing calculations, and real-time updates via WebSocket connections.

### Key Design Principles

1. **Separation of Concerns**: Pricing calculations, driver availability, and zone validation are independent services
2. **Real-Time Responsiveness**: WebSocket connections enable live updates for driver lists and availability changes
3. **Data Consistency**: Atomic operations ensure pricing is locked and consistent throughout fulfillment
4. **Extensibility**: Pricing models can be extended without modifying core delivery logic
5. **Auditability**: All pricing decisions and delivery choices are logged for compliance and troubleshooting

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Application                          │
│  (Web/Mobile UI for delivery selection and pricing review)       │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────────┬─────────────────┬──────────────────┐
│ Express Delivery │ Scheduled Delivery│ Pricing Engine   │
│ Controller       │ Controller        │ (Shared)         │
└────┬─────────────┴─────┬───────────┴────┬──────────────┘
     │                   │                │
     ▼                   ▼                ▼
┌──────────────────────────────────────────────────────────┐
│                  Business Logic Layer                     │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │Driver        │  │Zone         │  │TimeSlot        │  │
│  │Availability  │  │Validator    │  │Manager         │  │
│  │Service       │  │Service      │  │Service         │  │
│  └──────────────┘  └─────────────┘  └────────────────┘  │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │Distance      │  │Pricing      │  │Validation      │  │
│  │Calculator    │  │Calculator   │  │Service         │  │
│  └──────────────┘  └─────────────┘  └────────────────┘  │
└────┬──────────────────────────────────────────┬─────────┘
     │                                          │
     ▼                                          ▼
┌──────────────────────┐              ┌────────────────────┐
│  Data Access Layer   │              │ Real-Time          │
│  (Repositories)      │              │ Updates (Socket)   │
└────┬─────────────────┘              └────────┬───────────┘
     │                                         │
     ▼                                         ▼
┌──────────────────────────────────────────────────────────┐
│              Database & External Services                │
│  DeliveryRequest │ Zone │ Driver │ TimeSlot │ Audit Log  │
└──────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### 1. **Driver Availability Service**
- Queries drivers with status 'online' in serviceable area
- Filters drivers within distance threshold
- Calculates driver distance from pickup location
- Emits real-time updates via WebSocket on driver status changes
- Handles concurrent driver list requests

#### 2. **Zone Validator Service**
- Determines delivery zone from geographic coordinates
- Validates location falls within serviceable zones
- Retrieves zone pricing configuration
- Handles zone boundary edge cases (points on borders)

#### 3. **Pricing Calculator Service**
- Implements distance-based pricing for Express delivery
- Implements zone-based pricing for Scheduled delivery
- Applies configurable pricing parameters (base price, per-km rate)
- Locks pricing at confirmation time
- Recalculates pricing on driver/location changes before confirmation

#### 4. **Distance Calculator Utility**
- Implements Haversine formula for great-circle distance
- Returns distance in kilometers
- Handles edge cases (same location, invalid coordinates)

#### 5. **Time Slot Manager Service**
- Manages two predefined daily time slots
- Tracks per-slot capacity and current load
- Prevents overbooking through atomic capacity updates
- Supports slot availability status

#### 6. **Validation Service**
- Validates delivery option selection
- Validates driver selection for Express delivery
- Validates time slot selection for Scheduled delivery
- Validates pricing calculation success
- Provides user-friendly error messages

#### 7. **Audit Logger Service**
- Logs pricing calculations with parameters and results
- Logs delivery choice decisions
- Logs validation errors and rejections
- Tracks timestamps and user identifiers for compliance

---

## Components and Interfaces

### 1. Express Delivery Flow

#### Interface: Driver Availability Response
```javascript
{
  drivers: [
    {
      id: UUID,
      name: String,
      vehicleType: String,
      vehiclePlate: String,
      rating: Float (0-5),
      currentLatitude: Float,
      currentLongitude: Float,
      distanceFromPickup: Float (km)
    }
  ],
  timestamp: ISO8601,
  pickupLocation: { lat: Float, lng: Float }
}
```

#### Interface: Express Pricing Calculation Request
```javascript
{
  deliveryOption: 'express',
  driverId: UUID,
  pickupLat: Float,
  pickupLng: Float,
  deliveryLat: Float,
  deliveryLng: Float
}
```

#### Interface: Express Pricing Response
```javascript
{
  deliveryOption: 'express',
  pricingModel: 'distance_based',
  distanceKm: Float,
  basePriceFCFA: Decimal,
  pricePerKmFCFA: Decimal,
  calculatedPriceFCFA: Decimal,
  breakdown: {
    basePrice: Decimal,
    distanceCost: Decimal,
    total: Decimal
  },
  driverId: UUID,
  calculatedAt: ISO8601
}
```

#### Process: Express Delivery Selection
1. Client selects Express delivery option
2. System queries available drivers via Driver Availability Service
3. WebSocket connection established for real-time driver updates
4. Client selects specific driver
5. System triggers pricing calculation for selected driver location
6. System displays pricing before confirmation

---

### 2. Scheduled Delivery Flow

#### Interface: Time Slot Response
```javascript
{
  slots: [
    {
      slotId: String (e.g., "morning"),
      startTime: String (HH:MM format),
      endTime: String (HH:MM format),
      capacity: Integer,
      currentLoad: Integer,
      isAvailable: Boolean,
      availableSpots: Integer,
      expectedDeliveryDate: ISO8601
    }
  ],
  timestamp: ISO8601
}
```

#### Interface: Scheduled Pricing Calculation Request
```javascript
{
  deliveryOption: 'scheduled',
  deliveryLat: Float,
  deliveryLng: Float,
  selectedSlotId: String
}
```

#### Interface: Scheduled Pricing Response
```javascript
{
  deliveryOption: 'scheduled',
  pricingModel: 'zone_based',
  deliveryZoneId: UUID,
  deliveryZoneName: String,
  fixedPriceFCFA: Decimal,
  breakdown: {
    zonePrice: Decimal,
    total: Decimal
  },
  selectedSlotId: String,
  calculatedAt: ISO8601
}
```

#### Process: Scheduled Delivery Selection
1. Client selects Scheduled delivery option
2. System retrieves available time slots with capacity info
3. Client selects time slot and provides delivery location
4. System validates delivery location is within serviceable zone
5. System calculates zone-based pricing
6. System displays pricing before confirmation

---

### 3. Pricing Review & Confirmation

#### Interface: Final Pricing Review
```javascript
{
  deliveryOption: String ('express' | 'scheduled'),
  pricingModel: String ('distance_based' | 'zone_based'),
  deliveryPrice: Decimal,
  breakdown: Object,
  packagePrice: Decimal,
  totalAmount: Decimal,
  senderLocation: { lat: Float, lng: Float, address: String },
  deliverLocation: { lat: Float, lng: Float, address: String },
  additionalDetails: {
    // For Express
    driverId?: UUID,
    driverName?: String,
    driverRating?: Float,
    distanceKm?: Float,
    // For Scheduled
    timeSlotId?: String,
    timeSlotWindow?: String,
    deliveryZone?: String
  }
}
```

#### Interface: Delivery Request Creation
```javascript
{
  // Existing sender/receiver fields
  senderName: String,
  senderPhone: String,
  // ... other sender fields
  receiverName: String,
  receiverPhone: String,
  // ... other receiver fields
  
  // NEW: Delivery choice fields
  deliveryOption: String ('express' | 'scheduled'),
  pricingModel: String ('distance_based' | 'zone_based'),
  deliveryPrice: Decimal, // Locked-in price
  
  // For Express delivery
  expressDeliveryDetails: {
    driverId: UUID,
    driverName: String,
    distanceKm: Float,
    calculatedAt: ISO8601
  },
  
  // For Scheduled delivery
  scheduledDeliveryDetails: {
    timeSlotId: String,
    deliveryZoneId: UUID,
    zoneName: String,
    expectedDeliveryDate: ISO8601,
    expectedDeliveryTimeWindow: String
  }
}
```

---

## Data Models

### Extended DeliveryRequest Model

```javascript
{
  // Existing fields...
  
  // NEW: Delivery Choice & Pricing
  deliveryOption: ENUM ('express', 'scheduled'),
  pricingModel: ENUM ('distance_based', 'zone_based'),
  deliveryPrice: DECIMAL(10, 2), // Locked-in price
  pricingCalculatedAt: DATETIME,
  
  // Express-specific fields
  expressDeliveryDetails: JSON, // {driverId, distanceKm, basePriceFCFA, pricePerKmFCFA}
  
  // Scheduled-specific fields
  scheduledDeliveryDetails: JSON, // {timeSlotId, deliveryZoneId, zoneName}
  expectedDeliveryTimeWindow: STRING, // e.g., "08:00-11:00"
  
  // Audit trail
  pricingAuditId: UUID, // References AuditLog entry
  
  // Immutability enforcement
  isPriceLocked: BOOLEAN DEFAULT false,
  
  status: ENUM('pending_approval', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled'),
  // ... rest of existing fields
}
```

### New Models

#### TimeSlot Model
```javascript
{
  id: String (e.g., "morning", "afternoon"),
  startTime: STRING (HH:MM),
  endTime: STRING (HH:MM),
  maxCapacity: INTEGER,
  baseDailyCapacity: INTEGER,
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

#### TimeSlotCapacity Model (daily tracking)
```javascript
{
  id: UUID,
  slotId: STRING FK(TimeSlot.id),
  date: DATE,
  maxCapacity: INTEGER,
  currentLoad: INTEGER,
  isAvailable: BOOLEAN,
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

#### ZonePricing Model (extend Zone)
```javascript
{
  // Existing Zone fields
  id: UUID,
  name: STRING,
  description: TEXT,
  boundaries: JSON (GeoJSON),
  centerLatitude: DECIMAL,
  centerLongitude: DECIMAL,
  isActive: BOOLEAN,
  
  // NEW: Pricing
  fixedDeliveryPrice: DECIMAL(10, 2), // Range: 1000-2000 FCFA
  minPrice: DECIMAL(10, 2),
  maxPrice: DECIMAL(10, 2),
  
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

#### AuditLog Model (for pricing & delivery choices)
```javascript
{
  id: UUID,
  eventType: ENUM ('pricing_calculated', 'delivery_choice', 'validation_error', 'driver_assigned'),
  deliveryRequestId: UUID FK,
  userId: UUID,
  deliveryOption: ENUM ('express', 'scheduled'),
  details: JSON, // Varies by event type
  result: ENUM ('success', 'error'),
  errorMessage: TEXT,
  parameters: JSON, // Input parameters for reproducibility
  timestamp: DATETIME,
  createdAt: DATETIME
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before writing correctness properties, let me analyze the acceptance criteria for testability:
### Acceptance Criteria Testing Prework

Based on analysis of the requirements, the following acceptance criteria are testable as properties:

**PROPERTY-TESTABLE CRITERIA:**
- R2.1: Driver filtering by 'online' status
- R2.2: Required fields in driver display (location, vehicle, rating, distance)
- R2.4: Driver assignment to delivery request
- R2.6: Driver status transitions to 'in_delivery'
- R3.1-R3.6: Distance-based pricing calculations and formula application
- R4.1-R4.2: Time slot retrieval and field rendering
- R4.4-R4.5: Time slot assignment and capacity decrement
- R5.1-R5.5: Zone determination and pricing range retrieval
- R6.1-R6.3: Zone-based pricing calculations
- R8.1-R8.3: Delivery request persistence and price immutability
- R11.1-R11.4: Concurrent request handling and data isolation
- R12.1-R12.3: Audit logging completeness

**NOT PROPERTY-TESTABLE:**
- R1.2, R1.3: Visual design/presentation (manual review)
- R2.3: WebSocket real-time infrastructure (integration test)
- R2.5: UI message rendering (example-based test)
- R7.2, R7.3: UI controls and navigation (E2E tests)
- R9.1-R9.2: Driver availability change detection (integration test)

### Correctness Properties

#### Property 1: Online Driver Filtering
*For any* mixed set of drivers with varying statuses, when filtering for available drivers, the system SHALL return only drivers with status 'online' and exclude all offline drivers.

**Validates: Requirements 2.1**

#### Property 2: Driver Display Contains Required Fields
*For any* list of drivers returned by the availability service, each driver record rendered in the Express_Delivery_Interface SHALL contain all required fields: current location (latitude/longitude), vehicle type, license plate, rating (0-5 range), and distance from pickup location in kilometers.

**Validates: Requirements 2.2**

#### Property 3: Driver Selection Creates Assignment
*For any* available driver and delivery request, when a client selects that driver, the system SHALL immediately create a driver-delivery assignment relationship that persists in the database.

**Validates: Requirements 2.4**

#### Property 4: Driver Status Transitions on Assignment
*For any* driver in 'online' status assigned to an Express delivery, the driver's status SHALL transition from 'online' to 'in_delivery' and remain locked until the delivery is completed or cancelled.

**Validates: Requirements 2.6**

#### Property 5: Haversine Distance Calculation
*For any* two geographic points (latitude, longitude pairs) representing pickup and delivery locations, the Distance_Calculator using Haversine formula SHALL produce consistent, accurate distance measurements within ±0.1km of expected values for distances up to 50km.

**Validates: Requirements 3.2**

#### Property 6: Distance-Based Pricing Formula Application
*For any* valid distance value in kilometers and configured pricing parameters (base price and price-per-km), when calculating Express delivery cost, the system SHALL apply the formula: Delivery_Cost = Base_Price + (Distance_in_km × Price_per_km) exactly.

**Validates: Requirements 3.1, 3.3, 3.4**

#### Property 7: Express Pricing Display on Calculation
*For any* successful Express pricing calculation, the Delivery_Pricing_Interface SHALL immediately display the calculated price (matching the formula result exactly) to the client before confirmation.

**Validates: Requirements 3.5**

#### Property 8: Price Recalculation on Parameter Changes
*For any* change to distance or driver location before delivery confirmation, when the client changes their driver selection, the system SHALL trigger a new pricing calculation and update the displayed price to reflect the new calculation result.

**Validates: Requirements 3.6**

#### Property 9: Time Slot Retrieval Count
*For any* Scheduled_Delivery selection request at any time of day, the Time_Slot_Service SHALL retrieve and return exactly two time slots (morning and afternoon slots), each with valid start time, end time, capacity information, and availability status.

**Validates: Requirements 4.1**

#### Property 10: Time Slot Display Contains Required Information
*For any* list of available time slots, the Time_Slot_Selection_Interface SHALL render each slot with all required information: start time (HH:MM format), end time (HH:MM format), capacity status, current availability indicator, and expected delivery date.

**Validates: Requirements 4.2**

#### Property 11: Time Slot Assignment
*For any* available time slot selected by a client, the system SHALL create a slot-delivery assignment relationship that persists in the database and is visible in the delivery request record.

**Validates: Requirements 4.4**

#### Property 12: Atomic Time Slot Capacity Decrement
*For any* Scheduled_Delivery time slot with available capacity, when a client selects it, the system SHALL atomically decrement available capacity by exactly 1 in an all-or-nothing operation that prevents race conditions.

**Validates: Requirements 4.5**

#### Property 13: Zone Determination from Coordinates
*For any* geographic coordinate pair (latitude, longitude) that falls within the boundaries of a defined delivery zone, the Delivery_Zone_Validator SHALL correctly identify and return that zone (point-in-polygon test).

**Validates: Requirements 5.1, 5.2**

#### Property 14: Out-of-Zone Rejection
*For any* geographic coordinate pair that falls outside all defined delivery zones, the Delivery_Zone_Validator SHALL reject the delivery with the standardized error message "Delivery location is outside serviceable zones" and prevent pricing calculation from proceeding.

**Validates: Requirements 5.3**

#### Property 15: Zone Pricing Range Retrieval
*For any* identified delivery zone, the Zone_Information_Service SHALL retrieve the zone's fixed delivery price, which SHALL fall within the configured range of 1000 FCFA to 2000 FCFA.

**Validates: Requirements 5.4, 5.5**

#### Property 16: Zone-Based Pricing Formula Application
*For any* Scheduled_Delivery with a confirmed delivery zone, when calculating delivery cost, the system SHALL apply the zone-based formula: Delivery_Cost = Zone_Fixed_Price (without any additional calculations or multipliers), using the exact price configured for that zone.

**Validates: Requirements 6.1, 6.2, 6.3**

#### Property 17: Zone-Based Price Display
*For any* successful zone-based pricing calculation, the Delivery_Pricing_Interface SHALL immediately display the fixed zone price (matching the zone configuration exactly) to the client before confirmation.

**Validates: Requirements 6.4**

#### Property 18: Price Locking on Confirmation
*For any* delivery request confirmed by a client, once the delivery request is created in the database, the delivery_price field SHALL be immutable—price SHALL NOT be recalculated or modified through any status transition (approved, in_transit, completed, cancelled) during the delivery lifecycle.

**Validates: Requirements 6.5, 8.3**

#### Property 19: Complete Delivery Request Persistence
*For any* confirmed delivery request (Express or Scheduled), when stored in the database, all delivery details SHALL be persisted exactly as provided: delivery_option, pricingModel, calculated price, relevant details (driver info for Express or slot/zone info for Scheduled), and all original sender/receiver information.

**Validates: Requirements 8.1**

#### Property 20: Required Delivery Price Population
*For any* delivery request created in the database after confirmation, the delivery_price field SHALL be non-null, populated with the confirmed price value, and match the price displayed to the client during review.

**Validates: Requirements 8.2**

#### Property 21: Concurrent Request Data Isolation
*For any* multiple concurrent delivery selection requests from different clients, each request's data SHALL be isolated such that selections made by one client (delivery option, driver/slot choice) do NOT appear in or affect another client's delivery interface.

**Validates: Requirements 11.1**

#### Property 22: Location-Based Driver List Independence
*For any* two clients at different pickup locations selecting Express delivery concurrently, each client SHALL receive a driver list filtered to drivers closest to THEIR pickup location respectively, with distance calculations specific to each client's location.

**Validates: Requirements 11.2**

#### Property 23: Atomic Driver Availability Across Concurrent Requests
*For any* driver assigned to one Express delivery request, that driver SHALL immediately become unavailable in all other concurrent clients' driver availability lists (reflected within 100ms via WebSocket update).

**Validates: Requirements 11.3**

#### Property 24: Time Slot Capacity Atomicity Prevents Overbooking
*For any* time slot with fixed capacity, when multiple clients concurrently select the same slot, the system SHALL ensure total assignments never exceeds slot capacity—overbooking SHALL NOT occur regardless of timing of concurrent requests.

**Validates: Requirements 11.4**

#### Property 25: Audit Log Entry Completeness for Pricing
*For any* pricing calculation (Express distance-based or Scheduled zone-based), the Audit_Logger SHALL create a complete log entry containing: timestamp, delivery_option (express|scheduled), pricing_model (distance_based|zone_based), calculated price, input parameters (distance/zone), result status (success|error), and delivery request ID.

**Validates: Requirements 12.1**

#### Property 26: Audit Log Entry Completeness for Delivery Choice
*For any* client delivery choice (option selection or driver/slot selection), the Audit_Logger SHALL create a complete log entry containing: timestamp of choice, client ID, delivery option selected (express|scheduled), and specific selection (driver ID for Express, slot ID for Scheduled).

**Validates: Requirements 12.2**

#### Property 27: Audit Log Entry for Rejection
*For any* delivery request rejected due to validation or pricing errors, the Audit_Logger SHALL record a rejection log entry containing: timestamp, rejection reason, client ID, attempted delivery details, and error category.

**Validates: Requirements 12.3**

---

## Error Handling

### Pricing Calculation Failures
- **Distance Calculation Errors**: If Haversine calculation fails (invalid coordinates), return error "Invalid delivery location coordinates" and log with severity ERROR
- **Zone Lookup Errors**: If zone cannot be determined for Scheduled delivery, return error "Delivery location is outside serviceable zones" (catch-all for all zone-related issues)
- **Configuration Missing**: If pricing parameters (base price, rate, or zone price) not found, return error "Unable to calculate delivery cost. Please try again" and log configuration issue
- **Concurrent State Issues**: If driver/slot becomes unavailable during calculation, inform client and trigger fresh availability query

### Driver Availability Issues
- **No Available Drivers**: Display message "No available drivers at this time" with option to schedule instead
- **Driver Becomes Unavailable**: Detect status change and notify "Selected driver is no longer available. Please select another driver" with refreshed list
- **Driver Location Stale**: If driver position data > 2 minutes old, recalculate distance with latest position or use cached calculation with staleness warning

### Capacity Issues
- **Slot Full**: Disable slot in UI with message "This slot is full. Please select another time"
- **Capacity Underflow**: In edge case where capacity goes negative due to race condition, automatically retry increment with exponential backoff (max 3 retries)

### Validation Failures
- **Missing Selection**: "Please select a delivery option"
- **Missing Driver (Express)**: "Please select a driver"
- **Missing Slot (Scheduled)**: "Please select a delivery time slot"
- **Missing Location**: "Please provide a valid delivery address"

### Error Response Format
```javascript
{
  success: false,
  errorCode: String, // e.g., "INVALID_ZONE", "NO_DRIVERS_AVAILABLE"
  errorMessage: String, // User-friendly message
  details: Object, // Additional debug info
  timestamp: ISO8601
}
```

---

## Testing Strategy

### Approach

**Dual-Layer Testing Model:**
1. **Property-Based Testing**: Validates universal correctness properties across randomized inputs
2. **Integration/Example Testing**: Validates specific workflows, error cases, and external integrations

### Property-Based Testing

Properties 1-27 above are implemented as property-based tests using **fast-check** (JavaScript/Node.js).

**Test Configuration:**
- Minimum 100 iterations per property test
- Input generators for:
  - Geographic coordinates (valid lat/lng ranges, edge cases like equator/prime meridian)
  - Driver lists (varying sizes, status distributions)
  - Pricing parameters (valid FCFA ranges 1000-2000)
  - Time slots (capacity variations, edge times)
- Shrinking enabled for failure diagnostics

**Test Coverage by Component:**

| Component | Properties | Test Count |
|-----------|-----------|-----------|
| Driver Availability | 1-4 | 4 |
| Distance Calculation | 5 | 1 |
| Express Pricing | 6-8 | 3 |
| Time Slots | 9-12 | 4 |
| Zone Validation | 13-15 | 3 |
| Scheduled Pricing | 16-17 | 2 |
| Price Immutability | 18-20 | 3 |
| Concurrency | 21-24 | 4 |
| Audit Logging | 25-27 | 3 |
| **Total** | | **27** |

### Unit/Example Tests

- **Driver Assignment**: Verify driver status transitions when assigned
- **Price Display**: Verify UI renders correct calculated price
- **Time Slot Rendering**: Verify all time slots display correctly with availability
- **Error Messages**: Verify user-friendly error messages appear on validation failures
- **Audit Logging**: Verify log entries contain correct data

### Integration Tests

- **WebSocket Driver Updates**: Verify driver list updates in real-time when driver status changes
- **Driver Unavailability Handling**: Verify client notification and list refresh when selected driver goes offline
- **Concurrent Request Isolation**: Verify database maintains isolation between concurrent requests
- **Pricing Lock During Fulfillment**: Verify price doesn't recalculate through status transitions
- **Capacity Atomicity**: Verify concurrent time slot selections don't cause overbooking

### E2E Tests

- **Express Selection Flow**: Client → select Express → choose driver → review price → confirm
- **Scheduled Selection Flow**: Client → select Scheduled → choose slot → provide location → review price → confirm
- **Modify & Reselect**: Client reviews price → clicks modify → changes driver → confirms new price
- **Driver Unavailability Recovery**: Client selected driver → driver goes offline → notification → selects new driver → confirms

---

## API Endpoints

### Express Delivery Endpoints

#### 1. Get Available Drivers
```
GET /api/express/drivers
Query: pickupLat, pickupLng, radiusKm (optional, default 15)
Response: {drivers: [...], timestamp: ISO8601}
```

#### 2. Calculate Express Pricing
```
POST /api/express/calculate-pricing
Body: {driverId, pickupLat, pickupLng, deliveryLat, deliveryLng}
Response: {deliveryOption: 'express', pricingModel: 'distance_based', distanceKm, breakdown, calculatedPriceFCFA, ...}
```

#### 3. Assign Driver
```
POST /api/express/assign-driver
Body: {deliveryRequestId, driverId}
Response: {success, driverId, deliveryRequestId, assignedAt}
```

### Scheduled Delivery Endpoints

#### 1. Get Available Time Slots
```
GET /api/scheduled/time-slots
Response: {slots: [{slotId, startTime, endTime, capacity, currentLoad, isAvailable, availableSpots, ...}], timestamp}
```

#### 2. Calculate Scheduled Pricing
```
POST /api/scheduled/calculate-pricing
Body: {deliveryLat, deliveryLng, selectedSlotId}
Response: {deliveryOption: 'scheduled', pricingModel: 'zone_based', deliveryZoneId, zoneName, fixedPriceFCFA, breakdown, ...}
```

#### 3. Reserve Time Slot
```
POST /api/scheduled/reserve-slot
Body: {deliveryRequestId, slotId}
Response: {success, slotId, currentLoad, availableSpots, reservedAt}
```

### Shared Endpoints

#### 1. Create Delivery Request
```
POST /api/delivery-requests
Body: {
  senderName, senderPhone, senderAddress, senderLat, senderLng,
  receiverName, receiverPhone, receiverAddress, receiverLat, receiverLng,
  description, weight, packagePrice,
  deliveryOption, pricingModel, deliveryPrice,
  expressDeliveryDetails OR scheduledDeliveryDetails
}
Response: {id, status: 'pending_approval', deliveryPrice, deliveryOption, ...}
```

#### 2. Validate Delivery Location
```
POST /api/delivery/validate-location
Body: {lat, lng}
Response: {valid, zoneId, zoneName, fixedPrice OR error}
```

#### 3. Get Pricing Details
```
POST /api/pricing/calculate
Body: {deliveryOption, ...option-specific fields}
Response: {pricingModel, calculatedPrice, breakdown, ...}
```

---

## WebSocket Events

### Client → Server

- `driver:list:request` - Request updated driver list for location
- `driver:select` - Notify driver selection
- `slot:select` - Notify time slot selection
- `pricing:recalculate` - Request price recalculation

### Server → Client

- `driver:list:update` - Send updated driver availability list
- `driver:unavailable` - Notify selected driver went offline
- `price:updated` - Send recalculated price
- `capacity:updated` - Notify time slot capacity change

---

## Security & Authorization

1. **Request Validation**: All inputs validated for type, format, and range
2. **Rate Limiting**: Pricing calculations rate-limited to 10 requests/minute per client
3. **Data Isolation**: Queries filtered by authenticated user ID to prevent cross-client data leakage
4. **Audit Logging**: All pricing decisions logged with user attribution for compliance
5. **Pricing Immutability**: Database constraints prevent price modification after confirmation

---

## Performance Considerations

### Caching Strategy
- **Zone Data**: Cache in memory with TTL 1 hour (zones rarely change)
- **Time Slot Configuration**: Cache with TTL 30 minutes
- **Driver Positions**: Cache with TTL 30 seconds (balances freshness and load)
- **Pricing Parameters**: Cache with TTL 2 hours

### Database Indexes
- `DeliveryRequest(deliveryOption, status)` - For filtering queries
- `DeliveryRequest(deliveryPrice)` - For pricing analytics
- `Driver(status)` - For availability filtering
- `TimeSlotCapacity(slotId, date)` - For daily capacity lookups
- `Zone(boundaries)` - For geospatial queries (consider PostGIS)

### Query Optimization
- Use database geospatial functions (PostGIS) for zone point-in-polygon instead of application logic
- Batch driver availability queries when possible
- Implement pagination for large driver lists

---

## Future Extensions

1. **Dynamic Pricing**: Allow base price/rate adjustment based on demand (surge pricing)
2. **Multiple Time Slots**: Extend beyond 2 predefined slots for better scheduling
3. **Driver Selection Preferences**: Allow clients to filter drivers by rating, vehicle type, preferred drivers
4. **Price Negotiation**: Allow clients to offer alternative prices (within bounds)
5. **Bulk/Recurring Deliveries**: Support subscription-based scheduled deliveries
6. **Multi-Zone Pricing**: Support delivery across multiple zones with combined pricing

---

## Deployment Considerations

### Environment Variables
```
EXPRESS_DELIVERY_BASE_PRICE=500
EXPRESS_DELIVERY_PRICE_PER_KM=250
HAVERSINE_MAX_DISTANCE_KM=50
DRIVER_AVAILABILITY_RADIUS_KM=15
TIME_SLOT_MORNING_START=08:00
TIME_SLOT_MORNING_END=11:00
TIME_SLOT_AFTERNOON_START=14:00
TIME_SLOT_AFTERNOON_END=17:00
TIMEZONE=Africa/Dakar
```

### Monitoring & Alerting
- Track pricing calculation success rate (target: >99%)
- Monitor driver availability (warn if <3 drivers online)
- Alert on time slot capacity exhaustion
- Track audit log completeness (verify all pricing decisions logged)
- Monitor WebSocket connection stability

