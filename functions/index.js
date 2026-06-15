const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// Exemple de fonction HTTP (hello world)
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from BETEX EXPRESS!");
});

// Fonction pour récupérer les utilisateurs
exports.getUsers = functions.https.onRequest(async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fonction pour générer un mot de passe aléatoire
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Fonction Cloud pour créer un livreur (sans affecter la session admin)
exports.createDriver = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié et est admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté');
  }

  // Vérifier que l'utilisateur est admin (optionnel, mais recommandé)
  const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!adminUserDoc.exists || adminUserDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Seuls les admins peuvent créer des livreurs');
  }

  const { firstName, lastName, email, phone, cnib, vehicleType, vehiclePlate } = data;

  try {
    // Générer un mot de passe temporaire
    const tempPassword = generateRandomPassword();

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password: tempPassword,
      displayName: `${firstName} ${lastName}`
    });

    // Créer le document utilisateur dans Firestore
    await db.collection('users').doc(userRecord.uid).set({
      firstName,
      lastName,
      email,
      phone,
      cnib,
      vehicleType,
      vehiclePlate,
      name: `${firstName} ${lastName}`,
      role: 'driver',
      status: 'active',
      totalDeliveries: 0,
      successfulDeliveries: 0,
      rating: 5.0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Retourner les identifiants
    return {
      success: true,
      driverId: userRecord.uid,
      credentials: {
        email,
        password: tempPassword
      }
    };
  } catch (error) {
    console.error('Erreur lors de la création du livreur:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
