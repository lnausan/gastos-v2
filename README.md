# Gastos V2 - Aplicación de Gestión de Gastos

Una aplicación web para gestionar ingresos y gastos personales, construida con Next.js, Firebase y TypeScript.

## 🚀 Características

- 📊 Dashboard con resumen mensual
- 💰 Gestión de ingresos y gastos
- 📈 Gráficos y estadísticas
- 📱 Diseño responsive
- 🌙 Modo oscuro/claro
- 🔐 **Autenticación real con Firebase** (Email/Password)
- ☁️ Sincronización en la nube
- 🛡️ Rutas protegidas con AuthGuard

## 🔐 Autenticación

La aplicación ahora requiere **credenciales reales** para acceder. Los usuarios pueden:

- **Crear una cuenta**: Registrarse con email y contraseña
- **Iniciar sesión**: Usar credenciales existentes
- **Cerrar sesión**: Salir de la aplicación de forma segura
- **Protección de rutas**: Todas las páginas están protegidas y redirigen a login si no hay sesión activa

## 💾 Guardado de Datos

La aplicación guarda automáticamente todos los datos en **Firebase Firestore**:

### 📊 Datos que se guardan:
- **Transacciones**: Ingresos y gastos con fecha, categoría, descripción y monto
- **Valores del dólar**: Cotización mensual para conversiones
- **Datos del usuario**: Información de autenticación y preferencias

### 🔄 Sincronización:
- **Tiempo real**: Los datos se sincronizan automáticamente con Firebase
- **Multi-dispositivo**: Accede a tus datos desde cualquier dispositivo
- **Respaldo automático**: Tus datos están seguros en la nube
- **Modo offline**: Los datos se guardan localmente si no hay conexión

### 🛡️ Seguridad:
- **Datos privados**: Cada usuario solo ve sus propios datos
- **Autenticación requerida**: Solo usuarios logueados pueden acceder
- **Reglas de Firestore**: Protección a nivel de base de datos

## 🔧 Solución de Problemas

### Error de Índices de Firestore

Si ves este error:
```
"The query requires an index. You can create it here: https://console.firebase.google.com/..."
```

**Solución rápida:**
1. Ejecuta el script de configuración de índices:
   ```bash
   node scripts/setup-indexes.js
   ```
2. Haz clic en los enlaces que aparecen en la consola
3. En Firebase Console, haz clic en "Create index"
4. Espera 2-3 minutos a que se creen los índices
5. Recarga la aplicación

**Solución manual:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a Firestore Database > Indexes
4. Haz clic en "Create index"
5. Crea estos índices:

**Para transacciones:**
- Collection: `transactions`
- Fields: `userId` (Ascending) + `date` (Descending)

**Para valores del dólar:**
- Collection: `dollarValues`
- Fields: `userId` (Ascending) + `month` (Descending)

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth, Firestore)
- **Deploy**: Vercel
- **Control de versiones**: Git

## 📋 Configuración Paso a Paso

### 1. Configurar Firebase

#### 1.1 Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear proyecto"
3. Dale un nombre a tu proyecto (ej: "gastos-v2")
4. Sigue los pasos del asistente
5. Una vez creado, ve a la configuración del proyecto

#### 1.2 Configurar Authentication

1. En el panel de Firebase, ve a "Authentication"
2. Haz clic en "Get started"
3. En la pestaña "Sign-in method", habilita "Email/Password"
4. Guarda los cambios

#### 1.3 Configurar Firestore Database

1. Ve a "Firestore Database"
2. Haz clic en "Create database"
3. Selecciona "Start in test mode" (para desarrollo)
4. Elige la ubicación más cercana
5. Haz clic en "Done"

#### 1.4 Configurar Reglas de Firestore

1. En Firestore Database, ve a la pestaña "Rules"
2. Reemplaza las reglas existentes con las reglas del archivo `firestore.rules`
3. Haz clic en "Publish"

**Reglas de Firestore (firestore.rules):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para transacciones
    match /transactions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Reglas para valores del dólar
    match /dollarValues/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### 1.5 Obtener credenciales

1. Ve a la configuración del proyecto (ícono de engranaje)
2. En "General", haz clic en "Add app"
3. Selecciona "Web" y dale un nombre
4. Copia la configuración que aparece

### 2. Configurar Variables de Entorno

#### 2.1 Archivo .env.local

Crea un archivo `.env.local` en la raíz del proyecto con las credenciales de Firebase:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 3. Configurar Git y GitHub

#### 3.1 Inicializar repositorio Git

```bash
# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: Firebase integration"

# Crear repositorio en GitHub
# Ve a github.com y crea un nuevo repositorio
# Luego conecta tu repositorio local:

git remote add origin https://github.com/tu-usuario/gastos-v2.git
git branch -M main
git push -u origin main
```

#### 3.2 Configurar .gitignore

Asegúrate de que tu `.gitignore` incluya:

```