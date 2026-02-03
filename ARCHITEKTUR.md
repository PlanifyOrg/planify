# Planify - Architektur-Übersicht

## System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              public/index.html (UI)                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │  Events  │  │ Meetings │  │  Tasks   │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └───────────────────────────────────────────────────────┘  │
│           │                                                   │
│           │ public/css/styles.css                            │
│           │ public/js/app.js                                 │
└───────────┼───────────────────────────────────────────────────┘
            │
            │ (Future: REST API)
            │
┌───────────▼───────────────────────────────────────────────────┐
│                      BACKEND (TypeScript)                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    src/index.ts                          │  │
│  │                  (Application Entry)                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    SERVICES LAYER                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ AuthService  │  │EventService  │  │ Notification │  │  │
│  │  │              │  │              │  │   Service    │  │  │
│  │  │ • register() │  │ • create()   │  │ • send()     │  │  │
│  │  │ • login()    │  │ • update()   │  │ • markRead() │  │  │
│  │  │ • hasRole()  │  │ • delete()   │  │              │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                     MODELS LAYER                         │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │  │
│  │  │  User  │  │ Event  │  │Meeting │  │  Task  │        │  │
│  │  ├────────┤  ├────────┤  ├────────┤  ├────────┤        │  │
│  │  │   id   │  │   id   │  │   id   │  │   id   │        │  │
│  │  │  name  │  │  title │  │  time  │  │  title │        │  │
│  │  │  role  │  │  desc  │  │ status │  │ status │        │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘        │  │
│  │                                                           │  │
│  │         ┌──────────────┐                                 │  │
│  │         │ Notification │                                 │  │
│  │         ├──────────────┤                                 │  │
│  │         │      id      │                                 │  │
│  │         │     type     │                                 │  │
│  │         │   message    │                                 │  │
│  │         └──────────────┘                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  DATA STORAGE                            │  │
│  │         (In-Memory - Future: Database)                   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Datenfluss

### Beispiel: Benutzer-Registrierung

```
1. User → Frontend (index.html)
        ↓
2. Form Submit → app.js
        ↓
3. (Future) API Call → Backend
        ↓
4. AuthService.register()
        ↓
5. User Model erstellen
        ↓
6. In Memory speichern
        ↓
7. User Object zurück
        ↓
8. Response → Frontend
        ↓
9. UI Update
```

### Beispiel: Event erstellen

```
1. Organizer → Create Event Button
        ↓
2. Event Form ausfüllen
        ↓
3. Submit → EventService.createEvent()
        ↓
4. Event Model erstellen
        ↓
5. Participants hinzufügen
        ↓
6. NotificationService.sendInvitation()
        ↓
7. Notification an Teilnehmer
        ↓
8. Event in Liste anzeigen
```

## Komponenten-Beziehungen

```
┌──────────────────────────────────────────────────────────┐
│                    AuthService                            │
│  • Verwaltet User-Authentifizierung                      │
│  • Prüft Berechtigungen                                  │
└────────────────┬─────────────────────────────────────────┘
                 │ verwendet
                 ▼
           ┌──────────┐
           │   User   │
           │  Model   │
           └──────────┘
                 ▲
                 │ benötigt
┌────────────────┴─────────────────────────────────────────┐
│                   EventService                            │
│  • CRUD für Events                                       │
│  • Teilnehmerverwaltung                                  │
└────────────────┬─────────────────────────────────────────┘
                 │ verwendet
                 ▼
           ┌──────────┐
           │  Event   │
           │  Model   │
           └──────────┘
                 │
                 ├──── beinhaltet ───→ Meeting Model
                 │
                 └──── beinhaltet ───→ Task Model
                 
┌──────────────────────────────────────────────────────────┐
│              NotificationService                          │
│  • Benachrichtigungen senden                             │
│  • Status verwalten                                      │
└────────────────┬─────────────────────────────────────────┘
                 │ verwendet
                 ▼
         ┌───────────────┐
         │ Notification  │
         │    Model      │
         └───────────────┘
```

## Zukünftige Erweiterungen

### Phase 1: REST API
```
Frontend ←→ Express.js API ←→ Services ←→ Models
                │
                └──→ Middleware (Auth, Validation)
```

### Phase 2: Datenbank
```
Services ←→ ORM/ODM ←→ PostgreSQL/MongoDB
                          │
                          └──→ Persistente Speicherung
```

### Phase 3: Echtzeit-Features
```
Frontend ←→ WebSockets ←→ Backend
                          │
                          └──→ Live Notifications
                          └──→ Real-time Updates
```

## Technologie-Stack Details

### Backend
- **Sprache**: TypeScript 5.x
- **Runtime**: Node.js
- **Framework**: (geplant) Express.js
- **Testing**: Jest
- **Linting**: ESLint
- **Formatting**: Prettier

### Frontend
- **Markup**: HTML5
- **Styling**: CSS3 (Custom Properties)
- **Logic**: Vanilla JavaScript
- **Design**: Responsive, Mobile-First

### DevOps (geplant)
- **CI/CD**: GitHub Actions
- **Testing**: Automatisierte Tests
- **Deployment**: Docker + Cloud

## Code-Organisation

```
src/
├── models/          → Datenstrukturen (Interfaces, Enums)
│   ├── User.ts
│   ├── Event.ts
│   ├── Meeting.ts
│   ├── Task.ts
│   └── Notification.ts
│
├── services/        → Business Logic
│   ├── AuthService.ts
│   ├── EventService.ts
│   ├── MeetingService.ts    (geplant)
│   ├── TaskService.ts       (geplant)
│   └── NotificationService.ts
│
├── controllers/     → API Request Handler (geplant)
│   ├── AuthController.ts
│   ├── EventController.ts
│   └── ...
│
├── utils/          → Helper Functions
│   ├── validators.ts
│   ├── dateUtils.ts
│   └── ...
│
└── index.ts        → Application Entry Point
```

## Sicherheit (geplant)

```
┌─────────────────────────────────────┐
│          Security Layer              │
├─────────────────────────────────────┤
│  • JWT Authentication                │
│  • Password Hashing (bcrypt)        │
│  • Input Validation                  │
│  • XSS Protection                    │
│  • CSRF Protection                   │
│  • Rate Limiting                     │
└─────────────────────────────────────┘
```

## Performance-Überlegungen

- **In-Memory Storage**: Schnell, aber nicht persistent
- **Lazy Loading**: Frontend lädt Daten bei Bedarf
- **Caching**: (geplant) Redis für häufige Abfragen
- **Pagination**: Für große Datenlisten
- **Optimization**: Code-Splitting, Minification

---

**Status**: Initial Setup Complete
**Nächste Phase**: API-Integration & Datenbank-Setup
