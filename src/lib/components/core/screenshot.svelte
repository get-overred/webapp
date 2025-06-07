<script lang="ts">
  import { onMount } from "svelte";
  import cursorUrl from "$lib/assets/cursor.png";
  import "@fortawesome/fontawesome-free/css/all.min.css";

  interface targetData {
    click_x: number;
    click_y: number;
    left: number;
    top: number;
    width: number;
    height: number;
    canvas_width: number;
    canvas_height: number;
    url: string;
    hmtl: string;
    x_path: string;
    descrb: string | null;
    title: string;
  }

  // Data
  export let base64: string; // data:image/png;base64,xxx
  export let targetData: targetData;
  export let id: string;

  // Variables:
  export let target_bg_color: string;
  export let target_border_radius: string;
  export let target_no_fillout: boolean;
  export let target_replace_cursor: boolean;
  export let target_enable_arrow: boolean;
  export let image_border_radius: string;
  export let target_scale_factor: string | null;
  export let image_size_perc: string;
  export let image_border_show: boolean;
  export let border: string;
  export let targetBlob: string | null;
  export let targetBlobWithBorder: string | null;

  // Debounce and Loading State
  let debounceTimeout;
  let renderToken: number = 0;
  let pendingUpdates = new Set<string>();
  let pendingUpdatesCount = 0;
  let showImage: boolean = true;
  let worker: Worker;
  let imageUrl: string | null = null; // string for altered image

  // Canvas Dimensions
  let _overlay_width = 0;
  let _overlay_height = 0;
  let _overlay_x = 0;
  let _overlay_y = 0;
  const _overlay_padding = 10;
  const _strokeWidth = 3;

  onMount(() => {
    if (base64 && targetData) {
      calcTargetPosition();
      initializeWorker();
      updateCanvas();
    }
  });

  function initializeWorker() {
    worker = new Worker(new URL("./screenshot.worker.ts", import.meta.url));
    worker.onmessage = (e) => {
      const { blob, blobWithBorder } = e.data;

      imageUrl = null; // Revoke imageUrl
      imageUrl = URL.createObjectURL(blob); // create new url
      targetBlob = URL.createObjectURL(blob);
      targetBlobWithBorder = URL.createObjectURL(
        image_border_show ? blobWithBorder : blob,
      );
    };
  }

  // Track property changes
  $: if (target_bg_color) {
    // Ensure we're working with rgba format
    if (!target_bg_color.startsWith("rgba")) {
      // Convert hex to rgba if needed
      const hex = target_bg_color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      target_bg_color = `rgba(${r}, ${g}, ${b}, 1)`;
    }
    pendingUpdates.add("bg_color");
    pendingUpdatesCount = pendingUpdates.size;
  }
  $: if (target_border_radius) {
    pendingUpdates.add("border_radius");
    pendingUpdatesCount = pendingUpdates.size;
  }
  $: target_no_fillout,
    (() => {
      pendingUpdates.add("no_fillout");
      pendingUpdatesCount = pendingUpdates.size;
    })();
  $: target_replace_cursor,
    (() => {
      pendingUpdates.add("replace_cursor");
      pendingUpdatesCount = pendingUpdates.size;
    })();
  $: target_enable_arrow,
    (() => {
      pendingUpdates.add("enable_arrow");
      pendingUpdatesCount = pendingUpdates.size;
    })();
  $: if (image_border_radius) {
    pendingUpdates.add("image_border_radius");
    pendingUpdatesCount = pendingUpdates.size;
  }
  $: if (target_scale_factor) {
    pendingUpdates.add("scale_factor");
    pendingUpdatesCount = pendingUpdates.size;
  }
  $: if (image_size_perc) {
    pendingUpdates.add("size_perc");
    pendingUpdatesCount = pendingUpdates.size;
  }
  $: if (image_border_show) {
    pendingUpdates.add("image_border_show");
    pendingUpdatesCount = pendingUpdates.size;
  }

  // Debounced update
  $: if (pendingUpdatesCount > 0) {
    console.log("pendingUpdate size > 0 ");
    const currentToken = ++renderToken;
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => {
      if (currentToken === renderToken) {
        showImage = false;
        updateCanvas();
        showImage = true;
        pendingUpdates.clear();
        pendingUpdatesCount = 0;
      }
    }, 250);
  }

  // Target Call:
  async function updateCanvas() {
    console.log("updateCanvas ...");
    if (!worker) return;

    try {
      // Load SVG
      const response = await fetch(cursorUrl);
      const svgBlob = await response.blob();
      const cursorBitmap = await createImageBitmap(svgBlob, {
        resizeQuality: "high",
        resizeWidth: 75,
        resizeHeight: 75,
      });

      // Load Backdrop
      const backdropBitmap = await createImageBitmap(
        await fetch(base64).then((r) => r.blob()),
      );

      worker.postMessage({
        backdropBitmap,
        cursorBitmap,
        targetData,
        options: {
          target_bg_color,
          target_border_radius,
          target_no_fillout,
          target_replace_cursor,
          target_enable_arrow,
          image_border_radius,
          target_scale_factor,
          image_size_perc,
          _overlay_x,
          _overlay_y,
          _overlay_width,
          _overlay_height,
          _strokeWidth,
          border,
        },
      });
    } catch (error) {
      console.error("Error creating image bitmaps:", error);
    }
  }

  function calcTargetPosition() {
    _overlay_x = targetData.left - _overlay_padding;
    _overlay_y = targetData.top - _overlay_padding;
    _overlay_width = targetData.width + _overlay_padding * 2;
    _overlay_height = targetData.height + _overlay_padding * 2;
  }

  // Track property changes
  $: if (target_bg_color) {
    pendingUpdates.add("bg_color");
  }
  $: if (target_border_radius) pendingUpdates.add("border_radius");
  $: if (target_no_fillout) pendingUpdates.add("no_fillout");
  $: if (target_replace_cursor) pendingUpdates.add("replace_cursor");
  $: if (target_enable_arrow) pendingUpdates.add("enable_arrow");
  $: if (image_border_radius) pendingUpdates.add("image_border_radius");
  $: if (target_scale_factor) pendingUpdates.add("scale_factor");
  $: if (image_size_perc) pendingUpdates.add("size_perc");
  $: console.log("pendingUpdates: ", pendingUpdates);
</script>

<div class="w-full flex justify-center items-center">
  <div
    id={"image_wrapper_" + id}
    aria-label={"image_wrapper_" + id}
    role="img"
    style="
        border-radius: {image_border_radius}px; 
        width: {image_size_perc}%; 
        border: {image_border_show ? border : 'none'};"
    class="image__wrapper w-[50%] rounded-sm flex justify-center items-center size-min object-contain overflow-clip"
  >
    {#if imageUrl}
      <img
        id={"image_" + id}
        alt={"image_" + id}
        src={imageUrl}
        style="width: 100%; height: auto;"
      />
    {:else}
      <img
        id={"image_" + id + "_backdrop"}
        alt={"image_" + id + "_backdrop"}
        src={base64}
        style="width: 100%; height: auto;"
      />
    {/if}
  </div>
</div>
