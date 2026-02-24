// backend/config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./denonciation-ac6d1-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'denonciation-ac6d1'
});

const db = admin.firestore();
module.exports = db;