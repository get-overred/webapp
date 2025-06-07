<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import MultiButton from "../res/multi_button.svelte";
  import varData from "./variables.json";
  import { VARIABLES } from "../../../store";
  import type { Category, Input, ExportInput } from "$lib/types/input";

  export let yScroll: number;
  export let scroll_to_export: boolean;
  export let activeTab: "file" | "video";

  const dispatch = createEventDispatcher();
  let expandedSection: string | null =
    activeTab === "video" ? "VIDEO" : "DOCUMENT";
  let isMinimized = false;
  let wasMinimized = false;

  const categories: Category[] = varData;

  function isExportInput(input: Input): input is ExportInput {
    return input.type === "export" && "description" in input;
  }

  function getExportDescription(input: Input): string | undefined {
    if (isExportInput(input)) {
      return input.description;
    }
    return undefined;
  }

  $: if (activeTab === "video") {
    expandedSection = "VIDEO";
  } else {
    expandedSection = "DOCUMENT";
  }

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
  $: if (yScroll > 0) {
    if (!wasMinimized) {
      isMinimized = true;
      wasMinimized = true;
    }
  } else {
    isMinimized = false;
    wasMinimized = false;
  }

  function handleHeaderClick() {
    if (isMinimized) isMinimized = false;
  }

  // Reset minimized state when scrolling
  function handleScroll() {
    if (yScroll > 0 && !isMinimized) {
      isMinimized = true;
    }
  }

  function hexToRGBA(hex: string, opacity: number): string {
    // Remove the # if present
    hex = hex.replace("#", "");

    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Return rgba string
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  $: {
    for (const category of categories) {
      for (const input of category.inputs) {
        if (input.type === "color") {
          // Initialize RGB and opacity values if they don't exist
          if (!$VARIABLES[input.id + "_rgb"]) {
            $VARIABLES[input.id + "_rgb"] = "#000000";
          }
          if ($VARIABLES[input.id + "_opacity"] === undefined) {
            $VARIABLES[input.id + "_opacity"] = 1;
          }

          // Initialize the combined rgba value if it doesn't exist
          if (!$VARIABLES[input.id]) {
            $VARIABLES[input.id] = hexToRGBA(
              $VARIABLES[input.id + "_rgb"],
              $VARIABLES[input.id + "_opacity"],
            );
          }
        }
      }
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<header
  id="editor_header"
  class={`overflow-x-scroll space-x-6 shadow-inner py-2 px-6 border-opacity-25 flex flex-row sticky z-[90] top-0 items-start transition-all duration-500 w-full bg-slate-300 ${yScroll > 0 ? " bg-opacity-90" : " bg-opacity-100"}`}
  class:expanded-header={expandedSection !== null}
  class:minimized={isMinimized}
  on:click={handleHeaderClick}
  on:scroll={handleScroll}
  style="position: sticky; top: 0;"
>
  {#each categories as category}
    {#if activeTab === "video" && (category.title === "VIDEO" || category.title === "EXPORT")}
      <div
        class="flex flex-col h-full bg-slate-200 rounded-md transition-all duration-300 hover:bg-slate-300"
        class:expanded={expandedSection === category.title}
      >
        <button
          class="flex items-center justify-between w-full px-4 py-2 border-b border-slate-300"
          on:click={() => toggleSection(category.title)}
        >
          <p
            class="text-black font-bold text-opacity-80 text-sm flex items-center"
          >
            {category.title}
          </p>
          <span class="text-xs text-slate-600">
            {#if expandedSection === category.title}
              <i class="fa-solid fa-chevron-up"></i>
            {:else}
              <i class="fa-solid fa-chevron-down"></i>
            {/if}
          </span>
        </button>

        {#if expandedSection === category.title}
          <div class="flex flex-row space-x-4 p-4">
            {#each category.inputs as input}
              {#if input["display"] !== "NO"}
                <div class="flex flex-col space-y-2 w-[160px]">
                  {#if input.type !== "export"}
                    <label
                      class="w-full flex justify-start text-left text-sm text-slate-700"
                      for={input.id}>{input.label}</label
                    >
                    <div
                      class="flex w-full justify-center border-slate-400 border rounded-lg px-2 py-1 h-[28px] bg-white"
                    >
                      {#if input.type == "color"}
                        <div
                          class="flex flex-row w-full items-center space-x-2"
                        >
                          <div
                            class="relative w-1/2 h-[28px] rounded-md overflow-hidden border border-slate-400"
                          >
                            <input
                              type="color"
                              id={input.id}
                              name={input.id}
                              class="absolute inset-0 w-full h-full p-0 border-none bg-transparent cursor-pointer"
                              bind:value={$VARIABLES[input.id + "_rgb"]}
                              on:click|stopPropagation={() => {}}
                              on:input={(e) => {
                                if (e.target instanceof HTMLInputElement) {
                                  const color = e.target.value;
                                  const opacity =
                                    $VARIABLES[input.id + "_opacity"] ?? 1;
                                  $VARIABLES[input.id] = hexToRGBA(
                                    color,
                                    opacity,
                                  );
                                }
                              }}
                            />
                          </div>
                          <div class="w-1/2 flex items-center">
                            <input
                              type="range"
                              id={input.id + "_opacity"}
                              name={input.id + "_opacity"}
                              min="0"
                              max="1"
                              step="0.01"
                              class="w-full h-[4px] p-0 border-none bg-transparent cursor-pointer"
                              style="accent-color: rgb(250,0,0,0.5);"
                              bind:value={$VARIABLES[input.id + "_opacity"]}
                              on:input={(e) => {
                                if (e.target instanceof HTMLInputElement) {
                                  const opacity = parseFloat(e.target.value);
                                  const color =
                                    $VARIABLES[input.id + "_rgb"] ?? "#000000";
                                  $VARIABLES[input.id] = hexToRGBA(
                                    color,
                                    opacity,
                                  );
                                }
                              }}
                            />
                          </div>
                        </div>
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
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
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
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
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
                    <div class="flex flex-col items-center">
                      <button
                        id={input.id}
                        on:click|stopPropagation={() => exportTrigger(input.id)}
                        class="flex flex-row justify-center items-center space-x-2 px-4 py-2 bg-primary-color border-primary-plus-color border rounded-xl text-black text-sm shadow-inner font-bold hover:bg-opacity-90 transition-colors"
                      >
                        <p>{input.label}</p>
                        <span class="text-base"
                          ><i class={input["icon"]} /></span
                        >
                      </button>
                      {#if isExportInput(input)}
                        <p class="text-xs text-gray-600 mt-1">
                          ({input.description})
                        </p>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {:else if activeTab === "file" && (category.title === "DOCUMENT" || category.title === "TEXT" || category.title === "SCREENSHOT" || category.title === "EXPORT")}
      <div
        class="flex flex-col h-full bg-slate-200 rounded-md transition-all duration-300 hover:bg-slate-300"
        class:expanded={expandedSection === category.title}
      >
        <button
          class="flex items-center justify-between w-full px-4 py-2 border-b border-slate-300"
          on:click={() => toggleSection(category.title)}
        >
          <p
            class="text-black font-bold text-opacity-80 text-sm flex items-center"
          >
            {category.title}
          </p>
          <span class="text-xs text-slate-600">
            {#if expandedSection === category.title}
              <i class="fa-solid fa-chevron-up"></i>
            {:else}
              <i class="fa-solid fa-chevron-down"></i>
            {/if}
          </span>
        </button>

        {#if expandedSection === category.title}
          <div class="flex flex-row space-x-4 p-4">
            {#each category.inputs as input}
              {#if input["display"] !== "NO"}
                <div class="flex flex-col space-y-2 w-[160px]">
                  {#if input.type !== "export"}
                    <label
                      class="w-full flex justify-start text-left text-sm text-slate-700"
                      for={input.id}>{input.label}</label
                    >
                    <div
                      class="flex w-full justify-center border-slate-400 border rounded-lg px-2 py-1 h-[28px] bg-white"
                    >
                      {#if input.type == "color"}
                        <div
                          class="flex flex-row w-full items-center space-x-2"
                        >
                          <div
                            class="relative w-1/2 h-[28px] rounded-md overflow-hidden border border-slate-400"
                          >
                            <input
                              type="color"
                              id={input.id}
                              name={input.id}
                              class="absolute inset-0 w-full h-full p-0 border-none bg-transparent cursor-pointer"
                              bind:value={$VARIABLES[input.id + "_rgb"]}
                              on:click|stopPropagation={() => {}}
                              on:input={(e) => {
                                if (e.target instanceof HTMLInputElement) {
                                  const color = e.target.value;
                                  const opacity =
                                    $VARIABLES[input.id + "_opacity"] ?? 1;
                                  $VARIABLES[input.id] = hexToRGBA(
                                    color,
                                    opacity,
                                  );
                                }
                              }}
                            />
                          </div>
                          <div class="w-1/2 flex items-center">
                            <input
                              type="range"
                              id={input.id + "_opacity"}
                              name={input.id + "_opacity"}
                              min="0"
                              max="1"
                              step="0.01"
                              class="w-full h-[4px] p-0 border-none bg-transparent cursor-pointer"
                              style="accent-color: rgb(250,0,0,0.5);"
                              bind:value={$VARIABLES[input.id + "_opacity"]}
                              on:input={(e) => {
                                if (e.target instanceof HTMLInputElement) {
                                  const opacity = parseFloat(e.target.value);
                                  const color =
                                    $VARIABLES[input.id + "_rgb"] ?? "#000000";
                                  $VARIABLES[input.id] = hexToRGBA(
                                    color,
                                    opacity,
                                  );
                                }
                              }}
                            />
                          </div>
                        </div>
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
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
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
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
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
                    <div class="flex flex-col items-center">
                      <button
                        id={input.id}
                        on:click|stopPropagation={() => exportTrigger(input.id)}
                        class="flex flex-row justify-center items-center space-x-2 px-4 py-2 bg-primary-color border-primary-plus-color border rounded-xl text-black text-sm shadow-inner font-bold hover:bg-opacity-90 transition-colors"
                      >
                        <p>{input.label}</p>
                        <span class="text-base"
                          ><i class={input["icon"]} /></span
                        >
                      </button>
                      {#if isExportInput(input)}
                        <p class="text-xs text-gray-600 mt-1">
                          ({input.description})
                        </p>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/each}
</header>

<style>
  .expanded {
    background-color: rgb(226 232 240);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .expanded-header {
    min-height: 180px;
  }

  :global(#editor_header) {
    min-height: 110px;
    position: sticky;
    top: 0;
    z-index: 90;
  }

  button {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover {
    background-color: rgb(226 232 240);
  }

  .minimized {
    min-height: 40px !important;
    cursor: pointer;
    position: sticky !important;
    top: 0 !important;
    z-index: 90 !important;
    background-color: rgb(226 232 240) !important;
  }

  .minimized > div {
    display: none;
  }

  .minimized:hover {
    background-color: rgb(203 213 225) !important;
  }

  .minimized::after {
    content: "Click to expand";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: rgb(71 85 105);
    font-size: 0.875rem;
    pointer-events: none;
    white-space: nowrap;
  }
</style>
