<script lang="ts">
    import Auth from "$lib/auth/auth.svelte";
    import { Jellyfish } from "svelte-loading-spinners";
    import { onMount } from "svelte";
    import { supabase } from "../supabaseClient";
    import type { AuthSession } from "@supabase/supabase-js";
    import "../app.css";

    let session: AuthSession | null = null;
    let isLoading = true;

    onMount(() => {
        supabase.auth.getSession().then(({ data }) => {
            session = data.session;
            isLoading = false;
        });

        supabase.auth.onAuthStateChange((_event, _session) => {
            session = _session;
        });
    });
</script>

{#if isLoading}
    <div class="w-full min-h-screen flex justify-center items-center">
        <Jellyfish size="500" color="#FF3E00" unit="px" duration="1s" />
    </div>
{:else}
    <Auth>
        <slot />
    </Auth>
{/if}
