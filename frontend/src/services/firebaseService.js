import { db, auth } from './firebase';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

// Configuration Firebase (même que dans firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyAQnPZo3HKxt9i1pMXHEGWDQ64gojCcp5o",
  authDomain: "betexexpress-420fc.firebaseapp.com",
  projectId: "betexexpress-420fc",
  storageBucket: "betexexpress-420fc.firebasestorage.app",
  messagingSenderId: "1075687132287",
  appId: "1:1075687132287:web:eb16b2521349779d90834a",
  measurementId: "G-LZNVBKPR33"
};

// Fonction pour générer un mot de passe aléatoire
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Fonction pour les utilisateurs
export const getUsers = async (filters = {}) => {
  let q = collection(db, 'users');
  if (filters.role) {
    q = query(q, where('role', '==', filters.role));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUser = async (id) => {
  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createUser = async (data) => {
  const docRef = await addDoc(collection(db, 'users'), { ...data, createdAt: serverTimestamp() });
  return { id: docRef.id, ...data };
};

export const updateUser = async (id, data) => {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, data);
  return { id, ...data };
};

export const deleteUser = async (id) => {
  const docRef = doc(db, 'users', id);
  await deleteDoc(docRef);
  return id;
};

// Fonction pour les livraisons (delivery requests)
export const getDeliveryRequests = async (filters = {}) => {
  let q = collection(db, 'deliveryRequests');
  if (filters.userId) {
    q = query(q, where('userId', '==', filters.userId));
  }
  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }
  q = query(q, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeliveryRequest = async (id) => {
  const docRef = doc(db, 'deliveryRequests', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createDeliveryRequest = async (data) => {
  const docRef = await addDoc(collection(db, 'deliveryRequests'), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'pending'
  });
  return { id: docRef.id, ...data };
};

export const updateDeliveryRequest = async (id, data) => {
  const docRef = doc(db, 'deliveryRequests', id);
  await updateDoc(docRef, data);
  return { id, ...data };
};

export const deleteDeliveryRequest = async (id) => {
  const docRef = doc(db, 'deliveryRequests', id);
  await deleteDoc(docRef);
  return id;
};

// Fonction pour les colis
export const getPackages = async (filters = {}) => {
  let q = collection(db, 'packages');
  if (filters.driverId) {
    q = query(q, where('driverId', '==', filters.driverId));
  }
  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }
  q = query(q, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPackage = async (id) => {
  const docRef = doc(db, 'packages', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createPackage = async (data) => {
  const docRef = await addDoc(collection(db, 'packages'), {
    ...data,
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...data };
};

export const updatePackage = async (id, data) => {
  const docRef = doc(db, 'packages', id);
  await updateDoc(docRef, data);
  return { id, ...data };
};

// Fonction pour les chauffeurs
export const getDrivers = async (filters = {}) => {
  let q = collection(db, 'users');
  q = query(q, where('role', '==', 'driver'));
  if (filters.isAvailable) {
    q = query(q, where('isAvailable', '==', filters.isAvailable));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    name: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim(),
    ...doc.data(),
    status: doc.data().status || 'active'
  }));
};

// Fonction pour les tarifs
export const getPricing = async () => {
  const docRef = doc(db, 'pricing', 'current');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  // Default pricing if not exists
  const defaultPricing = {
    express: {
      basePrice: 500,
      pricePerKm: 250,
      minPrice: 500,
      maxPrice: 10000
    },
    scheduled: {
      zones: [
        { id: 'zone-1', name: 'Zone Centre-Ville', price: 1500 },
        { id: 'zone-2', name: 'Zone Secteur 1-2', price: 1200 },
        { id: 'zone-3', name: 'Zone Secteur 5-6', price: 1000 },
        { id: 'zone-4', name: 'Zone Nord', price: 2000 }
      ]
    }
  };
  await setDoc(docRef, defaultPricing);
  return { id: docRef.id, ...defaultPricing };
};

export const updatePricing = async (data) => {
  const docRef = doc(db, 'pricing', 'current');
  await setDoc(docRef, data, { merge: false });
  return { id: docRef.id, ...data };
};

export const createPricing = async (data) => {
  const docRef = await addDoc(collection(db, 'pricing'), data);
  return { id: docRef.id, ...data };
};

// Fonction pour les zones
export const getZones = async () => {
  const querySnapshot = await getDocs(collection(db, 'zones'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createZone = async (data) => {
  const docRef = await addDoc(collection(db, 'zones'), data);
  return { id: docRef.id, ...data };
};

// Fonction pour les annonces
export const getAnnouncements = async () => {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createAnnouncement = async (data) => {
  const docRef = await addDoc(collection(db, 'announcements'), {
    ...data,
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...data };
};

export const updateAnnouncement = async (id, data) => {
  const docRef = doc(db, 'announcements', id);
  await updateDoc(docRef, data);
  return { id, ...data };
};

export const deleteAnnouncement = async (id) => {
  const docRef = doc(db, 'announcements', id);
  await deleteDoc(docRef);
};

export const createDriver = async (driverData) => {
  const docRef = await addDoc(collection(db, 'users'), {
    ...driverData,
    role: 'driver',
    status: 'active',
    createdAt: serverTimestamp(),
    totalDeliveries: 0,
    successfulDeliveries: 0,
    rating: 5.0
  });
  return { id: docRef.id, ...driverData };
};

export const updateDriver = async (id, data) => {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, data);
  return { id, ...data };
};

export const deleteDriver = async (id) => {
  const docRef = doc(db, 'users', id);
  await deleteDoc(docRef);
};

/**
 * Listen to real-time delivery requests
 */
export const listenToDeliveryRequests = (callback) => {
  const q = query(
    collection(db, 'deliveryRequests'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(requests);
  }, (error) => {
    console.error('Error listening to delivery requests:', error);
  });
};

/**
 * Listen to real-time packages (to track deliveries)
 */
export const listenToPackages = (callback) => {
  const q = query(
    collection(db, 'packages'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const packages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(packages);
  }, (error) => {
    console.error('Error listening to packages:', error);
  });
};

// Fonction pour créer un livreur avec Firebase Auth (sans affecter la session admin)
export const createDriverWithAuth = async (driverData) => {
  try {
    // Générer un mot de passe temporaire
    const tempPassword = generateRandomPassword();

    // Initialiser une instance Firebase séparée pour créer le livreur (si elle n'existe pas déjà)
    let secondaryApp = getApps().find(app => app.name === 'secondary');
    if (!secondaryApp) {
      secondaryApp = initializeApp(firebaseConfig, 'secondary');
    }
    const secondaryAuth = getAuth(secondaryApp);

    // Créer l'utilisateur dans Firebase Auth avec l'instance secondaire
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      driverData.email,
      tempPassword
    );

    // Créer le document utilisateur dans Firestore (utilise la db principale)
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...driverData,
      name: `${driverData.firstName} ${driverData.lastName}`,
      role: 'driver',
      status: 'active',
      totalDeliveries: 0,
      successfulDeliveries: 0,
      rating: 5.0,
      createdAt: serverTimestamp()
    });

    // Se déconnecter de l'instance secondaire
    await signOut(secondaryAuth);

    // Retourner les identifiants
    return {
      success: true,
      driverId: userCredential.user.uid,
      credentials: {
        email: driverData.email,
        password: tempPassword
      }
    };
  } catch (error) {
    console.error('Erreur lors de la création du livreur:', error);
    throw error;
  }
};
