// Script para configurar índices de Firestore
// Ejecutar con: node scripts/setup-indexes.js

const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function setupIndexes() {
  try {
    console.log('🔧 Configurando índices de Firestore...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado');
    console.log('📋 Project ID:', firebaseConfig.projectId);
    
    console.log('\n📝 Índices necesarios para Gastos V2:');
    console.log('');
    console.log('1. Collection: transactions');
    console.log('   - userId (ASC) + date (DESC)');
    console.log('   - userId (ASC) + date (ASC) + date (DESC)');
    console.log('');
    console.log('2. Collection: dollarValues');
    console.log('   - userId (ASC) + month (DESC)');
    console.log('   - userId (ASC) + month (ASC)');
    console.log('');
    
    console.log('🔗 Enlaces para crear índices:');
    console.log('');
    console.log('Para transacciones (userId + date DESC):');
    console.log(`https://console.firebase.google.com/v1/r/project/${firebaseConfig.projectId}/firestore/indexes?create_composite=ClRwcm9qZWN0cy9nYXN0b3MtdjItNDk4NDEvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RyYW5zYWN0aW9ucy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoJCgVkYXRlEAIaDAoIX19uYW1lX18QAg`);
    console.log('');
    console.log('Para valores del dólar (userId + month DESC):');
    console.log(`https://console.firebase.google.com/v1/r/project/${firebaseConfig.projectId}/firestore/indexes?create_composite=ClRwcm9qZWN0cy9nYXN0b3MtdjItNDk4NDEvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2RvbGxhclZhbHVlcy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoJCgVtb250aBACGgwKCF9fbmFtZV9fEAI`);
    console.log('');
    
    console.log('📋 Pasos para configurar índices:');
    console.log('1. Haz clic en los enlaces de arriba');
    console.log('2. En Firebase Console, haz clic en "Create index"');
    console.log('3. Espera a que los índices se creen (puede tomar 2-3 minutos)');
    console.log('4. Recarga la aplicación');
    console.log('');
    
    console.log('🎉 Una vez creados los índices, la aplicación funcionará correctamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Solución de problemas:');
    console.log('1. Verifica que las variables de entorno estén configuradas');
    console.log('2. Asegúrate de que Firebase esté habilitado');
    console.log('3. Crea los índices manualmente en Firebase Console');
  }
}

// Cargar variables de entorno
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  console.log('⚠️  No se encontró .env.local, usando variables del sistema');
}

setupIndexes(); 