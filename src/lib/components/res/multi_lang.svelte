<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function exportTrigger() {
        dispatch("export");
    }
</script>

<div class="fixed left-0 top-0 h-full flex justify-center items-center">
    <button
        on:click={() => exportTrigger()}
        class="flex bg-slate-400 rounded-r-full opacity-75 hover:opacity-100 transition-opacity duration-300"
    >
        <i class="fa-solid fa-language text-black text-3xl text-opacity-30 p-3"
        ></i>
    </button>
</div>