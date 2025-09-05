// Usage: node scripts/seedMessages.js
// Seeds Firestore 'messages' collection with sample owner/traveler and admin/traveler messages

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const messages = [
  {
    text: "Bonjour, j'ai une question sur ma réservation.",
    sender: "traveler@marrerostern.com",
    role: "traveler",
    recipient: "admin@marrerostern.com"
  },
  {
    text: "Votre réservation est confirmée.",
    sender: "admin@marrerostern.com",
    role: "admin",
    recipient: "traveler@marrerostern.com"
  },
  {
    text: "Le logement est très agréable, merci !",
    sender: "traveler@marrerostern.com",
    role: "traveler",
    recipient: "owner@marrerostern.com"
  },
  {
    text: "Merci pour votre retour, profitez bien de votre séjour.",
    sender: "owner@marrerostern.com",
    role: "owner",
    recipient: "traveler@marrerostern.com"
  },
  {
    text: "N'hésitez pas à nous contacter pour toute demande.",
    sender: "admin@marrerostern.com",
    role: "admin",
    recipient: "traveler@marrerostern.com"
  }
];

async function seedMessages() {
  for (const msg of messages) {
    await addDoc(collection(db, 'messages'), {
      ...msg,
      createdAt: serverTimestamp(),
    });
    console.log(`Seeded message: ${msg.text}`);
  }
  console.log('Seeding complete.');
}

seedMessages();
