import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(dirname, "..");
const executable = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "cypress.cmd" : "cypress"
);
const args = process.argv.slice(2);
const env = { ...process.env };

delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(executable, args, {
  env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
