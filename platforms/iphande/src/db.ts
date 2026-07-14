import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'dev.db');
export const db = new Database(dbPath, { verbose: process.env.NODE_ENV === 'test' ? undefined : console.log });

db.pragma('foreign_keys = ON');

// Governed Values
export const EntityStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DISABLED: 'DISABLED',
  PENDING: 'PENDING',
  ARCHIVED: 'ARCHIVED',
};

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS AuthUser (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      emailVerified INTEGER DEFAULT 0,
      mfaEnabled INTEGER DEFAULT 0,
      credentialStatus TEXT DEFAULT 'ACTIVE',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Person (
      id TEXT PRIMARY KEY,
      authUserId TEXT UNIQUE NOT NULL,
      preferredName TEXT NOT NULL,
      legalName TEXT,
      contactDetails TEXT,
      status TEXT DEFAULT 'ACTIVE',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (authUserId) REFERENCES AuthUser(id)
    );

    CREATE TABLE IF NOT EXISTS Organization (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      createdByPersonId TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdByPersonId) REFERENCES Person(id)
    );

    CREATE TABLE IF NOT EXISTS Role (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS Permission (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      resource TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS RolePermission (
      roleId TEXT NOT NULL,
      permissionId TEXT NOT NULL,
      PRIMARY KEY (roleId, permissionId),
      FOREIGN KEY (roleId) REFERENCES Role(id),
      FOREIGN KEY (permissionId) REFERENCES Permission(id)
    );

    CREATE TABLE IF NOT EXISTS Membership (
      id TEXT PRIMARY KEY,
      personId TEXT NOT NULL,
      organizationId TEXT NOT NULL,
      roleId TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      joinedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (personId) REFERENCES Person(id),
      FOREIGN KEY (organizationId) REFERENCES Organization(id),
      FOREIGN KEY (roleId) REFERENCES Role(id)
    );

    CREATE TABLE IF NOT EXISTS TrustEvidence (
      id TEXT PRIMARY KEY,
      targetId TEXT NOT NULL,
      targetType TEXT NOT NULL,
      evidenceType TEXT NOT NULL,
      status TEXT DEFAULT 'VALID',
      issuedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      expiresAt TEXT
    );

    CREATE TABLE IF NOT EXISTS AuditLog (
      eventId TEXT PRIMARY KEY,
      traceId TEXT NOT NULL,
      correlationId TEXT,
      sourceLayer TEXT NOT NULL,
      domain TEXT NOT NULL,
      action TEXT NOT NULL,
      actorId TEXT NOT NULL,
      targetResource TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Initialize tables on import
initDb();
