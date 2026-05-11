import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCr3sBNeeJzrD59NjADGrYVv317fPqax0s',
  authDomain: 'e-kiitx.firebaseapp.com',
  projectId: 'e-kiitx',
  storageBucket: 'e-kiitx.firebasestorage.app',
  messagingSenderId: '84188150509',
  appId: '1:84188150509:web:c697ed3720ab9f32612ae4',
  measurementId: 'G-EEJ51QG16Q',
}

const app = initializeApp(firebaseConfig)
const analyticsEnabled = import.meta.env.VITE_ENABLE_FIREBASE_ANALYTICS === 'true'

if (analyticsEnabled && typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app)
      }
    })
    .catch(() => {
      // Ignore analytics on unsupported environments.
    })
}

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
