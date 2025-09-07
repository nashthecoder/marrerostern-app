// src/utils/autoTracker.js
// Automated tracking utility for user actions (audit + session)
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Tracks a user action automatically in both audit_logs and session/devices if relevant.
 * @param {Object} params
 * @param {string} params.type - 'Audit Log' or 'Session'
 * @param {string} params.action - Action/Event name (e.g., 'login', 'logout', 'create_user')
 * @param {string} [params.resource] - Resource/User Agent
 * @param {string|Object} [params.details] - Details/IP or extra info
 * @param {string} [params.userId] - User ID (defaults to current user)
 * @param {boolean} [params.session] - If true, also logs to devices collection
 */
export async function autoTrack({ type, action, resource = '', details = '', userId = null, session = false }) {
  try {
    const db = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const logUserId = userId || (currentUser ? currentUser.uid : 'system');
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : resource || '';
    const ip = details && typeof details === 'string' ? details : '';
    // Write to audit_logs
    await addDoc(collection(db, 'audit_logs'), {
      userId: logUserId,
      type,
      action,
      resource: resource || userAgent,
      details: details || ip,
      timestamp: serverTimestamp(),
    });
    // Optionally write to devices (session)
    if (session && logUserId && logUserId !== 'system') {
      await addDoc(collection(db, `users/${logUserId}/devices`), {
        event: action,
        userAgent,
        ip,
        timestamp: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Failed to auto-track event:', error);
  }
}

/**
 * Helper to track login event (audit + session)
 */
export async function trackLogin(userId, ip = '') {
  await autoTrack({
    type: 'Session',
    action: 'login',
    userId,
    resource: window.navigator.userAgent,
    details: ip,
    session: true,
  });
}

/**
 * Helper to track logout event (audit + session)
 */
export async function trackLogout(userId, ip = '') {
  await autoTrack({
    type: 'Session',
    action: 'logout',
    userId,
    resource: window.navigator.userAgent,
    details: ip,
    session: true,
  });
}
