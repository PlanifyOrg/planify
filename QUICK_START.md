# Planify - Quick Start Guide

## Was wurde erstellt?

Das Planify-Projekt wurde erfolgreich initialisiert mit einer vollständigen Projektstruktur für ein Event-Planning- und Management-System.

## Projektstruktur Übersicht

```
Planify/
├── 📁 src/                     → TypeScript Backend-Code
│   ├── 📁 models/              → Datenmodelle (User, Event, Meeting, Task, Notification)
│   ├── 📁 services/            → Business Logic (Auth, Event, Notification)
│   ├── 📁 controllers/         → Request Handler (für zukünftige API)
│   ├── 📁 utils/               → Hilfsfunktionen
│   └── 📄 index.ts             → Haupteinstiegspunkt
├── 📁 public/                  → Frontend-Dateien
│   ├── 📁 css/                 → Stylesheets
│   ├── 📁 js/                  → Client JavaScript
│   └── 📄 index.html           → Haupt-HTML
├── 📁 tests/                   → Test-Dateien
├── 📁 Dokumentation/           → Projekt-Dokumentation & Diagramme
├── 📁 Meetings/                → Meeting-Protokolle
└── 📁 Styleguides-Codeconventions/ → Coding Standards
```

## Implementierte Features

### ✅ Backend (TypeScript)
- **User Management**: Registrierung, Login, Rollenverwaltung
- **Event Service**: Event-Erstellung, Bearbeitung, Teilnehmerverwaltung
- **Notification Service**: Benachrichtigungssystem
- **Datenmodelle**: User, Event, Meeting, Task, Notification

### ✅ Frontend (HTML/CSS/JS)
- **Responsive Design**: Mobile-first Ansatz
- **Modal-Dialoge**: Login und Registrierung
- **Navigation**: Event, Meeting, Task, Notification Bereiche
- **Moderne UI**: Professionelles Design mit CSS Variables

### ✅ Entwicklungsumgebung
- **TypeScript**: Vollständig konfiguriert
- **ESLint**: Code-Linting nach Google Style Guide
- **Prettier**: Automatische Code-Formatierung
- **Jest**: Test-Framework mit Beispiel-Tests

## Erste Schritte

### 1. Dependencies installieren
```bash
cd "c:\Users\mariu\Desktop\Universität\Coding\Planify"
npm install
```

### 2. Projekt bauen
```bash
npm run build
```

### 3. Tests ausführen
```bash
npm test
```

### 4. Development starten
```bash
npm run dev
```
Der TypeScript-Compiler läuft im Watch-Modus.

### 5. Anwendung starten
```bash
npm start
```

## Verfügbare NPM Scripts

| Script | Beschreibung |
|--------|--------------|
| `npm run build` | TypeScript zu JavaScript kompilieren |
| `npm run dev` | Entwicklungsmodus mit Auto-Rebuild |
| `npm start` | Anwendung starten |
| `npm test` | Tests ausführen |
| `npm run lint` | Code mit ESLint prüfen |
| `npm run format` | Code mit Prettier formatieren |

## Nächste Entwicklungsschritte

### Sprint 1 Vorschläge:
1. **Meeting Service implementieren**
   - MeetingService in `src/services/MeetingService.ts`
   - Meeting-Planung mit Teilnehmerbestätigung

2. **Task Service implementieren**
   - TaskService in `src/services/TaskService.ts`
   - Aufgabenverteilung und Status-Tracking

3. **REST API aufsetzen**
   - Express.js integrieren
   - API-Endpoints für alle Services
   - Controller implementieren

4. **Frontend-Backend verbinden**
   - API-Calls aus `public/js/app.js`
   - Dynamisches Laden von Daten
   - Formular-Validierung

5. **Datenbank-Integration**
   - PostgreSQL oder MongoDB
   - ORM/ODM (TypeORM oder Mongoose)
   - Persistente Datenspeicherung

## Wichtige Dateien

- **`README.md`**: Projekt-Übersicht
- **`PROJEKT_ÜBERSICHT.md`**: Detaillierte Dokumentation
- **`package.json`**: Dependencies und Scripts
- **`tsconfig.json`**: TypeScript-Konfiguration
- **`.eslintrc.json`**: Linting-Regeln
- **`.env.example`**: Umgebungsvariablen-Template

## Coding Standards

Das Projekt folgt:
- ✓ Google TypeScript Style Guide
- ✓ Google HTML/CSS Style Guide
- ✓ Agile Entwicklung mit 2-Wochen-Sprints

## Dokumentation

Weitere Informationen finden Sie in:
- `/Dokumentation/` - UML-Diagramme, Use Cases
- `/Dokumentation/Sprint 1/` - Sprint-Planung
- `/Styleguides-Codeconventions/` - PDF Style Guides

## Support & Hilfe

Bei Fragen oder Problemen:
1. Dokumentation durchlesen
2. Code-Kommentare beachten
3. Tests als Beispiele nutzen

## Projektstatus

**Version**: 0.1.0 (Initial Setup)
**Status**: ✅ Bereit für Entwicklung
**Nächster Schritt**: `npm install` ausführen

---

**Viel Erfolg mit Planify! 🚀**
