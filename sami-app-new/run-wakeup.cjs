#!/usr/bin/env node
console.log("Exécution du script de simulation");
const { spawnSync } = require("child_process");
const result = spawnSync("npx", ["tsx", "src/scripts/simulateWakeup.ts"], { stdio: "inherit" });
process.exit(result.status || 0);
