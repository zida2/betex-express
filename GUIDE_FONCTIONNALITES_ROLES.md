# 📱 BETEX EXPRESS - Guide Simple des Fonctionnalités par Rôle

> **Ce guide explique QUI fait QUOI dans l'application**

---

## 👥 **LES 3 RÔLES PRINCIPAUX**

### 1️⃣ **CLIENT** 🧑‍💼
C'est le **client final** qui veut envoyer quelque chose

### 2️⃣ **ADMIN** 👨‍💻
C'est le **responsable** qui gère les demandes et les livreurs

### 3️⃣ **LIVREUR** 🚚
C'est la **personne qui livre** les colis

---

## 📊 **TABLEAU COMPARATIF DES FONCTIONNALITÉS**

| Fonctionnalité | CLIENT | ADMIN | LIVREUR |
|---|:---:|:---:|:---:|
| Soumettre une demande de livraison | ✅ | ❌ | ❌ |
| Voir ses demandes en cours | ✅ | ✅ | ❌ |
| Recevoir des messages sur sa demande | ✅ | ✅ | ❌ |
| **Recevoir et approuver les demandes** | ❌ | ✅ | ❌ |
| **Ajouter le prix de livraison** | ❌ | ✅ | ❌ |
| **Assigner un livreur** | ❌ | ✅ | ❌ |
| **Envoyer des messages au client** | ❌ | ✅ | ❌ |
| **Voir les demandes assignées** | ❌ | ✅ | ✅ |
| Confirmer qu'il a collecté le colis | ❌ | ❌ | ✅ |
| Confirmer la livraison | ❌ | ❌ | ✅ |
| Voir sa localisation en temps réel | ❌ | ✅ | ✅ |
| Gérer les livreurs | ❌ | ✅ | ❌ |
| Voir l'historique des livraisons | ❌ | ✅ | ✅ |

---

# 🎯 **GUIDE DÉTAILLÉ PAR RÔLE**

---

## 👤 **RÔLE: CLIENT** 🧑‍💼

### 🏠 **Où accéder?**
- URL: `Portail Client`
- Pas besoin de se connecter pour voir les livreurs disponibles

### ✅ **Ce que le CLIENT peut faire:**

#### 1️⃣ **TROUVER UN LIVREUR** 🔍
```
Étapes:
1. Cliquez sur "Activer ma localisation" 
   → Le système trouve votre position GPS
   
2. Vous voyez une liste de tous les livreurs disponibles
   → Distance, véhicule, évaluation
   
3. Cliquez sur "Sélectionner" pour un livreur
```

**À voir:**
- 📍 Distance du livreur
- 🚗 Type de véhicule (Moto, Voiture, Vélo, etc)
- ⭐ Note du livreur (évaluation)
- 🟢 Statut (Disponible, Occupé, etc)

---

#### 2️⃣ **SOUMETTRE UNE DEMANDE DE LIVRAISON** 📋
```
Étapes:
1. Remplissez vos informations (expéditeur):
   ✓ Votre nom
   ✓ Votre téléphone
   ✓ Votre adresse (ou cliquez sur 📍 pour votre localisation)

2. Remplissez les infos du destinataire:
   ✓ Nom de la personne qui reçoit
   ✓ Téléphone du destinataire
   ✓ Adresse de destination (ou localisation GPS)

3. Décrivez votre colis (optionnel):
   ✓ Description: "Livre", "Vêtements", "Nourriture", etc
   ✓ Poids: Ex: 0.5 kg
   
   ❌ NE remplissez PAS le prix du colis
      (C'est l'admin qui le fait)

4. Cliquez sur "📤 Envoyer la demande"
   → Message: "Demande envoyée à l'admin pour approbation"
```

**À savoir:**
- ✅ Les infos obligatoires: nom et téléphone (expéditeur + destinataire)
- ⏳ La demande attend l'approbation de l'admin
- 📱 Vous recevrez un message quand c'est approuvé

---

#### 3️⃣ **SUIVRE VOS DEMANDES** 📍
```
Menu: "📋 Mes demandes"

Vous voyez:
- État de chaque demande:
  ⏳ En attente d'approbation
  ✅ Approuvée (livreur assigné)
  ❌ Rejetée (raison du refus)
  🚚 En cours de livraison
  ✔️ Livrée

- Infos affichées:
  • Départ et destination
  • Livreur assigné (nom, téléphone)
  • Description du colis
  • Statut actuel
```

---

#### 4️⃣ **RECEVOIR DES MESSAGES** 💬
```
L'admin peut vous envoyer des messages WhatsApp:
- "Votre livraison est approuvée!"
- "Le livreur Ahmed arrive dans 15 min"
- "Vous avez une question? Contactez-nous"
```

---

### ❌ **Ce que le CLIENT NE PEUT PAS faire:**

- ❌ Voir le prix de la livraison avant approbation
- ❌ Assigner un livreur lui-même
- ❌ Gérer d'autres demandes
- ❌ Voir le GPS en temps réel du livreur
- ❌ Accepter ou refuser une demande

---

---

## 👨‍💻 **RÔLE: ADMIN** 🎛️

### 🏠 **Où accéder?**
- URL: `Dashboard Admin`
- Menu latéral → **"📋 Demandes"**
- Nécessite une connexion (email admin + mot de passe)

### ✅ **Ce que l'ADMIN peut faire:**

#### 1️⃣ **RECEVOIR LES DEMANDES** 📬
```
Lieu: Menu "📋 Demandes"

Vous voyez:
- Liste des demandes triées par:
  ⏳ En attente d'approbation
  ✅ Approuvées
  ❌ Rejetées
  📊 Toutes les demandes

Infos affichées:
- Numéro de la demande
- Nom du client
- Date de soumission
- Statut actuel
```

---

#### 2️⃣ **EXAMINER UNE DEMANDE** 🔍
```
Cliquez sur une demande pour voir les détails:

📤 EXPÉDITEUR (Celui qui envoie):
   • Nom: Jean Kouassi
   • Téléphone: +226 70 00 00 01
   • Adresse: Ouagadougou
   • Localisation GPS: 12.3714, -1.5197

📥 DESTINATAIRE (Celui qui reçoit):
   • Nom: Marie Dupont
   • Téléphone: +226 70 00 00 02
   • Adresse: Bobo Dioulasso
   • Localisation GPS: 12.1875, -4.2899

📦 COLIS:
   • Description: "Livre de Littérature"
   • Poids: 0.5 kg
   • Prix du colis: 0 FCFA (non fourni par client)
```

---

#### 3️⃣ **COMPLÉTER LA DEMANDE** ✏️
```
Avant d'approuver, vous devez remplir:

💰 PRIX DE LA LIVRAISON (obligatoire):
   • Exemple: 5000 FCFA
   • C'est VOUS qui décidez basé sur:
     - Distance
     - Type de colis
     - Zone de livraison
     - Urgence

👨‍🚚 SÉLECTIONNER UN LIVREUR (obligatoire):
   • Dropdown avec tous les livreurs disponibles
   • Pour chaque livreur vous voyez:
     - Nom: Ahmed Diallo
     - Téléphone: +226 70 11 11 11
     - Véhicule: Moto
     - Statut: 🟢 Disponible
     - Évaluation: ⭐ 4.8/5
   • Choisissez le plus adapté

📝 NOTES POUR LE LIVREUR (optionnel):
   • Exemple: "Livraison fragile - À faire avant 14h"
   • Instructions spéciales
   • Précautions à prendre
```

---

#### 4️⃣ **APPROUVER ET ASSIGNER** ✅
```
Une fois rempli:

Cliquez sur "✅ Approuver et Envoyer au Livreur"

Le système fait:
1. ✅ Marque la demande comme "approuvée"
2. ✅ Assigne le livreur choisi
3. ✅ Génère un lien WhatsApp pour le client
   (optionnel - vous pouvez l'envoyer ou pas)

Résultat: Le livreur voit maintenant la demande et peut:
- Voir les détails complets
- Aller chercher le colis
- Effectuer la livraison
```

---

#### 5️⃣ **REJETER UNE DEMANDE** ❌
```
Si vous ne pouvez pas livrer:

Cliquez sur "❌ Rejeter"

Remplissez la raison:
- "Adresse inaccessible"
- "Zone de livraison non couverte"
- "Demande non conforme"
- "Autre raison..."

Le système:
1. ❌ Marque la demande comme "rejetée"
2. 📧 Peut notifier le client
```

---

#### 6️⃣ **ENVOYER UN MESSAGE AU CLIENT** 💬
```
Après approbation (optionnel):

Cliquez sur "💬 Envoyer un message"

Exemple de message:
"Bonjour Marie, votre livraison est approuvée! ✅
Le livreur Ahmed Diallo sera là demain entre 14h-16h. 
Merci pour votre confiance! 🚚"

Le système génère un lien WhatsApp:
- Cliquez le lien
- WhatsApp s'ouvre
- Envoyez le message manuellement
```

---

#### 7️⃣ **VOIR LES LIVREURS DISPONIBLES** 👨‍🚚
```
Lieu: Bouton "👨‍🚚 Livreurs"

Vous voyez:
- Liste complète des livreurs
- Nom, téléphone, email
- Véhicule et plaque
- CNIB
- Statut: 🟢 Disponible / 🟡 Occupé / ⚫ Hors ligne
- Évaluation: ⭐ 4.8/5
- Livraisons du jour
```

---

#### 8️⃣ **VOIR LE SUIVI EN TEMPS RÉEL** 🗺️
```
Lieu: Bouton "🗺️ Carte"

Vous voyez:
- Carte GPS de votre ville
- Position en temps réel de chaque livreur
  (petit point rouge avec nom)
- Trajet du livreur
- Distance restante

Cliquez sur un livreur pour voir:
- Ses détails
- Sa vitesse
- Ses livraisons actuelles
- Temps d'arrivée estimé
```

---

#### 9️⃣ **VOIR L'HISTORIQUE** 📜
```
Lieu: Bouton "📜 Historique"

Vous voyez:
- Toutes les livraisons passées
- Date et heure
- Livreur
- Client
- Distance parcourue
- Temps pris
- Prix
- Statut (Complétée, Annulée, etc)
```

---

### ❌ **Ce que l'ADMIN NE PEUT PAS faire:**

- ❌ Livrer lui-même (ce n'est pas son rôle)
- ❌ Voir les infos privées des clients (sauf si demande)
- ❌ Modifier la demande après approbation
- ❌ Changer le prix une fois assigné

---

---

## 🚚 **RÔLE: LIVREUR** 🏍️

### 🏠 **Où accéder?**
- URL: `Dashboard Livreur`
- Menu latéral principal
- Nécessite une connexion (email livreur + mot de passe)

### ✅ **Ce que le LIVREUR peut faire:**

#### 1️⃣ **VOIR SES LIVRAISONS ASSIGNÉES** 📦
```
Lieu: Menu "📦 Mes livraisons" ou "📋 Demandes"

Vous voyez:
- Liste des livraisons à faire aujourd'hui
- Pour chaque livraison:
  • Client: Jean Kouassi
  • Téléphone: +226 70 00 00 01
  • Adresse de collecte: Ouagadougou
  • Adresse de livraison: Bobo Dioulasso
  • Description: "Livre de Littérature"
  • Poids: 0.5 kg
  • Prix: 5000 FCFA (ce que vous gagnez)
  • Notes de l'admin: "Livraison fragile"
```

---

#### 2️⃣ **ACCEPTER UNE LIVRAISON** ✅
```
Quand vous voyez une demande assignée:

Cliquez sur "✅ Accepter cette livraison"

Le système:
1. ✅ Marque que vous avez accepté
2. ✅ Vous donne tous les détails
3. ✅ Active votre GPS
```

---

#### 3️⃣ **NAVIGUER VERS LA COLLECTE** 🗺️
```
Pour aller chercher le colis:

Utilisez "📍 Naviguer vers la collecte"

Le système:
1. Affiche la carte GPS
2. Montre l'adresse exacte
3. Indique la distance
4. Donne le temps estimé
5. Vous pouvez utiliser Google Maps ou Waze
```

---

#### 4️⃣ **CONFIRMER LA COLLECTE** 📍
```
Quand vous avez le colis:

Cliquez sur "✅ Colis collecté"

Vous pouvez:
- Prendre une photo du colis (optionnel)
- Ajouter une note: "Colis en bon état", etc
- Confirmer l'heure de collecte

Le système:
- Met à jour le statut: "En course"
- Notifie le client: "Le livreur part!"
```

---

#### 5️⃣ **NAVIGUER VERS LA LIVRAISON** 🗺️
```
Pour aller livrer le colis:

Utilisez "📍 Naviguer vers la livraison"

Même chose que la collecte:
1. Affiche la carte GPS
2. Montre l'adresse du destinataire
3. Temps estimé
4. Intégration Google Maps/Waze
```

---

#### 6️⃣ **CONFIRMER LA LIVRAISON** ✔️
```
Quand vous avez livré:

Cliquez sur "✔️ Livraison effectuée"

Vous pouvez:
- Prendre une signature du client
- Prendre une photo du colis livré
- Ajouter une note: "Client absent", "Porte A", etc
- Confirmer l'heure de livraison

Le système:
- Met à jour le statut: "Livrée ✔️"
- Notifie le client: "Colis livré!"
- Ajoute à l'historique
```

---

#### 7️⃣ **VOIR SES STATISTIQUES** 📊
```
Lieu: Menu "📊 Mes Statistiques"

Vous voyez:
- Nombre de livraisons aujourd'hui
- Distance parcourue: Ex: 45.3 km
- Temps de travail: Ex: 6h 23min
- Revenus du jour: Ex: 35,000 FCFA
- Note moyenne: ⭐ 4.8/5
- Taux de réussite: 98%
```

---

#### 8️⃣ **VOIR VOTRE HISTORIQUE** 📜
```
Lieu: Menu "📜 Historique"

Vous voyez:
- Toutes vos livraisons passées
- Date, heure, client
- Distance, temps, prix
- Statut (Livrée, Annulée)
- Notes du client
- Évaluations
```

---

#### 9️⃣ **METTRE À JOUR VOTRE STATUT** 🔴
```
Menu: Bouton de statut en haut

Options:
🟢 Disponible (Je suis prêt à recevoir des demandes)
🟡 Occupé (Je suis en livraison)
⚫ Hors ligne (Je me déconnecte)

Important:
- Mettez "Disponible" quand vous êtes libre
- Mettez "Occupé" pendant une livraison
- Admins vous voient sur la carte GPS
```

---

#### 🔟 **PARTAGER VOTRE LOCALISATION** 📍
```
Pendant une livraison:

Votre GPS s'active automatiquement

L'admin peut voir:
- Votre position en temps réel
- Votre trajet
- Votre vitesse
- Temps d'arrivée estimé

Le client peut voir (optionnel):
- Votre position (lien fourni par admin)
- "Le livreur est à 2 km"
- Temps d'arrivée estimé

Sécurité:
- Vous pouvez arrêter le partage
- Pas d'enregistrement après livraison
```

---

### ❌ **Ce que le LIVREUR NE PEUT PAS faire:**

- ❌ Approuver les demandes (c'est l'admin)
- ❌ Assigner d'autres livreurs
- ❌ Voir le prix avant de l'accepter... NON ATTENDEZ!
- ✅ Voir le prix: OUI il DOIT le voir
- ❌ Modifier la demande
- ❌ Refuser après avoir accepté (sauf exception)

---

---

# 🔐 **RÉSUMÉ: QUI FAIT QUOI**

## **CLIENT** 🧑‍💼
```
✅ Soumet une demande de livraison
✅ Voit les livreurs disponibles
✅ Suit ses demandes
✅ Reçoit des messages WhatsApp
❌ Voit pas le prix avant approbation
❌ Peut pas assigner un livreur
```

## **ADMIN** 👨‍💻
```
✅ Reçoit les demandes des clients
✅ Examine les détails de chaque demande
✅ Ajoute le prix de livraison (décide)
✅ Sélectionne le meilleur livreur
✅ Approuve ou rejette les demandes
✅ Envoie des messages WhatsApp aux clients
✅ Voit tous les livreurs en temps réel
✅ Voit l'historique complet
❌ Livre pas lui-même
```

## **LIVREUR** 🚚
```
✅ Voit ses livraisons assignées
✅ Accepte/refuse les livraisons
✅ Navigue vers la collecte et livraison
✅ Confirme la collecte du colis
✅ Confirme la livraison
✅ Voit ses statistiques
✅ Voit l'historique
✅ Gère son statut (Disponible/Occupé)
❌ Approuve pas les demandes
❌ Assigne pas d'autres livreurs
```

---

# 💡 **EXEMPLE COMPLET D'UNE LIVRAISON**

```
🕐 10h00 - CLIENT SOUMET LA DEMANDE
   • Jean va sur le portail client
   • Clique "Trouver un livreur"
   • Remplit le formulaire
   • Clique "Envoyer la demande"
   ✓ Message: "Demande en attente d'approbation"

🕐 10h05 - ADMIN REÇOIT LA DEMANDE
   • Notification sur le dashboard
   • Admin va sur "📋 Demandes"
   • Voit la demande de Jean
   • Clique dessus pour voir les détails

🕐 10h10 - ADMIN EXAMINE ET COMPLÈTE
   • Remplit le prix: 5000 FCFA
   • Sélectionne Ahmed (le meilleur livreur)
   • Ajoute la note: "Livraison fragile"
   • Clique "✅ Approuver et Envoyer"

🕐 10h12 - ADMIN ENVOIE UN MESSAGE
   • Clique "💬 Envoyer un message"
   • Écrit: "Bonjour Jean, demande approuvée! 
             Ahmed arrive vers 14h!"
   • Envoie par WhatsApp

🕐 10h15 - CLIENT REÇOIT LE MESSAGE
   • ✅ Message WhatsApp reçu
   • Voit: "Demande approuvée"
   • Sait que Ahmed viendra à 14h

🕐 10h20 - LIVREUR REÇOIT L'ASSIGNATION
   • Ahmed voit la demande sur son app
   • Lit: Collecte à Ouagadougou, livraison à Bobo
   • Voit le prix: 5000 FCFA
   • Clique "✅ J'accepte"

🕐 10h25 - LIVREUR PART CHERCHER LE COLIS
   • Ahmed clique "🗺️ Naviguer vers la collecte"
   • La carte lui montre l'adresse
   • Il prend sa moto et part

🕐 11h00 - LIVREUR COLLECTE LE COLIS
   • Ahmed arrive chez Jean
   • Récupère le colis
   • Clique "✅ Colis collecté"
   • Prend une photo (optionnel)

🕐 11h05 - ADMIN ET CLIENT VOIENT LA MISE À JOUR
   • ✅ Client reçoit: "Ahmed a collecté votre colis!"
   • Admin voit: "En cours de livraison"
   • Admin peut voir la position GPS d'Ahmed

🕐 14h00 - LIVREUR ARRIVE À LA DESTINATION
   • Ahmed utilise "🗺️ Naviguer vers la livraison"
   • Arrive à Bobo où Marie reçoit

🕐 14h05 - LIVREUR LIVRE LE COLIS
   • Ahmed donne le colis à Marie
   • Marie signe (optionnel)
   • Ahmed clique "✔️ Livraison effectuée"

🕐 14h06 - TOUT LE MONDE EST NOTIFIÉ
   • ✅ Client Jean voit: "Votre colis est livré! ✔️"
   • ✅ Admin voit: "Livraison complétée"
   • ✅ Ahmed voit: "Livraison complétée, +5000 FCFA"

🕐 14h10 - HISTORIQUE MIS À JOUR
   • Admin peut voir dans "📜 Historique"
   • Ahmed peut voir dans son historique
   • Jean peut voir dans "📋 Mes demandes"

✅ LIVRAISON RÉUSSIE!
```

---

# 📞 **SUPPORT & QUESTIONS**

**Besoin d'aide?**
- Client: Utilisez le chat du portail
- Admin: Consultez le dashboard
- Livreur: Utilisez le menu "Aide"

**Problèmes?**
- Contactez l'équipe support
- Email: support@betexexpress.bf
- WhatsApp: +226 XX XX XX XX

---

**Version:** 1.0  
**Dernière mise à jour:** Janvier 2025  
**Status:** ✅ Documentation Complète
