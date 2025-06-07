<script lang="ts">
    export let scaleFactor: number;

    $: console.log("scaleFactor updated: ", scaleFactor)
</script>

<div
    class="fixed bottom-0 right-0 bg-slate-200 bg-opacity-65 rounded-md text-sm px-2 py-1 space-y-1 z-50"
>
    <button on:click={() => scaleFactor = scaleFactor*1.05} class="bg-slate-300 rounded-md p-1">
        <i class="fa-solid fa-plus"></i>
    </button>
    <button on:click={() => scaleFactor = scaleFactor*0.95} class="bg-slate-300 rounded-md p-1">
        <i class="fa-solid fa-minus"></i>
    </button>
</div>
