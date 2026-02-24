const axios = require('axios');

// Convertir des coordonnées en adresse (reverse geocoding)
exports.reverseGeocode = async (lat, lon) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await axios.get(url);
    if (response.data && response.data.address) {
      const address = response.data.address;
      return {
        ville: address.city || address.town || address.village || address.county,
        pays: address.country,
        code_postal: address.postcode
      };
    }
    return null;
  } catch (err) {
    console.error('Erreur reverse geocoding', err);
    return null;
  }
};

// Convertir une adresse en coordonnées (geocoding)
exports.geocode = async (adresse) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`;
    const response = await axios.get(url);
    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (err) {
    console.error('Erreur geocoding', err);
    return null;
  }
};