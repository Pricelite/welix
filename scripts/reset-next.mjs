import fs from "node:fs";
import path from "node:path";

const target = path.join(process.cwd(), ".next");

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

for (let attempt = 0; attempt < 6; attempt += 1) {
  try {
    fs.rmSync(target, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
    break;
  } catch (error) {
    if (attempt === 5) {
      throw error;
    }

    sleep(150);
  }
}

fs.mkdirSync(path.join(target, "types"), { recursive: true });
