
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building Windows executable...');

try {
  // Create dist directory if it doesn't exist
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Create exe-dist directory if it doesn't exist
  if (!fs.existsSync('exe-dist')) {
    fs.mkdirSync('exe-dist');
  }

  // Build the project first
  console.log('Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });

  // Package with pkg
  console.log('Creating executable with pkg...');
  execSync('npx pkg dist/index.js --target node18-win-x64 --output exe-dist/LibraryManagement.exe', { stdio: 'inherit' });

  // Copy additional files
  console.log('Copying additional files...');
  if (fs.existsSync('library.db')) {
    fs.copyFileSync('library.db', 'exe-dist/library.db');
  }

  // Create batch file for easy running
  const batContent = `@echo off
cd /d "%~dp0"
LibraryManagement.exe
pause`;
  fs.writeFileSync('exe-dist/run-library.bat', batContent);

  console.log('✅ Windows executable created successfully in exe-dist/');
  console.log('📁 Files created:');
  console.log('   - LibraryManagement.exe');
  console.log('   - library.db (if exists)');
  console.log('   - run-library.bat');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
