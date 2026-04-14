import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// ─── Generic CRUD helpers ────────────────────────────────────────────────────

export async function createEntity(col, data) {
  const ref = await addDoc(collection(db, col), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateEntity(col, id, data) {
  await updateDoc(doc(db, col, id), data)
}

export async function deleteEntity(col, id) {
  await deleteDoc(doc(db, col, id))
}

export function subscribeToEntities(col, callback) {
  const q = query(collection(db, col), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(docs)
  })
}

export { writeBatch, doc as firestoreDoc } from 'firebase/firestore'
