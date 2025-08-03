#!/bin/bash

# Cargar variables de entorno
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Verificar que tenemos el ID del proyecto
if [ -z "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" ]; then
    echo "Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID no está definido en .env.local"
    exit 1
fi

echo "Desplegando reglas de Firestore para el proyecto: $NEXT_PUBLIC_FIREBASE_PROJECT_ID"

# Desplegar las reglas
firebase deploy --only firestore:rules --project "$NEXT_PUBLIC_FIREBASE_PROJECT_ID"

echo "Reglas desplegadas exitosamente!" 