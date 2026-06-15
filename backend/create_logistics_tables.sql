-- BETEX EXPRESS - Logistics Platform Tables Migration
-- Creates new tables for enhanced logistics features
-- Run this script to add new functionality for:
-- - Client-based storage management
-- - Expense tracking (driver & admin)
-- - Shipment management
-- - Scheduled deliveries
-- - Financial records

-- =====================================================
-- 1. CLIENT STORAGE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_storages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'active', 'suspended', 'terminated')),
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_storages_client_id ON client_storages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_storages_status ON client_storages(status);

-- =====================================================
-- 2. EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('driver', 'admin')),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'fuel', 'repair', 'toll', 'communication', 
    'salary', 'internet', 'electricity', 'rent', 'equipment', 'other'
  )),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_type_status ON expenses(type, status);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- =====================================================
-- 3. SHIPMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tracking_number VARCHAR(50) NOT NULL UNIQUE,
  
  -- Recipient Information
  recipient_name VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  destination_address TEXT NOT NULL,
  destination_lat FLOAT,
  destination_lng FLOAT,
  
  -- Package Information
  package_description TEXT NOT NULL,
  package_value DECIMAL(10, 2) NOT NULL CHECK (package_value >= 0),
  weight FLOAT,
  
  -- Pricing (Admin fills these)
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  additional_fees DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Status & Workflow
  status VARCHAR(30) NOT NULL DEFAULT 'pending_pricing' CHECK (status IN (
    'pending_pricing', 'awaiting_payment', 'paid', 
    'processing', 'in_transit', 'delivered', 'cancelled'
  )),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  
  -- Admin fields
  admin_notes TEXT,
  priced_by UUID REFERENCES users(id) ON DELETE SET NULL,
  priced_at TIMESTAMP,
  
  -- Driver assignment
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP,
  delivered_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_client_id_status ON shipments(client_id, status);
CREATE INDEX IF NOT EXISTS idx_shipments_status_payment ON shipments(status, payment_status);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at);

-- =====================================================
-- 4. SCHEDULED DELIVERIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS scheduled_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tracking_number VARCHAR(50) NOT NULL UNIQUE,
  
  -- Pickup Information
  pickup_address TEXT NOT NULL,
  pickup_lat FLOAT,
  pickup_lng FLOAT,
  
  -- Delivery Information
  delivery_address TEXT NOT NULL,
  delivery_lat FLOAT,
  delivery_lng FLOAT,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time_slot VARCHAR(20) NOT NULL DEFAULT 'morning' CHECK (scheduled_time_slot IN ('morning', 'afternoon', 'evening', 'specific')),
  specific_time TIME,
  
  -- Delivery Type
  delivery_type VARCHAR(20) NOT NULL DEFAULT 'local' CHECK (delivery_type IN ('local', 'express')),
  
  -- Package Information
  description TEXT,
  weight FLOAT,
  
  -- Pricing
  price DECIMAL(10, 2) DEFAULT 0,
  
  -- Recurring (future enhancement)
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(100),
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'pending_approval' CHECK (status IN (
    'pending_approval', 'approved', 'scheduled', 
    'in_progress', 'completed', 'cancelled'
  )),
  
  -- Driver assignment
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  
  -- Admin fields
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_deliveries_tracking_number ON scheduled_deliveries(tracking_number);
CREATE INDEX IF NOT EXISTS idx_scheduled_deliveries_client_id_status ON scheduled_deliveries(client_id, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_deliveries_scheduled_date_status ON scheduled_deliveries(scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_deliveries_driver_id ON scheduled_deliveries(driver_id);

-- =====================================================
-- 5. FINANCIAL RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'monthly', 'yearly')),
  
  -- Revenue breakdown
  delivery_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  shipment_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  storage_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Expense breakdown
  driver_expenses DECIMAL(12, 2) NOT NULL DEFAULT 0,
  admin_expenses DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_expenses DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Profit
  net_profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  profit_margin DECIMAL(5, 2) NOT NULL DEFAULT 0,
  
  -- Additional metrics
  number_of_deliveries INTEGER NOT NULL DEFAULT 0,
  number_of_shipments INTEGER NOT NULL DEFAULT 0,
  active_clients INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(period, period_type)
);

CREATE INDEX IF NOT EXISTS idx_financial_records_period ON financial_records(period);
CREATE INDEX IF NOT EXISTS idx_financial_records_period_type ON financial_records(period_type);

-- =====================================================
-- 6. MODIFY STOCKS TABLE FOR CLIENT-BASED INVENTORY
-- =====================================================
-- Add client_id column to stocks table if it doesn't exist
ALTER TABLE stocks 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add index for client-based stock queries
CREATE INDEX IF NOT EXISTS idx_stocks_client_id ON stocks(client_id);

-- Add comment
COMMENT ON COLUMN stocks.client_id IS 'Client who owns this inventory (if applicable)';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - client_storages';
  RAISE NOTICE '  - expenses';
  RAISE NOTICE '  - shipments';
  RAISE NOTICE '  - scheduled_deliveries';
  RAISE NOTICE '  - financial_records';
  RAISE NOTICE 'Modified tables:';
  RAISE NOTICE '  - stocks (added client_id column)';
END $$;
