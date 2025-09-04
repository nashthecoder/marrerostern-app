
require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_ADMIN_KEY_PATH || './marrerosten-admin-firebase-adminsdk-fbsvc-bf0a78abe1.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const users = [
  {
    email: 'naijeria@gmail.com',
    password: 'admin@1234',
    role: 'admin',
    prenom: 'Admin',
    nom: 'Nigeria',
    status: 'active'
  },
  {
    email: 'nashprovides@gmail.com',
    password: 'provider@1234',
    role: 'provider',
    prenom: 'Nash',
    nom: 'Provides',
    status: 'active'
  },
  {
    email: 'nashowns@gmail.com',
    password: 'owner@1234',
    role: 'owner',
    prenom: 'Nash',
    nom: 'Owns',
    status: 'active'
  },
  {
    email: 'nashtravels@gmail.com',
    password: 'travelle4@1234',
    role: 'traveler',
    prenom: 'Nash',
    nom: 'Travels',
    status: 'active'
  }
];

async function seedUsers() {
  for (const user of users) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password
      });
      // Add user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: user.email,
        role: user.role,
        prenom: user.prenom,
        nom: user.nom,
        status: user.status
      });
      console.log(`Seeded user: ${user.email} (${user.role})`);
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        console.log(`User already exists: ${user.email}`);
      } else {
        console.error(`Error seeding user ${user.email}:`, err);
      }
    }
  }
  process.exit();
}

seedUsers();
