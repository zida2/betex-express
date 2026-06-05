/**
 * Form Validation Utilities
 * Using Zod for schema validation
 */

import { z } from 'zod';

// Base schemas
export const emailSchema = z.string()
  .email('Email invalide')
  .max(255, 'Email trop long');

export const passwordSchema = z.string()
  .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
  .max(128, 'Le mot de passe est trop long');

export const phoneSchema = z.string()
  .regex(/^[0-9\-\+\(\)\s]*$/, 'Numéro de téléphone invalide')
  .min(7, 'Numéro de téléphone trop court')
  .max(20, 'Numéro de téléphone trop long')
  .optional();

export const addressSchema = z.string()
  .min(5, 'L\'adresse doit contenir au moins 5 caractères')
  .max(255, 'L\'adresse est trop longue');

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Latitude invalide'),
  longitude: z.number().min(-180).max(180, 'Longitude invalide')
});

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis')
});

// Package Schema
export const packageSchema = z.object({
  senderName: z.string().min(2, 'Nom invalide').max(100),
  senderPhone: phoneSchema,
  senderAddress: addressSchema,
  senderLatitude: z.number().min(-90).max(90),
  senderLongitude: z.number().min(-180).max(180),
  
  receiverName: z.string().min(2, 'Nom invalide').max(100),
  receiverPhone: phoneSchema,
  receiverAddress: addressSchema,
  receiverLatitude: z.number().min(-90).max(90),
  receiverLongitude: z.number().min(-180).max(180),
  
  packageType: z.string().min(1, 'Type de colis requis'),
  packagePrice: z.coerce.number().positive('Prix invalide'),
  deliveryPrice: z.coerce.number().positive('Prix de livraison invalide'),
  weight: z.coerce.number().positive('Poids invalide'),
  notes: z.string().max(500).optional()
});

// Driver Schema
export const driverSchema = z.object({
  firstName: z.string().min(2, 'Prénom invalide').max(100),
  lastName: z.string().min(2, 'Nom invalide').max(100),
  phone: phoneSchema,
  email: emailSchema,
  licenseNumber: z.string().min(3, 'Numéro de permis invalide').max(50),
  vehicleType: z.string().min(1, 'Type de véhicule requis'),
  vehicleRegistration: z.string().min(3, 'Immatriculation invalide').max(50)
});

// Route Schema
export const routeSchema = z.object({
  name: z.string().min(2, 'Nom invalide').max(200),
  startAddress: addressSchema,
  endAddress: addressSchema,
  distance: z.coerce.number().positive('Distance invalide'),
  estimatedTime: z.coerce.number().positive('Temps estimé invalide')
});

// Validation function
export const validateForm = async (schema, data) => {
  try {
    const validatedData = await schema.parseAsync(data);
    return { valid: true, data: validatedData, errors: {} };
  } catch (error) {
    if (error.errors) {
      const errors = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { valid: false, data: null, errors };
    }
    return { valid: false, data: null, errors: { general: error.message } };
  }
};

// Sanitization function
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned;
};

// Validate email format
export const isValidEmail = (email) => {
  return emailSchema.safeParse(email).success;
};

// Validate coordinates
export const isValidCoordinates = (lat, lng) => {
  return coordinatesSchema.safeParse({ latitude: lat, longitude: lng }).success;
};
