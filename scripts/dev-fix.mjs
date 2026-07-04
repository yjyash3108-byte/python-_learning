/**

 * Fix broken dev styling (missing CSS / 500 errors) caused by a corrupted .next cache.

 * Kills anything on port 3000, removes .next, then starts Next.js dev.

 */

import { execSync, spawn } from "node:child_process";

import fs from "node:fs";

import path from "node:path";

import { fileURLToPath } from "node:url";



const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const port = 3000;

const nextDir = path.join(root, ".next");



function sleepSync(ms) {

  if (ms <= 0) return;

  try {

    if (process.platform === "win32") {

      execSync(`powershell -NoProfile -Command "Start-Sleep -Milliseconds ${ms}"`, {

        stdio: "ignore",

      });

    } else {

      execSync(`sleep ${Math.max(1, Math.ceil(ms / 1000))}`, { stdio: "ignore" });

    }

  } catch {

    /* best effort */

  }

}



function killPort() {

  try {

    if (process.platform === "win32") {

      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });

      const pids = new Set(

        out

          .split(/\r?\n/)

          .map((line) => line.trim().split(/\s+/).pop())

          .filter((pid) => pid && /^\d+$/.test(pid) && pid !== "0")

      );

      for (const pid of pids) {

        try {

          execSync(`taskkill /PID ${pid} /F /T`, { stdio: "ignore" });

        } catch {

          /* already gone */

        }

      }

    } else {

      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore" });

    }

  } catch {

    /* nothing listening */

  }

}



function removeNextDir() {

  if (!fs.existsSync(nextDir)) return;



  const rmOptions = { recursive: true, force: true, maxRetries: 8, retryDelay: 250 };



  for (let attempt = 1; attempt <= 5; attempt++) {

    try {

      fs.rmSync(nextDir, rmOptions);

      return;

    } catch (err) {

      if (process.platform === "win32") {

        try {

          execSync(`cmd /c rmdir /s /q "${nextDir}"`, { stdio: "ignore" });

          if (!fs.existsSync(nextDir)) return;

        } catch {

          /* try rename fallback below */

        }



        try {

          const staleDir = path.join(root, `.next.old.${Date.now()}`);

          fs.renameSync(nextDir, staleDir);

          fs.rmSync(staleDir, rmOptions);

          return;

        } catch {

          /* retry after another wait */

        }

      }



      if (attempt === 5) {

        console.warn(

          `Warning: could not fully delete .next (${err.code ?? err.message}). Starting dev anyway.`

        );

        return;

      }



      sleepSync(400 * attempt);

    }

  }

}



killPort();

sleepSync(800);

removeNextDir();

console.log("Cleared .next and restarted dev server on http://localhost:3000");



const child = spawn("npx", ["next", "dev", "--port", String(port)], {

  cwd: root,

  stdio: "inherit",

  shell: true,

});



child.on("exit", (code) => process.exit(code ?? 0));

