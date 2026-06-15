# Implementation Tasks - BETEX Logistics Platform

## Task 1: Create New Database Models
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Create all new Sequelize models for the logistics platform expansion.

### Subtasks:
- [ ] Create ClientStorage model (`backend/src/models/ClientStorage.js`)
- [ ] Create Expense model (`backend/src/models/Expense.js`)
- [ ] Create Shipment model (`backend/src/models/Shipment.js`)
- [ ] Create ScheduledDelivery model (`backend/src/models/ScheduledDelivery.js`)
- [ ] Create FinancialRecord model (`backend/src/models/FinancialRecord.js`)
- [ ] Update models/index.js with new models and associations

---

## Task 2: Modify Stock Model for Client-Based Storage
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Refactor the Stock model to support client-based inventory instead of zone-based.

### Subtasks:
- [ ] Add `clientId` field to Stock model
- [ ] Update Stock model validations and indexes
- [ ] Create migration script for existing stock data
- [ ] Update StockMovement model to track client-specific movements

---

## Task 3: Create Stock Management API Endpoints
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Implement REST API endpoints for client stock management.

### Subtasks:
- [ ] Create `backend/src/controllers/clientStockController.js`
- [ ] Create `backend/src/routes/clientStock.routes.js`
- [ ] Implement GET /api/v1/client-stock (list inventory)
- [ ] Implement POST /api/v1/client-stock (add product)
- [ ] Implement PUT /api/v1/client-stock/:id (update quantity)
- [ ] Implement GET /api/v1/client-stock/movements (movement history)
- [ ] Implement POST /api/v1/client-stock/movement (record movement)
- [ ] Add routes to server.js

---

## Task 4: Create Storage Service API Endpoints
**Status:** todo
**Assignee:** unassigned
**Priority:** medium

Implement API for clients to request and manage storage service.

### Subtasks:
- [ ] Create `backend/src/controllers/storageController.js`
- [ ] Create `backend/src/routes/storage.routes.js`
- [ ] Implement POST /api/v1/storage/request
- [ ] Implement GET /api/v1/storage/requests (admin)
- [ ] Implement PUT /api/v1/storage/requests/:id/approve
- [ ] Implement GET /api/v1/storage/my-storage
- [ ] Add routes to server.js

---

## Task 5: Create Expense Management API Endpoints
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Implement expense tracking for drivers and administrators.

### Subtasks:
- [ ] Create `backend/src/controllers/expenseController.js`
- [ ] Create `backend/src/routes/expense.routes.js`
- [ ] Implement POST /api/v1/expenses (submit expense)
- [ ] Implement GET /api/v1/expenses (list expenses)
- [ ] Implement PUT /api/v1/expenses/:id/approve
- [ ] Implement PUT /api/v1/expenses/:id/reject
- [ ] Implement GET /api/v1/expenses/summary
- [ ] Add file upload middleware for expense photos
- [ ] Add routes to server.js

---

## Task 6: Create Shipment Management API Endpoints
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Implement shipment system with admin pricing workflow.

### Subtasks:
- [ ] Create `backend/src/controllers/shipmentController.js`
- [ ] Create `backend/src/routes/shipment.routes.js`
- [ ] Implement POST /api/v1/shipments (create shipment)
- [ ] Implement GET /api/v1/shipments (list shipments)
- [ ] Implement GET /api/v1/shipments/:trackingNumber (track)
- [ ] Implement PUT /api/v1/shipments/:id/price (admin pricing)
- [ ] Implement PUT /api/v1/shipments/:id/pay (client payment)
- [ ] Implement PUT /api/v1/shipments/:id/status (update status)
- [ ] Add tracking number generation utility
- [ ] Add routes to server.js

---

## Task 7: Create Scheduled Delivery API Endpoints
**Status:** todo
**Assignee:** unassigned
**Priority:** medium

Implement scheduled delivery feature with date/time selection.

### Subtasks:
- [ ] Create `backend/src/controllers/scheduledDeliveryController.js`
- [ ] Create `backend/src/routes/scheduledDelivery.routes.js`
- [ ] Implement POST /api/v1/scheduled-deliveries
- [ ] Implement GET /api/v1/scheduled-deliveries
- [ ] Implement PUT /api/v1/scheduled-deliveries/:id
- [ ] Add routes to server.js

---

## Task 8: Create Financial Dashboard API Endpoints
**Status:** todo
**Assignee:** unassigned
**Priority:** medium

Implement financial analytics and reporting endpoints.

### Subtasks:
- [ ] Create `backend/src/controllers/financialController.js`
- [ ] Create `backend/src/routes/financial.routes.js`
- [ ] Implement GET /api/v1/financial/dashboard
- [ ] Implement GET /api/v1/financial/revenue
- [ ] Implement GET /api/v1/financial/expenses
- [ ] Implement GET /api/v1/financial/profit
- [ ] Implement POST /api/v1/financial/report
- [ ] Add financial calculation service
- [ ] Add routes to server.js

---

## Task 9: Create Client Portal Frontend - Stock Management
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Build client-facing pages for stock management.

### Subtasks:
- [ ] Create `frontend/src/pages/client/ClientStockPage.js`
- [ ] Create `frontend/src/pages/client/StockMovementHistoryPage.js`
- [ ] Create `frontend/src/pages/client/StorageRequestPage.js`
- [ ] Create `frontend/src/components/client/StockInventoryTable.js`
- [ ] Create `frontend/src/components/client/StockMovementCard.js`
- [ ] Create `frontend/src/services/clientStockService.js`
- [ ] Add API integration for stock operations

---

## Task 10: Create Client Portal Frontend - Shipments
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Build client-facing pages for shipment creation and tracking.

### Subtasks:
- [ ] Create `frontend/src/pages/client/ShipmentCreationPage.js`
- [ ] Create `frontend/src/pages/client/ShipmentTrackingPage.js`
- [ ] Create `frontend/src/components/client/ShipmentForm.js`
- [ ] Create `frontend/src/components/client/ShipmentStatusBadge.js`
- [ ] Create `frontend/src/services/shipmentService.js`
- [ ] Add tracking interface with real-time updates

---

## Task 11: Create Client Portal Frontend - Scheduled Deliveries
**Status:** todo
**Assignee:** unassigned
**Priority:** medium

Build client interface for scheduling deliveries.

### Subtasks:
- [ ] Create `frontend/src/pages/client/ScheduledDeliveryPage.js`
- [ ] Create `frontend/src/components/client/DeliveryScheduler.js`
- [ ] Add date/time picker components
- [ ] Create `frontend/src/services/scheduledDeliveryService.js`

---

## Task 12: Create Client Portal Frontend - Main Menu
**Status:** todo
**Assignee:** unassigned
**Priority:** medium

Update client navigation with new menu options.

### Subtasks:
- [ ] Create `frontend/src/pages/client/ClientDashboard.js`
- [ ] Create `frontend/src/components/client/ClientMenuNavigation.js`
- [ ] Add menu items: Livraison Express, Livraison Programmée, Expédition, Historique, Stockage
- [ ] Update routing configuration

---

## Task 13: Create Driver Dashboard Frontend - Expenses
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Build driver interface for expense management.

### Subtasks:
- [ ] Create `frontend/src/pages/driver/DriverExpensesPage.js`
- [ ] Create `frontend/src/pages/driver/ExpenseHistoryPage.js`
- [ ] Create `frontend/src/pages/driver/DailyExpenseForm.js`
- [ ] Create `frontend/src/components/driver/ExpenseForm.js`
- [ ] Create `frontend/src/components/driver/PhotoUploader.js`
- [ ] Create `frontend/src/components/driver/ExpenseCategorySelector.js`
- [ ] Create `frontend/src/services/expenseService.js`
- [ ] Add photo upload functionality

---

## Task 14: Create Admin Panel Frontend - Stock Management
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Build admin interface for managing all client stocks.

### Subtasks:
- [ ] Create `frontend/src/pages/admin/AdminStockManagement.js`
- [ ] Create `frontend/src/pages/admin/StorageRequestsPage.js`
- [ ] Create `frontend/src/components/admin/ClientStockManager.js`
- [ ] Create `frontend/src/components/admin/StorageRequestCard.js`
- [ ] Add bulk stock operations interface

---

## Task 15: Create Admin Panel Frontend - Expense Validation
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Build admin interface for validating expenses.

### Subtasks:
- [ ] Create `frontend/src/pages/admin/ExpenseValidationPage.js`
- [ ] Create `frontend/src/components/admin/ExpenseValidationTable.js`
- [ ] Add expense approval/rejection workflow
- [ ] Add photo viewer for expense justifications

---

## Task 16: Create Admin Panel Frontend - Shipment Management
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Build admin interface for pricing and managing shipments.

### Subtasks:
- [ ] Create `frontend/src/pages/admin/ShipmentPricingPage.js`
- [ ] Create `frontend/src/components/admin/ShipmentPricingForm.js`
- [ ] Add shipment pricing calculator
- [ ] Add shipment status management

---

## Task 17: Create Admin Panel Frontend - Financial Dashboard
**Status:** todo
**Assignee:** unassigned
**Priority:** medium

Build financial analytics dashboard for administrators.

### Subtasks:
- [ ] Create `frontend/src/pages/admin/FinancialDashboardPage.js`
- [ ] Create `frontend/src/components/admin/FinancialChart.js`
- [ ] Create `frontend/src/components/admin/RevenueCard.js`
- [ ] Create `frontend/src/components/admin/ExpenseCard.js`
- [ ] Create `frontend/src/components/admin/ProfitCard.js`
- [ ] Create `frontend/src/services/financialService.js`
- [ ] Add chart visualization (Recharts)
- [ ] Add period filtering (daily, monthly, yearly)

---

## Task 18: Implement Notification System
**Status:** todo
**Assignee:** unassigned
**Priority:** medium

Build notification system for shipment pricing and payment updates.

### Subtasks:
- [ ] Create `backend/src/services/notificationService.js`
- [ ] Add email notification templates
- [ ] Add SMS notification integration (optional)
- [ ] Add in-app notification system
- [ ] Implement Socket.IO events for real-time notifications

---

## Task 19: Implement File Upload System
**Status:** todo
**Assignee:** unassigned
**Priority:** medium

Add file upload capability for expense photos.

### Subtasks:
- [ ] Configure Multer middleware for file uploads
- [ ] Create upload directory structure
- [ ] Add file validation (size, type)
- [ ] Implement file storage service
- [ ] Add file serving endpoint

---

## Task 20: Database Migration Scripts
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Create migration scripts for database schema changes.

### Subtasks:
- [ ] Create migration to add clientId to stocks table
- [ ] Create migration to create new tables
- [ ] Create data migration script for existing stocks
- [ ] Create rollback scripts
- [ ] Test migrations on staging environment

---

## Task 21: Update Authentication & Authorization
**Status:** todo
**Assignee:** unassigned
**Priority:** high

Update middleware to support new role-based permissions.

### Subtasks:
- [ ] Update auth middleware for new endpoints
- [ ] Add role-based access control for stock management
- [ ] Add role-based access control for expense management
- [ ] Add role-based access control for shipment management
- [ ] Add role-based access control for financial dashboard

---

## Task 22: Integration Testing
**Status:** todo
**Assignee:** unassigned
**Priority:** medium

Create comprehensive integration tests for new features.

### Subtasks:
- [ ] Write tests for shipment workflow
- [ ] Write tests for expense approval workflow
- [ ] Write tests for storage service workflow
- [ ] Write tests for stock management operations
- [ ] Write tests for financial calculations

---

## Task 23: Performance Optimization
**Status:** todo
**Assignee:** unassigned
**Priority:** low

Optimize database queries and add caching.

### Subtasks:
- [ ] Add database indexes for new tables
- [ ] Implement Redis caching for financial dashboard
- [ ] Implement pagination for large result sets
- [ ] Optimize stock movement queries
- [ ] Add query performance monitoring

---

## Task 24: Documentation
**Status:** todo
**Assignee:** unassigned
**Priority:** low

Create user and developer documentation.

### Subtasks:
- [ ] Write API documentation for new endpoints
- [ ] Create user guide for client portal
- [ ] Create user guide for driver dashboard
- [ ] Create user guide for admin panel
- [ ] Document database schema changes

---

## Task 25: Deployment & Monitoring
**Status:** todo
**Assignee:** unassigned
**Priority:** medium

Deploy new features and set up monitoring.

### Subtasks:
- [ ] Deploy backend updates to staging
- [ ] Deploy frontend updates to staging
- [ ] Run database migrations on staging
- [ ] Set up monitoring for new endpoints
- [ ] Configure logging for new features
- [ ] Deploy to production with gradual rollout

