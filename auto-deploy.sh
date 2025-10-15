#!/bin/bash

# Automatisches Deploy-Script für Geheimsprache Umwandeln
# Dieses Script committet und pusht automatisch alle Änderungen

# Farben für bessere Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Automatisches Deploy gestartet...${NC}"

# Zum Projektverzeichnis wechseln
cd "/Users/leopoldspringorum/Documents/Cursor Projects/Geheimsprache Umwandeln"

# Git Status prüfen
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}ℹ️  Keine Änderungen gefunden.${NC}"
    exit 0
fi

echo -e "${BLUE}📝 Änderungen gefunden, committe...${NC}"

# Alle Änderungen hinzufügen
git add -A

# Commit mit Zeitstempel
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m "Auto-update: $TIMESTAMP

Automatische Aktualisierung der Website
- Alle lokalen Änderungen wurden committet
- Deploy wird automatisch auf Netlify ausgelöst"

# Push zu GitHub
echo -e "${BLUE}📤 Pushe zu GitHub...${NC}"
if git push origin main; then
    echo -e "${GREEN}✅ Erfolgreich zu GitHub gepusht!${NC}"
    echo -e "${GREEN}🌐 Netlify wird automatisch deployen...${NC}"
    echo -e "${YELLOW}⏱️  Deploy dauert normalerweise 1-2 Minuten${NC}"
else
    echo -e "${RED}❌ Fehler beim Pushen zu GitHub${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deploy-Prozess abgeschlossen!${NC}"
