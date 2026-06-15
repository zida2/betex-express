/**
 * Authentication Context
 * Manages user authentication state with Firebase
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Essayer de récupérer les données utilisateur depuis Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          console.log("Document Firestore récupéré:", userDoc.exists(), userDoc.data());
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.email,
              role: userData.role || 'client'
            });
          } else {
            // Si pas de document Firestore, créer un document par défaut
            const defaultUserData = {
              email: firebaseUser.email,
              name: firebaseUser.email,
              role: 'client',
              createdAt: new Date()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), defaultUserData);
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.email,
              role: 'client'
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.email,
            role: 'client'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData;
      if (userDoc.exists()) {
        const firestoreData = userDoc.data();
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firestoreData.name || firebaseUser.email,
          role: firestoreData.role || 'client'
        };
      } else {
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.email,
          role: 'client'
        };
      }
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      const fallbackUserData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.email,
        role: 'client'
      };
      setUser(fallbackUserData);
      return fallbackUserData;
    }
  };

  const register = async (userData, autoLogin = true) => {
    const { email, password, ...otherData } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Enregistrer les données utilisateur dans Firestore
    const userDocData = {
      ...otherData,
      email,
      name: otherData.firstName + ' ' + otherData.lastName,
      createdAt: new Date(),
      role: otherData.role || 'client'
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), userDocData);
    
    const newUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: userDocData.name,
      role: userDocData.role
    };
    if (autoLogin) {
      setUser(newUser);
    }
    return newUser;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
