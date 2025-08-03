import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Verificar si Firebase está configurado
const isFirebaseEnabled = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
)

// console.log('Firebase config check:', {
//   apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   isFirebaseEnabled
// })

let app: any = null
let auth: any = null
let db: any = null

if (isFirebaseEnabled) {
  // console.log('Inicializando Firebase...')
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  }

  // console.log('Configuración de Firebase:', {
  //   projectId: firebaseConfig.projectId,
  //   authDomain: firebaseConfig.authDomain
  // })

  // Initialize Firebase
  app = initializeApp(firebaseConfig)

  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app)

  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app)
  
  // console.log('Firebase inicializado correctamente:', { hasApp: !!app, hasAuth: !!auth, hasDb: !!db })
} else {
  // console.log('Firebase no está configurado. Usando modo local.')
}

// console.log('Exportando Firebase:', { auth: !!auth, db: !!db })

export { auth, db }
export default app 