/**
 * Seed script for Delivery Requests test data
 * Creates sample delivery requests for testing the admin panel
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const testDeliveryRequests = [
  {
    senderName: 'Ahmed Diallo',
    senderPhone: '+226 70 50 50 50',
    senderAddress: 'Quartier 1, Ouagadougou',
    senderLatitude: 12.3656,
    senderLongitude: -1.5197,
    
    receiverName: 'Fatou Coulibaly',
    receiverPhone: '+226 70 60 60 60',
    receiverAddress: 'Secteur 4, Ouagadougou',
    receiverLatitude: 12.3700,
    receiverLongitude: -1.5250,
    
    packageType: 'colis',
    packagePrice: 50000,
    weight: 2.5,
    notes: 'Colis fragile - à manipuler avec soin',
    deliveryOption: 'express'
  },
  {
    senderName: 'Amadou Traore',
    senderPhone: '+226 70 70 70 70',
    senderAddress: 'Centre-ville, Ouagadougou',
    senderLatitude: 12.3656,
    senderLongitude: -1.5197,
    
    receiverName: 'Mariam Ndiaye',
    receiverPhone: '+226 70 80 80 80',
    receiverAddress: 'Zone Nord, Ouagadougou',
    receiverLatitude: 12.4100,
    receiverLongitude: -1.5300,
    
    packageType: 'nourriture',
    packagePrice: 0,
    weight: 1.0,
    notes: 'Livraison de repas - prioritaire',
    deliveryOption: 'express'
  },
  {
    senderName: 'Ibrahim Sow',
    senderPhone: '+226 70 90 90 90',
    senderAddress: 'Quartier 2, Ouagadougou',
    senderLatitude: 12.3550,
    senderLongitude: -1.5150,
    
    receiverName: 'Sophie Kabore',
    receiverPhone: '+226 70 15 15 15',
    receiverAddress: 'Secteur 5, Ouagadougou',
    receiverLatitude: 12.3200,
    receiverLongitude: -1.5000,
    
    packageType: 'document',
    packagePrice: 0,
    weight: 0.2,
    notes: 'Documents administratifs importants',
    deliveryOption: 'express'
  },
  {
    senderName: 'Alassane Samba',
    senderPhone: '+226 70 25 25 25',
    senderAddress: 'Centre Commercial, Ouagadougou',
    senderLatitude: 12.3656,
    senderLongitude: -1.5197,
    
    receiverName: 'Ismail Jallo',
    receiverPhone: '+226 70 35 35 35',
    receiverAddress: 'Secteur 6, Ouagadougou',
    receiverLatitude: 12.3100,
    receiverLongitude: -1.5050,
    
    packageType: 'colis',
    packagePrice: 75000,
    weight: 3.0,
    notes: 'Équipement électronique - emballage sécurisé demandé',
    deliveryOption: 'scheduled'
  },
  {
    senderName: 'Fanta Diallo',
    senderPhone: '+226 70 45 45 45',
    senderAddress: 'Quartier Résidentiel, Ouagadougou',
    senderLatitude: 12.3750,
    senderLongitude: -1.5300,
    
    receiverName: 'Moussa Ouedraogo',
    receiverPhone: '+226 70 55 55 55',
    receiverAddress: 'Zone Centre-Ville, Ouagadougou',
    receiverLatitude: 12.3656,
    receiverLongitude: -1.5197,
    
    packageType: 'other',
    packagePrice: 25000,
    weight: 1.5,
    notes: 'Colis standard - livraison flexible',
    deliveryOption: 'scheduled'
  },
  {
    senderName: 'Hassane Diop',
    senderPhone: '+226 70 65 65 65',
    senderAddress: 'Marché Central, Ouagadougou',
    senderLatitude: 12.3600,
    senderLongitude: -1.5200,
    
    receiverName: 'Aïssatou Bah',
    receiverPhone: '+226 70 75 75 75',
    receiverAddress: 'Kyassa, Ouagadougou',
    receiverLatitude: 12.4200,
    receiverLongitude: -1.5250,
    
    packageType: 'nourriture',
    packagePrice: 0,
    weight: 2.0,
    notes: 'Denrées alimentaires fraiches - livraison rapide',
    deliveryOption: 'express'
  },
  {
    senderName: 'Yacouba Traore',
    senderPhone: '+226 70 85 85 85',
    senderAddress: 'Zone Industrielle, Ouagadougou',
    senderLatitude: 12.3500,
    senderLongitude: -1.5400,
    
    receiverName: 'Oumou Cisse',
    receiverPhone: '+226 70 95 95 95',
    receiverAddress: 'Quartier Administratif, Ouagadougou',
    receiverLatitude: 12.3750,
    receiverLongitude: -1.5150,
    
    packageType: 'document',
    packagePrice: 0,
    weight: 0.5,
    notes: 'Dossier pour signature officielle',
    deliveryOption: 'express'
  },
  {
    senderName: 'Mariama Kone',
    senderPhone: '+226 70 11 11 11',
    senderAddress: 'Secteur 1, Ouagadougou',
    senderLatitude: 12.3550,
    senderLongitude: -1.5250,
    
    receiverName: 'Adama Sow',
    receiverPhone: '+226 70 22 22 22',
    receiverAddress: 'Secteur 3, Ouagadougou',
    receiverLatitude: 12.3400,
    receiverLongitude: -1.5300,
    
    packageType: 'fragile',
    packagePrice: 120000,
    weight: 5.0,
    notes: 'Équipement fragile - manipulation délicate requise',
    deliveryOption: 'scheduled'
  }
];

async function seedDeliveryRequests() {
  try {
    console.log('🌱 Amorçage des demandes de livraison...\n');

    for (const request of testDeliveryRequests) {
      try {
        // POST to create delivery request
        const response = await axios.post(`${API_URL}/delivery-requests`, request, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log(`✅ Demande créée: ${request.senderName} → ${request.receiverName}`);
        console.log(`   Type: ${request.deliveryOption === 'express' ? '🚀 Express' : '📅 Programmée'}`);
      } catch (error) {
        // If endpoint doesn't exist, try alternative
        console.warn(`⚠️ Impossible de créer via API: ${error.message}`);
      }
    }

    console.log('\n✅ Amorçage complété!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'amorçage:', error.message);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedDeliveryRequests();
}

module.exports = { seedDeliveryRequests, testDeliveryRequests };
