
import fs from 'fs';
import path from 'path';
import { log } from './vite';

export function setupBackup() {
  const backupInterval = 60000; // 1 minute instead of 1 second
  
  const performBackup = () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
      fs.copyFileSync(
        path.join(process.cwd(), 'library.db'),
        path.join(backupDir, `library-${timestamp}.db`)
      );
      
      const backups = fs.readdirSync(backupDir);
      if (backups.length > 24) {
        const oldestBackup = backups.sort()[0];
        fs.unlinkSync(path.join(backupDir, oldestBackup));
      }
    } catch (error) {
      log('Database backup failed: ' + error);
    }
  };

  setInterval(performBackup, backupInterval);
}
