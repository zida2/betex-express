/**
 * Quartiers de Ouagadougou avec leurs coordonnées géographiques
 * Système de géolocalisation pour assigner automatiquement les clients
 */

// Coordonnées approximatives des quartiers de Ouagadougou
const OUAGA_QUARTIERS = [
  // Zone Centre
  {
    id: 1,
    nom: "Centre-ville",
    zone: "Zone Centre",
    coordonnees: {
      lat: 12.3714,
      lng: -1.5197,
      rayon: 2000 // rayon en mètres
    }
  },
  {
    id: 2,
    nom: "Koulouba",
    zone: "Zone Centre", 
    coordonnees: {
      lat: 12.3589,
      lng: -1.5331,
      rayon: 1500
    }
  },
  {
    id: 3,
    nom: "Dapoya",
    zone: "Zone Centre",
    coordonnees: {
      lat: 12.3656,
      lng: -1.5089,
      rayon: 1800
    }
  },
  {
    id: 4,
    nom: "Bilbalogo",
    zone: "Zone Centre",
    coordonnees: {
      lat: 12.3789,
      lng: -1.5234,
      rayon: 1200
    }
  },
  {
    id: 5,
    nom: "Kamsaoghin",
    zone: "Zone Centre",
    coordonnees: {
      lat: 12.3678,
      lng: -1.5156,
      rayon: 1000
    }
  },

  // Zone Nord
  {
    id: 6,
    nom: "Tampouy",
    zone: "Zone Nord",
    coordonnees: {
      lat: 12.4156,
      lng: -1.4789,
      rayon: 2500
    }
  },
  {
    id: 7,
    nom: "Nongremassom",
    zone: "Zone Nord",
    coordonnees: {
      lat: 12.4089,
      lng: -1.5234,
      rayon: 2000
    }
  },
  {
    id: 8,
    nom: "Patte d'Oie",
    zone: "Zone Nord",
    coordonnees: {
      lat: 12.3967,
      lng: -1.5356,
      rayon: 1800
    }
  },
  {
    id: 9,
    nom: "Gounghin",
    zone: "Zone Nord",
    coordonnees: {
      lat: 12.3889,
      lng: -1.4967,
      rayon: 1500
    }
  },
  {
    id: 10,
    nom: "Samandin",
    zone: "Zone Nord",
    coordonnees: {
      lat: 12.4234,
      lng: -1.5123,
      rayon: 1200
    }
  },
  {
    id: 11,
    nom: "Tanghin",
    zone: "Zone Nord",
    coordonnees: {
      lat: 12.4167,
      lng: -1.5456,
      rayon: 1600
    }
  },
  {
    id: 12,
    nom: "Wayalghin",
    zone: "Zone Nord",
    coordonnees: {
      lat: 12.4045,
      lng: -1.4856,
      rayon: 1400
    }
  },

  // Zone Sud
  {
    id: 13,
    nom: "Cissin",
    zone: "Zone Sud",
    coordonnees: {
      lat: 12.3245,
      lng: -1.5567,
      rayon: 2800
    }
  },
  {
    id: 14,
    nom: "Rimkieta",
    zone: "Zone Sud",
    coordonnees: {
      lat: 12.2989,
      lng: -1.5234,
      rayon: 2200
    }
  },
  {
    id: 15,
    nom: "Kilwin",
    zone: "Zone Sud",
    coordonnees: {
      lat: 12.3167,
      lng: -1.4789,
      rayon: 1800
    }
  },
  {
    id: 16,
    nom: "Saaba",
    zone: "Zone Sud",
    coordonnees: {
      lat: 12.2856,
      lng: -1.4456,
      rayon: 2000
    }
  },
  {
    id: 17,
    nom: "Nioko 1",
    zone: "Zone Sud",
    coordonnees: {
      lat: 12.3089,
      lng: -1.5689,
      rayon: 1500
    }
  },
  {
    id: 18,
    nom: "Nioko 2",
    zone: "Zone Sud",
    coordonnees: {
      lat: 12.3023,
      lng: -1.5756,
      rayon: 1300
    }
  },
  {
    id: 19,
    nom: "Zabré",
    zone: "Zone Sud",
    coordonnees: {
      lat: 12.2789,
      lng: -1.5123,
      rayon: 1600
    }
  },

  // Zone Est
  {
    id: 20,
    nom: "Baskuy",
    zone: "Zone Est",
    coordonnees: {
      lat: 12.3456,
      lng: -1.4234,
      rayon: 2200
    }
  },
  {
    id: 21,
    nom: "Wemtenga",
    zone: "Zone Est",
    coordonnees: {
      lat: 12.3789,
      lng: -1.4567,
      rayon: 1800
    }
  },
  {
    id: 22,
    nom: "Kossodo",
    zone: "Zone Est",
    coordonnees: {
      lat: 12.4023,
      lng: -1.4345,
      rayon: 2500
    }
  },
  {
    id: 23,
    nom: "Bogodogo",
    zone: "Zone Est",
    coordonnees: {
      lat: 12.3567,
      lng: -1.4123,
      rayon: 2000
    }
  },
  {
    id: 24,
    nom: "Dassasgho",
    zone: "Zone Est",
    coordonnees: {
      lat: 12.3234,
      lng: -1.4456,
      rayon: 1600
    }
  },
  {
    id: 25,
    nom: "Sig-Noghin",
    zone: "Zone Est",
    coordonnees: {
      lat: 12.3678,
      lng: -1.4789,
      rayon: 1400
    }
  },

  // Zone Ouest
  {
    id: 26,
    nom: "Bendogo",
    zone: "Zone Ouest",
    coordonnees: {
      lat: 12.3456,
      lng: -1.6234,
      rayon: 1800
    }
  },
  {
    id: 27,
    nom: "Somgandé",
    zone: "Zone Ouest",
    coordonnees: {
      lat: 12.3789,
      lng: -1.5967,
      rayon: 2000
    }
  },
  {
    id: 28,
    nom: "Pissy",
    zone: "Zone Ouest",
    coordonnees: {
      lat: 12.3167,
      lng: -1.5789,
      rayon: 2200
    }
  },
  {
    id: 29,
    nom: "Zogona",
    zone: "Zone Ouest",
    coordonnees: {
      lat: 12.3345,
      lng: -1.6123,
      rayon: 1500
    }
  },
  {
    id: 30,
    nom: "Hamdallaye",
    zone: "Zone Ouest",
    coordonnees: {
      lat: 12.3623,
      lng: -1.6345,
      rayon: 1700
    }
  },
  {
    id: 31,
    nom: "Yamtenga",
    zone: "Zone Ouest",
    coordonnees: {
      lat: 12.3234,
      lng: -1.6456,
      rayon: 1400
    }
  },

  // Périphérie
  {
    id: 32,
    nom: "Ouidi",
    zone: "Périphérie",
    coordonnees: {
      lat: 12.4567,
      lng: -1.3456,
      rayon: 3000
    }
  },
  {
    id: 33,
    nom: "Balkuy",
    zone: "Périphérie",
    coordonnees: {
      lat: 12.2345,
      lng: -1.3789,
      rayon: 2800
    }
  },
  {
    id: 34,
    nom: "Kombissiri",
    zone: "Périphérie",
    coordonnees: {
      lat: 12.1789,
      lng: -1.4567,
      rayon: 3500
    }
  },
  {
    id: 35,
    nom: "Sakoula",
    zone: "Périphérie",
    coordonnees: {
      lat: 12.5234,
      lng: -1.4234,
      rayon: 3200
    }
  },
  {
    id: 36,
    nom: "Komsilga",
    zone: "Périphérie",
    coordonnees: {
      lat: 12.2678,
      lng: -1.6789,
      rayon: 4000
    }
  },
  {
    id: 37,
    nom: "Koubri",
    zone: "Périphérie",
    coordonnees: {
      lat: 12.1456,
      lng: -1.5234,
      rayon: 3800
    }
  }
];

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 * @param {number} lat1 - Latitude du premier point
 * @param {number} lng1 - Longitude du premier point  
 * @param {number} lat2 - Latitude du second point
 * @param {number} lng2 - Longitude du second point
 * @returns {number} Distance en mètres
 */
function calculerDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Détermine le quartier le plus proche d'une position GPS
 * @param {number} latitude - Latitude du client
 * @param {number} longitude - Longitude du client
 * @returns {Object|null} Quartier trouvé ou null
 */
function determinerQuartier(latitude, longitude) {
  if (!latitude || !longitude) {
    return null;
  }

  let quartierPlusProche = null;
  let distanceMinimale = Infinity;

  for (const quartier of OUAGA_QUARTIERS) {
    const distance = calculerDistance(
      latitude, 
      longitude, 
      quartier.coordonnees.lat, 
      quartier.coordonnees.lng
    );

    // Si le client est dans le rayon du quartier et c'est le plus proche
    if (distance <= quartier.coordonnees.rayon && distance < distanceMinimale) {
      distanceMinimale = distance;
      quartierPlusProche = {
        ...quartier,
        distance: Math.round(distance)
      };
    }
  }

  // Si aucun quartier exact trouvé, prendre le plus proche général
  if (!quartierPlusProche) {
    for (const quartier of OUAGA_QUARTIERS) {
      const distance = calculerDistance(
        latitude, 
        longitude, 
        quartier.coordonnees.lat, 
        quartier.coordonnees.lng
      );

      if (distance < distanceMinimale) {
        distanceMinimale = distance;
        quartierPlusProche = {
          ...quartier,
          distance: Math.round(distance)
        };
      }
    }
  }

  return quartierPlusProche;
}

/**
 * Obtient tous les quartiers d'une zone donnée
 * @param {string} zone - Nom de la zone
 * @returns {Array} Liste des quartiers de la zone
 */
function getQuartiersParZone(zone) {
  return OUAGA_QUARTIERS.filter(quartier => quartier.zone === zone);
}

/**
 * Recherche un quartier par son nom
 * @param {string} nom - Nom du quartier
 * @returns {Object|null} Quartier trouvé ou null
 */
function rechercherQuartierParNom(nom) {
  return OUAGA_QUARTIERS.find(quartier => 
    quartier.nom.toLowerCase().includes(nom.toLowerCase())
  ) || null;
}

/**
 * Obtient la liste de toutes les zones
 * @returns {Array} Liste des zones uniques
 */
function getZones() {
  const zones = [...new Set(OUAGA_QUARTIERS.map(q => q.zone))];
  return zones.sort();
}

/**
 * Valide si des coordonnées sont dans les limites de Ouagadougou
 * @param {number} latitude - Latitude à vérifier
 * @param {number} longitude - Longitude à vérifier
 * @returns {boolean} True si dans Ouagadougou
 */
function estDansOuagadougou(latitude, longitude) {
  // Limites approximatives de Ouagadougou
  const limites = {
    nord: 12.6,
    sud: 12.1,
    est: -1.2,
    ouest: -1.8
  };

  return latitude >= limites.sud && latitude <= limites.nord &&
         longitude >= limites.ouest && longitude <= limites.est;
}

module.exports = {
  OUAGA_QUARTIERS,
  determinerQuartier,
  calculerDistance,
  getQuartiersParZone,
  rechercherQuartierParNom,
  getZones,
  estDansOuagadougou
};