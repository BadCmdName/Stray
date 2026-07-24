import fs from "fs";
import path from "path";
import pkg from "../../package.json";

let cachedRemoteVersion = "";
let lastFetchTime = 0;

export function getLocalVersion(): string {
  try {
    const cwd = process.cwd();
    const readmePaths = [
      path.join(/*turbopackIgnore: true*/ cwd, "README.MD"),
      path.join(/*turbopackIgnore: true*/ cwd, "README.md"),
      path.join(/*turbopackIgnore: true*/ cwd, "..", "README.MD"),
      path.join(/*turbopackIgnore: true*/ cwd, "..", "README.md"),
    ];

    for (const p of readmePaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        const match = content.match(/#\s*Stray Alley\s*\(v?([0-9]+\.[0-9]+\.[0-9]+)\)/i);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
  } catch { }

  return pkg.version ? pkg.version.replace(/^v/i, "") : "ERROR";
}

export async function getRemoteLatestVersion(): Promise<string> {
  const now = Date.now();
  if (now - lastFetchTime < 60000 && cachedRemoteVersion) {
    return cachedRemoteVersion;
  }

  try {
    const res = await fetch("https://raw.githubusercontent.com/BadCmdName/Stray/main/README.MD", {
      cache: "no-store",
    });

    if (res.ok) {
      const content = await res.text();
      const match = content.match(/#\s*Stray Alley\s*\(v?([0-9]+\.[0-9]+\.[0-9]+)\)/i);
      if (match && match[1]) {
        cachedRemoteVersion = match[1];
        lastFetchTime = now;
        return cachedRemoteVersion;
      }
    }
  } catch { }

  try {
    const resPkg = await fetch("https://raw.githubusercontent.com/BadCmdName/Stray/main/Alley/package.json", {
      cache: "no-store",
    });
    if (resPkg.ok) {
      const data = await resPkg.json();
      if (data.version) {
        cachedRemoteVersion = data.version.replace(/^v/i, "");
        lastFetchTime = now;
        return cachedRemoteVersion;
      }
    }
  } catch { }

  return cachedRemoteVersion || getLocalVersion();
}

export function isVersionNewer(latest: string, current: string): boolean {
  const parse = (v: string) => v.replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const l = parse(latest);
  const c = parse(current);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const lNum = l[i] || 0;
    const cNum = c[i] || 0;
    if (lNum > cNum) return true;
    if (lNum < cNum) return false;
  }
  return false;
}
