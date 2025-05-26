<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import MultiButton from "../res/multi_button.svelte";
  import varData from "./variables.json";
  import { VARIABLES } from "../../../store";

  export let yScroll: number;
  export let scroll_to_export: boolean;

  const dispatch = createEventDispatcher();
  let expandedSection: string | null = "DOCUMENT"; // Default expanded section

  function exportTrigger(id: string) {
    dispatch("export", id);
  }

  function toggleSection(title: string) {
    expandedSection = expandedSection === title ? null : title;
  }

  $: if (scroll_to_export == true) {
    if (typeof document !== "undefined") {
      const header = document.getElementById("editor_header");
      header?.scrollBy({ left: 10000, behavior: "smooth" });
      expandedSection = "EXPORT"; // Expand the EXPORT section
      scroll_to_export = false;
    }
  }
</script>

<header
  id="editor_header"
  class={`h-[110px] overflow-x-scroll space-x-6 shadow-inner py-2 px-6 border-opacity-25 flex flex-row sticky z-[90] top-0 items-center transition-all duration-500 w-full bg-slate-300 ${yScroll > 0 ? " bg-opacity-90" : " bg-opacity-100"}`}
>
  {#each varData as category}
    <div
      class="flex flex-col h-full bg-slate-200 rounded-md p-2 justify-between transition-all duration-300 cursor-pointer hover:bg-slate-300"
      class:expanded={expandedSection === category.title}
      on:click={() => toggleSection(category.title)}
    >
      <p
        id="regional_header"
        class="text-black font-bold text-opacity-80 text-sm flex items-center justify-between"
      >
        {category.title}
        <span class="text-xs ml-2">
          {#if expandedSection === category.title}
            <i class="fa-solid fa-chevron-up"></i>
          {:else}
            <i class="fa-solid fa-chevron-down"></i>
          {/if}
        </span>
      </p>

      {#if expandedSection === category.title}
        <div class="w-full flex flex-row space-x-4 px-3">
          {#each category.inputs as input}
            {#if input["display"] !== "NO"}
              <div class="flex flex-col space-y-1 w-[160px]">
                {#if input.type !== "export"}
                  <label
                    class="w-full flex justify-start text-left pl-1 text-sm"
                    for={input.id}>{input.label}</label
                  >
                  <div
                    class="flex w-full justify-center border-slate-400 border rounded-lg px-2 py-0.5 h-[24px] object-contain overflow-clip"
                  >
                    {#if input.type == "color"}
                      <input
                        type="color"
                        id={input.id}
                        name={input.id}
                        class="h-full w-full object-cover p-0 border-none bg-transparent text-xs"
                        bind:value={$VARIABLES[input.id]}
                        on:click|stopPropagation={() => {}}
                      />
                    {:else if input.type == "range"}
                      <input
                        type="range"
                        id={input.id}
                        name={input.id}
                        min={input["range_min"] ?? 0}
                        max={input["range_max"] ?? 0}
                        step={input["range_step"] ?? 0}
                        class="h-full p-0 border-none bg-transparent text-xs"
                        style="accent-color: rgb(250,0,0,0.5);"
                        bind:value={$VARIABLES[input.id]}
                        on:click|stopPropagation={() => {}}
                      />
                    {:else if input.type == "select"}
                      <select
                        bind:value={$VARIABLES[input.id]}
                        class="bg-transparent outline-none border-none focus:outline-none focus:border-none text-xs w-full"
                        on:click|stopPropagation={() => {}}
                      >
                        {#each input["selectors"] as option, i}
                          <option value={option}>{option}</option>
                        {/each}
                      </select>
                    {:else if input.type == "multi_button"}
                      <form
                        class="w-full h-full flex flex-row justify-evenly items-center"
                        on:click|stopPropagation={() => {}}
                      >
                        <MultiButton
                          data={input["selectors"]}
                          bind:value={$VARIABLES[input.id]}
                        />
                      </form>
                    {:else if input.type == "text"}
                      <input
                        type="text"
                        id={input.id}
                        name={input.id}
                        class="h-full p-0 border-none bg-transparent text-center text-xs w-full"
                        bind:value={$VARIABLES[input.id]}
                        on:click|stopPropagation={() => {}}
                      />
                    {:else if input.type == "checkbox"}
                      <input
                        type="checkbox"
                        id={input.id}
                        name={input.id}
                        class="h-full p-0 border-none bg-transparent text-center text-base"
                        style="accent-color: rgb(250,0,0,0.5);"
                        bind:checked={$VARIABLES[input.id]}
                        on:click|stopPropagation={() => {}}
                      />
                    {:else if input.type == "file"}
                      <div
                        class="w-full h-full relative"
                        on:click|stopPropagation={() => {}}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          id={input.id}
                          name={input.id}
                          class="h-full w-full p-0 border-none bg-transparent absolute inset-0"
                          style="opacity: 1%;"
                          on:change={(e) => {
                            if (e.target instanceof HTMLInputElement) {
                              let reader = new FileReader();
                              if (e.target.files)
                                reader.readAsDataURL(e.target.files[0]);
                              reader.onload = (ev) => {
                                console.log("Got File:");
                                console.log(ev.target);
                                console.log(ev.target?.result);
                                $VARIABLES[input.id] = ev.target?.result;
                                console.log($VARIABLES[input.id]);
                              };
                            }
                          }}
                        />
                        <input
                          type="button"
                          value="Browse..."
                          class="h-full w-full p-0 border-none bg-transparent absolute inset-0"
                          style="pointer-events: none;"
                        />
                      </div>
                    {/if}
                  </div>
                {:else}
                  <button
                    id={input.id}
                    on:click|stopPropagation={() => exportTrigger(input.id)}
                    class="flex flex-row justify-center items-center space-x-4 px-4 bg-primary-color border-primary-plus-color border rounded-xl mr-auto mt-auto text-black text-sm shadow-inner font-bold"
                  >
                    <p>{input.label}</p>
                    <span class="text-base"><i class={input["icon"]} /></span>
                  </button>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</header>

<style>
  #regional_header {
    margin-top: 0px;
    font-weight: bold;
    width: 100%;
    color: #000;
    border-left: 3px solid rgb(250, 0, 0);
    padding: 0.15em 0.75em;
  }

  .expanded {
    background-color: rgb(226 232 240);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
</style>
