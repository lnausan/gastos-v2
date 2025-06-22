#!/bin/bash

echo "🚀 Configurando Gastos V2 con autenticación real y guardado de datos..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm primero."
    exit 1
fi

echo "✅ Node.js y npm están instalados"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo ""
echo "🔐 Configuración de Firebase requerida:"
echo ""
echo "1. Ve a https://console.firebase.google.com/"
echo "2. Crea un nuevo proyecto o selecciona uno existente"
echo "3. Habilita Authentication > Sign-in method > Email/Password"
echo "4. Crea Firestore Database > Start in test mode"
echo "5. Ve a Project Settings > General > Add app > Web"
echo "6. Copia las credenciales de configuración"
echo ""
echo "7. Configura las reglas de Firestore:"
echo "   - Ve a Firestore Database > Rules"
echo "   - Reemplaza las reglas con el contenido de firestore.rules"
echo "   - Haz clic en 'Publish'"
echo ""
echo "8. Crea un archivo .env.local en la raíz del proyecto con:"
echo ""
echo "NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui"
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto_id.firebaseapp.com"
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id"
echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto_id.appspot.com"
echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id"
echo "NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id"
echo ""
echo "9. Ejecuta: npm run dev"
echo ""
echo "🎉 ¡Listo! Tu aplicación estará disponible en http://localhost:3000"
echo ""
echo "💾 Funcionalidades de guardado:"
echo "   ✅ Transacciones se guardan automáticamente en Firebase"
echo "   ✅ Valores del dólar se sincronizan en la nube"
echo "   ✅ Datos accesibles desde cualquier dispositivo"
echo "   ✅ Respaldo automático en la nube"
echo ""
echo "📝 Nota: La aplicación ahora requiere credenciales reales para acceder."
echo "   Los usuarios deberán crear una cuenta o iniciar sesión para usar la app."
echo "   Todos los datos se guardarán automáticamente en Firebase Firestore." 