console.log('Starting import test...');

try {
  console.log('Trying to import course.routes.ts...');
  const courseRoutes = require('./src/routes/course.routes');
  console.log('Successfully imported course.routes.ts');
} catch (error) {
  console.error('Error importing course.routes.ts:', error);
}

console.log('Import test complete.');
