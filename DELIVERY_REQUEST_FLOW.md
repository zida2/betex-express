# Flux de Gestion des Demandes de Livraison

## 📋 Vue d'ensemble

Le système permet aux **clients** de soumettre des demandes de livraison via le **portail client**, que l'**administrateur** approuve, complète et assigne à un **livreur disponible**.

---

## 🔄 Flux Complet

### 1️⃣ **Client Soumet une Demande** 
**Lieu:** Portail Client (`ClientPortal.js`)

**Étapes:**
- Client remplit le formulaire avec:
  - ✅ Infos expéditeur (nom, téléphone, adresse)
  - ✅ Infos destinataire (nom, téléphone, adresse)
  - ✅ Description du colis (optionnel)
  - ✅ Poids du colis (optionnel)
  - ❌ Prix du colis (CACHÉ - masqué à la vue)

- Clique sur **"📤 Envoyer la demande"**

**Requête API:**
```
POST /api/v1/delivery-requests
Content-Type: application/json

{
  "senderName": "Jean Kouassi",
  "senderPhone": "+226 70 00 00 01",
  "senderAddress": "Ouagadougou",
  "senderLat": 12.3714,
  "senderLng": -1.5197,
  "receiverName": "Marie Dupont",
  "receiverPhone": "+226 70 00 00 02",
  "receiverAddress": "Bobo Dioulasso",
  "receiverLat": 12.1875,
  "receiverLng": -4.2899,
  "description": "Livre de Littérature",
  "weight": 0.5,
  "packagePrice": 0
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Demande envoyée à l'admin pour approbation",
  "data": {
    "id": "uuid-123456",
    "status": "pending_approval",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**État:** `pending_approval` ⏳

---

### 2️⃣ **Admin Reçoit la Demande**
**Lieu:** Dashboard Admin → Onglet "📋 Demandes"

**Admin voit:**
- Liste des demandes en attente (`pending_approval`)
- Filtre par statut (En attente, Approuvées, Rejetées, Toutes)

---

### 3️⃣ **Admin Examine et Complète la Demande**

**Admin peut voir dans le panneau latéral:**

#### 📤 Section Expéditeur
- Nom, téléphone, adresse
- Coordonnées GPS (si fournies par le client)

#### 📥 Section Destinataire  
- Nom, téléphone, adresse
- Coordonnées GPS (si fournies par le client)

#### 📦 Section Colis
- Description
- Poids
- Prix du colis (s'il l'a fourni)

#### ✏️ À Compléter par l'Admin

**L'admin doit ajouter:**

1. **💰 Prix de la Livraison** (obligatoire)
   - Montant en FCFA
   - Exemple: 5000 FCFA

2. **👨‍🚚 Sélectionner un Livreur** (obligatoire)
   - Dropdown avec liste des livreurs disponibles
   - Affiche: nom, téléphone, véhicule, statut, note

3. **📝 Notes pour le Livreur** (optionnel)
   - Ex: "Livraison fragile", "À faire avant 14h"

**Interface Admin:**
```
[Demande #uuid-123456]

Expéditeur:
  Nom: Jean Kouassi
  Tél: +226 70 00 00 01
  Adresse: Ouagadougou

Destinataire:
  Nom: Marie Dupont
  Tél: +226 70 00 00 02
  Adresse: Bobo Dioulasso

Colis:
  Description: Livre de Littérature
  Poids: 0.5 kg

À Compléter:
  [💰 Prix livraison: ___5000___ FCFA]
  [👨‍🚚 Livreur: [Dropdown - Sélectionner]]
  [📝 Notes: _______________]

[✅ Approuver et Envoyer]  [❌ Rejeter]
```

---

### 4️⃣ **Admin Approuve et Assigne**

**Requête API:**
```
POST /api/v1/delivery-requests/uuid-123456/approve
Content-Type: application/json

{
  "deliveryPrice": 5000,
  "driverId": "driver-uuid-789",
  "adminNotes": "Livraison fragile"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Demande approuvée et assignée au livreur",
  "data": {
    "id": "uuid-123456",
    "status": "approved",
    "deliveryPrice": 5000,
    "driverId": "driver-uuid-789",
    "driverName": "Ahmed Diallo",
    "driverPhone": "+226 70 11 11 11",
    "approvedAt": "2024-01-15T10:35:00Z"
  }
}
```

**État:** `approved` ✅

---

### 5️⃣ **Admin Peut Communiquer avec le Client**

**Après approbation, l'admin peut:**

#### Option A: Envoyer un Message WhatsApp
```
POST /api/v1/delivery-requests/uuid-123456/send-message
Content-Type: application/json

{
  "clientMessage": "Bonjour Marie, votre livraison a été approuvée! Le livreur Ahmed Diallo vous contactera bientôt. Merci pour votre confiance! 🚚",
  "messageType": "whatsapp"
}
```

**La réponse inclut:**
```json
{
  "success": true,
  "data": {
    "request": { ...request data },
    "whatsappLink": "https://wa.me/22670000002?text=Bonjour%20Marie..."
  }
}
```

**Admin peut:**
1. Cliquer sur le lien WhatsApp généré
2. Le message s'ouvre dans WhatsApp Web/App
3. Admin envoie le message au client

#### Option B: Rejeter la Demande (au lieu d'approuver)
```
POST /api/v1/delivery-requests/uuid-123456/reject
Content-Type: application/json

{
  "rejectionReason": "Adresse de livraison inaccessible"
}
```

**État:** `rejected` ❌

---

### 6️⃣ **Livreur Reçoit l'Assigationn**

Une fois approuvée, le livreur peut voir:
- ✅ Nouvelle demande assignée
- 📦 Détails de la livraison
- 📍 Adresse de collecte et de destination
- 💰 Prix de la livraison (visible au livreur)
- 📝 Notes de l'admin

---

### 7️⃣ **Cycle de Vie Complet**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT SOUMET                                            │
│    Status: pending_approval                                 │
│    Informations: Expéditeur + Destinataire + Colis          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ADMIN EXAMINE                                            │
│    Peut voir tous les détails du client                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    ✅ APPROUVER              ❌ REJETER
    │                         │
    ▼                         ▼
┌──────────────────────┐  ┌──────────────┐
│ 3. ADMIN COMPLÈTE    │  │ Status:      │
│ - Prix livraison     │  │ rejected     │
│ - Sélectionne livreur│  └──────────────┘
│ - Ajoute notes       │
└────────────┬─────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 4. ADMIN APPROUVE ET ASSIGNE                               │
│    Status: approved                                         │
│    Livreur assigné + Details complets                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 5. ADMIN COMMUNIQUE AVEC CLIENT (optionnel)                │
│    - Envoie message WhatsApp                               │
│    - Informe du livreur et de l'heure approximative        │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 6. LIVREUR COLLECT ET LIVRE                                │
│    Status: in_transit → completed                          │
│    Client reçoit le colis ✓                                │
└────────────────────────────────────────────────────────────┘
```

---

## 📊 Modèle de Données - DeliveryRequest

```javascript
{
  // Identifiants
  id: UUID,
  
  // Informations Expéditeur
  senderName: String,
  senderPhone: String,
  senderAddress: String,
  senderLat: Float,
  senderLng: Float,
  
  // Informations Destinataire
  receiverName: String,
  receiverPhone: String,
  receiverAddress: String,
  receiverLat: Float,
  receiverLng: Float,
  
  // Information Colis
  description: String,
  weight: Float,
  packagePrice: Decimal,
  
  // Informations Admin
  deliveryPrice: Decimal,      // Rempli par admin
  adminNotes: String,          // Notes du livreur
  
  // Assignation
  status: Enum[
    'pending_approval',  // En attente d'approbation
    'approved',          // Approuvée et assignée
    'rejected',          // Rejetée
    'in_transit',        // En cours de livraison
    'completed',         // Livrée
    'cancelled'          // Annulée
  ],
  driverId: UUID,
  driverName: String,
  driverPhone: String,
  
  // Raison de Rejet
  rejectionReason: String,
  
  // Communication Client
  clientMessage: String,       // Message envoyé au client
  messageType: Enum['whatsapp', 'sms', 'email', 'none'],
  messageSentAt: Date,
  
  // Dates
  approvedAt: Date,
  rejectedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 Endpoints API

### Client
- **POST** `/api/v1/delivery-requests` - Créer une demande

### Admin
- **GET** `/api/v1/delivery-requests` - Lister toutes les demandes (avec filtres)
- **GET** `/api/v1/delivery-requests/:id` - Voir une demande
- **POST** `/api/v1/delivery-requests/:id/approve` - Approuver et assigner
- **POST** `/api/v1/delivery-requests/:id/reject` - Rejeter
- **POST** `/api/v1/delivery-requests/:id/send-message` - Envoyer un message au client
- **GET** `/api/v1/delivery-requests/available/drivers` - Obtenir les livreurs disponibles

---

## 💬 Pourquoi le Client n'Envoie pas Directement au Livreur?

**Raison:** ✅ **Contrôle de Qualité & Gestion Administrative**

### Bénéfices du Système d'Approbation Admin:

1. **✅ Vérification des Informations**
   - Admin vérifie que les coordonnées sont correctes
   - Peut demander des précisions au client si besoin

2. **✅ Pricing Contrôlé**
   - Admin fixe le prix de livraison (pas le client)
   - Évite les prix déraisonnables

3. **✅ Assignation Intelligente**
   - Admin assigne au livreur OPTIMAL:
     - Disponibilité
     - Zone géographique
     - Compétences spéciales
     - Charge de travail

4. **✅ Communication Structurée**
   - Admin peut ajouter des notes pour le livreur
   - Messages professionnels et cohérents

5. **✅ Audit et Compliance**
   - Toutes les demandes sont tracées
   - Admin a accès à l'historique complet
   - Facilite la facturation

6. **✅ Gestion des Exceptions**
   - Admin peut rejeter les demandes impossibles
   - Peut proposer des alternatives
   - Gère les cas spéciaux

---

## 🚀 Prochaines Étapes

1. **Notifications Livreur** - Envoyer notification au livreur quand assigné
2. **Suivi Temps Réel** - Intégrer tracking GPS pendant la livraison
3. **Feedback Client** - Permettre au client d'évaluer la livraison
4. **Automatisation** - Auto-assign basé sur la zone et disponibilité
5. **Facturatio** - Générer factures automatiquement
