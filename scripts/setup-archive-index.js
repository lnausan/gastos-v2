console.log('🔧 Configurando índice para archivar transacciones...');
console.log('📋 Project ID: gastos-v2-49841');

console.log('\n📝 Índice necesario para transactions (archivar):');
console.log('Collection: transactions');
console.log('- archived (ASC) + userId (ASC) + date (ASC) + date (DESC)');

console.log('\n🔗 Enlace para crear el índice:');
console.log('https://console.firebase.google.com/v1/r/project/gastos-v2-49841/firestore/indexes?create_composite=ClRwcm9qZWN0cy9nYXN0b3MtdjItNDk4NDEvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RyYW5zYWN0aW9ucy9pbmRleGVzL18QARoMCghhcmNoaXZlZBABGgoKBnVzZXJJZBABGggKBGRhdGUQARoMCghfX25hbWVfXxAB');

console.log('\n📋 Pasos para configurar el índice:');
console.log('1. Haz clic en el enlace de arriba');
console.log('2. En Firebase Console, haz clic en "Create index"');
console.log('3. Espera a que el índice se cree (puede tomar 2-3 minutos)');
console.log('4. Recarga la aplicación');

console.log('\n🎉 Una vez creado el índice, la funcionalidad de archivar transacciones funcionará correctamente!'); 