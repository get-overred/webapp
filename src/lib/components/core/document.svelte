<script lang="ts">
  import Screenshot from "./screenshot.svelte";
  import { type FLOW, type Variables } from "../func";

  export let VARIABLES: Variables;
  export let currFlow: FLOW;

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
</script>

<div
  style="
  scale: {VARIABLES.editor_scale};
  transform: translateY({-200}px)
  "
  id="editor-view"
  class="h-full w-full p-20"
>
  <div
    id="page"
    style="
    background-color:{VARIABLES.document_bg_color};
    padding:{VARIABLES.document_padding}px;
    width: {VARIABLES.document_width};
    min-height: {VARIABLES.document_height}px;"
    class="mx-auto flex flex-col w-full h-full"
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

    <div class="flex flex-col justify-center items-center w-full h-full">
      {#each currFlow.steps as _, idx}
        <div
          style="
              margin-top: {Number(VARIABLES.document_space_y)}px;
              "
          class="flex flex-col justify-center items-center w-full h-full"
        >
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
            border={`${VARIABLES.image_border_width}px ${VARIABLES.image_border_type} ${VARIABLES.image_border_color}`}
            bind:target_scale_factor={VARIABLES.target_scale_factor}
            bind:targetBlob={currFlow.steps[idx].blob_target}
            bind:targetBlobWithBorder={currFlow.steps[idx].blob_target_b}
          />

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
      {/each}
    </div>
  </div>
</div>

<style>
  #page {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    position: relative;
    overflow: hidden;
    page-break-after: always; /* Forces a new page */
    break-after: always;
  }
</style>
