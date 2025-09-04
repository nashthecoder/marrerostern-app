
const express = require('express');
const router = express.Router();
const { db } = require('./firebase-admin');

// Traveler login by reservation number
router.post('/traveler/login', async (req, res) => {
  const { reservationNumber } = req.body;
  try {
    const snap = await db.collection('reservations').where('reservationNumber', '==', reservationNumber).limit(1).get();
    if (snap.empty) return res.status(404).json({ success: false, message: 'Reservation not found' });
    // In production, issue JWT/session here
    res.json({ success: true, reservationId: snap.docs[0].id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Traveler check-in
router.post('/traveler/checkin', async (req, res) => {
  const { reservationId, ...form } = req.body;
  try {
    await db.collection('checkins').add({ reservationId, ...form, createdAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Welcome booklet
router.get('/traveler/booklet', async (req, res) => {
  const { reservationId } = req.query;
  try {
    const reservation = await db.collection('reservations').doc(reservationId).get();
    if (!reservation.exists) return res.status(404).send('Not found');
    const { propertyId } = reservation.data();
    const property = await db.collection('properties').doc(propertyId).get();
    if (!property.exists) return res.status(404).send('No booklet');
    res.send(property.data().welcomeBookletHtml || '<h1>No booklet available</h1>');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Owner incident report
router.post('/owner/incident-report', async (req, res) => {
  try {
    await db.collection('incidents').add({ ...req.body, createdAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Traveler review
router.post('/traveler/review', async (req, res) => {
  const { reservationId, review } = req.body;
  try {
    await db.collection('reviews').add({ reservationId, review, createdAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
