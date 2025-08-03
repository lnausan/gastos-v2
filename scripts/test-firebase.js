// Script de prueba para verificar Firebase
// Ejecutar con: node scripts/test-firebase.js

const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('Configuración de Firebase:', {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey
});

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFirebaseConnection() {
  try {
    console.log('🔐 Autenticando usuario anónimo...');
    
    // Autenticar usuario anónimo
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    
    console.log('✅ Usuario autenticado:', user.uid);
    
    console.log('📖 Probando conexión con Firestore...');
    
    // Intentar leer una colección
    const transactionsRef = collection(db, 'transactions');
    const snapshot = await getDocs(transactionsRef);
    
    console.log('✅ Conexión exitosa!');
    console.log(`Documentos encontrados: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('Primer documento:', snapshot.docs[0].data());
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('🔒 Error de permisos detectado');
      console.log('Las reglas de Firestore pueden estar muy restrictivas');
      console.log('Necesitas actualizar las reglas en la consola de Firebase');
    }
  }
}

testFirebaseConnection(); 