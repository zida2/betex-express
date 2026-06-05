# 🚀 Fonctionnalité Livraison Express & Programmée

## Vue d'ensemble

Cette nouvelle fonctionnalité permet aux clients de choisir entre deux modes de livraison :

### 1. **Livraison Express** 🚀
- Livraison immédiate le jour même
- Client choisit son livreur parmi les disponibles en temps réel
- **Tarification :** Basée sur la distance
  - **Formule :** 500 FCFA (base) + (distance en km × 250 FCFA/km)
  - Exemple : Pour 2 km = 500 + (2 × 250) = 1000 FCFA

### 2. **Livraison Programmée** 📅
- Deux créneaux horaires disponibles par jour
- Client choisit le créneau qui lui convient
- **Créneaux disponibles :**
  - Matin : 09h00 - 12h00
  - Après-midi : 14h00 - 17h00
- **Tarification :** Basée sur la zone de livraison
  - Zone Plateau : 1500 FCFA
  - Zone Treichville : 1200 FCFA
  - Zone Yopougon : 1000 FCFA
  - Zone Cocody : 2000 FCFA

## Composants Frontend

### 1. **DeliveryOptions.js**
Composant de sélection entre Express et Programmée
- Affiche deux cartes avec les caractéristiques de chaque option
- Visuel distinct pour chaque type de livraison
- Feedback visuel de la sélection

### 2. **ExpressDeliveryFlow.js**
Interface complète pour la livraison Express
- Liste des livreurs disponibles en temps réel
- Affichage de la distance et du tarif pour chaque livreur
- Tri par distance (le plus proche en premier)
- Notation des livreurs (⭐ 0-5)
- Calcul automatique du prix selon la distance

### 3. **ScheduledDeliveryFlow.js**
Interface complète pour la livraison Programmée
- Affichage de la zone de livraison détectée
- Liste des zones disponibles (si besoin de changer)
- Sélection du créneau horaire
- Barre de capacité pour montrer la saturation des créneaux
- Tarif fixe selon la zone (ne change pas)

## Flux utilisateur complet

```
1. Remplir informations expéditeur
   ↓
2. Remplir informations destinataire
   ↓
3. Remplir informations colis
   ↓
4. CHOIX DU TYPE DE LIVRAISON
   ├─ Express 🚀
   │  └─ Sélectionner un livreur
   │     └─ Prix calculé automatiquement
   │
   └─ Programmée 📅
      └─ Zone détectée/Sélectionner zone
         └─ Sélectionner créneau
            └─ Prix fixe selon zone
   ↓
5. Révision du tarif
   ├─ Type de livraison
   ├─ Détails du livreur OU créneau/zone
   └─ Prix FINAL
   ↓
6. Confirmation de la livraison
```

## État du formulaire

```javascript
const [deliveryOption, setDeliveryOption] = useState(null); // 'express' ou 'scheduled'
const [selectedDriver, setSelectedDriver] = useState(null); // Pour Express
const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // Pour Programmée
const [pricingInfo, setPricingInfo] = useState(null); // Infos de tarification
```

## Données de démo

Toutes les données de démo sont stockées dans `src/utils/demoData.js` :
- **DEMO_EXPRESS_DRIVERS** : 4 livreurs avec distances et infos
- **DEMO_ZONES** : 4 zones géographiques avec tarifs
- **DEMO_TIME_SLOTS** : 2 créneaux horaires par jour
- **PRICING_CONFIG** : Configuration des tarifs

## Validation

Le formulaire nécessite :
1. ✅ Type de livraison sélectionné
2. ✅ Pour Express : Livreur sélectionné
3. ✅ Pour Programmée : Créneau sélectionné
4. ✅ Tous les champs obligatoires remplis

## Payload d'envoi au backend

### Express Delivery
```javascript
{
  ...commonFields,
  deliveryOption: 'express',
  pricingModel: 'distance_based',
  deliveryPrice: 1000,
  driverId: 'driver-1',
  distance: 2.5
}
```

### Scheduled Delivery
```javascript
{
  ...commonFields,
  deliveryOption: 'scheduled',
  pricingModel: 'zone_based',
  deliveryPrice: 1500,
  timeSlotId: 'slot-1',
  zone: 'zone-1'
}
```

## Styling

- **DeliveryOptions.css** : Styles pour la sélection des options
- **DeliveryFlow.css** : Styles pour les deux interfaces de livraison
- **PackagesPage.css** : Styles pour le formulaire et la révision du tarif

## En mode démo

La fonctionnalité est **entièrement fonctionnelle en mode démo** :
- Les livreurs, zones et créneaux sont des données mockées
- Les tarifs sont calculés en temps réel
- L'interface est entièrement interactive
- Le formulaire peut être soumis avec les données de démo

## Prochaines étapes (Backend)

Le backend doit :
1. ✅ Accepter le champ `deliveryOption` dans le payload
2. ✅ Accepter les champs `pricingModel`, `deliveryPrice`, `distance` ou `zone`
3. ✅ Stocker ces informations en base de données
4. ✅ Implémenter les endpoints pour récupérer les livreurs et zones en temps réel
5. ✅ Implémenter les Web Sockets pour les mises à jour en temps réel des livreurs
6. ✅ Implémenter la gestion des créneaux horaires et de la capacité

## Notes d'implémentation

- Les données de démo sont stockées côté frontend pour minimiser les appels API
- En production, remplacer les données mockées par des appels API réels
- Les Web Sockets pour les mises à jour en temps réel sont prêts à être implémentés
- Le calcul du prix est entièrement côté frontend pour la démo, peut être déplacé au backend si nécessaire
