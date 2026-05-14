import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { adminDb } from './firebaseAdmin';

/**
 * SERVER-SIDE USER OPERATIONS (using Admin SDK when available)
 */

export async function getUserByEmailServer(email) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    const querySnapshot = await adminDb.collection('users').where('email', '==', email).get();
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by email (server):', error?.message);
    throw error;
  }
}

export async function createUserServer(userData) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    const docRef = await adminDb.collection('users').add({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...userData };
  } catch (error) {
    console.error('Error creating user (server):', error?.message);
    throw error;
  }
}

export async function getUserByIdServer(id) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    const docSnap = await adminDb.collection('users').doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by ID (server):', error?.message);
    throw error;
  }
}

export async function getUsersServer(role = null) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    let queryRef = adminDb.collection('users');
    if (role) queryRef = queryRef.where('role', '==', role);

    let querySnapshot;
    try {
      querySnapshot = await queryRef.orderBy('createdAt', 'desc').get();
    } catch (orderError) {
      console.warn('Admin getUsers orderBy failed, querying without ordering:', orderError?.message);
      querySnapshot = await queryRef.get();
    }

    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error('Error fetching users (server):', error?.message);
    throw error;
  }
}

export async function updateUserServer(id, userData) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    await adminDb.collection('users').doc(id).update({
      ...userData,
      updatedAt: new Date(),
    });
    return { id, ...userData };
  } catch (error) {
    console.error('Error updating user (server):', error?.message);
    throw error;
  }
}

export async function deleteUserServer(id) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    await adminDb.collection('users').doc(id).delete();
    return { id };
  } catch (error) {
    console.error('Error deleting user (server):', error?.message);
    throw error;
  }
}

/**
 * VENUES OPERATIONS
 */

export async function createVenue(venueData) {
  try {
    const docRef = await addDoc(collection(db, 'venues'), {
      ...venueData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...venueData };
  } catch (error) {
    console.error('Error creating venue:', error);
    throw error;
  }
}

export async function getVenues() {
  try {
    const q = query(collection(db, 'venues'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }
}

export async function getVenueById(id) {
  try {
    const docRef = doc(db, 'venues', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching venue:', error);
    throw error;
  }
}

export async function updateVenue(id, venueData) {
  try {
    const docRef = doc(db, 'venues', id);
    await updateDoc(docRef, {
      ...venueData,
      updatedAt: Timestamp.now(),
    });
    return { id, ...venueData };
  } catch (error) {
    console.error('Error updating venue:', error);
    throw error;
  }
}

export async function deleteVenue(id) {
  try {
    await deleteDoc(doc(db, 'venues', id));
    return { id };
  } catch (error) {
    console.error('Error deleting venue:', error);
    throw error;
  }
}

/**
 * CONFLICTS OPERATIONS
 */

export async function createConflict(conflictData) {
  try {
    const docRef = await addDoc(collection(db, 'conflicts'), {
      ...conflictData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...conflictData };
  } catch (error) {
    console.error('Error creating conflict:', error);
    throw error;
  }
}

export async function createConflictServer(conflictData) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    const docRef = await adminDb.collection('conflicts').add({
      ...conflictData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...conflictData };
  } catch (error) {
    console.error('Error creating conflict (server):', error);
    throw error;
  }
}

export async function getConflicts(filters = {}) {
  try {
    let queryConstraints = [orderBy('createdAt', 'desc')];

    if (filters.status) {
      queryConstraints.push(where('status', '==', filters.status));
    }
    if (filters.reportedBy) {
      queryConstraints.push(where('reportedBy', '==', filters.reportedBy));
    }

    const q = query(collection(db, 'conflicts'), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    throw error;
  }
}

export async function getConflictsServer(filters = {}) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }

  try {
    let queryRef = adminDb.collection('conflicts').orderBy('createdAt', 'desc');

    if (filters.status) {
      queryRef = queryRef.where('status', '==', filters.status);
    }
    if (filters.reportedBy) {
      queryRef = queryRef.where('reportedBy', '==', filters.reportedBy);
    }

    const querySnapshot = await queryRef.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching conflicts (server):', error);
    throw error;
  }
}

export async function getConflictById(id) {
  try {
    const docRef = doc(db, 'conflicts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching conflict:', error);
    throw error;
  }
}

export async function getConflictByIdServer(id) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    const docSnap = await adminDb.collection('conflicts').doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching conflict (server):', error);
    throw error;
  }
}

export async function updateConflict(id, conflictData) {
  try {
    const docRef = doc(db, 'conflicts', id);
    await updateDoc(docRef, {
      ...conflictData,
      updatedAt: Timestamp.now(),
    });
    return { id, ...conflictData };
  } catch (error) {
    console.error('Error updating conflict:', error);
    throw error;
  }
}

export async function updateConflictServer(id, conflictData) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    await adminDb.collection('conflicts').doc(id).update({
      ...conflictData,
      updatedAt: new Date(),
    });
    return { id, ...conflictData };
  } catch (error) {
    console.error('Error updating conflict (server):', error);
    throw error;
  }
}

export async function deleteConflict(id) {
  try {
    await deleteDoc(doc(db, 'conflicts', id));
    return { id };
  } catch (error) {
    console.error('Error deleting conflict:', error);
    throw error;
  }
}

export async function deleteConflictServer(id) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    await adminDb.collection('conflicts').doc(id).delete();
    return { id };
  } catch (error) {
    console.error('Error deleting conflict (server):', error);
    throw error;
  }
}

/**
 * USERS OPERATIONS
 */

export async function createUser(userData) {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...userData };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function createClient(clientData) {
  try {
    const clientUser = {
      ...clientData,
      role: 'client',
    };
    return await createUser(clientUser);
  } catch (error) {
    console.error('Error creating client user:', error);
    throw error;
  }
}

export async function getClients() {
  return getUsers('client');
}

export async function getUserByEmail(email) {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

export async function getUserById(id) {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function getUsers(role = null) {
  try {
    const constraints = [];
    if (role) {
      constraints.push(where('role', '==', role));
    }

    let q;
    try {
      const orderConstraints = [orderBy('createdAt', 'desc')];
      q = query(collection(db, 'users'), ...orderConstraints, ...constraints);
    } catch (orderError) {
      console.warn('Order by createdAt failed, querying without ordering:', orderError?.message);
      q = constraints.length ? query(collection(db, 'users'), ...constraints) : collection(db, 'users');
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function updateUser(id, userData) {
  try {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    });
    return { id, ...userData };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id) {
  try {
    await deleteDoc(doc(db, 'users', id));
    return { id };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * MEDIATOR ASSIGNMENTS OPERATIONS
 */

export async function createAssignment(assignmentData) {
  try {
    const docRef = await addDoc(collection(db, 'assignments'), {
      ...assignmentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...assignmentData };
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
}

export async function getAssignments(filters = {}) {
  try {
    let queryConstraints = [orderBy('createdAt', 'desc')];

    if (filters.conflictId) {
      queryConstraints.push(where('conflictId', '==', filters.conflictId));
    }
    if (filters.mediatorId) {
      queryConstraints.push(where('mediatorId', '==', filters.mediatorId));
    }
    if (filters.status) {
      queryConstraints.push(where('status', '==', filters.status));
    }

    const q = query(collection(db, 'assignments'), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
}

export async function getAssignmentById(id) {
  try {
    const docRef = doc(db, 'assignments', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    throw error;
  }
}

export async function updateAssignment(id, assignmentData) {
  try {
    const docRef = doc(db, 'assignments', id);
    await updateDoc(docRef, {
      ...assignmentData,
      updatedAt: Timestamp.now(),
    });
    return { id, ...assignmentData };
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
}

export async function deleteAssignment(id) {
  try {
    await deleteDoc(doc(db, 'assignments', id));
    return { id };
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
}

/**
 * FEEDBACK OPERATIONS
 */

export async function createFeedback(feedbackData) {
  try {
    const docRef = await addDoc(collection(db, 'feedback'), {
      ...feedbackData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...feedbackData };
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
}

export async function getFeedback(filters = {}) {
  try {
    let queryConstraints = [orderBy('createdAt', 'desc')];

    if (filters.type) {
      queryConstraints.push(where('feedbackType', '==', filters.type));
    }
    if (filters.submittedBy) {
      queryConstraints.push(where('submittedBy', '==', filters.submittedBy));
    }

    const q = query(collection(db, 'feedback'), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
}

export async function getFeedbackById(id) {
  try {
    const docRef = doc(db, 'feedback', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
}

export async function updateFeedback(id, feedbackData) {
  try {
    const docRef = doc(db, 'feedback', id);
    await updateDoc(docRef, {
      ...feedbackData,
      updatedAt: Timestamp.now(),
    });
    return { id, ...feedbackData };
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
}

export async function deleteFeedback(id) {
  try {
    await deleteDoc(doc(db, 'feedback', id));
    return { id };
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
}

/**
 * SERVER-SIDE FEEDBACK OPERATIONS (using Admin SDK)
 */

export async function createFeedbackServer(feedbackData) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    const docRef = await adminDb.collection('feedback').add({
      ...feedbackData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...feedbackData };
  } catch (error) {
    console.error('Error creating feedback (server):', error?.message);
    throw error;
  }
}

export async function getFeedbackServer(filters = {}) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    let queryRef = adminDb.collection('feedback').orderBy('createdAt', 'desc');

    if (filters.type) {
      queryRef = queryRef.where('feedbackType', '==', filters.type);
    }
    if (filters.submittedBy) {
      queryRef = queryRef.where('submittedBy', '==', filters.submittedBy);
    }

    const querySnapshot = await queryRef.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching feedback (server):', error?.message);
    throw error;
  }
}

export async function getMeetings(filters = {}) {
  try {
    let queryConstraints = [orderBy('createdAt', 'desc')];

    if (filters.reportId) {
      queryConstraints.push(where('reportId', '==', filters.reportId));
    }
    if (filters.scheduledBy) {
      queryConstraints.push(where('scheduledBy', '==', filters.scheduledBy));
    }
    if (filters.status) {
      queryConstraints.push(where('status', '==', filters.status));
    }

    const q = query(collection(db, 'meetings'), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
}

export async function getMeetingById(id) {
  try {
    const docRef = doc(db, 'meetings', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching meeting:', error);
    throw error;
  }
}

export async function updateMeeting(id, meetingData) {
  try {
    const docRef = doc(db, 'meetings', id);
    await updateDoc(docRef, {
      ...meetingData,
      updatedAt: Timestamp.now(),
    });
    return { id, ...meetingData };
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
}

export async function deleteMeeting(id) {
  try {
    await deleteDoc(doc(db, 'meetings', id));
    return { id };
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
}

/**
 * SERVER-SIDE MEETING OPERATIONS (using Admin SDK)
 */

export async function createMeetingServer(meetingData) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    const docRef = await adminDb.collection('meetings').add({
      ...meetingData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...meetingData };
  } catch (error) {
    console.error('Error creating meeting (server):', error?.message);
    throw error;
  }
}

export async function getMeetingsServer(filters = {}) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    let queryRef = adminDb.collection('meetings').orderBy('createdAt', 'desc');

    if (filters.reportId) {
      queryRef = queryRef.where('reportId', '==', filters.reportId);
    }
    if (filters.scheduledBy) {
      queryRef = queryRef.where('scheduledBy', '==', filters.scheduledBy);
    }
    if (filters.status) {
      queryRef = queryRef.where('status', '==', filters.status);
    }

    const querySnapshot = await queryRef.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching meetings (server):', error?.message);
    throw error;
  }
}

export async function getMeetingByIdServer(id) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    const docSnap = await adminDb.collection('meetings').doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching meeting (server):', error);
    throw error;
  }
}

export async function updateMeetingServer(id, meetingData) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    await adminDb.collection('meetings').doc(id).update({
      ...meetingData,
      updatedAt: new Date(),
    });
    return { id, ...meetingData };
  } catch (error) {
    console.error('Error updating meeting (server):', error);
    throw error;
  }
}

export async function deleteMeetingServer(id) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    await adminDb.collection('meetings').doc(id).delete();
    return { id };
  } catch (error) {
    console.error('Error deleting meeting (server):', error);
    throw error;
  }
}

export async function getAssignmentByIdServer(id) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    const docSnap = await adminDb.collection('assignments').doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching assignment by ID (server):', error?.message);
    throw error;
  }
}

export async function updateAssignmentServer(id, assignmentData) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    await adminDb.collection('assignments').doc(id).update({
      ...assignmentData,
      updatedAt: new Date(),
    });
    return { id, ...assignmentData };
  } catch (error) {
    console.error('Error updating assignment (server):', error?.message);
    throw error;
  }
}

export async function deleteAssignmentServer(id) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    await adminDb.collection('assignments').doc(id).delete();
    return { id };
  } catch (error) {
    console.error('Error deleting assignment (server):', error?.message);
    throw error;
  }
}

export async function getAssignmentsServer(filters = {}) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    let queryRef = adminDb.collection('assignments').orderBy('createdAt', 'desc');

    if (filters.conflictId) {
      queryRef = queryRef.where('conflictId', '==', filters.conflictId);
    }
    if (filters.mediatorId) {
      queryRef = queryRef.where('mediatorId', '==', filters.mediatorId);
    }
    if (filters.status) {
      queryRef = queryRef.where('status', '==', filters.status);
    }

    const querySnapshot = await queryRef.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching assignments (server):', error?.message);
    throw error;
  }
}

export async function createAssignmentServer(assignmentData) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_ADMIN_SDK_* environment variables.');
  }
  try {
    const docRef = await adminDb.collection('assignments').add({
      ...assignmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...assignmentData };
  } catch (error) {
    console.error('Error creating assignment (server):', error?.message);
    throw error;
  }
}
