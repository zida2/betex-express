# 🎯 Guide d'Utilisation - Mode Démo Livraison Express & Programmée

## ✅ Compilation Réussie !

La nouvelle fonctionnalité a été compilée avec succès et est prête à être testée.

## 🚀 Démarrer l'Application

### 1. Frontend
```bash
cd frontend
npm start
```
L'application démarre sur `http://localhost:3000`

### 2. Backend (si nécessaire)
```bash
cd backend
npm start
```

## 📝 Guide de Test Complet

### Étape 1 : Accéder à la Page de Gestion des Colis
1. Cliquez sur **"+ Nouvelle livraison"** dans le header

### Étape 2 : Remplir les Informations de l'Expéditeur
- **Nom** : Jean Dupont
- **Téléphone** : +225 07 12 34 56 78
- **Localisation** : Utilisez le bouton 📍 ou entrez les coordonnées :
  - Latitude : 6.8276
  - Longitude : -5.2893

### Étape 3 : Remplir les Informations du Destinataire
- **Nom** : Marie Martin
- **Téléphone** : +225 01 98 76 54 32
- **Localisation** : Utilisez le bouton 📍 ou entrez les coordonnées :
  - Latitude : 6.8300
  - Longitude : -5.2850

### Étape 4 : Remplir les Informations du Colis
- **Type de colis** : Sélectionnez "Colis" ou "Document"
- **Prix du colis** : 5000 (optionnel)
- **Poids** : 1.5 kg (optionnel)
- **Notes** : "Fragile - Manipuler avec soin"

### Étape 5 : CHOIX CLÉS - Type de Livraison

#### 🚀 Option 1 : LIVRAISON EXPRESS

**Caractéristiques :**
- Livraison aujourd'hui
- Choisissez votre livreur
- Tarif selon distance

**Fonctionnement :**
1. Cliquez sur la carte **"Livraison Express"** (🚀)
2. Vous verrez une liste de **4 livreurs disponibles** triés par distance
3. Pour chaque livreur :
   - Nom et prénom
   - Rating (⭐ notation)
   - Distance
   - **Prix calculé automatiquement** : 500 + (distance × 250) FCFA
   - Véhicule et plaque
   - Infos de charge

**Livreurs de Démo :**
| Livreur | Distance | Véhicule | Prix Calculé |
|---------|----------|----------|--------------|
| Ahmed Ibrahim | 1.8 km | Moto | 500 + (1.8 × 250) = **950 FCFA** |
| Jean Kouame | 2.5 km | Moto | 500 + (2.5 × 250) = **1125 FCFA** |
| Marie Diallo | 3.1 km | Voiture | 500 + (3.1 × 250) = **1275 FCFA** |
| Sophie Blanc | 4.2 km | Voiture | 500 + (4.2 × 250) = **1550 FCFA** |

3. **Sélectionnez un livreur** en cliquant sur sa carte
4. Le prix s'affiche immédiatement dans la **"Résumé du Tarif"**

---

#### 📅 Option 2 : LIVRAISON PROGRAMMÉE

**Caractéristiques :**
- Deux créneaux par jour
- Tarif selon zone (1000-2000 FCFA)
- Tarif fixe et immuable

**Fonctionnement :**
1. Cliquez sur la carte **"Livraison Programmée"** (📅)
2. La **zone est automatiquement détectée** selon la localisation du destinataire
3. Vous verrez **2 créneaux horaires** :

| Créneau | Horaire | Capacité |
|---------|---------|----------|
| Matin | 09:00 - 12:00 | 50 places (42 réservées) |
| Après-midi | 14:00 - 17:00 | 50 places (38 réservées) |

4. **Zones disponibles** (tarif fixe) :
   - Zone Plateau : 1500 FCFA
   - Zone Treichville : 1200 FCFA
   - Zone Yopougon : 1000 FCFA
   - Zone Cocody : 2000 FCFA

5. **Sélectionnez un créneau** en cliquant sur la carte
6. Le prix s'affiche immédiatement (selon la zone détectée)

---

### Étape 6 : Révision du Tarif

Une fois le livreur (Express) ou le créneau (Programmée) sélectionné, vous verrez :

**Section "💰 Résumé du Tarif"** affichant :

#### Pour Express :
```
Type de livraison: 🚀 Express
Distance: 1.8 km
Prix base: 500 FCFA
Prix distance: 450 FCFA (1.8 × 250)
💰 Total: 950 FCFA
```

#### Pour Programmée :
```
Type de livraison: 📅 Programmée
Zone: Zone Plateau
Créneau: Créneau du matin (09:00 - 12:00)
💰 Total: 1500 FCFA
```

### Étape 7 : Confirmer la Livraison

1. Vérifiez tous les détails
2. Cliquez sur **"✅ Confirmer la Livraison"**
3. Vous recevrez un message de confirmation
4. La livraison apparaît dans la liste ci-dessous

## 🎮 Fonctionnalités Interactives

### Express Delivery
- ✅ Affichage en temps réel des livreurs
- ✅ Tri automatique par distance
- ✅ Calcul dynamique du prix selon distance
- ✅ Affichage du rating du livreur
- ✅ Feedback visuel de sélection

### Scheduled Delivery
- ✅ Détection automatique de zone
- ✅ Affichage de la capacité des créneaux
- ✅ Barre de progression de saturation
- ✅ Tarif fixe et transparent
- ✅ Affichage des zones alternatives

## 📊 Données de Démo

Toutes les données sont **100% mockées** et stockées localement :

```javascript
// Fichier : src/utils/demoData.js
- 4 livreurs Express avec distances différentes
- 4 zones géographiques avec tarifs
- 2 créneaux horaires par jour
- Configuration de tarification
```

## 🔧 Cas de Test

### Test 1 : Sélection Express
- ✅ Les 4 livreurs apparaissent
- ✅ Le prix se calcule correctement
- ✅ La sélection est visible
- ✅ Le résumé s'affiche

### Test 2 : Sélection Programmée
- ✅ La zone est détectée
- ✅ Les 2 créneaux apparaissent
- ✅ La barre de capacité s'affiche
- ✅ Le prix fixe s'affiche

### Test 3 : Validation du Formulaire
- ✅ Ne peut pas soumettre sans type de livraison
- ✅ Ne peut pas soumettre sans sélection de livreur/créneau
- ✅ Le bouton de soumission se désactive correctement

### Test 4 : Révision du Tarif
- ✅ Le résumé de Express affiche distance + tarif
- ✅ Le résumé de Programmée affiche zone + créneau + tarif
- ✅ Le tarif total est correct

## 💡 Points Importants

1. **Aucun appel API réel** - tout fonctionne en mode démo
2. **Données entièrement configurables** - modifier `demoData.js`
3. **Tarification transparente** - formules claires
4. **UX intuitive** - cartes cliquables et visuels distincts
5. **Responsive** - fonctionne sur mobile

## 📱 Responsive Design

- ✅ Desktop (>768px) : Grilles de 2 colonnes
- ✅ Tablette (480-768px) : Grilles adaptées
- ✅ Mobile (<480px) : Affichage en colonne unique

## 🐛 Dépannage

### Le formulaire ne se soumet pas ?
- Vérifiez que type de livraison est sélectionné
- Vérifiez que livreur/créneau est sélectionné
- Vérifiez que tous les champs obligatoires sont remplis

### Les prix ne s'affichent pas ?
- Vérifiez la console (F12) pour erreurs
- Assurez-vous que la sélection est bien faite
- Rechargez la page

### Les livreurs n'apparaissent pas ?
- Assurez-vous que Express est bien sélectionné
- Cliquez sur le bouton "Afficher" si caché
- Vérifiez que `ExpressDeliveryFlow` est importé

## 📞 Support

Pour questions ou améliorations, vérifiez :
1. `DELIVERY_FEATURE_README.md` - Documentation technique
2. `src/components/DeliveryOptions.js` - Composant sélection
3. `src/components/ExpressDeliveryFlow.js` - Livreurs
4. `src/components/ScheduledDeliveryFlow.js` - Créneaux
5. `src/utils/demoData.js` - Données mockées

---

**✅ Prêt à tester ! Bon test de la fonctionnalité !** 🚀
