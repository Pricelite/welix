import fs from "node:fs";
import path from "node:path";

fs.rmSync(path.join(process.cwd(), "tsconfig.tsbuildinfo"), { force: true });
fs.mkdirSync(path.join(process.cwd(), ".next", "types"), { recursive: true });
