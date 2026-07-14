"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadKnowledgeSet = loadKnowledgeSet;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Loads and validates the Governance Knowledge Set from an external JSON file.
 * Pure function relative to the file system (no live DB queries).
 *
 * @param filePath Path to the governance knowledge set JSON
 * @returns The strongly-typed KnowledgeSet
 */
function loadKnowledgeSet(filePath) {
    const absolutePath = path_1.default.resolve(filePath);
    if (!fs_1.default.existsSync(absolutePath)) {
        throw new Error(`Knowledge Set not found at path: ${absolutePath}`);
    }
    const fileContents = fs_1.default.readFileSync(absolutePath, 'utf8');
    let data;
    try {
        data = JSON.parse(fileContents);
    }
    catch (err) {
        throw new Error(`Knowledge Set is not valid JSON: ${err.message}`);
    }
    // Basic structural validation to ensure the knowledge set matches the expected AXIONYX schema
    if (!data.knowledgeSetVersion || !data.ontologyVersion) {
        throw new Error("Invalid Knowledge Set: Missing version metadata.");
    }
    if (!Array.isArray(data.assertionLibrary)) {
        throw new Error("Invalid Knowledge Set: Missing or invalid assertionLibrary.");
    }
    if (!Array.isArray(data.ruleSet)) {
        throw new Error("Invalid Knowledge Set: Missing or invalid ruleSet.");
    }
    // Ensure every rule's assertions map to a valid assertion in the library
    const validAssertionIds = new Set(data.assertionLibrary.map((a) => a.assertionId));
    data.ruleSet.forEach((rule) => {
        if (!Array.isArray(rule.assertions)) {
            throw new Error(`Rule ${rule.ruleId} has no assertions array.`);
        }
        rule.assertions.forEach((assertionRef) => {
            if (!validAssertionIds.has(assertionRef.assertionId)) {
                throw new Error(`Rule ${rule.ruleId} references unknown assertionId: ${assertionRef.assertionId}`);
            }
        });
    });
    return data;
}
