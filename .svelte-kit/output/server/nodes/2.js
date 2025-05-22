import * as universal from '../entries/pages/_page.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.ts";
export const imports = ["_app/immutable/nodes/2.B69eRgnl.js","_app/immutable/chunks/2.BQA3ox4k.js","_app/immutable/chunks/scheduler.DS4MoFyp.js","_app/immutable/chunks/index.Btp2-ozX.js","_app/immutable/chunks/entry.CJPZrdIo.js","_app/immutable/chunks/preload-helper.D6kgxu3v.js"];
export const stylesheets = ["_app/immutable/assets/2.CHby19cj.css"];
export const fonts = ["_app/immutable/assets/fa-brands-400.O7nZalfM.woff2","_app/immutable/assets/fa-brands-400.Dur5g48u.ttf","_app/immutable/assets/fa-regular-400.DgEfZSYE.woff2","_app/immutable/assets/fa-regular-400.Bf3rG5Nx.ttf","_app/immutable/assets/fa-solid-900.DOQJEhcS.woff2","_app/immutable/assets/fa-solid-900.BV3CbEM2.ttf","_app/immutable/assets/fa-v4compatibility.BX8XWJtE.woff2","_app/immutable/assets/fa-v4compatibility.B9MWI-E6.ttf"];
