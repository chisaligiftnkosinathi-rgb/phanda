// Node-only script (run via `node scripts/debc-lint.ts`)
// Use require() to avoid needing @types/node in the TS compile config.
const fs = require("fs");
const path = require("path");

const ROOT = "src/engine";

const forbiddenGlobal: RegExp[] = [
    /Math\.random\(/g,
    /crypto\.randomUUID\(/g,
    /performance\.now\(/g,
];

// new Date(...) is only allowed inside deterministicId.ts
const forbiddenHard: RegExp[] = [/new Date\s*\(/g];

function walk(dir: string, results: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full: string = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            walk(full, results);
            continue;
        }

        if (!full.endsWith(".ts")) continue;

        const content: string = fs.readFileSync(full, "utf-8");

        // Global forbidden patterns
        for (const r of forbiddenGlobal) {
            if (r.test(content)) results.push(`GLOBAL FORBIDDEN :: ${full} :: ${r.toString()}`);
        }

        // new Date(...) conditional exception
        for (const r of forbiddenHard) {
            if (!r.test(content)) continue;

            const normalized = full.replace(/\\/g, "/");
            const allowedDeterministicId = normalized.endsWith("src/engine/kernel/deterministicId.ts");

            if (!allowedDeterministicId) {
                results.push(`DATE FORBIDDEN :: ${full} :: ${r.toString()}`);
            }
        }
    }

    return results;
}

function main(): void {
    const violations = walk(ROOT);

    if (violations.length > 0) {
        console.error("\n❌ DEBC VIOLATION DETECTED\n");
        for (const v of violations) console.error(v);
        process.exit(1);
    }

    console.log("✅ DEBC CLEAN");
}

main();