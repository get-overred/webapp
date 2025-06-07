export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.C7-4fTjS.js","app":"_app/immutable/entry/app.CjkW1Nhz.js","imports":["_app/immutable/entry/start.C7-4fTjS.js","_app/immutable/chunks/entry.CJPZrdIo.js","_app/immutable/chunks/scheduler.DS4MoFyp.js","_app/immutable/entry/app.CjkW1Nhz.js","_app/immutable/chunks/preload-helper.D6kgxu3v.js","_app/immutable/chunks/scheduler.DS4MoFyp.js","_app/immutable/chunks/index.Btp2-ozX.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
