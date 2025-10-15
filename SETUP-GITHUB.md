# 🔐 GitHub Authentifizierung einrichten

## Problem
Das automatische Deploy-System kann nicht zu GitHub pushen, weil die Authentifizierung fehlt.

## Lösung: Personal Access Token erstellen

### 1. GitHub Personal Access Token erstellen
1. Gehe zu GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Klicke "Generate new token (classic)"
3. Wähle "repo" Berechtigung (voller Zugriff auf Repositories)
4. Kopiere den Token (wird nur einmal angezeigt!)

### 2. Git Credentials speichern
```bash
# Im Terminal im Projektordner:
git config --global credential.helper store
```

### 3. Ersten Push manuell machen
```bash
# Im Terminal im Projektordner:
git push origin main
```
- **Username**: Dein GitHub-Username (Springo08)
- **Password**: Dein Personal Access Token (NICHT dein GitHub-Passwort!)

### 4. Testen
```bash
# Teste das automatische Deploy:
./auto-deploy.sh
```

## Alternative: SSH Key (für Fortgeschrittene)
Falls du SSH verwenden möchtest:
1. SSH Key generieren: `ssh-keygen -t ed25519 -C "deine-email@example.com"`
2. Public Key zu GitHub hinzufügen: Settings → SSH and GPG keys
3. Remote URL ändern: `git remote set-url origin git@github.com:Springo08/gemeimsprache-umwandeln.git`

## Nach der Einrichtung
- Das automatische Deploy-System funktioniert ohne weitere Eingaben
- File Watcher kann gestartet werden: `npm run watch`
- Alle Änderungen werden automatisch deployed
