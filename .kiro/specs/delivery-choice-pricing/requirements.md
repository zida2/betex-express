# Requirements Document: Betex Express Delivery Choice & Pricing System

## Introduction

Betex Express is implementing a flexible delivery system that empowers clients to choose between two distinct delivery modes:

1. **EXPRESS DELIVERY**: Real-time driver selection based on live availability and distance-based pricing
2. **SCHEDULED DELIVERY**: Fixed time slots with zone-based pricing

This feature enables clients to optimize delivery based on their urgency and budget while providing consistent pricing models for operational planning.

## Glossary

- **Express_Delivery**: A delivery service where the client selects an available driver in real-time and pays based on distance traveled
- **Scheduled_Delivery**: A delivery service where the client selects from two predefined daily time slots and pays a fixed zone-based price
- **Delivery_Option**: The choice presented to the client to select either Express_Delivery or Scheduled_Delivery
- **Client**: The entity requesting a delivery (sender or receiver)
- **Pricing_Engine**: The system component responsible for calculating delivery costs
- **Distance_Based_Pricing**: A pricing model where cost is determined by kilometers traveled
- **Zone_Based_Pricing**: A pricing model where cost is determined by delivery zone (fixed price range per zone)
- **Available_Driver**: A driver with status 'online' and located within serviceable delivery area
- **Time_Slot**: A predefined delivery window (two slots available per day)
- **Delivery_Zone**: A geographic area with a fixed delivery price
- **Distance_Calculator**: A utility that computes the distance between two geographic coordinates

## Requirements

### Requirement 1: Display Delivery Option Selection to Client

**User Story:** As a client, I want to choose between Express and Scheduled delivery options, so that I can select the service that best fits my needs.

#### Acceptance Criteria

1. WHEN a client initiates a delivery request, THE Delivery_Selection_Interface SHALL display both Express_Delivery and Scheduled_Delivery options
2. THE Delivery_Selection_Interface SHALL clearly show the key characteristics of each option (e.g., "Choose your driver now" vs "Pick a time slot")
3. WHERE visual presentation, THE Delivery_Selection_Interface SHALL use distinct visual indicators (icons, colors, or sections) to differentiate between the two options
4. WHEN a client hovers over or taps an option, THE Delivery_Selection_Interface SHALL display a brief description of each delivery mode
5. THE Delivery_Selection_Interface SHALL remain visible until the client explicitly selects one option

### Requirement 2: Enable Express Delivery with Real-Time Driver Selection

**User Story:** As a client, I want to see available drivers in real-time and select one for immediate delivery, so that I can get my package delivered quickly.

#### Acceptance Criteria

1. WHEN a client selects Express_Delivery, THE Driver_Availability_Service SHALL query drivers with status 'online' in the serviceable area
2. WHEN available drivers are found, THE Express_Delivery_Interface SHALL display a list of available drivers with their:
   - Current location (latitude and longitude)
   - Vehicle type and license plate
   - Current rating (numeric value between 0 and 5)
   - Distance from pickup location in kilometers
3. WHEN driver availability changes (driver goes online/offline), THE Express_Delivery_Interface SHALL update the driver list in real-time using WebSocket connections
4. WHEN a client selects a specific driver, THE Delivery_System SHALL assign that driver to the delivery request
5. IF no drivers are available at the time of selection, THE Express_Delivery_Interface SHALL display a message "No available drivers at this time" and offer to schedule delivery instead
6. WHEN a driver is assigned, THE Driver_Assignment_Service SHALL update the driver status to 'in_delivery'

### Requirement 3: Calculate Distance-Based Pricing for Express Delivery

**User Story:** As the Pricing_Engine, I want to calculate delivery cost based on distance traveled, so that clients pay fairly for express delivery services.

#### Acceptance Criteria

1. WHEN a client selects Express_Delivery and chooses a driver, THE Pricing_Engine SHALL calculate the distance from pickup location to delivery location using the Distance_Calculator
2. THE Distance_Calculator SHALL use the Haversine formula to compute the straight-line distance between two geographic coordinates (latitude, longitude)
3. WHEN distance is calculated, THE Pricing_Engine SHALL apply the pricing formula: Delivery_Cost = Base_Price + (Distance_in_km × Price_per_km)
4. THE Pricing_Engine SHALL use configurable pricing parameters: Base_Price and Price_per_km (retrieved from system configuration)
5. WHEN the pricing calculation is complete, THE Delivery_Pricing_Interface SHALL display the calculated price to the client before delivery confirmation
6. WHEN price changes occur (e.g., due to route updates), THE Delivery_Pricing_Interface SHALL recalculate and update the displayed price in real-time

### Requirement 4: Display Available Time Slots for Scheduled Delivery

**User Story:** As a client, I want to see available delivery time slots and select one that works for me, so that I can schedule delivery at a convenient time.

#### Acceptance Criteria

1. WHEN a client selects Scheduled_Delivery, THE Time_Slot_Service SHALL retrieve the two predefined daily time slots (hardcoded or configurable)
2. THE Time_Slot_Selection_Interface SHALL display both available time slots with:
   - Start time and end time for each slot (formatted as HH:MM - HH:MM)
   - Availability status (available or unavailable)
   - Expected delivery date
3. WHEN a time slot is unavailable (e.g., maximum capacity reached), THE Time_Slot_Selection_Interface SHALL display the slot as disabled with a reason (e.g., "Slot full")
4. WHEN a client selects a time slot, THE Delivery_System SHALL assign the selected time slot to the delivery request
5. WHEN a client selects a time slot, THE Time_Slot_Capacity_Service SHALL decrement the available slot capacity by 1

### Requirement 5: Validate Delivery Zone for Zone-Based Pricing

**User Story:** As the Pricing_Engine, I want to validate the delivery location and determine its zone, so that I can apply correct zone-based pricing.

#### Acceptance Criteria

1. WHEN a client provides a delivery address, THE Delivery_Zone_Validator SHALL determine which Delivery_Zone contains the delivery location using geographic coordinates
2. IF the delivery location falls within a defined Delivery_Zone, THE Pricing_Engine SHALL proceed to pricing calculation
3. IF the delivery location falls outside all defined Delivery_Zones, THE Delivery_Zone_Validator SHALL reject the delivery with error message "Delivery location is outside serviceable zones"
4. WHEN a Delivery_Zone is identified, THE Zone_Information_Service SHALL retrieve the zone's delivery pricing range (minimum price: 1000f, maximum price: 2000f)
5. WHEN a delivery location is in a zone with price 1500f, THE Pricing_Engine SHALL use 1500f as the delivery cost for Scheduled_Delivery

### Requirement 6: Calculate Zone-Based Pricing for Scheduled Delivery

**User Story:** As the Pricing_Engine, I want to calculate delivery cost based on delivery zone, so that clients pay a fixed predictable price for scheduled delivery.

#### Acceptance Criteria

1. WHEN a client selects Scheduled_Delivery and confirms a delivery location, THE Pricing_Engine SHALL determine the applicable Delivery_Zone
2. WHEN a Delivery_Zone is determined, THE Pricing_Engine SHALL retrieve the zone's fixed delivery price from zone configuration
3. THE Pricing_Engine SHALL apply zone-based pricing formula: Delivery_Cost = Zone_Fixed_Price (values ranging from 1000f to 2000f depending on zone)
4. WHEN pricing is calculated, THE Delivery_Pricing_Interface SHALL display the fixed zone-based price to the client
5. WHEN a client confirms the delivery request, THE Delivery_System SHALL lock in the calculated price (price shall not change during fulfillment)

### Requirement 7: Display Final Pricing Before Delivery Confirmation

**User Story:** As a client, I want to review the final delivery cost before confirming my order, so that I can make an informed purchasing decision.

#### Acceptance Criteria

1. WHEN a client completes selection of delivery option and location, THE Pricing_Review_Interface SHALL display:
   - Selected delivery option (Express or Scheduled)
   - Delivery cost (calculated based on pricing model)
   - Breakdown of pricing (e.g., "Base: 500f + Distance: 2km × 250f/km = 1000f" for Express, or "Zone B: 1500f" for Scheduled)
   - Total package price (if client specified package value)
2. WHEN a client reviews pricing, THE Pricing_Review_Interface SHALL provide a "Confirm" and "Modify" button
3. WHEN a client clicks "Modify", THE Delivery_System SHALL return to delivery option selection (Requirement 1)
4. WHEN a client clicks "Confirm", THE Delivery_System SHALL create the delivery request with the locked-in pricing

### Requirement 8: Persist Delivery Choice and Pricing Information

**User Story:** As the system, I want to store delivery choice and pricing details, so that I can track delivery history and generate accurate invoices.

#### Acceptance Criteria

1. WHEN a delivery request is confirmed by a client, THE Delivery_Request_Repository SHALL create a record containing:
   - Delivery_Option (Express or Scheduled)
   - Calculated_Price
   - Pricing_Model_Used (Distance_Based or Zone_Based)
   - For Express: Driver ID, selected driver details, distance calculated
   - For Scheduled: Selected time slot, delivery zone
2. WHEN the delivery request is stored, THE DeliveryRequest_Database SHALL ensure the delivery_price field is populated with the confirmed price
3. WHEN the delivery status changes (approved, in_transit, completed, cancelled), THE Delivery_Status_Tracker SHALL maintain the original pricing information (pricing shall not be recalculated)

### Requirement 9: Handle Express Delivery Driver Availability Changes

**User Story:** As the system, I want to manage situations where a selected driver becomes unavailable, so that I can maintain service reliability.

#### Acceptance Criteria

1. WHEN an Express_Delivery client selects a driver and the driver status changes to 'offline' before delivery confirmation, THE Driver_Availability_Service SHALL detect this change
2. WHEN a selected driver becomes unavailable, THE Availability_Notification_Service SHALL notify the client: "Selected driver is no longer available. Please select another driver"
3. WHEN notified, THE Delivery_Selection_Interface SHALL refresh the available driver list
4. WHEN a client reselects a driver, THE Pricing_Engine SHALL recalculate the delivery cost based on the new driver's location (distance may have changed)

### Requirement 10: Prevent Delivery Request Submission with Invalid Pricing

**User Story:** As the system, I want to prevent incomplete or invalid delivery requests, so that all deliveries have proper pricing information.

#### Acceptance Criteria

1. WHEN a client attempts to confirm a delivery request without selecting a delivery option, THE Form_Validator SHALL display error message "Please select a delivery option"
2. WHEN a client selects Express_Delivery but does not choose a driver, THE Form_Validator SHALL display error message "Please select a driver"
3. WHEN a client selects Scheduled_Delivery but does not choose a time slot, THE Form_Validator SHALL display error message "Please select a delivery time slot"
4. WHEN the Pricing_Engine fails to calculate pricing for any reason, THE Error_Handler SHALL display a user-friendly error: "Unable to calculate delivery cost. Please try again"
5. WHEN all validations pass, THE Delivery_Request_Service SHALL create the delivery request in status 'pending_approval'

### Requirement 11: Support Concurrent Delivery Requests

**User Story:** As the system, I want to process multiple delivery requests simultaneously, so that multiple clients can place orders without blocking each other.

#### Acceptance Criteria

1. WHEN multiple clients are selecting delivery options concurrently, THE Delivery_Selection_Interface SHALL serve each client independently without cross-contamination of data
2. WHEN multiple clients are viewing available drivers for Express_Delivery, THE Driver_Availability_Service SHALL provide independent driver lists based on each client's pickup location
3. WHEN a driver is assigned to one Express_Delivery request, THE Driver_Assignment_Service SHALL immediately reflect this in the available driver list for other clients
4. WHEN time slot capacity is updated, THE Time_Slot_Capacity_Service SHALL ensure atomic updates to prevent overbooking

### Requirement 12: Log Pricing and Delivery Choice Decisions

**User Story:** As an administrator, I want to audit all pricing calculations and delivery choices, so that I can verify system accuracy and troubleshoot issues.

#### Acceptance Criteria

1. WHEN a delivery pricing calculation occurs, THE Audit_Logger SHALL log:
   - Timestamp of calculation
   - Delivery option selected (Express or Scheduled)
   - Pricing model used (Distance_Based or Zone_Based)
   - Calculated price
   - Input parameters (distance or zone)
   - Result (success or error)
2. WHEN a client selects a delivery option or driver, THE Audit_Logger SHALL record:
   - Timestamp
   - Client ID
   - Selected option
   - Selected driver ID (for Express) or time slot (for Scheduled)
3. WHEN a delivery request is rejected due to pricing or validation errors, THE Audit_Logger SHALL record the rejection reason for troubleshooting

