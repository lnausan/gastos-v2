# Instrucciones para desplegar reglas de Firestore manualmente

## Problema
El error "Missing or insufficient permissions" indica que las reglas de Firestore están muy restrictivas.

## Solución
Necesitas desplegar las reglas manualmente desde la consola de Firebase.

## Pasos:

1. **Ve a la consola de Firebase:**
   - Abre https://console.firebase.google.com/
   - Selecciona tu proyecto: `gastos-v2-49841`

2. **Navega a Firestore:**
   - En el menú lateral, haz clic en "Firestore Database"
   - Haz clic en la pestaña "Rules"

3. **Copia y pega las reglas:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Reglas permisivas para desarrollo - permitir acceso a usuarios autenticados
       match /transactions/{document} {
         allow read, write: if request.auth != null;
       }
       
       match /dollarValues/{document} {
         allow read, write: if request.auth != null;
       }
       
       match /closedMonths/{document} {
         allow read, write: if request.auth != null;
       }
       
       match /archivedTransactions/{document} {
         allow read, write: if request.auth != null;
       }
       
       // Regla de respaldo para cualquier otro documento
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

4. **Publica las reglas:**
   - Haz clic en "Publish"

5. **Verifica:**
   - Las reglas se aplicarán en unos segundos
   - Prueba la aplicación nuevamente

## Nota de seguridad
Estas reglas permiten acceso completo a usuarios autenticados. Para producción, deberías implementar reglas más restrictivas basadas en user_id. 