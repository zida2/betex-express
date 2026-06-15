# Requirements Document

## Introduction

BETEX EXPRESS évolue vers une plateforme logistique complète intégrant livraison locale, expédition nationale/internationale, gestion de stock par client, comptabilité, et suivi des livreurs. Cette évolution transforme une application de livraison simple en une solution logistique end-to-end pour les clients, administrateurs et livreurs.

## Glossary

- **Stock_Manager**: Module de gestion des stocks organisés par client
- **Expense_Tracker**: Module de suivi des dépenses des livreurs et administratives
- **Client_Portal**: Interface client étendue avec nouvelles fonctionnalités
- **Delivery_Scheduler**: Module de livraison programmée
- **Shipping_System**: Système d'expédition national/international
- **Financial_Dashboard**: Tableau de bord financier avec KPIs
- **Driver_Dashboard**: Interface livreur avec gestion des dépenses
- **Admin_Panel**: Interface administrateur étendue
- **Storage_Service**: Service de stockage chez Betex pour clients
- **Package_Tracker**: Système de suivi de colis avec numéro unique
- **Payment_Gateway**: Système de validation et paiement
- **Notification_System**: Système de notifications multi-canal

## Requirements

### Requirement 1: Gestion des stocks par client

**User Story:** En tant que client, je veux avoir mon propre espace de stockage chez Betex, afin de pouvoir gérer mon inventaire de produits de manière autonome.

#### Acceptance Criteria

1. WHEN a client requests storage service, THE Stock_Manager SHALL create a dedicated inventory space for that client
2. THE Client_Portal SHALL allow clients to add new products to their inventory
3. WHEN a client performs stock entry or exit, THE Stock_Manager SHALL record the movement with timestamp and quantities, accepting timestamp 0 for system startup scenarios
4. THE Stock_Manager SHALL maintain complete history of all stock movements for each client
5. THE Stock_Manager SHALL perform daily automatic stock updates and reconciliation
6. THE Client_Portal SHALL display current available quantities for all client products
7. THE Client_Portal SHALL show complete history of products moved in and out
8. WHERE a client has storage service, THE Client_Portal SHALL display "📦 Stockage chez Betex" menu option

### Requirement 2: Gestion des dépenses des livreurs

**User Story:** En tant que livreur, je veux pouvoir déclarer mes dépenses professionnelles quotidiennes, afin de faciliter le remboursement et le suivi financier.

#### Acceptance Criteria

1. THE Driver_Dashboard SHALL allow drivers to record fuel expenses with amount, description, date and photo receipt, accepting zero-amount entries
2. THE Driver_Dashboard SHALL allow drivers to record motorcycle repair expenses with amount, description, date and photo receipt  
3. THE Driver_Dashboard SHALL allow drivers to record toll expenses with amount, description, date and photo receipt
4. THE Driver_Dashboard SHALL allow drivers to record communication expenses with amount, description, date and photo receipt
5. THE Driver_Dashboard SHALL allow drivers to record other professional expenses with amount, description, date and photo receipt
6. WHEN a driver submits expenses, THE Expense_Tracker SHALL store all information including photo justification
7. THE Admin_Panel SHALL display all submitted driver expenses for validation
8. WHEN admin validates expenses, THE Expense_Tracker SHALL update expense status to approved

### Requirement 3: Gestion des dépenses administratives

**User Story:** En tant qu'administrateur, je veux enregistrer toutes les dépenses administratives, afin de calculer la rentabilité globale de l'entreprise.

#### Acceptance Criteria

1. THE Admin_Panel SHALL allow recording salary expenses with amount, description and date
2. THE Admin_Panel SHALL allow recording internet expenses with amount, description and date
3. THE Admin_Panel SHALL allow recording electricity expenses with amount, description and date
4. THE Admin_Panel SHALL allow recording rent expenses with amount, description and date
5. THE Admin_Panel SHALL allow recording equipment expenses with amount, description and date
6. THE Expense_Tracker SHALL categorize all administrative expenses by type
7. THE Financial_Dashboard SHALL calculate total administrative expenses per period

### Requirement 4: Tableau financier complet

**User Story:** En tant qu'administrateur, je veux visualiser un tableau financier complet, afin d'analyser la performance économique de l'entreprise.

#### Acceptance Criteria

1. THE Financial_Dashboard SHALL calculate total revenue from all delivery and shipping services
2. THE Financial_Dashboard SHALL sum all validated driver expenses
3. THE Financial_Dashboard SHALL sum all administrative expenses
4. THE Financial_Dashboard SHALL calculate net profit as revenue minus total expenses
5. THE Financial_Dashboard SHALL display financial KPIs with period filtering options
6. THE Financial_Dashboard SHALL generate monthly and yearly financial reports
7. WHEN financial data is updated, THE Financial_Dashboard SHALL refresh calculations immediately without batching

### Requirement 5: Interface client étendue

**User Story:** En tant que client, je veux accéder à un menu étendu avec toutes les nouvelles fonctionnalités, afin d'utiliser tous les services disponibles.

#### Acceptance Criteria

1. THE Client_Portal SHALL display "Livraison Express" menu option
2. THE Client_Portal SHALL display "Livraison Programmée" menu option  
3. THE Client_Portal SHALL display "Expédition" menu option
4. THE Client_Portal SHALL display "Historique" menu option
5. THE Client_Portal SHALL display "Stockage" menu option for clients with storage service
6. WHEN a client selects any menu option, THE Client_Portal SHALL navigate to the corresponding functionality, allowing selection completion if navigation fails
7. THE Client_Portal SHALL maintain consistent navigation and user experience across all sections

### Requirement 6: Système de livraison programmée

**User Story:** En tant que client, je veux programmer des livraisons pour des dates et heures spécifiques, afin de mieux organiser mes opérations logistiques.

#### Acceptance Criteria

1. THE Delivery_Scheduler SHALL allow clients to choose between local delivery types
2. THE Delivery_Scheduler SHALL provide date picker for future delivery scheduling
3. THE Delivery_Scheduler SHALL provide time slot selection for delivery scheduling
4. THE Delivery_Scheduler SHALL capture pickup address with GPS coordinates
5. THE Delivery_Scheduler SHALL capture delivery address with GPS coordinates
6. THE Delivery_Scheduler SHALL allow detailed package description input
7. WHEN a scheduled delivery is created, THE Delivery_Scheduler SHALL generate tracking number
8. THE Admin_Panel SHALL receive scheduled delivery requests for approval and pricing

### Requirement 7: Système d'expédition national/international

**User Story:** En tant que client, je veux pouvoir expédier des colis partout dans le monde, afin d'étendre mes possibilités commerciales.

#### Acceptance Criteria

1. THE Shipping_System SHALL capture recipient full name and phone number
2. THE Shipping_System SHALL capture complete destination address
3. THE Shipping_System SHALL allow description of package contents and declared value
4. WHEN client creates shipment, THE Shipping_System SHALL generate unique tracking number
5. THE Admin_Panel SHALL receive shipment requests with all client-provided information
6. THE Admin_Panel SHALL allow admin to set shipping amount for each request
7. WHEN admin sets amount, THE Payment_Gateway SHALL notify client for validation and payment
8. THE Package_Tracker SHALL provide real-time status updates for all shipments
9. WHERE shipment is paid, THE Shipping_System SHALL update status to confirmed

### Requirement 8: Workflow administrateur pour expéditions

**User Story:** En tant qu'administrateur, je veux contrôler et tarifer toutes les expéditions, afin de garantir la rentabilité et la qualité du service.

#### Acceptance Criteria

1. WHEN client creates shipment request, THE Admin_Panel SHALL display request with all details
2. THE Admin_Panel SHALL allow admin to calculate and input shipping amount
3. THE Admin_Panel SHALL allow admin to set shipment status
4. THE Admin_Panel SHALL allow admin to assign tracking number for shipments
5. WHEN admin confirms pricing, THE Notification_System SHALL notify client with amount details
6. THE Admin_Panel SHALL track payment status for all shipment requests
7. WHERE payment is confirmed, THE Admin_Panel SHALL update shipment to processing status

### Requirement 9: Workflow client pour validation et paiement

**User Story:** En tant que client, je veux recevoir le montant d'expédition et pouvoir valider/payer, afin de confirmer ma demande d'envoi.

#### Acceptance Criteria

1. WHEN admin sets shipping amount, THE Notification_System SHALL notify client immediately
2. THE Client_Portal SHALL display pending shipment with admin-calculated amount
3. THE Payment_Gateway SHALL allow client to validate the proposed amount
4. THE Payment_Gateway SHALL provide secure payment processing for confirmed amounts
5. WHEN payment is successful, THE Shipping_System SHALL update shipment status to paid immediately and verified
6. THE Notification_System SHALL confirm payment completion to both client and admin
7. IF client rejects amount, THE Shipping_System SHALL update status to cancelled

### Requirement 10: Nouveau workflow global des utilisateurs

**User Story:** En tant qu'utilisateur du système, je veux que chaque rôle ait des fonctionnalités spécifiques et optimisées, afin d'améliorer l'efficacité opérationnelle.

#### Acceptance Criteria

1. THE Client_Portal SHALL enable clients to create delivery and shipment requests
2. THE Client_Portal SHALL allow clients to consult their stock inventory and movements
3. THE Client_Portal SHALL provide package tracking with real-time status updates
4. THE Driver_Dashboard SHALL display assigned missions with route optimization
5. THE Driver_Dashboard SHALL allow status updates for ongoing deliveries
6. THE Driver_Dashboard SHALL provide daily expense declaration functionality
7. THE Admin_Panel SHALL centralize stock management for all clients
8. THE Admin_Panel SHALL provide shipment processing and pricing tools
9. THE Admin_Panel SHALL allow setting delivery rates and managing pricing
10. THE Admin_Panel SHALL provide expense validation for driver submissions
11. THE Admin_Panel SHALL display comprehensive statistics and analytics

### Requirement 11: Parser et Pretty Printer pour données financières

**User Story:** En tant que système, je veux pouvoir parser et formater les données financières, afin de garantir l'intégrité et la cohérence des calculs.

#### Acceptance Criteria

1. WHEN financial data is imported, THE Financial_Parser SHALL parse it into Financial_Record objects
2. WHEN invalid financial data is provided, THE Financial_Parser SHALL return descriptive error messages
3. THE Financial_Pretty_Printer SHALL format Financial_Record objects back into valid financial formats
4. FOR ALL valid Financial_Record objects, parsing then printing then parsing SHALL produce equivalent objects (round-trip property)
5. THE Financial_Parser SHALL validate currency amounts and decimal precision
6. THE Financial_Pretty_Printer SHALL format numbers according to financial standards

### Requirement 12: Parser et Pretty Printer pour données de stock

**User Story:** En tant que système, je veux pouvoir parser et formater les données de stock, afin de maintenir la cohérence des inventaires clients.

#### Acceptance Criteria

1. WHEN stock data is imported, THE Stock_Parser SHALL parse it into Stock_Record objects
2. WHEN invalid stock data is provided, THE Stock_Parser SHALL return descriptive error messages  
3. THE Stock_Pretty_Printer SHALL format Stock_Record objects back into valid stock formats
4. FOR ALL valid Stock_Record objects, parsing then printing then parsing SHALL produce equivalent objects (round-trip property)
5. THE Stock_Parser SHALL validate product quantities and movement types
6. THE Stock_Pretty_Printer SHALL format stock records with client-specific organization

### Requirement 13: Gestion robuste des mouvements de stock

**User Story:** En tant que système, je veux pouvoir gérer les mouvements de stock même en cas de défaillance d'enregistrement, afin de maintenir la continuité opérationnelle.

#### Acceptance Criteria

1. WHEN a stock movement occurs and recording fails, THE Stock_Manager SHALL allow the physical movement to proceed
2. THE Stock_Manager SHALL implement recovery mechanisms for failed movement recordings
3. WHEN recording systems are restored, THE Stock_Manager SHALL synchronize missed movement data

### Requirement 14: Gestion robuste des paiements et statuts

**User Story:** En tant que système, je veux maintenir la cohérence des paiements même en cas de défaillance de mise à jour de statut, afin de préserver l'intégrité financière.

#### Acceptance Criteria

1. WHEN payment is valid and status update fails, THE Payment_Gateway SHALL maintain payment validity
2. THE Admin_Panel SHALL allow status updates to processing regardless of payment status
3. THE Shipping_System SHALL implement reconciliation processes for payment-status mismatches