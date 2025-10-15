# 🚀 Automatisches Deploy-System

Dieses System sorgt dafür, dass alle Änderungen an deiner Website automatisch auf GitHub und dann auf Netlify deployed werden.

## 📋 Was wurde eingerichtet

### 1. Automatisches Deploy-Script (`auto-deploy.sh`)
- Committet alle Änderungen automatisch
- Pusht zu GitHub
- Löst Netlify-Deploy aus

### 2. File Watcher (`watch-files.js`)
- Überwacht Änderungen an: `index.html`, `impressum.html`, `styles.css`, `script.js`
- Wartet 2 Sekunden nach der letzten Änderung (Debounce)
- Startet automatisch das Deploy-Script

## 🎯 So verwendest du es

### Option 1: File Watcher starten (empfohlen)
```bash
# Im Terminal im Projektordner:
npm run watch
# oder
node watch-files.js
```

**Was passiert:**
- File Watcher läuft im Hintergrund
- Jede Änderung an deinen Dateien wird automatisch erkannt
- Nach 2 Sekunden wird automatisch deployed

### Option 2: Manuelles Deploy
```bash
# Einmaliges Deploy aller aktuellen Änderungen:
npm run deploy
# oder
./auto-deploy.sh
```

## 🔧 Konfiguration

### Überwachte Dateien ändern
In `watch-files.js` die `WATCH_FILES` Array anpassen:
```javascript
const WATCH_FILES = [
    'index.html',
    'impressum.html', 
    'styles.css',
    'script.js'
    // Weitere Dateien hier hinzufügen
];
```

### Debounce-Zeit ändern
In `watch-files.js` die `DEBOUNCE_DELAY` Variable anpassen:
```javascript
const DEBOUNCE_DELAY = 2000; // 2 Sekunden
```

## 🎨 Workflow

1. **Datei bearbeiten** (in Cursor/Editor)
2. **Speichern** (Cmd+S)
3. **File Watcher erkennt Änderung** (automatisch)
4. **Wartet 2 Sekunden** (Debounce)
5. **Git Commit** (automatisch)
6. **Push zu GitHub** (automatisch)
7. **Netlify Deploy** (automatisch)
8. **Website ist live** (nach 1-2 Minuten)

## 🛠️ Troubleshooting

### File Watcher startet nicht
```bash
# Node.js installieren (falls nicht vorhanden):
brew install node
```

### Deploy schlägt fehl
```bash
# Git-Status prüfen:
git status

# Manuell committen:
git add -A
git commit -m "Manueller Commit"
git push origin main
```

### File Watcher beenden
```bash
# Im Terminal: Ctrl+C
```

## 📱 Netlify-Status prüfen

- Gehe zu deiner Netlify-Site
- Klicke auf "Deploys"
- Du siehst alle automatischen Deploys mit Zeitstempel

## 🎉 Fertig!

Deine Website wird jetzt automatisch aktualisiert, sobald du oder ich Änderungen an den Dateien vornehmen!
