<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function exportTrigger() {
        dispatch("export");
    }
</script>

<button
    on:click={() => exportTrigger()}
    class="fixed bottom-0 right-0 m-5 mb-20 shadow-2xl bg-primary-color rounded-3xl border-2 border-primary-plus-color hover:bg-primary-plus-color"
>
    <div
        class="flex flex-row space-x-4 px-6 py-2 text-lg jusitfy-center items-center shadow-inner"
    >
        <p class="font-bold text-center">Export</p>
        <i class="fa-solid fa-share-from-square"></i>
    </div>
</button>
