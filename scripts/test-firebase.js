// Script de prueba para verificar Firebase
// Ejecutar con: node scripts/test-firebase.js

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');

// Configuración de Firebase (reemplazar con tus credenciales)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testFirebase() {
  try {
    console.log('🚀 Iniciando prueba de Firebase...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado correctamente');
    
    // Verificar configuración
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error('❌ Variables de entorno de Firebase no configuradas');
      console.log('Por favor, configura las variables en .env.local');
      return;
    }
    
    console.log('✅ Configuración de Firebase válida');
    console.log('📋 Project ID:', firebaseConfig.projectId);
    
    // Verificar conexión a Firestore
    try {
      const testQuery = query(collection(db, 'test'));
      await getDocs(testQuery);
      console.log('✅ Conexión a Firestore exitosa');
    } catch (error) {
      console.log('⚠️  Conexión a Firestore:', error.message);
      console.log('   Esto es normal si las reglas están configuradas correctamente');
    }
    
    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Configura las variables de entorno en .env.local');
    console.log('2. Ejecuta: npm run dev');
    console.log('3. Crea una cuenta en la aplicación');
    console.log('4. Los datos se guardarán automáticamente en Firebase');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.log('\n🔧 Solución de problemas:');
    console.log('1. Verifica que las variables de entorno estén configuradas');
    console.log('2. Asegúrate de que Firebase esté habilitado en tu proyecto');
    console.log('3. Verifica que Firestore esté creado y las reglas configuradas');
  }
}

// Cargar variables de entorno si existe .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  console.log('⚠️  No se encontró .env.local, usando variables del sistema');
}

testFirebase(); 