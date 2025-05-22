

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.txn1s346.js","_app/immutable/chunks/scheduler.DS4MoFyp.js","_app/immutable/chunks/index.Btp2-ozX.js","_app/immutable/chunks/entry.CJPZrdIo.js"];
export const stylesheets = [];
export const fonts = [];
