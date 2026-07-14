"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityStatus = exports.db = void 0;
exports.initDb = initDb;
var better_sqlite3_1 = __importDefault(require("better-sqlite3"));
var path_1 = __importDefault(require("path"));
var dbPath = path_1.default.join(__dirname, '..', 'dev.db');
exports.db = new better_sqlite3_1.default(dbPath, { verbose: process.env.NODE_ENV === 'test' ? undefined : console.log });
exports.db.pragma('foreign_keys = ON');
// Governed Values
exports.EntityStatus = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    DISABLED: 'DISABLED',
    PENDING: 'PENDING',
    ARCHIVED: 'ARCHIVED',
};
function initDb() {
    exports.db.exec("\n    CREATE TABLE IF NOT EXISTS AuthUser (\n      id TEXT PRIMARY KEY,\n      email TEXT UNIQUE NOT NULL,\n      passwordHash TEXT NOT NULL,\n      emailVerified INTEGER DEFAULT 0,\n      mfaEnabled INTEGER DEFAULT 0,\n      credentialStatus TEXT DEFAULT 'ACTIVE',\n      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,\n      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP\n    );\n\n    CREATE TABLE IF NOT EXISTS Person (\n      id TEXT PRIMARY KEY,\n      authUserId TEXT UNIQUE NOT NULL,\n      preferredName TEXT NOT NULL,\n      legalName TEXT,\n      contactDetails TEXT,\n      status TEXT DEFAULT 'ACTIVE',\n      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,\n      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (authUserId) REFERENCES AuthUser(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS Organization (\n      id TEXT PRIMARY KEY,\n      name TEXT NOT NULL,\n      slug TEXT UNIQUE NOT NULL,\n      createdByPersonId TEXT NOT NULL,\n      status TEXT DEFAULT 'ACTIVE',\n      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (createdByPersonId) REFERENCES Person(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS Role (\n      id TEXT PRIMARY KEY,\n      name TEXT NOT NULL,\n      description TEXT\n    );\n\n    CREATE TABLE IF NOT EXISTS Permission (\n      id TEXT PRIMARY KEY,\n      action TEXT NOT NULL,\n      resource TEXT NOT NULL\n    );\n\n    CREATE TABLE IF NOT EXISTS RolePermission (\n      roleId TEXT NOT NULL,\n      permissionId TEXT NOT NULL,\n      PRIMARY KEY (roleId, permissionId),\n      FOREIGN KEY (roleId) REFERENCES Role(id),\n      FOREIGN KEY (permissionId) REFERENCES Permission(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS Membership (\n      id TEXT PRIMARY KEY,\n      personId TEXT NOT NULL,\n      organizationId TEXT NOT NULL,\n      roleId TEXT NOT NULL,\n      status TEXT DEFAULT 'ACTIVE',\n      joinedAt TEXT DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (personId) REFERENCES Person(id),\n      FOREIGN KEY (organizationId) REFERENCES Organization(id),\n      FOREIGN KEY (roleId) REFERENCES Role(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS TrustEvidence (\n      id TEXT PRIMARY KEY,\n      targetId TEXT NOT NULL,\n      targetType TEXT NOT NULL,\n      evidenceType TEXT NOT NULL,\n      status TEXT DEFAULT 'VALID',\n      issuedAt TEXT DEFAULT CURRENT_TIMESTAMP,\n      expiresAt TEXT\n    );\n\n    CREATE TABLE IF NOT EXISTS AuditLog (\n      eventId TEXT PRIMARY KEY,\n      traceId TEXT NOT NULL,\n      correlationId TEXT,\n      sourceLayer TEXT NOT NULL,\n      domain TEXT NOT NULL,\n      action TEXT NOT NULL,\n      actorId TEXT NOT NULL,\n      targetResource TEXT NOT NULL,\n      timestamp TEXT DEFAULT CURRENT_TIMESTAMP\n    );\n  ");
}
// Initialize tables on import
initDb();
