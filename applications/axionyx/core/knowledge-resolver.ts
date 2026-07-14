import fs from 'fs';
import path from 'path';
import { KnowledgeSet } from './types';

/**
 * Loads and validates the Governance Knowledge Set from an external JSON file.
 * Pure function relative to the file system (no live DB queries).
 * 
 * @param filePath Path to the governance knowledge set JSON
 * @returns The strongly-typed KnowledgeSet
 */
export function loadKnowledgeSet(filePath: string): KnowledgeSet {
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Knowledge Set not found at path: ${absolutePath}`);
  }

  const fileContents = fs.readFileSync(absolutePath, 'utf8');
  let data: any;
  
  try {
    data = JSON.parse(fileContents);
  } catch (err) {
    throw new Error(`Knowledge Set is not valid JSON: ${(err as Error).message}`);
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
  const validAssertionIds = new Set(data.assertionLibrary.map((a: any) => a.assertionId));
  data.ruleSet.forEach((rule: any) => {
    if (!Array.isArray(rule.assertions)) {
      throw new Error(`Rule ${rule.ruleId} has no assertions array.`);
    }
    rule.assertions.forEach((assertionRef: any) => {
      if (!validAssertionIds.has(assertionRef.assertionId)) {
        throw new Error(`Rule ${rule.ruleId} references unknown assertionId: ${assertionRef.assertionId}`);
      }
    });
  });

  return data as KnowledgeSet;
}
