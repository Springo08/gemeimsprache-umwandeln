#!/usr/bin/env node

// File Watcher für automatische Deploys
// Überwacht Änderungen an HTML, CSS und JS Dateien

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Dateien die überwacht werden sollen
const WATCH_FILES = [
    'index.html',
    'impressum.html', 
    'styles.css',
    'script.js'
];

// Verzeichnis
const PROJECT_DIR = '/Users/leopoldspringorum/Documents/Cursor Projects/Geheimsprache Umwandeln';

// Debounce Timer (wartet 2 Sekunden nach der letzten Änderung)
let debounceTimer = null;
const DEBOUNCE_DELAY = 2000;

console.log('🔍 File Watcher gestartet...');
console.log('📁 Überwache Dateien:', WATCH_FILES.join(', '));
console.log('⏱️  Debounce Delay:', DEBOUNCE_DELAY + 'ms');
console.log('💡 Drücke Ctrl+C zum Beenden\n');

// Funktion zum Ausführen des Deploy-Scripts
function runDeploy() {
    console.log('🚀 Starte automatisches Deploy...');
    
    exec('./auto-deploy.sh', { cwd: PROJECT_DIR }, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Deploy-Fehler:', error);
            return;
        }
        
        console.log(stdout);
        if (stderr) {
            console.error('⚠️  Warnung:', stderr);
        }
    });
}

// File Watcher für jede Datei
WATCH_FILES.forEach(filename => {
    const filePath = path.join(PROJECT_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Datei nicht gefunden: ${filename}`);
        return;
    }
    
    fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
        // Prüfe ob Datei wirklich geändert wurde
        if (curr.mtime.getTime() !== prev.mtime.getTime()) {
            console.log(`📝 Änderung erkannt: ${filename}`);
            
            // Debounce: Lösche vorherigen Timer
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            
            // Setze neuen Timer
            debounceTimer = setTimeout(() => {
                console.log('⏰ Debounce abgelaufen, starte Deploy...');
                runDeploy();
                debounceTimer = null;
            }, DEBOUNCE_DELAY);
        }
    });
    
    console.log(`✅ Überwache: ${filename}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('\n👋 File Watcher beendet.');
    process.exit(0);
});

console.log('\n🎯 File Watcher läuft... Warte auf Änderungen...');
