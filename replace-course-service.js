const fs = require('fs');
const path = require('path');

// Paths
const sourcePath = path.join(__dirname, 'src', 'services', 'course.service.new.ts');
const backupPath = path.join(__dirname, 'src', 'services', 'course.service.ts.bak');
const targetPath = path.join(__dirname, 'src', 'services', 'course.service.ts');

console.log('Replacing course.service.ts with new version...');

try {
  // Create backup
  if (fs.existsSync(targetPath)) {
    console.log('Creating backup of original file...');
    fs.copyFileSync(targetPath, backupPath);
    console.log(`Backup created at ${backupPath}`);
    
    // Delete the original file
    fs.unlinkSync(targetPath);
    console.log('Original file deleted');
  }

  // Replace file
  if (fs.existsSync(sourcePath)) {
    console.log('Copying new file...');
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`File replaced successfully!`);
  } else {
    console.error(`Error: Source file ${sourcePath} not found!`);
    process.exit(1);
  }

  console.log('Done!');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
