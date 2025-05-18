
import fs from 'fs';
import path from 'path';
import { log } from './vite';

interface BackupConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

export function setupBackup(config: BackupConfig = { frequency: 'daily', enabled: true }) {
  if (!config.enabled) {
    return;
  }

  // Calculate interval based on frequency
  const intervals = {
    daily: 24 * 60 * 60 * 1000, // 24 hours
    weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
    monthly: 30 * 24 * 60 * 60 * 1000 // 30 days (approximate)
  };

  const backupInterval = intervals[config.frequency];
  
  const performBackup = () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      
      // Create backups directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
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
      const maxBackups = config.frequency === 'daily' ? 24 : config.frequency === 'weekly' ? 12 : 6;
      const backups = fs.readdirSync(backupDir);
      if (backups.length > maxBackups) {
        const oldestBackups = backups.sort().slice(0, backups.length - maxBackups);
        oldestBackups.forEach(backup => {
          fs.unlinkSync(path.join(backupDir, backup));
        });
      }
      
      log(`Successfully created backup copies of library and dashboard databases (${config.frequency} backup)`);
    } catch (error) {
      log('Database backup failed: ' + error);
    }
  };

  // Perform initial backup
  performBackup();
  
  // Schedule periodic backups
  setInterval(performBackup, backupInterval);
}
