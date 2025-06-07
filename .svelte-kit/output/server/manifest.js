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
		client: {start:"_app/immutable/entry/start.GiGtpxiy.js",app:"_app/immutable/entry/app.kMRb1d9t.js",imports:["_app/immutable/entry/start.GiGtpxiy.js","_app/immutable/chunks/CKoKYkkT.js","_app/immutable/chunks/DweVjaGk.js","_app/immutable/entry/app.kMRb1d9t.js","_app/immutable/chunks/CmsKOCeN.js","_app/immutable/chunks/DweVjaGk.js","_app/immutable/chunks/BA73HWMz.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		routes: [
			{
				id: "/help",
				pattern: /^\/help\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/[idx]",
				pattern: /^\/([^/]+?)\/?$/,
				params: [{"name":"idx","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set(["/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
