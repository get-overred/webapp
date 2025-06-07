<script lang="ts">
    import type { AuthSession } from "@supabase/supabase-js";
    import { onMount } from "svelte";
    import { supabase } from "../../supabaseClient";

    interface Credentials {
        password1: string;
        password2: string;
        email: string;
        username: string;
    }

    interface AuthState {
        loading: boolean;
        error: string | null;
        success: string | null;
    }

    let session: AuthSession;
    let isRegister: boolean = true;
    let isForgotPassword: boolean = false;
    let authState: AuthState = {
        loading: false,
        error: null,
        success: null,
    };

    let credentials: Credentials = {
        password1: "",
        password2: "",
        email: "",
        username: "",
    };

    function validatePassword(password: string): boolean {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return regex.test(password);
    }

    function validateEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    async function handleSubmit() {
        authState.loading = true;
        authState.error = null;
        authState.success = null;

        try {
            if (!validateEmail(credentials.email)) {
                throw new Error("Please enter a valid email address");
            }

            if (isForgotPassword) {
                await forgetPassword(credentials.email);
                authState.success = "Password reset email sent!";
                return;
            }

            if (!validatePassword(credentials.password1)) {
                throw new Error(
                    "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers",
                );
            }

            if (isRegister) {
                if (credentials.password1 !== credentials.password2) {
                    throw new Error("Passwords do not match");
                }
                if (!credentials.username.trim()) {
                    throw new Error("Username is required");
                }
                await signUpNewUser(
                    credentials.email,
                    credentials.password1,
                    credentials.username,
                );
                authState.success =
                    "Registration successful! Please check your email to verify your account.";
            } else {
                await signInWithEmail(credentials.email, credentials.password1);
                authState.success = "Login successful!";
            }
        } catch (error) {
            authState.error =
                error instanceof Error ? error.message : "An error occurred";
        } finally {
            authState.loading = false;
        }
    }

    async function signUpNewUser(
        email: string,
        password: string,
        username: string,
    ) {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    email: email,
                },
            },
        });
        if (error) throw error;
        return data;
    }

    async function signInWithEmail(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        return data;
    }

    async function forgetPassword(email: string) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: "http://localhost:4000/flowwp/reset-password",
            },
        );
        if (error) throw error;
        return data;
    }

    onMount(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) session = data.session;
        });

        supabase.auth.onAuthStateChange((_event, _session) => {
            if (_session) session = _session;
        });
    });
</script>

{#if !session}
    <div
        class="bg-slate-50 flex flex-col items-center justify-center w-full h-full min-h-screen transition-all duration-500"
        role="main"
    >
        <form
            on:submit|preventDefault={handleSubmit}
            class="bg-slate-100 rounded-2xl w-1/2 px-12 py-20 space-y-10 flex flex-col items-center justify-center"
        >
            <h2 class="text-center text-green-400 font-black text-5xl pb-5">
                {!isForgotPassword
                    ? isRegister
                        ? "Register"
                        : "Login"
                    : "Forgot Password"}
            </h2>

            {#if authState.error}
                <div
                    class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-5/6 text-center"
                    role="alert"
                >
                    <span class="block sm:inline">{authState.error}</span>
                </div>
            {/if}

            {#if authState.success}
                <div
                    class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative w-5/6 text-center"
                    role="alert"
                >
                    <span class="block sm:inline">{authState.success}</span>
                </div>
            {/if}

            {#if !isForgotPassword}
                {#if isRegister}
                    <input
                        type="text"
                        placeholder="Username"
                        bind:value={credentials.username}
                        class="py-3 px-6 w-5/6 text-center text-lg font-bold bg-inherit border-4 border-green-400 border-opacity-75 focus:border-opacity-100 focus:outline-green-400 rounded-full"
                        required
                        aria-label="Username"
                        minlength="3"
                    />
                {/if}
                <input
                    type="password"
                    placeholder="Password"
                    bind:value={credentials.password1}
                    class="py-3 px-6 w-5/6 text-center text-lg font-bold bg-inherit border-4 border-green-400 border-opacity-75 focus:border-opacity-100 focus:outline-green-400 rounded-full"
                    required
                    aria-label="Password"
                    minlength="8"
                />

                {#if isRegister}
                    <input
                        type="password"
                        placeholder="Please repeat your Password"
                        bind:value={credentials.password2}
                        class="py-3 px-6 w-5/6 text-center text-lg font-bold bg-inherit border-4 border-green-400 border-opacity-75 focus:border-opacity-100 focus:outline-green-400 rounded-full"
                        required
                        aria-label="Confirm Password"
                        minlength="8"
                    />
                {/if}
            {/if}

            <input
                type="email"
                placeholder="eMail Address"
                bind:value={credentials.email}
                class="py-3 px-6 w-5/6 text-center text-lg font-bold bg-inherit border-4 border-green-400 border-opacity-75 focus:border-opacity-100 focus:outline-green-400 rounded-full"
                required
                aria-label="Email Address"
            />

            <button
                type="submit"
                class="w-min font-extrabold text-black bg-green-400 bg-opacity-75 rounded-full px-20 py-3 text-center hover:opacity-75 text-lg hover:shadow-md hover:shadow-green-700 flex flex-row transition-none duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={authState.loading}
            >
                {#if authState.loading}
                    <span class="animate-spin mr-2">⌛</span>
                {/if}
                Submit
            </button>
        </form>

        {#if !isForgotPassword}
            <button
                on:click={() => (isRegister = !isRegister)}
                class="text-green-600 font-md text-center w-1/3 text-xl hover:underline font-semibold opacity-50 p-5"
                type="button"
            >
                or <span class="font-bold"
                    >{isRegister ? "Login" : "Register"}</span
                >
            </button>
        {/if}

        {#if !isRegister}
            <button
                on:click={() => (isForgotPassword = !isForgotPassword)}
                class="absolute bottom-0 text-slate-500 font-md text-center w-1/3 text-lg hover:underline p-5"
                type="button"
            >
                {isForgotPassword
                    ? "Can you remember?"
                    : "Forgot your Password?"}
            </button>
        {/if}
    </div>
{:else}
    <slot />
{/if}
