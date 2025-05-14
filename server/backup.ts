
import fs from 'fs';
import path from 'path';
import { log } from './vite';

export function setupBackup() {
  const backupInterval = 1000; // 1 second
  
  const performBackup = () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      
      // Create backups directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
      // Copy the database file
      fs.copyFileSync(
        path.join(process.cwd(), 'library.db'),
        path.join(backupDir, `library-${timestamp}.db`)
      );
      
      // Keep only last 24 backups
      const backups = fs.readdirSync(backupDir);
      if (backups.length > 24) {
        const oldestBackup = backups.sort()[0];
        fs.unlinkSync(path.join(backupDir, oldestBackup));
      }
      
      log('Database backup completed');
    } catch (error) {
      log('Database backup failed: ' + error);
    }
  };

  // Perform initial backup
  performBackup();
  
  // Schedule periodic backups
  setInterval(performBackup, backupInterval);
}
