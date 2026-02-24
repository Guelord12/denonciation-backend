const vision = require('@google-cloud/vision').v1;
const client = new vision.ImageAnnotatorClient();

exports.analyzeImage = async (imageUrl) => {
  try {
    const [result] = await client.safeSearchDetection(imageUrl);
    const detections = result.safeSearchAnnotation;
    const isAdult = detections.adult === 'LIKELY' || detections.adult === 'VERY_LIKELY';
    const isViolent = detections.violence === 'LIKELY' || detections.violence === 'VERY_LIKELY';
    const isRacy = detections.racy === 'LIKELY' || detections.racy === 'VERY_LIKELY';
    if (isAdult || isViolent || isRacy) {
      return { isValid: false, reasons: { adult: isAdult, violence: isViolent, racy: isRacy } };
    }
    return { isValid: true };
  } catch (err) {
    console.error('Erreur modération image', err);
    return { isValid: true };
  }
};

exports.analyzeText = async (text) => {
  // Vous pouvez garder la version simplifiée ou intégrer Perspective API plus tard
  const bannedWords = ['insulte', 'raciste', 'sexiste'];
  const lowerText = text.toLowerCase();
  const found = bannedWords.filter(word => lowerText.includes(word));
  if (found.length > 0) {
    return { isValid: false, reasons: found };
  }
  return { isValid: true };
};