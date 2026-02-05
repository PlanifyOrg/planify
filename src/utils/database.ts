/**
 * Database initialization and connection for SQLite
 */
import Database from 'better-sqlite3';
import path from 'path';

// Create database connection
const dbPath = path.join(__dirname, '../../planify.db');
export const db: Database.Database = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database tables
 */
export function initializeDatabase(): void {
  console.log('Initializing database...');

  // Organizations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      logo TEXT,
      website TEXT,
      settings TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Organization members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS organization_members (
      organization_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (organization_id, user_id),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Join requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS join_requests (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      reviewed_by TEXT,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      organization_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
    )
  `);

  // Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      organizer_id TEXT NOT NULL,
      organization_id TEXT,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      location TEXT,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
    )
  `);

  // Event participants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_participants (
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (event_id, user_id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Meetings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      scheduled_time DATETIME NOT NULL,
      duration INTEGER NOT NULL,
      status TEXT NOT NULL,
      flagged_for_deletion INTEGER DEFAULT 0,
      flagged_by TEXT,
      flagged_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (flagged_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Meeting participants table with check-in status
  db.exec(`
    CREATE TABLE IF NOT EXISTS meeting_participants (
      meeting_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      checked_in INTEGER DEFAULT 0,
      checked_in_at DATETIME,
      PRIMARY KEY (meeting_id, user_id),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Meeting agenda items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meeting_agenda_items (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration INTEGER,
      order_index INTEGER NOT NULL,
      is_completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    )
  `);

  // Meeting documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meeting_documents (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      eventId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assignedTo TEXT NOT NULL,
      volunteers TEXT NOT NULL,
      dueDate DATETIME NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      phase TEXT NOT NULL,
      tags TEXT NOT NULL,
      estimatedHours REAL,
      actualHours REAL,
      createdBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      completedAt DATETIME,
      "order" INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Task notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_notes (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      userId TEXT NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Remove old task_assignments table as we now store assignments in tasks.assignedTo JSON
  db.exec(`DROP TABLE IF EXISTS task_assignments`);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_id TEXT NOT NULL,
      sender_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      related_entity_id TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Migration: Add flagged_for_deletion columns if they don't exist
  try {
    const tableInfo = db.prepare('PRAGMA table_info(meetings)').all() as any[];
    const hasFlag = tableInfo.some(col => col.name === 'flagged_for_deletion');
    
    if (!hasFlag) {
      console.log('Running migration: Adding flagged_for_deletion columns to meetings table...');
      db.exec(`
        ALTER TABLE meetings ADD COLUMN flagged_for_deletion INTEGER DEFAULT 0;
        ALTER TABLE meetings ADD COLUMN flagged_by TEXT;
        ALTER TABLE meetings ADD COLUMN flagged_at DATETIME;
      `);
      console.log('✓ Migration completed successfully');
    }
  } catch (error) {
    console.error('Migration warning:', error);
  }

  // Migration: Add meeting_link column if it doesn't exist
  try {
    const tableInfo = db.prepare('PRAGMA table_info(meetings)').all() as any[];
    const hasMeetingLink = tableInfo.some(col => col.name === 'meeting_link');
    
    if (!hasMeetingLink) {
      console.log('Running migration: Adding meeting_link column to meetings table...');
      db.exec(`
        ALTER TABLE meetings ADD COLUMN meeting_link TEXT;
      `);
      console.log('✓ Migration completed successfully');
    }
  } catch (error) {
    console.error('Migration warning:', error);
  }

  // Migration: Add created_by column if it doesn't exist
  try {
    const tableInfo = db.prepare('PRAGMA table_info(meetings)').all() as any[];
    const hasCreatedBy = tableInfo.some(col => col.name === 'created_by');
    
    if (!hasCreatedBy) {
      console.log('Running migration: Adding created_by column to meetings table...');
      db.exec(`
        ALTER TABLE meetings ADD COLUMN created_by TEXT;
      `);
      console.log('✓ Migration completed successfully');
    }
  } catch (error) {
    console.error('Migration warning:', error);
  }

  // Migration: Make event_id optional (nullable) in meetings table
  try {
    const tableInfo = db.prepare('PRAGMA table_info(meetings)').all() as any[];
    const eventIdCol = tableInfo.find((col: any) => col.name === 'event_id');
    
    // Check if event_id is currently NOT NULL
    if (eventIdCol && eventIdCol.notnull === 1) {
      console.log('Running migration: Making event_id optional in meetings table...');
      
      // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
      db.exec(`
        -- Create new table with optional event_id
        CREATE TABLE meetings_new (
          id TEXT PRIMARY KEY,
          event_id TEXT,
          title TEXT NOT NULL,
          description TEXT,
          scheduled_time DATETIME NOT NULL,
          duration INTEGER NOT NULL,
          meeting_link TEXT,
          created_by TEXT,
          status TEXT NOT NULL,
          flagged_for_deletion INTEGER DEFAULT 0,
          flagged_by TEXT,
          flagged_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
          FOREIGN KEY (flagged_by) REFERENCES users(id) ON DELETE SET NULL
        );
        
        -- Copy data from old table with explicit column mapping
        INSERT INTO meetings_new (id, event_id, title, description, scheduled_time, duration, meeting_link, created_by, status, flagged_for_deletion, flagged_by, flagged_at, created_at, updated_at)
        SELECT id, event_id, title, description, scheduled_time, duration, meeting_link, created_by, status, flagged_for_deletion, flagged_by, flagged_at, created_at, updated_at FROM meetings;
        
        -- Drop old table
        DROP TABLE meetings;
        
        -- Rename new table
        ALTER TABLE meetings_new RENAME TO meetings;
      `);
      
      console.log('✓ Migration completed successfully');
    }
  } catch (error) {
    console.error('Migration warning:', error);
  }

  // Migration: Fix corrupted created_by data
  try {
    // Check if there are meetings with timestamp-like created_by values
    const checkStmt = db.prepare(`SELECT id, created_by FROM meetings WHERE created_by LIKE '%-%-%T%' LIMIT 1`);
    const corruptedRow = checkStmt.get();
    
    if (corruptedRow) {
      console.log('Running migration: Fixing corrupted created_by values...');
      
      // We need to clear the corrupted created_by values since we can't recover the original user IDs
      // The application will need to handle meetings without creators gracefully
      db.exec(`
        UPDATE meetings 
        SET created_by = NULL 
        WHERE created_by LIKE '%-%-%T%'
      `);
      
      console.log('✓ Migration completed: Cleared corrupted created_by values. Note: Some meetings may not have a creator.');
    }
  } catch (error) {
    console.error('Migration warning:', error);
  }

  // Create meeting_responses table for participant confirmations/declinations
  db.exec(`
    CREATE TABLE IF NOT EXISTS meeting_responses (
      meeting_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      response TEXT NOT NULL,
      reason TEXT,
      responded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (meeting_id, user_id),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Migration: Update tasks table with new columns
  try {
    const tableInfo = db.prepare('PRAGMA table_info(tasks)').all() as any[];
    const hasCreatedBy = tableInfo.some(col => col.name === 'createdBy');
    const hasOrder = tableInfo.some(col => col.name === 'order');
    
    if (!hasCreatedBy || !hasOrder) {
      console.log('Running migration: Updating tasks table with new schema...');
      
      // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
      db.exec(`
        -- Create new tasks table with updated schema
        CREATE TABLE tasks_new (
          id TEXT PRIMARY KEY,
          eventId TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          assignedTo TEXT NOT NULL DEFAULT '[]',
          volunteers TEXT NOT NULL DEFAULT '[]',
          dueDate DATETIME NOT NULL,
          priority TEXT NOT NULL,
          status TEXT NOT NULL,
          phase TEXT NOT NULL DEFAULT 'todo',
          tags TEXT NOT NULL DEFAULT '[]',
          estimatedHours REAL,
          actualHours REAL,
          createdBy TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          completedAt DATETIME,
          "order" INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
        );
        
        -- Copy existing data if the old table has data
        INSERT OR IGNORE INTO tasks_new (id, eventId, title, description, dueDate, priority, status, createdBy, createdAt, updatedAt, assignedTo, volunteers, phase, tags, "order")
        SELECT 
          id, 
          event_id, 
          title, 
          COALESCE(description, ''), 
          due_date, 
          priority, 
          status,
          COALESCE((SELECT id FROM users LIMIT 1), 'unknown'),
          created_at,
          updated_at,
          '[]',
          '[]',
          'todo',
          '[]',
          0
        FROM tasks
        WHERE EXISTS (SELECT 1 FROM tasks LIMIT 1);
        
        -- Drop old table
        DROP TABLE IF EXISTS tasks;
        
        -- Rename new table
        ALTER TABLE tasks_new RENAME TO tasks;
      `);
      
      console.log('✓ Migration completed: Tasks table updated successfully');
    }
  } catch (error) {
    console.error('Migration warning:', error);
  }

  console.log('✓ Database tables created successfully');
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  db.close();
  console.log('Database connection closed');
}
