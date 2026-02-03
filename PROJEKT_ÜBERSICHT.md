# Planify - Projekt Übersicht

## Projektbeschreibung
Planify ist eine Event-Planning- und Management-Anwendung, die Teams dabei unterstützt, Events zu organisieren, Meetings zu planen, Aufgaben zu verteilen und Teilnehmer zu verwalten.

## Projektstruktur

```
Planify/
├── src/                          # TypeScript Quellcode
│   ├── models/                   # Datenmodelle
│   │   ├── User.ts              # Benutzermodell
│   │   ├── Event.ts             # Event-Modell
│   │   ├── Meeting.ts           # Meeting-Modell
│   │   ├── Task.ts              # Aufgaben-Modell
│   │   └── Notification.ts      # Benachrichtigungs-Modell
│   ├── services/                # Business Logic
│   │   ├── AuthService.ts       # Authentifizierung
│   │   ├── EventService.ts      # Event-Verwaltung
│   │   └── NotificationService.ts # Benachrichtigungen
│   ├── controllers/             # Request Handler (zukünftig)
│   ├── utils/                   # Hilfsfunktionen
│   └── index.ts                 # Haupteinstiegspunkt
├── public/                      # Statische Dateien
│   ├── css/
│   │   └── styles.css          # Hauptstylesheet
│   ├── js/
│   │   └── app.js              # Client-seitige Logik
│   └── index.html              # Haupt-HTML-Datei
├── tests/                       # Test-Dateien
│   └── AuthService.test.ts     # Beispiel-Test
├── Dokumentation/               # Projektdokumentation
│   ├── Diagramme/              # UML und Aktivitätsdiagramme
│   └── Sprint 1/               # Sprint-Dokumentation
├── Meetings/                    # Meeting-Protokolle
├── Styleguides-Codeconventions/ # Coding Standards
├── package.json                 # Projekt-Dependencies
├── tsconfig.json               # TypeScript-Konfiguration
├── .eslintrc.json              # ESLint-Konfiguration
├── .prettierrc.json            # Prettier-Konfiguration
└── README.md                    # Projekt-README

## Hauptfunktionen

### 1. Benutzerverwaltung
- **Registrierung**: Neue Benutzer anlegen
- **Anmeldung**: Authentifizierung mit Benutzername/Passwort
- **Rollenverwaltung**: Admin, Organizer, Participant
- **Zugriffsverwaltung**: Berechtigungen basierend auf Rollen

### 2. Event-Management
- **Event erstellen**: Neue Events mit Details anlegen
- **Event bearbeiten**: Details anpassen
- **Event anzeigen**: Events basierend auf Berechtigungen
- **Event löschen**: Events und zugehörige Daten entfernen
- **Teilnehmerverwaltung**: Teilnehmer hinzufügen/entfernen

### 3. Meeting-Planung
- **Meeting planen**: Meetings für Events erstellen
- **Teilnehmer festlegen**: Meeting-Teilnehmer auswählen
- **Zeitplanung**: Termine vorschlagen und bestätigen
- **Status-Verwaltung**: Proposed, Confirmed, Ongoing, Completed

### 4. Aufgabenverteilung
- **Aufgaben erstellen**: Neue Aufgaben für Events
- **Aufgaben zuweisen**: Personen zu Aufgaben zuweisen
- **Prioritäten**: Low, Medium, High, Urgent
- **Status-Tracking**: Todo, In Progress, Review, Done

### 5. Benachrichtigungssystem
- **Event-Einladungen**: Automatische Benachrichtigungen
- **Aufgabenzuweisungen**: Benachrichtigung bei neuen Aufgaben
- **Meeting-Erinnerungen**: Rechtzeitige Erinnerungen
- **Status-Updates**: Änderungen an Events/Meetings

## Technologie-Stack

### Backend
- **TypeScript**: Hauptprogrammiersprache
- **Node.js**: Runtime-Umgebung
- **Express** (geplant): Web-Framework

### Frontend
- **HTML5**: Markup
- **CSS3**: Styling
- **Vanilla JavaScript**: Client-seitige Logik

### Entwicklungstools
- **TypeScript Compiler**: Code-Kompilierung
- **ESLint**: Code-Linting
- **Prettier**: Code-Formatierung
- **Jest**: Testing-Framework

## Setup und Installation

### Voraussetzungen
- Node.js (v18 oder höher)
- npm (v9 oder höher)

### Installation

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen einrichten:**
   ```bash
   cp .env.example .env
   ```
   Dann `.env` mit den entsprechenden Werten anpassen.

3. **Projekt bauen:**
   ```bash
   npm run build
   ```

### Development

**Entwicklungsmodus starten:**
```bash
npm run dev
```
Der TypeScript-Compiler läuft im Watch-Modus und kompiliert Änderungen automatisch.

**Anwendung starten:**
```bash
npm start
```

**Tests ausführen:**
```bash
npm test
```

**Code formatieren:**
```bash
npm run format
```

**Code linten:**
```bash
npm run lint
```

## Code-Konventionen

Das Projekt folgt den folgenden Style Guides:
- **Google TypeScript Style Guide**
- **Google HTML/CSS Style Guide**

### Wichtige Konventionen:
- **Indentation**: 2 Leerzeichen
- **Quotes**: Single quotes für Strings
- **Semicolons**: Erforderlich
- **Naming**:
  - Classes: PascalCase (z.B. `AuthService`)
  - Functions/Variables: camelCase (z.B. `getUserById`)
  - Constants: UPPER_SNAKE_CASE (z.B. `MAX_USERS`)
  - Interfaces: PascalCase mit 'I' Präfix optional (z.B. `User`)

## Entwicklungsprozess

### Agile Methodik
- **Sprint-Dauer**: 2 Wochen
- **Sprint Planning**: Aufgaben aus Backlog auswählen
- **Arbeitsphase 1**: Erste Entwicklungsphase
- **Zwischenmeeting**: Funktionalität präsentieren, Feedback vom PO
- **Arbeitsphase 2**: Zweite Entwicklungsphase mit Testing
- **Sprint Review/Retrospective**: Prozess reflektieren

## Aktueller Status

### Version: 0.1.0 (Initial Release)

**Implementiert:**
- ✅ Projektstruktur
- ✅ TypeScript-Konfiguration
- ✅ Datenmodelle (User, Event, Meeting, Task, Notification)
- ✅ Basis-Services (Auth, Event, Notification)
- ✅ Frontend-Grundstruktur (HTML/CSS)
- ✅ Test-Setup
- ✅ Entwicklungsumgebung

**Geplant für nächste Sprints:**
- ⏳ Meeting-Service implementieren
- ⏳ Task-Service implementieren
- ⏳ REST API mit Express
- ⏳ Datenbank-Integration
- ⏳ Frontend-Backend-Verbindung
- ⏳ Authentifizierungs-Middleware
- ⏳ Vollständige Test-Coverage
- ⏳ CI/CD Pipeline

## Nächste Schritte

1. **Dependencies installieren**: `npm install`
2. **Projekt bauen**: `npm run build`
3. **Tests ausführen**: `npm test`
4. **Dokumentation durchlesen**: Siehe `/Dokumentation` Ordner
5. **Sprint Planning**: Siehe `/Dokumentation/Sprint 1`

## Lizenz
ISC

## Kontakt
Projektteam Planify
