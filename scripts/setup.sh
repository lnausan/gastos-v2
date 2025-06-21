#!/bin/bash

echo "🚀 Configurando Gastos V2 con Firebase, Vercel y Git"
echo "=================================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar si Git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado. Por favor instala Git primero."
    exit 1
fi

echo "✅ Node.js y Git están instalados"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cat > .env.local << EOF
# Firebase Configuration
# Reemplaza estos valores con tus credenciales de Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
EOF
    echo "✅ Archivo .env.local creado"
    echo "⚠️  IMPORTANTE: Edita .env.local con tus credenciales de Firebase"
else
    echo "✅ Archivo .env.local ya existe"
fi

# Verificar si Git está inicializado
if [ ! -d .git ]; then
    echo "🔧 Inicializando repositorio Git..."
    git init
    echo "✅ Repositorio Git inicializado"
else
    echo "✅ Repositorio Git ya está inicializado"
fi

# Verificar si hay commits
if ! git log --oneline -1 &> /dev/null; then
    echo "📝 Haciendo commit inicial..."
    git add .
    git commit -m "Initial commit: Firebase integration"
    echo "✅ Commit inicial realizado"
else
    echo "✅ Ya hay commits en el repositorio"
fi

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a Firebase Console y crea un proyecto"
echo "2. Habilita Authentication (Email/Password)"
echo "3. Crea una base de datos Firestore"
echo "4. Obtén las credenciales y edita .env.local"
echo "5. Ejecuta 'npm run dev' para iniciar el servidor"
echo "6. Ve a Vercel.com y conecta tu repositorio"
echo ""
echo "📚 Consulta el README.md para instrucciones detalladas"
echo ""
echo "¡Buena suerte! 🚀" 