<script lang="ts">
  interface DataEntry {
    value: string
    icon: string
  }

  //   export let valuee: any
  export let data: Array<DataEntry>
  export let value: any

  function clickkk(val: any) {
    console.log("Clicked on: ", val)
    value = val
  }
</script>

<form
  on:submit|preventDefault
  class="flex flex-row justify-evenly w-full h-full">
  {#each data as _entry}
    <button
      class={`${_entry.icon} ${value == _entry.value ? "  text-slate-900 text-opacity-85" : " text-opacity-75"} text-slate-500 rounded-sm w-full h-full p-0 m-0 text-lg flex justify-center items-center`}
      on:click={() => clickkk(_entry.value)} />
  {/each}
</form>
