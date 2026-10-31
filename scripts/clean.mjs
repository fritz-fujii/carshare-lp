import { rmSync } from "node:fs";

for (const path of ["dist", ".astro", "node_modules"]) {
  rmSync(new URL(`../${path}`, import.meta.url), { recursive: true, force: true });
}
