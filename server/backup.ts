
import fs from 'fs';
import path from 'path';
import { log } from './vite';

export function setupBackup() {
  const backupInterval = 60000; // 1 minute (60 * 1000 ms)
  
  const performBackup = () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      
      // Create backups directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
      // Copy the database file
      // Backup main library database
      fs.copyFileSync(
        path.join(process.cwd(), 'library.db'),
        path.join(backupDir, `library-${timestamp}.db`)
      );

      // Backup dashboard database
      fs.copyFileSync(
        path.join(process.cwd(), 'dashboard.db'),
        path.join(backupDir, `dashboard-${timestamp}.db`)
      );
      
      // Keep only last 24 backups
      const backups = fs.readdirSync(backupDir);
      if (backups.length > 24) {
        const oldestBackup = backups.sort()[0];
        fs.unlinkSync(path.join(backupDir, oldestBackup));
      }
      
      log('Successfully created backup copies of library and dashboard databases');
    } catch (error) {
      log('Database backup failed: ' + error);
    }
  };

  // Perform initial backup
  performBackup();
  
  // Schedule periodic backups
  setInterval(performBackup, backupInterval);
}
