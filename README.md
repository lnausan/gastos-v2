# Gastos V2 - Aplicación de Gestión de Gastos

Una aplicación web para gestionar ingresos y gastos personales, construida con Next.js, Firebase y TypeScript.

## 🚀 Características

- 📊 Dashboard con resumen mensual
- 💰 Gestión de ingresos y gastos
- 📈 Gráficos y estadísticas
- 📱 Diseño responsive
- 🌙 Modo oscuro/claro
- 🔐 Autenticación con Firebase
- ☁️ Sincronización en la nube

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

#### 1.4 Obtener credenciales

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

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Next.js
.next/
out/

# Production
build/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

### 4. Configurar Vercel

#### 4.1 Conectar con Vercel

1. Ve a [Vercel](https://vercel.com/)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Importa tu repositorio de GitHub
5. Configura las variables de entorno

#### 4.2 Variables de Entorno en Vercel

En la configuración del proyecto en Vercel:

1. Ve a "Settings" > "Environment Variables"
2. Agrega las mismas variables que tienes en `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

#### 4.3 Configurar dominio personalizado (opcional)

1. En Vercel, ve a "Settings" > "Domains"
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar DNS

### 5. Configurar Reglas de Firestore

En Firebase Console, ve a Firestore Database > Rules y actualiza las reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso solo a usuarios autenticados
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

### 6. Flujo de Desarrollo

#### 6.1 Desarrollo local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir http://localhost:3000
```

#### 6.2 Deploy automático

Cada vez que hagas push a la rama `main`, Vercel automáticamente:

1. Detecta los cambios
2. Ejecuta el build
3. Despliega la nueva versión
4. Actualiza tu dominio

#### 6.3 Flujo de trabajo recomendado

```bash
# Crear nueva rama para feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios
# ... código ...

# Commit cambios
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push a GitHub
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
# Revisar y mergear a main
# Vercel automáticamente hace deploy
```

### 7. Monitoreo y Analytics

#### 7.1 Firebase Analytics (opcional)

1. En Firebase Console, ve a "Analytics"
2. Sigue las instrucciones para habilitar Google Analytics
3. Agrega el código de seguimiento a tu aplicación

#### 7.2 Vercel Analytics

1. En Vercel, ve a "Settings" > "Analytics"
2. Habilita Vercel Analytics
3. Agrega el script de seguimiento

### 8. Seguridad

#### 8.1 Variables de entorno

- Nunca commits credenciales en Git
- Usa siempre variables de entorno
- Rota las claves regularmente

#### 8.2 Firestore Rules

- Revisa y actualiza las reglas de seguridad
- Prueba las reglas antes de deployar
- Usa el simulador de reglas de Firebase

### 9. Troubleshooting

#### 9.1 Errores comunes

**Error: "Firebase not initialized"**
- Verifica que las variables de entorno estén configuradas
- Asegúrate de que el archivo `lib/firebase.ts` esté correcto

**Error: "Permission denied"**
- Revisa las reglas de Firestore
- Verifica que el usuario esté autenticado

**Error: "Build failed"**
- Revisa los logs de Vercel
- Verifica que todas las dependencias estén instaladas

#### 9.2 Logs y debugging

```bash
# Ver logs de Vercel
vercel logs

# Ver logs de Firebase
# Ve a Firebase Console > Functions > Logs
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar servidor de producción
npm run lint         # Ejecutar linter
npm run type-check   # Verificar tipos TypeScript
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas:

1. Revisa la documentación de [Firebase](https://firebase.google.com/docs)
2. Consulta la documentación de [Vercel](https://vercel.com/docs)
3. Abre un issue en GitHub

---

¡Disfruta gestionando tus gastos! 💰 