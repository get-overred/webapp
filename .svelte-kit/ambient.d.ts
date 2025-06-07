
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const NVM_INC: string;
	export const npm_package_devDependencies__fontsource_fira_mono: string;
	export const TERM_PROGRAM: string;
	export const npm_package_devDependencies_eslint_plugin_svelte: string;
	export const npm_package_devDependencies_typescript_eslint: string;
	export const NODE: string;
	export const NVM_CD_FLAGS: string;
	export const PYENV_ROOT: string;
	export const npm_package_devDependencies_typescript: string;
	export const npm_package_dependencies_axios: string;
	export const INIT_CWD: string;
	export const SHELL: string;
	export const TERM: string;
	export const npm_package_devDependencies_vite: string;
	export const TMPDIR: string;
	export const HOMEBREW_REPOSITORY: string;
	export const npm_package_scripts_lint: string;
	export const TERM_PROGRAM_VERSION: string;
	export const npm_package_scripts_dev: string;
	export const MallocNanoZone: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const CURSOR_TRACE_ID: string;
	export const ZDOTDIR: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const npm_package_devDependencies_svelte_preprocess: string;
	export const npm_config_registry: string;
	export const PNPM_HOME: string;
	export const LC_ALL: string;
	export const BRANCH: string;
	export const npm_package_devDependencies_globals: string;
	export const USER: string;
	export const NVM_DIR: string;
	export const NETLIFY_BLOBS_CONTEXT: string;
	export const npm_package_scripts_check_watch: string;
	export const npm_package_dependencies__ffmpeg_util: string;
	export const COMMAND_MODE: string;
	export const npm_package_dependencies_docx: string;
	export const npm_package_dependencies_html2canvas: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const CHROME_EXECUTABLE: string;
	export const NETLIFY_CLI_VERSION: string;
	export const SSH_AUTH_SOCK: string;
	export const HEAD: string;
	export const NEXT_TELEMETRY_DISABLED: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const GATSBY_TELEMETRY_DISABLED: string;
	export const npm_package_devDependencies_eslint: string;
	export const npm_package_devDependencies_postcss: string;
	export const npm_package_devDependencies_tslib: string;
	export const npm_execpath: string;
	export const npm_package_devDependencies_svelte: string;
	export const npm_package_dependencies__netlify_functions: string;
	export const SITE_ID: string;
	export const npm_config_frozen_lockfile: string;
	export const PATH: string;
	export const npm_package_dependencies_jspdf: string;
	export const DEPLOY_URL: string;
	export const NETLIFY_DEV: string;
	export const __CFBundleIdentifier: string;
	export const USER_ZDOTDIR: string;
	export const npm_package_dependencies__types_chrome: string;
	export const PWD: string;
	export const CONTEXT: string;
	export const npm_package_devDependencies_tailwindcss: string;
	export const npm_command: string;
	export const npm_package_scripts_preview: string;
	export const DEPLOY_ID: string;
	export const npm_lifecycle_event: string;
	export const LANG: string;
	export const npm_package_name: string;
	export const npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
	export const NODE_PATH: string;
	export const npm_package_scripts_build: string;
	export const npm_package_devDependencies_sass: string;
	export const XPC_FLAGS: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const BUILD_ID: string;
	export const npm_package_dependencies__google_cloud_translate: string;
	export const npm_package_dependencies__types_axios: string;
	export const FORCE_COLOR: string;
	export const npm_package_dependencies_jszip: string;
	export const npm_config_node_gyp: string;
	export const XPC_SERVICE_NAME: string;
	export const URL: string;
	export const npm_package_version: string;
	export const VSCODE_INJECTION: string;
	export const npm_package_devDependencies_autoprefixer: string;
	export const npm_package_devDependencies_svelte_check: string;
	export const HOME: string;
	export const SHLVL: string;
	export const PYENV_SHELL: string;
	export const npm_package_dependencies__ffmpeg_ffmpeg: string;
	export const npm_package_type: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const LANGUAGE: string;
	export const NETLIFY_LOCAL: string;
	export const HOMEBREW_PREFIX: string;
	export const VITE_SUPABASE_URL: string;
	export const npm_package_dependencies__fortawesome_fontawesome_free: string;
	export const LOGNAME: string;
	export const OLLAMA_MODELS: string;
	export const VITE_SUPABASE_ANON_KEY: string;
	export const npm_lifecycle_script: string;
	export const HF_HUB_CACHE: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const npm_package_devDependencies_svelte_loading_spinners: string;
	export const NVM_BIN: string;
	export const DEPLOY_PRIME_URL: string;
	export const npm_package_dependencies__supabase_supabase_js: string;
	export const npm_config_user_agent: string;
	export const HOMEBREW_CELLAR: string;
	export const INFOPATH: string;
	export const GIT_ASKPASS: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const npm_package_devDependencies__types_eslint: string;
	export const PULL_REQUEST: string;
	export const SITE_NAME: string;
	export const npm_package_devDependencies__sveltejs_adapter_netlify: string;
	export const npm_package_scripts_check: string;
	export const npm_package_dependencies__lottiefiles_svelte_lottie_player: string;
	export const COLORTERM: string;
	export const npm_node_execpath: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		NVM_INC: string;
		npm_package_devDependencies__fontsource_fira_mono: string;
		TERM_PROGRAM: string;
		npm_package_devDependencies_eslint_plugin_svelte: string;
		npm_package_devDependencies_typescript_eslint: string;
		NODE: string;
		NVM_CD_FLAGS: string;
		PYENV_ROOT: string;
		npm_package_devDependencies_typescript: string;
		npm_package_dependencies_axios: string;
		INIT_CWD: string;
		SHELL: string;
		TERM: string;
		npm_package_devDependencies_vite: string;
		TMPDIR: string;
		HOMEBREW_REPOSITORY: string;
		npm_package_scripts_lint: string;
		TERM_PROGRAM_VERSION: string;
		npm_package_scripts_dev: string;
		MallocNanoZone: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		CURSOR_TRACE_ID: string;
		ZDOTDIR: string;
		npm_package_devDependencies__sveltejs_kit: string;
		npm_package_devDependencies_svelte_preprocess: string;
		npm_config_registry: string;
		PNPM_HOME: string;
		LC_ALL: string;
		BRANCH: string;
		npm_package_devDependencies_globals: string;
		USER: string;
		NVM_DIR: string;
		NETLIFY_BLOBS_CONTEXT: string;
		npm_package_scripts_check_watch: string;
		npm_package_dependencies__ffmpeg_util: string;
		COMMAND_MODE: string;
		npm_package_dependencies_docx: string;
		npm_package_dependencies_html2canvas: string;
		PNPM_SCRIPT_SRC_DIR: string;
		CHROME_EXECUTABLE: string;
		NETLIFY_CLI_VERSION: string;
		SSH_AUTH_SOCK: string;
		HEAD: string;
		NEXT_TELEMETRY_DISABLED: string;
		__CF_USER_TEXT_ENCODING: string;
		GATSBY_TELEMETRY_DISABLED: string;
		npm_package_devDependencies_eslint: string;
		npm_package_devDependencies_postcss: string;
		npm_package_devDependencies_tslib: string;
		npm_execpath: string;
		npm_package_devDependencies_svelte: string;
		npm_package_dependencies__netlify_functions: string;
		SITE_ID: string;
		npm_config_frozen_lockfile: string;
		PATH: string;
		npm_package_dependencies_jspdf: string;
		DEPLOY_URL: string;
		NETLIFY_DEV: string;
		__CFBundleIdentifier: string;
		USER_ZDOTDIR: string;
		npm_package_dependencies__types_chrome: string;
		PWD: string;
		CONTEXT: string;
		npm_package_devDependencies_tailwindcss: string;
		npm_command: string;
		npm_package_scripts_preview: string;
		DEPLOY_ID: string;
		npm_lifecycle_event: string;
		LANG: string;
		npm_package_name: string;
		npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
		NODE_PATH: string;
		npm_package_scripts_build: string;
		npm_package_devDependencies_sass: string;
		XPC_FLAGS: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		BUILD_ID: string;
		npm_package_dependencies__google_cloud_translate: string;
		npm_package_dependencies__types_axios: string;
		FORCE_COLOR: string;
		npm_package_dependencies_jszip: string;
		npm_config_node_gyp: string;
		XPC_SERVICE_NAME: string;
		URL: string;
		npm_package_version: string;
		VSCODE_INJECTION: string;
		npm_package_devDependencies_autoprefixer: string;
		npm_package_devDependencies_svelte_check: string;
		HOME: string;
		SHLVL: string;
		PYENV_SHELL: string;
		npm_package_dependencies__ffmpeg_ffmpeg: string;
		npm_package_type: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		LANGUAGE: string;
		NETLIFY_LOCAL: string;
		HOMEBREW_PREFIX: string;
		VITE_SUPABASE_URL: string;
		npm_package_dependencies__fortawesome_fontawesome_free: string;
		LOGNAME: string;
		OLLAMA_MODELS: string;
		VITE_SUPABASE_ANON_KEY: string;
		npm_lifecycle_script: string;
		HF_HUB_CACHE: string;
		VSCODE_GIT_IPC_HANDLE: string;
		npm_package_devDependencies_svelte_loading_spinners: string;
		NVM_BIN: string;
		DEPLOY_PRIME_URL: string;
		npm_package_dependencies__supabase_supabase_js: string;
		npm_config_user_agent: string;
		HOMEBREW_CELLAR: string;
		INFOPATH: string;
		GIT_ASKPASS: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		npm_package_devDependencies__types_eslint: string;
		PULL_REQUEST: string;
		SITE_NAME: string;
		npm_package_devDependencies__sveltejs_adapter_netlify: string;
		npm_package_scripts_check: string;
		npm_package_dependencies__lottiefiles_svelte_lottie_player: string;
		COLORTERM: string;
		npm_node_execpath: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
