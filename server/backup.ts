export async function setupBackup() {
  // Create backup every hour
  setInterval(() => {
    createBackup();
  }, 60 * 60 * 1000); // 1 hour

  // Also create initial backup on startup
  await createBackup();
}

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = './backups';

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Copy library.db only
    const libraryBackupPath = `${backupDir}/library-${timestamp}.db`;
    fs.copyFileSync('./library.db', libraryBackupPath);

    console.log(`✅ Successfully created backup copy of library database`);
  } catch (error) {
    console.error('❌ Error creating backup:', error);
  }
}