require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_ADMIN_KEY_PATH || './marrerosten-admin-firebase-adminsdk-fbsvc-bf0a78abe1.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// --- DATA ARRAYS ---
const users = [
  { email: 'naijeria@gmail.com', password: 'admin@1234', role: 'admin', prenom: 'Admin', nom: 'Nigeria', status: 'active' },
  { email: 'nashprovides@gmail.com', password: 'provider@1234', role: 'provider', prenom: 'Nash', nom: 'Provides', status: 'active' },
  { email: 'nashowns@gmail.com', password: 'owner@1234', role: 'owner', prenom: 'Nash', nom: 'Owns', status: 'active' },
  { email: 'nashtravels@gmail.com', password: 'travelle4@1234', role: 'traveler', prenom: 'Nash', nom: 'Travels', status: 'active' }
];

const properties = [
  { name: 'Villa Azure', address: '123 Côte d’Azur, Nice, France', ownerEmail: 'nashowns@gmail.com', providerEmail: 'nashprovides@gmail.com' },
  { name: 'Chalet Montagne', address: '456 Route des Alpes, Chamonix, France', ownerEmail: 'nashowns@gmail.com', providerEmail: 'nashprovides@gmail.com' },
  { name: 'Appartement Parisien', address: '789 Rue de Rivoli, Paris, France', ownerEmail: 'nashowns@gmail.com', providerEmail: 'nashprovides@gmail.com' }
];

const incidents = [
  { periodeStart: '2025-09-01', periodeEnd: '2025-09-02', logement: 'logement1', urgence: 'Haute', description: "Fuite d'eau dans la salle de bain.", reporter: 'nashtravels@gmail.com' },
  { periodeStart: '2025-09-03', periodeEnd: '2025-09-03', logement: 'logement2', urgence: 'Moyenne', description: "Problème de chauffage.", reporter: 'nashtravels@gmail.com' },
  { periodeStart: '2025-09-04', periodeEnd: '2025-09-04', logement: 'logement3', urgence: 'Basse', description: "Ampoule grillée dans la cuisine.", reporter: 'nashtravels@gmail.com' },
  { periodeStart: '2025-09-05', periodeEnd: '2025-09-05', logement: 'logement1', urgence: 'Haute', description: "Porte d'entrée difficile à fermer.", reporter: 'nashtravels@gmail.com' },
  { periodeStart: '2025-09-06', periodeEnd: '2025-09-06', logement: 'logement2', urgence: 'Moyenne', description: "Télévision ne fonctionne pas.", reporter: 'nashtravels@gmail.com' }
];

const messages = [
  { subject: "Question sur réservation", text: "Bonjour, j'ai une question sur ma réservation.", sender: "nashtravels@gmail.com", role: "traveler", recipient: "naijeria@gmail.com", participants: ["nashtravels@gmail.com", "naijeria@gmail.com"] },
  { subject: "Confirmation de réservation", text: "Votre réservation est confirmée.", sender: "naijeria@gmail.com", role: "admin", recipient: "nashtravels@gmail.com", participants: ["naijeria@gmail.com", "nashtravels@gmail.com"] },
  { subject: "Avis sur le logement", text: "Le logement est très agréable, merci !", sender: "nashtravels@gmail.com", role: "traveler", recipient: "nashowns@gmail.com", participants: ["nashtravels@gmail.com", "nashowns@gmail.com"] },
  { subject: "Remerciement", text: "Merci pour votre retour, profitez bien de votre séjour.", sender: "nashowns@gmail.com", role: "owner", recipient: "nashtravels@gmail.com", participants: ["nashowns@gmail.com", "nashtravels@gmail.com"] },
  { subject: "Assistance", text: "N'hésitez pas à nous contacter pour toute demande.", sender: "naijeria@gmail.com", role: "admin", recipient: "nashtravels@gmail.com", participants: ["naijeria@gmail.com", "nashtravels@gmail.com"] }
];

const sessions = [
  { userEmail: 'nashtravels@gmail.com', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', ip: '192.168.1.10', timestamp: new Date('2025-09-01T10:00:00Z') },
  { userEmail: 'nashtravels@gmail.com', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', ip: '192.168.1.11', timestamp: new Date('2025-09-02T12:30:00Z') },
  { userEmail: 'nashtravels@gmail.com', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', ip: '192.168.1.12', timestamp: new Date('2025-09-03T09:15:00Z') }
];

const reservations = [
  {
    logement: 'Villa Azure',
    dateArrivee: new Date('2025-09-10'),
    dateDepart: new Date('2025-09-15'),
    status: 'confirmée',
  },
  {
    logement: 'Chalet Montagne',
    dateArrivee: new Date('2025-10-01'),
    dateDepart: new Date('2025-10-07'),
    status: 'en attente',
  }
];

// --- SEED FUNCTIONS ---
async function seedUsers() {
  for (const user of users) {
    try {
      const userRecord = await auth.createUser({ email: user.email, password: user.password });
      await db.collection('users').doc(userRecord.uid).set({ email: user.email, role: user.role, prenom: user.prenom, nom: user.nom, status: user.status });
      console.log(`Seeded user: ${user.email} (${user.role})`);
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        console.log(`User already exists: ${user.email}`);
      } else {
        console.error(`Error seeding user ${user.email}:`, err);
      }
    }
  }
}

      async function seedProperties() {
        let ownerUid = '', providerUid = '';
        let ownerName = '', providerName = '';
        try {
          const ownerRecord = await auth.getUserByEmail('nashowns@gmail.com');
          ownerUid = ownerRecord.uid;
          ownerName = ownerRecord.displayName || 'Nash Owns';
          const providerRecord = await auth.getUserByEmail('nashprovides@gmail.com');
          providerUid = providerRecord.uid;
          providerName = providerRecord.displayName || 'Nash Provides';
        } catch (e) {
          console.error('Could not find owner/provider UID:', e);
          return;
        }
        for (const property of properties) {
          await db.collection('properties').add({
            name: property.name,
            address: property.address,
            ownerId: ownerUid,
            ownerName,
            providerId: providerUid,
            providerName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Seeded property: ${property.name}`);
        }
      }

      async function seedIncidents() {
        let travelerUid = '', travelerEmail = '';
        try {
          const userRecord = await auth.getUserByEmail('nashtravels@gmail.com');
          travelerUid = userRecord.uid;
          travelerEmail = userRecord.email;
        } catch (e) {
          console.error('Could not find traveler UID:', e);
          return;
        }
        for (const incident of incidents) {
          await db.collection('incidents').add({
            ...incident,
            reporterId: travelerUid,
            reporter: travelerEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            photoUrl: ''
          });
          console.log(`Seeded incident: ${incident.description}`);
        }
      }

      async function seedMessages() {
        for (const msg of messages) {
          await db.collection('messages').add({
            ...msg,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Seeded message: ${msg.text}`);
        }
      }

      async function seedSessions() {
        let travelerUid = '';
        try {
          const userRecord = await auth.getUserByEmail('nashtravels@gmail.com');
          travelerUid = userRecord.uid;
        } catch (e) {
          console.error('Could not find traveler UID:', e);
          return;
        }
        for (const session of sessions) {
          await db.collection('users').doc(travelerUid).collection('devices').add({
            ...session,
            userId: travelerUid,
            timestamp: admin.firestore.Timestamp.fromDate(session.timestamp),
          });
          console.log(`Seeded session for: ${session.userEmail}`);
        }
      }

      async function seedReservations() {
        let travelerUid = '', travelerEmail = '';
        try {
          const userRecord = await auth.getUserByEmail('nashtravels@gmail.com');
          travelerUid = userRecord.uid;
          travelerEmail = userRecord.email;
        } catch (e) {
          console.error('Could not find traveler UID:', e);
          return;
        }
        for (const reservation of reservations) {
          await db.collection('reservations').add({
            ...reservation,
            travelerId: travelerUid,
            client: travelerEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Seeded reservation for: ${reservation.logement}`);
        }
      }

      async function main() {
        await seedUsers();
        await seedProperties();
        await seedIncidents();
        await seedMessages();
        await seedSessions();
        await seedReservations();
        process.exit();
      }

main();