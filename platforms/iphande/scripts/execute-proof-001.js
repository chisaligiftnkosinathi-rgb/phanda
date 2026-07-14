"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var better_sqlite3_1 = __importDefault(require("better-sqlite3"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var IPHANDE_URL = 'http://localhost:4000/api/v1';
// Setup Mock Phanda Local DB
var dbPath = path_1.default.join(__dirname, '..', '..', '..', 'applications', 'phanda', 'local.db');
if (!fs_1.default.existsSync(path_1.default.dirname(dbPath)))
    fs_1.default.mkdirSync(path_1.default.dirname(dbPath), { recursive: true });
if (fs_1.default.existsSync(dbPath))
    fs_1.default.unlinkSync(dbPath); // Reset for clean proof
var phandaDb = new better_sqlite3_1.default(dbPath);
phandaDb.exec("\n  CREATE TABLE IF NOT EXISTS Opportunity (\n    id TEXT PRIMARY KEY,\n    title TEXT NOT NULL,\n    creatorId TEXT NOT NULL,\n    organizationId TEXT NOT NULL,\n    traceId TEXT NOT NULL,\n    correlationId TEXT NOT NULL,\n    createdAt TEXT DEFAULT CURRENT_TIMESTAMP\n  );\n");
function runProof() {
    return __awaiter(this, void 0, void 0, function () {
        var traceId, correlationId, loginRes, _a, _b, loginData, accessToken, authUser, identityRes, _c, _d, identityData, person, memberships, targetOrg, opportunityId, auditRes, _e, _f, e_1;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.log("=================================================");
                    console.log("   Executing Proof of Work 001 (Phanda -> iPhande) ");
                    console.log("=================================================\n");
                    traceId = (0, uuid_1.v4)();
                    correlationId = (0, uuid_1.v4)();
                    console.log("[Flow Context] TraceId: ".concat(traceId, " | CorrelationId: ").concat(correlationId, "\n"));
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 13, , 14]);
                    // 1. Authentication
                    console.log("1. Authenticating...");
                    return [4 /*yield*/, fetch("".concat(IPHANDE_URL, "/auth/login"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: 'gift@globalitbs.com', password: 'SecurePassword123' })
                        })];
                case 2:
                    loginRes = _g.sent();
                    if (!!loginRes.ok) return [3 /*break*/, 4];
                    _a = Error.bind;
                    _b = "Login failed: ".concat;
                    return [4 /*yield*/, loginRes.text()];
                case 3: throw new (_a.apply(Error, [void 0, _b.apply("Login failed: ", [_g.sent()])]))();
                case 4: return [4 /*yield*/, loginRes.json()];
                case 5:
                    loginData = _g.sent();
                    accessToken = loginData.accessToken;
                    authUser = loginData.user;
                    console.log("   \u2705 JWT Issued for AuthUser: ".concat(authUser.id));
                    // 2. Identity & Membership Resolution
                    console.log("\n2. Resolving Identity & Memberships...");
                    return [4 /*yield*/, fetch("".concat(IPHANDE_URL, "/identity/me"), {
                            headers: { 'x-auth-user-id': authUser.id }
                        })];
                case 6:
                    identityRes = _g.sent();
                    if (!!identityRes.ok) return [3 /*break*/, 8];
                    _c = Error.bind;
                    _d = "Identity resolution failed: ".concat;
                    return [4 /*yield*/, identityRes.text()];
                case 7: throw new (_c.apply(Error, [void 0, _d.apply("Identity resolution failed: ", [_g.sent()])]))();
                case 8: return [4 /*yield*/, identityRes.json()];
                case 9:
                    identityData = _g.sent();
                    person = identityData.person, memberships = identityData.memberships;
                    console.log("   \u2705 Person Resolved: ".concat(person.name, " (").concat(person.id, ")"));
                    targetOrg = memberships.find(function (m) { return m.slug === 'global-itbs'; });
                    if (!targetOrg)
                        throw new Error("Membership not found");
                    console.log("   \u2705 Membership Resolved: ".concat(targetOrg.role, " in ").concat(targetOrg.slug));
                    // 3. Authorization
                    console.log("\n3. Authorizing Action...");
                    if (!targetOrg.permissions.includes('manage:organization')) {
                        throw new Error("Unauthorized to create opportunity");
                    }
                    console.log("   \u2705 Permission Derived: manage:organization");
                    // 4. Domain Action (Phanda Creates Opportunity)
                    console.log("\n4. Executing Domain Action...");
                    opportunityId = (0, uuid_1.v4)();
                    phandaDb.prepare("\n      INSERT INTO Opportunity (id, title, creatorId, organizationId, traceId, correlationId)\n      VALUES (?, ?, ?, ?, ?, ?)\n    ").run(opportunityId, 'Senior Frontend Engineer', person.id, targetOrg.id, traceId, correlationId);
                    console.log("   \u2705 Opportunity Persisted (ID: ".concat(opportunityId, ")"));
                    // 5. Verification (Audit Logging)
                    console.log("\n5. Writing Audit Event to iPhande...");
                    return [4 /*yield*/, fetch("".concat(IPHANDE_URL, "/audit/log"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                traceId: traceId,
                                correlationId: correlationId,
                                sourceLayer: 'Domain (Phanda)',
                                domain: 'phanda',
                                action: 'OPPORTUNITY_CREATED',
                                actorId: person.id,
                                targetResource: "opportunity:".concat(opportunityId)
                            })
                        })];
                case 10:
                    auditRes = _g.sent();
                    if (!!auditRes.ok) return [3 /*break*/, 12];
                    _e = Error.bind;
                    _f = "Audit logging failed: ".concat;
                    return [4 /*yield*/, auditRes.text()];
                case 11: throw new (_e.apply(Error, [void 0, _f.apply("Audit logging failed: ", [_g.sent()])]))();
                case 12:
                    console.log("   \u2705 Audit Event Written");
                    console.log("\n=================================================");
                    console.log("   Proof of Work Execution Completed Successfully! ");
                    console.log("=================================================\n");
                    return [3 /*break*/, 14];
                case 13:
                    e_1 = _g.sent();
                    console.error("\n❌ Proof Failed:", e_1.message);
                    process.exit(1);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
runProof();
