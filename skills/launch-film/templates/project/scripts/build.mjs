import { build } from "esbuild";
import { resolve } from "node:path";
import { config, path } from "./lib.mjs";
// Bundle the picture (source/movie.js -> dist/movie.js). Optional config.build:
//   "alias": { "three": "../node_modules/three" }                       resolve a package from a fixed place
//   "swap":  [{ "filter": "ghost-emote-player$", "importer": "creator-landing-page", "to": "source/ghost-emote-player.ts" }]
//            replace a module only when imported from a given importer (e.g. a film-only performance)
const B = config.build ?? {};
const alias = Object.fromEntries(Object.entries(B.alias ?? {}).map(([k, v]) => [k, path(v)]));
const plugins = [{ name: "film-swaps", setup(b) {
  for (const s of B.swap ?? []) b.onResolve({ filter: new RegExp(s.filter) }, a => (!s.importer || a.importer.includes(s.importer)) ? { path: path(s.to) } : null);
  if (alias.three) b.onResolve({ filter: /^three\/addons\// }, a => ({ path: resolve(alias.three, "examples/jsm", a.path.slice("three/addons/".length)) }));
} }];
await build({ entryPoints: [path("source/movie.js")], outfile: path("dist/movie.js"), bundle: true, format: "iife", target: "chrome120",
  sourcemap: true, minify: true, logLevel: "warning", loader: { ".json": "json" }, alias, plugins });
console.log("built dist/movie.js");
