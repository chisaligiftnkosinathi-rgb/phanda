// DEBC Linter (runtime JS to avoid TS type issues)
// Run via: node scripts/debc-lint.js

const fs = require("fs");
const path = require("path");

const ROOT = "src/engine";

// Hard forbidden patterns (always fail)
const forbiddenGlobal = [
    /Date\.now\(/,
    /new Date\(/,
    /Math\.random\(/,
    /crypto\.randomUUID\(/,
    /performance\.now\(/,
];


function walk(dir, results = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            walk(full, results);
            continue;
        }

        if (!full.endsWith(".ts")) continue;

        const content = fs.readFileSync(full, "utf-8");

        // Conditional allow for deterministicId.ts
        const isDeterministicId = full.replace(/\\/g, "/").endsWith(
            "src/engine/kernel/deterministicId.ts"
        );

        for (const r of forbiddenGlobal) {
            if (!r.test(content)) continue;

            // Allow ONLY `new Date(tickTimestamp).toISOString()` inside deterministicId.ts
            if (
                isDeterministicId &&
                r.source === /new Date\(/.source &&
                /new\s+Date\s*\(\s*tickTimestamp\s*\)\s*\.toISOString\(/.test(content)
            ) {
                continue;
            }

            // Allow `Date.now(` ONLY inside scheduler.ts and only as Date.now() expression.
            if (full.replace(/\\/g, "/").endsWith("src/engine/kernel/scheduler.ts")) {
                if (r.source === /Date\.now\(/.source && /Date\.now\(\)/.test(content)) {
                    continue;
                }
            }


            results.push(`${full} :: ${r}`);
        }
    }

    return results;
}

function main() {
    const violations = walk(ROOT);

    if (violations.length > 0) {
        console.error("\n❌ DEBC VIOLATION DETECTED\n");
        for (const v of violations) console.error(v);
        process.exit(1);
    }

    console.log("✅ DEBC CLEAN");
}

main();
