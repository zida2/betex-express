# 🧪 Configuration de Test - Système de Livraison

## Prérequis pour Tester la Fonctionnalité

Pour tester complètement la suggestion de livreur, vous devez avoir au moins un livreur disponible dans le système.

---

## 🚗 Créer un Livreur de Test

### Méthode 1: Via l'Interface Admin

1. **Connexion**: `http://localhost:3003`
   - Email: `admin@betex.com`
   - Password: `admin123`

2. **Navigation**: Menu → **"Gestion des Livreurs"**

3. **Créer un Livreur**:
   - Cliquez sur **"+ Nouveau livreur"**
   - Remplissez le formulaire:

   ```
   Nom: Jean Kouassi
   Email: jean.kouassi@example.com
   Téléphone: +225 07 12 34 56 78
   Statut: online
   Latitude: 5.3364
   Longitude: -4.0267
   ```

4. **Enregistrer**: Cliquez sur "Créer"

### Méthode 2: Via API (Postman/Thunder Client)

**Endpoint**: `POST http://localhost:3002/api/v1/drivers`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Body**:
```json
{
  "name": "Jean Kouassi",
  "email": "jean.kouassi@example.com",
  "password": "driver123",
  "phone": "+225 07 12 34 56 78",
  "status": "online",
  "lastLatitude": 5.3364,
  "lastLongitude": -4.0267
}
```

---

## 📍 Coordonnées GPS de Test (Côte d'Ivoire)

### Abidjan - Principales Zones:

```
Cocody:
- Latitude: 5.3599
- Longitude: -3.9847

Plateau:
- Latitude: 5.3205
- Longitude: -4.0137

Yopougon:
- Latitude: 5.3364
- Longitude: -4.0867

Marcory:
- Latitude: 5.2892
- Longitude: -3.9778

Koumassi:
- Latitude: 5.2936
- Longitude: -3.9370

Adjamé:
- Latitude: 5.3569
- Longitude: -4.0262

Abobo:
- Latitude: 5.4233
- Longitude: -4.0168
```

---

## 🧪 Scénarios de Test

### Test 1: Livreur Proche

**Configuration**:
- Créer un livreur à Cocody (5.3599, -3.9847)
- Créer une livraison depuis Cocody (même zone)

**Résultat Attendu**:
- Distance: < 2 km
- Livreur suggéré immédiatement

### Test 2: Plusieurs Livreurs

**Configuration**:
1. Livreur A: Cocody (5.3599, -3.9847), 90% réussite
2. Livreur B: Yopougon (5.3364, -4.0867), 95% réussite
3. Créer une livraison depuis Plateau (5.3205, -4.0137)

**Résultat Attendu**:
- Livreur A suggéré (plus proche même si taux inférieur)
- Distances calculées et affichées

### Test 3: Pas de Livreur Disponible

**Configuration**:
- Tous les livreurs en status "offline" ou "unavailable"
- Créer une livraison

**Résultat Attendu**:
- Message d'erreur: "No available drivers"
- Pas de suggestion

### Test 4: Livreur en Livraison

**Configuration**:
- Livreur avec status "in_delivery"
- Créer une livraison

**Résultat Attendu**:
- Livreur toujours suggéré (status accepté: online, in_delivery)

---

## 🔄 Workflow de Test Complet

### Étape 1: Préparation
```bash
# Vérifier que Docker est lancé
docker ps

# Voir les logs en direct (optionnel)
docker logs -f betex-backend
```

### Étape 2: Créer les Livreurs
Créez au moins 2 livreurs à différentes positions:
- Livreur 1: Zone Nord (Abobo)
- Livreur 2: Zone Sud (Marcory)

### Étape 3: Tester la Suggestion

**Test A: Distance Courte**
```
Expéditeur: Abobo (5.4233, -4.0168)
Destinataire: Cocody (5.3599, -3.9847)
→ Devrait suggérer Livreur 1 (Zone Nord)
```

**Test B: Distance Longue**
```
Expéditeur: Marcory (5.2892, -3.9778)
Destinataire: Plateau (5.3205, -4.0137)
→ Devrait suggérer Livreur 2 (Zone Sud)
```

### Étape 4: Vérifier les Résultats
Après création de la livraison:
1. Vérifier dans la liste des colis
2. Status doit être "pending"
3. Livreur assigné doit correspondre à la suggestion

---

## 🔍 Debug et Logs

### Voir les Logs Backend
```bash
docker logs betex-backend --tail 100
```

### Logs en Temps Réel
```bash
docker logs -f betex-backend
```

### Requêtes SQL (dans les logs)
Vous verrez les requêtes Sequelize pour:
- Récupération des livreurs disponibles
- Calcul des distances
- Création du colis

### Erreurs Courantes

**1. "Cannot read property 'latitude' of null"**
- Cause: Livreur sans position GPS
- Solution: Mettez à jour lastLatitude/lastLongitude

**2. "No available drivers"**
- Cause: Aucun livreur online/in_delivery
- Solution: Changez le status d'un livreur

**3. "Invalid coordinates"**
- Cause: Lat/Lng hors limites
- Solution: Utilisez les coordonnées suggérées ci-dessus

---

## 📊 Données de Test Recommandées

### Livreur 1 - Performance Élevée
```json
{
  "name": "Mohamed Traoré",
  "email": "mohamed.traore@betex.ci",
  "password": "driver123",
  "phone": "+225 07 11 11 11 11",
  "status": "online",
  "lastLatitude": 5.3599,
  "lastLongitude": -3.9847,
  "totalDeliveries": 100,
  "successfulDeliveries": 95
}
```

### Livreur 2 - Performance Moyenne
```json
{
  "name": "Aya Koné",
  "email": "aya.kone@betex.ci",
  "password": "driver123",
  "phone": "+225 07 22 22 22 22",
  "status": "online",
  "lastLatitude": 5.2892,
  "lastLongitude": -3.9778,
  "totalDeliveries": 50,
  "successfulDeliveries": 40
}
```

### Livreur 3 - Nouveau (Pas d'Historique)
```json
{
  "name": "Kouadio N'Guessan",
  "email": "kouadio@betex.ci",
  "password": "driver123",
  "phone": "+225 07 33 33 33 33",
  "status": "online",
  "lastLatitude": 5.3364,
  "lastLongitude": -4.0867,
  "totalDeliveries": 0,
  "successfulDeliveries": 0
}
```

---

## ✅ Checklist de Test

Avant de considérer la fonctionnalité comme testée:

- [ ] Au moins 1 livreur créé avec status "online"
- [ ] Position GPS valide pour le livreur
- [ ] Création d'une livraison réussie
- [ ] Suggestion de livreur affichée
- [ ] Distance calculée correctement
- [ ] Taux de réussite affiché
- [ ] Livraison créée avec le bon livreur assigné
- [ ] Livraison visible dans la liste
- [ ] Status "pending" correct

---

## 🔄 Réinitialiser les Données de Test

Si vous voulez repartir de zéro:

```bash
# Arrêter les conteneurs
docker-compose down

# Supprimer les volumes (⚠️ SUPPRIME TOUTES LES DONNÉES)
docker-compose down -v

# Redémarrer
docker-compose up -d
```

Ensuite, recréez:
1. L'utilisateur admin (automatique via seeds)
2. Les livreurs de test
3. Les zones (optionnel)

---

## 📱 Test Mobile

Pour tester sur mobile:
1. Trouvez votre IP locale: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
2. Accédez depuis mobile: `http://YOUR_IP:3003`
3. Testez la géolocalisation GPS (bouton 📍)

---

## 🎯 Objectifs de Test Atteints

✅ Suggestion de livreur fonctionnelle
✅ Calcul de distance précis
✅ Prise en compte du taux de succès
✅ Interface utilisateur intuitive
✅ Validation des données
✅ Gestion des erreurs

---

**Prêt à tester!** 🚀

Si vous rencontrez des problèmes, consultez:
1. Les logs Docker
2. La console du navigateur (F12)
3. Le fichier GUIDE_UTILISATION.md
