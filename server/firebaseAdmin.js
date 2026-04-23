import admin from 'firebase-admin'
import { getFirebaseServiceAccount } from './config.js'

let appInstance = null
let firestoreInstance = null

function getAdminApp() {
  if (!appInstance) {
    appInstance = admin.apps[0]
      ?? admin.initializeApp({
        credential: admin.credential.cert(getFirebaseServiceAccount()),
      })
  }

  return appInstance
}

export function getAdminAuth() {
  return getAdminApp().auth()
}

export function getFirestore() {
  if (!firestoreInstance) {
    firestoreInstance = getAdminApp().firestore()
  }

  return firestoreInstance
}
