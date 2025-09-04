// src/utils/audit.js
// Utility to log audit events to Firestore
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Logs an audit event to the 'audit_logs' collection in Firestore.
 * @param {string} action - The action performed (e.g., 'create_user', 'update_reservation').
 * @param {string} resource - The resource affected (e.g., 'users', 'reservations').
 * @param {object} details - Additional details about the event (optional).
 * @param {string} [userId] - The user performing the action (optional, defaults to current user).
 */
export async function logAuditEvent(action, resource, details = {}, userId = null) {
  try {
    const db = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const logUserId = userId || (currentUser ? currentUser.uid : 'system');
    await addDoc(collection(db, 'audit_logs'), {
      userId: logUserId,
      action,
      resource,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    // Optionally handle/log error
    console.error('Failed to log audit event:', error);
  }
}
