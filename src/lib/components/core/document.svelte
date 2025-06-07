<script lang="ts">
  import Screenshot from "./screenshot.svelte";
  import { type FLOW, type Variables } from "../func";
  import { onMount } from "svelte";

  export let VARIABLES: Variables;
  export let currFlow: FLOW;

  let container;
  let visibleSteps = new Set<number>();
  let observer: IntersectionObserver;

  async function saveChanges() {
    const heading = document.getElementById("heading")?.innerText;
    if (heading) currFlow.title = heading;

    const bodyTexts = document.getElementsByClassName("body_texts");
    for (let index = 0; index < bodyTexts.length; index++) {
      const element = bodyTexts[index] as HTMLElement;
      if (element?.innerText) {
        currFlow.steps[index].descrb = element.innerText;
      }
    }
  }

  onMount(() => {
    console.log("here: ", VARIABLES.editor_scale);

    // Initialize intersection observer
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = parseInt(entry.target.getAttribute("data-index") || "-1");
          if (idx === -1) return;

          if (entry.isIntersecting) {
            visibleSteps.add(idx);
          } else {
            visibleSteps.delete(idx);
          }
          visibleSteps = new Set(visibleSteps); // Trigger reactivity
        });
      },
      {
        root: container,
        threshold: 0.1,
        rootMargin: "100px", // Preload screenshots slightly before they come into view
      },
    );

    // Observe all step containers
    document.querySelectorAll(".step-container").forEach((el) => {
      observer.observe(el);
    });
  });
</script>

<div
  style="
  transform-origin: top center;
  transform: scale({VARIABLES.editor_scale});
  position: relative;
  margin-top: 75px;
  width: 100%;
  padding: 0 5rem;
  "
  id="editor-view"
  class="w-full"
>
  <div
    id="page"
    style="
    background-color:{VARIABLES.document_bg_color};
    padding:{VARIABLES.document_padding}px;
    width: {VARIABLES.document_width};
    min-height: {VARIABLES.document_height}px;"
    class="mx-auto flex flex-col w-full"
  >
    <h1
      id="heading"
      on:input={saveChanges}
      contenteditable="true"
      style="
          font-family:{VARIABLES.document_txt_font};
          color:{VARIABLES.document_h_txt_color};
          font-size:{VARIABLES.document_h_txt_size}px;
          line-height:{Number(VARIABLES.document_h_txt_size) * 1.618}px;
          font-weight:{VARIABLES.document_h_txt_weight};
          text-align:{VARIABLES.document_h_txt_align};
          width: 100%;
          "
      class=" text_area outline-none border-none focus:ring-0 focus:border-transparent focus:outline-none"
    >
      {currFlow.title || "Undefined"}
    </h1>

    <div
      bind:this={container}
      class="flex flex-col justify-center items-center w-full h-full"
    >
      {#each currFlow.steps as _, idx}
        <!-- {#if idx === 0} -->
        <div
          data-index={idx}
          class="step-container flex flex-col justify-center items-center w-full h-full"
          style="
              margin-top: {Number(VARIABLES.document_space_y)}px;
              "
        >
          {#if visibleSteps.has(idx)}
            <Screenshot
              base64={currFlow.steps[idx].base64}
              targetData={currFlow.steps[idx].target_data}
              id={idx.toString() + "_overred"}
              target_bg_color={VARIABLES.target_bg_color}
              target_border_radius={VARIABLES.target_border_radius}
              target_no_fillout={VARIABLES.target_no_fillout}
              target_replace_cursor={VARIABLES.target_replace_cursor}
              target_enable_arrow={VARIABLES.target_enable_arrow}
              image_border_radius={VARIABLES.image_border_radius}
              image_size_perc={VARIABLES.image_size_perc}
              image_border_show={VARIABLES.image_border_show}
              border={`${VARIABLES.image_border_width}px ${VARIABLES.image_border_type} ${VARIABLES.image_border_color}`}
              bind:target_scale_factor={VARIABLES.target_scale_factor}
              bind:targetBlob={currFlow.steps[idx].blob_target}
              bind:targetBlobWithBorder={currFlow.steps[idx].blob_target_b}
            />
          {:else}
            <div
              class="placeholder"
              style="height: {VARIABLES.document_height}px;"
            />
          {/if}

          <p
            on:input={saveChanges}
            contenteditable="true"
            style="
                font-family:{VARIABLES.document_txt_font};
                color:{VARIABLES.document_p_txt_color};
                font-size:{VARIABLES.document_p_txt_size}px;
                line-height:{Number(VARIABLES.document_p_txt_size) * 1.618}px;
                font-weight:{VARIABLES.document_p_txt_weight};
                text-align:{VARIABLES.document_p_txt_align};
                width: 100%;
                padding-right: 5%;
                padding-left: 5%;
                min-height: 0px;
                margin-top: {VARIABLES.document_p_txt_size}px;
                "
            class="body_texts outline-none border-none focus:ring-0 focus:border-transparent focus:outline-none"
          >
            {currFlow.steps[idx].descrb || "Undefined"}
          </p>
        </div>
        <!-- {/if} -->
      {/each}
    </div>
  </div>
</div>

<style>
  #page {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    position: relative;
    overflow: hidden;
    page-break-after: always;
    break-after: always;
  }

  .placeholder {
    background: linear-gradient(
      45deg,
      #f0f0f0 25%,
      #e0e0e0 25%,
      #e0e0e0 50%,
      #f0f0f0 50%,
      #f0f0f0 75%,
      #e0e0e0 75%
    );
    background-size: 20px 20px;
    animation: placeholderShimmer 1s linear infinite;
  }

  @keyframes placeholderShimmer {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 40px 0;
    }
  }
</style>
