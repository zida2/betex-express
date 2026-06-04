# 📱 Guide d'Utilisation - Gestion des Colis

## 🚀 Accès à l'Application

### URL: `http://localhost:3003`

### Identifiants Admin:
- **Email**: `admin@betex.com`
- **Mot de passe**: `admin123`

---

## 📦 Créer une Nouvelle Livraison

### Étape 1: Accéder à la page Colis
1. Connectez-vous avec les identifiants admin
2. Cliquez sur **"Gestion des Colis"** dans le menu
3. Cliquez sur le bouton **"+ Nouvelle livraison"**

### Étape 2: Remplir les Informations de l'Expéditeur
1. **Nom**: Entrez le nom de la personne qui envoie le colis
2. **Téléphone**: Numéro au format +225 XX XX XX XX XX
3. **Localisation**:
   - **Option A**: Cliquez sur le bouton 📍 pour utiliser votre position actuelle
   - **Option B**: Entrez manuellement:
     - Adresse dans le champ texte
     - Latitude (ex: 5.3364)
     - Longitude (ex: -4.0267)

### Étape 3: Remplir les Informations du Destinataire
1. **Nom**: Entrez le nom de la personne qui reçoit le colis
2. **Téléphone**: Numéro de contact
3. **Localisation**: Même process que pour l'expéditeur

### Étape 4: Détails du Colis
1. **Type de colis**: Sélectionnez parmi:
   - Document
   - Colis
   - Nourriture
   - Fragile
   - Autre

2. **Prix du colis** (optionnel): Valeur marchande en FCFA
3. **Prix de livraison** (requis): Coût de la livraison en FCFA
4. **Poids** (optionnel): En kilogrammes
5. **Notes** (optionnel): Instructions spéciales pour le livreur

### Étape 5: Trouver un Livreur
1. Cliquez sur **"Trouver livreur le plus proche"**
2. Le système affichera automatiquement:
   - ✅ Nom du livreur
   - ✅ Téléphone
   - ✅ Distance depuis le point de collecte
   - ✅ Taux de réussite (%)
   - ✅ Statut (online/in_delivery)
   - ✅ Nombre total de livraisons

### Étape 6: Créer la Livraison
1. Vérifiez les informations du livreur suggéré
2. Cliquez sur **"Créer la livraison"**
3. Une confirmation apparaîtra
4. La livraison sera visible dans la liste ci-dessous

---

## 📋 Consulter les Livraisons

La liste des livraisons s'affiche automatiquement en bas de la page:

### Informations Affichées:
- **Badge de statut**: Couleur selon l'état
  - 🟡 `pending`: En attente
  - 🔵 `collected`: Collecté
  - 🟣 `in_delivery`: En livraison
  - 🟢 `delivered`: Livré
  - 🔴 `delivery_failed`: Échec

- **Type de colis**: Badge à droite
- **Expéditeur**: Nom et téléphone
- **Destinataire**: Nom et téléphone
- **Prix**: Prix de livraison et prix du colis

---

## 🎯 Système de Suggestion Intelligent

### Comment ça marche?

Lorsque vous cliquez sur "Trouver livreur", le système:

1. **Récupère votre position**: GPS de l'expéditeur
2. **Analyse tous les livreurs disponibles**: Status online ou in_delivery
3. **Calcule la distance**: Distance réelle en kilomètres
4. **Évalue le taux de succès**: Historique de livraisons
5. **Attribue un score**: Formule `(1/(distance+1)) * (taux+1)`
6. **Suggère le meilleur**: Livreur avec le score le plus élevé

### Exemple Concret:

**Situation**: Vous créez une livraison à Cocody
- Livreur A: À Cocody (2 km), 90% de réussite → Score: 0.63
- Livreur B: À Yopougon (10 km), 95% de réussite → Score: 0.18
→ **Livreur A sera suggéré** (plus proche même si taux légèrement inférieur)

---

## 🔍 Conseils d'Utilisation

### Pour une Utilisation Optimale:

1. **Géolocalisation GPS**:
   - Autorisez l'accès à votre localisation dans le navigateur
   - Plus précis que la saisie manuelle
   - Cliquez simplement sur 📍

2. **Coordonnées Manuelles**:
   - Utilisez Google Maps pour obtenir lat/lng
   - Clic droit sur la carte → "What's here?"
   - Copiez les coordonnées

3. **Prix**:
   - Le prix du colis = valeur de l'objet (si payement à la livraison)
   - Le prix de livraison = coût du service de livraison
   - Laissez 0 si pas de prix colis

4. **Notes**:
   - Précisez les horaires préférés
   - Indiquez les points de repère
   - Mentionnez les consignes spéciales

---

## ⚠️ Résolution de Problèmes

### "Impossible de trouver un livreur"
**Causes possibles**:
- Aucun livreur n'est en ligne (status: online)
- Tous les livreurs sont offline ou unavailable

**Solution**:
1. Allez dans **"Gestion des Livreurs"**
2. Créez un nouveau livreur OU
3. Modifiez un livreur existant et mettez status = "online"
4. Définissez une position GPS pour le livreur
5. Retournez créer votre livraison

### "Coordonnées GPS invalides"
**Solution**:
- Vérifiez le format: Latitude entre -90 et 90
- Longitude entre -180 et 180
- Utilisez le point (.) pour les décimales, pas la virgule

### Le bouton "Créer la livraison" est désactivé
**Raison**: Vous devez d'abord trouver un livreur disponible
**Solution**: Cliquez sur "Trouver livreur le plus proche"

---

## 📊 Statuts des Livraisons

### Cycle de Vie d'une Livraison:

1. **pending** 🟡: Livraison créée, en attente que le livreur accepte
2. **collected** 🔵: Livreur a récupéré le colis chez l'expéditeur
3. **in_delivery** 🟣: Colis en cours de livraison
4. **delivered** 🟢: Colis livré avec succès
5. **delivery_failed** 🔴: Échec de la livraison

---

## 🔐 Sécurité

- ✅ Connexion sécurisée par JWT
- ✅ Données chiffrées
- ✅ Accès limité aux administrateurs
- ✅ Traçabilité complète

---

## 📞 Support

Pour toute question ou problème:
- Consultez ce guide
- Vérifiez les logs dans Docker
- Contactez l'équipe technique

---

## 🎨 Interface Mobile

L'application est optimisée pour mobile:
- Design dark mode élégant
- Navigation fluide
- Boutons tactiles larges
- Formulaires adaptatifs
- Performance optimisée

---

**Version**: 1.0
**Date**: 4 Juin 2026
**Développé avec Kiro AI**
