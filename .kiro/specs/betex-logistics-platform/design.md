# Design Document - BETEX Logistics Platform

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BETEX Logistics Platform                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Client     │  │   Driver     │  │    Admin     │      │
│  │   Portal     │  │  Dashboard   │  │    Panel     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │   API Gateway    │                       │
│                   │   (Express.js)   │                       │
│                   └────────┬────────┘                        │
│                            │                                 │
│         ┌──────────────────┴──────────────────┐             │
│         │                                       │             │
│  ┌──────▼──────┐                      ┌────────▼────────┐   │
│  │   Existing   │                      │  New Modules    │   │
│  │   Modules    │                      │                 │   │
│  ├──────────────┤                      ├─────────────────┤   │
│  │ Auth         │                      │ Stock_Manager   │   │
│  │ Packages     │                      │ Expense_Tracker │   │
│  │ Routes       │                      │ Shipping_System │   │
│  │ Drivers      │                      │ Financial_Dash  │   │
│  │ GPS          │                      │ Storage_Service │   │
│  │ Dashboard    │                      │ Payment_Gateway │   │
│  └──────┬───────┘                      └────────┬────────┘   │
│         │                                       │             │
│         └──────────────────┬────────────────────┘             │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │   PostgreSQL     │                       │
│                   │   Database       │                       │
│                   └──────────────────┘                       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 Module Interactions

```
Client Portal           Driver Dashboard         Admin Panel
     │                        │                       │
     │ Create Shipment        │ Submit Expense        │
     ├────────────────────────┼──────────────────────►│
     │                        │                       │ Price Shipment
     │                        │                       │ Validate Expense
     │ ◄──────────────────────┼───────────────────────┤
     │ Notification           │                       │
     │                        │                       │
     │ Request Storage        │                       │
     ├───────────────────────────────────────────────►│
     │                        │                       │ Approve Storage
     │ ◄──────────────────────────────────────────────┤
     │                        │                       │
     │ Manage Stock           │                       │
     ├────────────────────────┼──────────────────────►│ View All Stocks
     │                        │                       │
```

## 2. Database Schema Design

### 2.1 Modified Models

#### Stock Model (Modified)
```javascript
Stock {
  id: UUID PRIMARY KEY
  productId: UUID FOREIGN KEY → products.id
  clientId: UUID FOREIGN KEY → users.id  // NEW: Replaces zoneId
  quantity: INTEGER
  minimumQuantity: INTEGER
  location: STRING  // Physical location reference
  lastRestockDate: DATE
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
  
  // Indexes
  INDEX (clientId, productId) UNIQUE
  INDEX (clientId)
}
```

### 2.2 New Models

#### ClientStorage Model
```javascript
ClientStorage {
  id: UUID PRIMARY KEY
  clientId: UUID FOREIGN KEY → users.id
  status: ENUM('requested', 'active', 'suspended', 'terminated')
  requestedAt: TIMESTAMP
  approvedAt: TIMESTAMP
  approvedBy: UUID FOREIGN KEY → users.id
  notes: TEXT
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
  
  // Indexes
  INDEX (clientId) UNIQUE
  INDEX (status)
}
```

#### Expense Model
```javascript
Expense {
  id: UUID PRIMARY KEY
  userId: UUID FOREIGN KEY → users.id
  type: ENUM('driver', 'admin')
  category: ENUM('fuel', 'repair', 'toll', 'communication', 'salary', 'internet', 'electricity', 'rent', 'equipment', 'other')
  amount: DECIMAL(10,2)
  description: TEXT
  date: DATE
  photoUrl: STRING  // Path to uploaded photo
  status: ENUM('pending', 'approved', 'rejected')
  approvedBy: UUID FOREIGN KEY → users.id
  approvedAt: TIMESTAMP
  rejectionReason: TEXT
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
  
  // Indexes
  INDEX (userId, date)
  INDEX (type, status)
  INDEX (category)
}
```

#### Shipment Model
```javascript
Shipment {
  id: UUID PRIMARY KEY
  clientId: UUID FOREIGN KEY → users.id
  trackingNumber: STRING UNIQUE
  
  // Recipient Information
  recipientName: STRING(100)
  recipientPhone: STRING(20)
  destinationAddress: TEXT
  destinationLat: FLOAT
  destinationLng: FLOAT
  
  // Package Information
  packageDescription: TEXT
  packageValue: DECIMAL(10,2)
  weight: FLOAT
  
  // Pricing (Admin fills)
  shippingAmount: DECIMAL(10,2)
  additionalFees: DECIMAL(10,2)
  totalAmount: DECIMAL(10,2)
  
  // Status & Workflow
  status: ENUM('pending_pricing', 'awaiting_payment', 'paid', 'processing', 'in_transit', 'delivered', 'cancelled')
  paymentStatus: ENUM('unpaid', 'paid', 'refunded')
  
  // Admin fields
  adminNotes: TEXT
  pricedBy: UUID FOREIGN KEY → users.id
  pricedAt: TIMESTAMP
  
  // Timestamps
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
  paidAt: TIMESTAMP
  deliveredAt: TIMESTAMP
  
  // Indexes
  INDEX (trackingNumber)
  INDEX (clientId, status)
  INDEX (status, paymentStatus)
}
```

#### ScheduledDelivery Model (extends DeliveryRequest)
```javascript
ScheduledDelivery {
  // Inherits all fields from DeliveryRequest
  // Additional fields:
  scheduledDate: DATE
  scheduledTimeSlot: ENUM('morning', 'afternoon', 'evening', 'specific')
  specificTime: TIME
  deliveryType: ENUM('local', 'express')
  isRecurring: BOOLEAN
  recurrencePattern: STRING  // For future recurring deliveries
}
```

#### FinancialRecord Model (for caching dashboard data)
```javascript
FinancialRecord {
  id: UUID PRIMARY KEY
  period: DATE  // Start of period (day/month/year)
  periodType: ENUM('daily', 'monthly', 'yearly')
  
  // Revenue
  deliveryRevenue: DECIMAL(12,2)
  shipmentRevenue: DECIMAL(12,2)
  storageRevenue: DECIMAL(12,2)
  totalRevenue: DECIMAL(12,2)
  
  // Expenses
  driverExpenses: DECIMAL(12,2)
  adminExpenses: DECIMAL(12,2)
  totalExpenses: DECIMAL(12,2)
  
  // Profit
  netProfit: DECIMAL(12,2)
  profitMargin: DECIMAL(5,2)  // Percentage
  
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
  
  // Indexes
  INDEX (period, periodType) UNIQUE
}
```

## 3. API Endpoints Design

### 3.1 Client Stock Management

```
GET    /api/v1/client-stock
       - Get client's stock inventory
       - Query params: productId (optional)
       - Auth: Client, Admin
       
POST   /api/v1/client-stock
       - Add product to client stock
       - Body: { productId, quantity, location }
       - Auth: Admin
       
PUT    /api/v1/client-stock/:id
       - Update stock quantity
       - Body: { quantity, operation: 'add'|'subtract' }
       - Auth: Admin
       
GET    /api/v1/client-stock/movements
       - Get stock movement history
       - Query params: startDate, endDate, type
       - Auth: Client, Admin
       
POST   /api/v1/client-stock/movement
       - Record stock movement
       - Body: { stockId, type, quantity, reason }
       - Auth: Admin
```

### 3.2 Storage Service

```
POST   /api/v1/storage/request
       - Client requests storage service
       - Body: { notes }
       - Auth: Client
       
GET    /api/v1/storage/requests
       - Get all storage requests (admin)
       - Query params: status
       - Auth: Admin
       
PUT    /api/v1/storage/requests/:id/approve
       - Approve storage request
       - Body: { notes }
       - Auth: Admin
       
GET    /api/v1/storage/my-storage
       - Get client's storage service status
       - Auth: Client
```

### 3.3 Expense Management

```
POST   /api/v1/expenses
       - Submit expense
       - Body: { type, category, amount, description, date, photo }
       - Auth: Driver, Admin
       
GET    /api/v1/expenses
       - Get expenses
       - Query params: type, status, startDate, endDate, userId
       - Auth: Driver (own), Admin (all)
       
PUT    /api/v1/expenses/:id/approve
       - Approve expense
       - Body: { notes }
       - Auth: Admin
       
PUT    /api/v1/expenses/:id/reject
       - Reject expense
       - Body: { rejectionReason }
       - Auth: Admin
       
GET    /api/v1/expenses/summary
       - Get expense summary
       - Query params: period, type
       - Auth: Admin
```

### 3.4 Shipment Management

```
POST   /api/v1/shipments
       - Create shipment request
       - Body: { recipientName, recipientPhone, destination, packageDescription, packageValue }
       - Auth: Client
       
GET    /api/v1/shipments
       - Get shipments
       - Query params: status, clientId (admin only)
       - Auth: Client (own), Admin (all)
       
GET    /api/v1/shipments/:trackingNumber
       - Track shipment
       - Auth: Public (with tracking number)
       
PUT    /api/v1/shipments/:id/price
       - Set shipment pricing
       - Body: { shippingAmount, additionalFees, notes }
       - Auth: Admin
       
PUT    /api/v1/shipments/:id/pay
       - Mark shipment as paid
       - Body: { paymentMethod, transactionId }
       - Auth: Client
       
PUT    /api/v1/shipments/:id/status
       - Update shipment status
       - Body: { status, notes }
       - Auth: Admin
```

### 3.5 Scheduled Delivery

```
POST   /api/v1/scheduled-deliveries
       - Create scheduled delivery
       - Body: { scheduledDate, timeSlot, pickupAddress, deliveryAddress, description }
       - Auth: Client
       
GET    /api/v1/scheduled-deliveries
       - Get scheduled deliveries
       - Query params: date, status
       - Auth: Client (own), Admin (all)
       
PUT    /api/v1/scheduled-deliveries/:id
       - Update scheduled delivery
       - Body: { scheduledDate, timeSlot, status }
       - Auth: Client (before approval), Admin
```

### 3.6 Financial Dashboard

```
GET    /api/v1/financial/dashboard
       - Get financial dashboard data
       - Query params: period (daily|monthly|yearly), startDate, endDate
       - Auth: Admin
       
GET    /api/v1/financial/revenue
       - Get revenue breakdown
       - Query params: period, source
       - Auth: Admin
       
GET    /api/v1/financial/expenses
       - Get expenses breakdown
       - Query params: period, category
       - Auth: Admin
       
GET    /api/v1/financial/profit
       - Get profit analysis
       - Query params: period
       - Auth: Admin
       
POST   /api/v1/financial/report
       - Generate financial report
       - Body: { period, format: 'pdf'|'excel' }
       - Auth: Admin
```

## 4. Frontend Component Architecture

### 4.1 Client Portal Components

```
src/pages/client/
├── ClientStockPage.js              # Stock inventory view
├── StockMovementHistoryPage.js     # Movement history
├── StorageRequestPage.js           # Request storage service
├── ShipmentCreationPage.js         # Create shipment
├── ShipmentTrackingPage.js         # Track shipments
├── ScheduledDeliveryPage.js        # Schedule deliveries
└── ClientDashboard.js              # Main dashboard

src/components/client/
├── StockInventoryTable.js
├── StockMovementCard.js
├── ShipmentForm.js
├── ShipmentStatusBadge.js
├── DeliveryScheduler.js
└── ClientMenuNavigation.js
```

### 4.2 Driver Dashboard Components

```
src/pages/driver/
├── DriverExpensesPage.js           # Submit expenses
├── ExpenseHistoryPage.js           # View expense history
├── DailyExpenseForm.js             # Quick daily entry
└── DriverDashboard.js              # Main dashboard

src/components/driver/
├── ExpenseForm.js
├── ExpenseCategorySelector.js
├── PhotoUploader.js
├── ExpenseCard.js
└── ExpenseSummary.js
```

### 4.3 Admin Panel Components

```
src/pages/admin/
├── AdminStockManagement.js         # Manage all client stocks
├── StorageRequestsPage.js          # Approve storage requests
├── ExpenseValidationPage.js        # Validate expenses
├── ShipmentPricingPage.js          # Price shipments
├── FinancialDashboardPage.js       # Financial overview
└── AdminDashboard.js               # Main dashboard

src/components/admin/
├── ClientStockManager.js
├── StorageRequestCard.js
├── ExpenseValidationTable.js
├── ShipmentPricingForm.js
├── FinancialChart.js
├── RevenueCard.js
├── ExpenseCard.js
└── ProfitCard.js
```

## 5. Data Flow Diagrams

### 5.1 Shipment Workflow

```
┌────────┐                    ┌────────┐                    ┌────────┐
│ Client │                    │ System │                    │ Admin  │
└───┬────┘                    └───┬────┘                    └───┬────┘
    │                             │                             │
    │ 1. Create Shipment          │                             │
    ├────────────────────────────►│                             │
    │                             │ Store (status: pending)     │
    │                             ├────────────────────────────►│
    │                             │                             │
    │                             │        2. Set Pricing       │
    │                             │◄────────────────────────────┤
    │                             │                             │
    │ 3. Notify Amount            │                             │
    │◄────────────────────────────┤                             │
    │                             │                             │
    │ 4. Validate & Pay           │                             │
    ├────────────────────────────►│                             │
    │                             │ Update (status: paid)       │
    │                             ├────────────────────────────►│
    │                             │                             │
    │                             │        5. Process           │
    │                             │◄────────────────────────────┤
    │                             │                             │
    │ 6. Track Status             │                             │
    │◄────────────────────────────┤                             │
    │                             │                             │
```

### 5.2 Storage Service Workflow

```
┌────────┐                    ┌────────┐                    ┌────────┐
│ Client │                    │ System │                    │ Admin  │
└───┬────┘                    └───┬────┘                    └───┬────┘
    │                             │                             │
    │ 1. Request Storage          │                             │
    ├────────────────────────────►│                             │
    │                             │ Store (status: requested)   │
    │                             ├────────────────────────────►│
    │                             │                             │
    │                             │        2. Review & Approve  │
    │                             │◄────────────────────────────┤
    │                             │                             │
    │ 3. Notify Approval          │                             │
    │◄────────────────────────────┤                             │
    │                             │                             │
    │ 4. Add Products to Stock    │                             │
    ├────────────────────────────►│                             │
    │                             │ Create Stock Records        │
    │                             ├────────────────────────────►│
    │                             │                             │
    │ 5. View Stock & Movements   │                             │
    │◄────────────────────────────┤                             │
    │                             │                             │
```

### 5.3 Expense Workflow

```
┌────────┐                    ┌────────┐                    ┌────────┐
│ Driver │                    │ System │                    │ Admin  │
└───┬────┘                    └───┬────┘                    └───┬────┘
    │                             │                             │
    │ 1. Submit Daily Expenses    │                             │
    ├────────────────────────────►│                             │
    │                             │ Store (status: pending)     │
    │                             ├────────────────────────────►│
    │                             │                             │
    │                             │        2. Review            │
    │                             │◄────────────────────────────┤
    │                             │                             │
    │                             │        3. Approve/Reject    │
    │                             │◄────────────────────────────┤
    │                             │                             │
    │ 4. Notify Status            │                             │
    │◄────────────────────────────┤                             │
    │                             │                             │
    │                             │        5. Update Financial  │
    │                             │         Dashboard           │
    │                             ├────────────────────────────►│
    │                             │                             │
```

## 6. Migration Strategy

### 6.1 Database Migration Plan

```sql
-- Phase 1: Add new columns and tables
ALTER TABLE stocks ADD COLUMN "clientId" UUID;
ALTER TABLE stocks ADD FOREIGN KEY ("clientId") REFERENCES users(id);

CREATE TABLE client_storages (...);
CREATE TABLE expenses (...);
CREATE TABLE shipments (...);
CREATE TABLE financial_records (...);

-- Phase 2: Migrate existing data
-- Create default client for existing zone-based stocks
INSERT INTO client_storages (clientId, status, approvedAt)
SELECT DISTINCT u.id, 'active', NOW()
FROM users u
WHERE u.role = 'admin' LIMIT 1;

-- Migrate stocks to default client
UPDATE stocks 
SET "clientId" = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE "clientId" IS NULL;

-- Phase 3: Make clientId NOT NULL
ALTER TABLE stocks ALTER COLUMN "clientId" SET NOT NULL;

-- Phase 4: Remove zoneId (after verification)
-- ALTER TABLE stocks DROP COLUMN "zoneId";
```

### 6.2 Deployment Strategy

1. **Phase 1: Backend Foundation** (Week 1)
   - Deploy new models
   - Add API endpoints
   - Keep existing functionality intact

2. **Phase 2: Admin Interface** (Week 2)
   - Deploy admin pages for new features
   - Test workflows with admin users

3. **Phase 3: Client & Driver Interface** (Week 3)
   - Deploy client portal updates
   - Deploy driver dashboard updates

4. **Phase 4: Migration & Cleanup** (Week 4)
   - Migrate existing data
   - Remove deprecated code
   - Performance optimization

### 6.3 Rollback Plan

```javascript
// Emergency rollback script
const rollback = async () => {
  // 1. Restore previous database schema
  await sequelize.query('ALTER TABLE stocks DROP COLUMN "clientId"');
  
  // 2. Restore previous API routes
  app.use('/api/v1/stock', oldStockRoutes);
  
  // 3. Revert frontend to previous version
  // Deploy from git tag: v1.0.0
};
```

## 7. Performance Considerations

### 7.1 Database Indexes

```sql
-- High-priority indexes for new features
CREATE INDEX idx_stocks_client ON stocks("clientId");
CREATE INDEX idx_expenses_user_date ON expenses("userId", date);
CREATE INDEX idx_shipments_tracking ON shipments("trackingNumber");
CREATE INDEX idx_shipments_client_status ON shipments("clientId", status);
CREATE INDEX idx_financial_period ON financial_records(period, "periodType");
```

### 7.2 Caching Strategy

```javascript
// Cache financial dashboard data
const financialCache = {
  ttl: 3600, // 1 hour
  keys: ['dashboard:daily', 'dashboard:monthly', 'dashboard:yearly']
};

// Cache client stock inventory
const stockCache = {
  ttl: 300, // 5 minutes
  keys: ['stock:client:{clientId}']
};
```

### 7.3 Query Optimization

```javascript
// Paginate large result sets
const EXPENSES_PER_PAGE = 50;
const SHIPMENTS_PER_PAGE = 20;

// Use database aggregation for financial dashboard
const financialSummary = await sequelize.query(`
  SELECT 
    SUM(CASE WHEN type = 'delivery' THEN amount ELSE 0 END) as deliveryRevenue,
    SUM(CASE WHEN type = 'shipment' THEN amount ELSE 0 END) as shipmentRevenue
  FROM transactions
  WHERE date >= ? AND date <= ?
`, { replacements: [startDate, endDate] });
```

## 8. Security Considerations

### 8.1 Authorization Matrix

```
Feature                  | Client | Driver | Admin
-------------------------|--------|--------|-------
View Own Stock           |   ✓    |   ✗    |   ✓
Manage All Stocks        |   ✗    |   ✗    |   ✓
Submit Expenses          |   ✗    |   ✓    |   ✓
Approve Expenses         |   ✗    |   ✗    |   ✓
Create Shipment          |   ✓    |   ✗    |   ✓
Price Shipment           |   ✗    |   ✗    |   ✓
View Financial Dashboard |   ✗    |   ✗    |   ✓
Request Storage          |   ✓    |   ✗    |   ✗
Approve Storage          |   ✗    |   ✗    |   ✓
```

### 8.2 Data Validation

```javascript
// Input validation schemas
const shipmentSchema = {
  recipientName: { type: 'string', minLength: 2, maxLength: 100 },
  recipientPhone: { type: 'string', pattern: /^\+?[\d\s-]+$/ },
  packageValue: { type: 'number', min: 0, max: 1000000 },
  weight: { type: 'number', min: 0.1, max: 1000 }
};

const expenseSchema = {
  amount: { type: 'number', min: 0, max: 100000 },
  category: { type: 'enum', values: ['fuel', 'repair', ...] },
  date: { type: 'date', max: new Date() }
};
```

## 9. Testing Strategy

### 9.1 Unit Tests

```javascript
// Stock management tests
describe('Stock_Manager', () => {
  test('should create client stock', async () => {});
  test('should record stock movement', async () => {});
  test('should calculate stock balance', async () => {});
});

// Expense tests
describe('Expense_Tracker', () => {
  test('should submit driver expense', async () => {});
  test('should validate expense approval', async () => {});
});

// Shipment tests
describe('Shipping_System', () => {
  test('should create shipment request', async () => {});
  test('should calculate shipping amount', async () => {});
  test('should process payment', async () => {});
});
```

### 9.2 Integration Tests

```javascript
// End-to-end workflow tests
describe('Shipment Workflow', () => {
  test('complete shipment flow from creation to delivery', async () => {
    // 1. Client creates shipment
    // 2. Admin prices shipment
    // 3. Client pays
    // 4. Status updates to delivered
  });
});
```

## 10. Monitoring & Logging

### 10.1 Key Metrics

```javascript
// Track business metrics
const metrics = {
  'shipments.created': counter,
  'shipments.paid': counter,
  'expenses.submitted': counter,
  'expenses.approved': counter,
  'stock.movements': counter,
  'financial.revenue.daily': gauge,
  'financial.profit.daily': gauge
};
```

### 10.2 Logging Strategy

```javascript
// Structured logging
logger.info('Shipment created', {
  shipmentId,
  clientId,
  trackingNumber,
  amount
});

logger.info('Expense approved', {
  expenseId,
  driverId,
  category,
  amount,
  approvedBy
});
```

