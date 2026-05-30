import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "./firebase";

const DEFAULT_USER_DATA = {
  visited: [],
  wishlist: [],
};

export function requireFirebaseConfig() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env.local and add your project credentials."
    );
  }
}

export async function signUp(email, password) {
  requireFirebaseConfig();
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", credential.user.uid), {
    ...DEFAULT_USER_DATA,
    email: credential.user.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return credential.user;
}

export async function signIn(email, password) {
  requireFirebaseConfig();
  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logOut() {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export async function loadUserData(uid) {
  const db = getFirebaseDb();
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    await setDoc(doc(db, "users", uid), {
      ...DEFAULT_USER_DATA,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ...DEFAULT_USER_DATA };
  }

  const data = snapshot.data();
  return {
    visited: Array.isArray(data.visited) ? data.visited : [],
    wishlist: Array.isArray(data.wishlist) ? data.wishlist : [],
  };
}

export async function saveUserData(uid, data) {
  const db = getFirebaseDb();
  await setDoc(
    doc(db, "users", uid),
    {
      visited: data.visited,
      wishlist: data.wishlist,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
