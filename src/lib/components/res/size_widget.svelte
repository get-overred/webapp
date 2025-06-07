<script lang="ts">
    export let docWidth: string;
    export let docHeight: string;
    export let activeTab: string;
</script>

{#if docWidth && docHeight && activeTab === "file"}
  <div
    class="fixed bottom-0 left-0 bg-slate-200 bg-opacity-65 rounded-md text-sm px-2 py-1 z-50">
    {docWidth} x {docHeight}
    {docWidth == "21cm" && docHeight == "29.7cm" ? "(A4)" : ""}
  </div>
{/if}
