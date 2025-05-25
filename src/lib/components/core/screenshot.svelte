<script lang="ts">
  import { onMount } from "svelte";
  import html2canvas from "html2canvas";
  import "@fortawesome/fontawesome-free/css/all.min.css";
  import cursor_svg from "$lib/assets/cursor/cursor.svg";
  import { hexToRgb } from "../func";

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
    title: string; // global, set last
  }

  // Data
  export let base64: string;
  export let targetData: targetData;
  export let id: string;

  // TargetBlob
  export let targetBlob: string | null;
  export let targetBlobWithBorder: string | null;

  // Variables:
  export let target_bg_color: string;
  export let target_border_radius: string;
  export let target_no_fillout: boolean;
  export let target_replace_cursor: boolean;
  export let target_enable_arrow: boolean;
  export let image_border_radius: string;
  export let target_scale_factor: string | null;
  export let image_size_perc: string;
  export let border: string;

  // Debounce
  let debounceTimeout;
  let renderToken: number = 0;

  onMount(() => {
    if (base64 && targetData) {
      calcTargetPosition();
      generateCanvas();
    }
  });

  $: if (
    target_bg_color ||
    target_border_radius ||
    target_no_fillout ||
    target_replace_cursor ||
    target_enable_arrow ||
    image_border_radius ||
    target_scale_factor ||
    image_size_perc
  ) {
    const currentToken = ++renderToken;
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      showImage = false;
    }
    debounceTimeout = setTimeout(() => {
      if (currentToken === renderToken) {
        showImage = false;
        updateCanvas();
        showImage = true;
      }
    }, 100);
  }

  let showImage: boolean = true;

  let _overlay_width = 0;
  let _overlay_height = 0;
  let _overlay_x = 0;
  let _overlay_y = 0;

  const _overlay_padding = 10;
  const _strokeWidth = 3;

  let cursor_svg_width: number = 0;
  let cursor_svg_height: number = 0;

  async function updateCanvas() {
    const image = document.getElementById("image_" + id);
    if (image) image.innerHTML = "";

    calcTargetPosition();
    generateCanvas();
  }

  function calcTargetPosition() {
    _overlay_x = targetData.left - _overlay_padding;
    _overlay_y = targetData.top - _overlay_padding;
    _overlay_width = targetData.width + _overlay_padding * 2;
    _overlay_height = targetData.height + _overlay_padding * 2;
  }

  function generateCanvas() {
    // const canvas = <HTMLCanvasElement>document.getElementById("canvas_" + id);
    if (typeof document === "undefined") return;
    const canvas = document.createElement("canvas");

    let img = new Image();
    img.src = base64;

    canvas.width = targetData.canvas_width;
    canvas.height = targetData.canvas_height;

    // set Offscreen:
    const offscreen = canvas.transferControlToOffscreen();
    const ctx = offscreen.getContext("2d");

    // set Cursor Dimensions
    const svg = new Image();
    svg.src = cursor_svg;
    svg.onload = function () {
      const rect = svg.getBoundingClientRect();
      cursor_svg_width = rect.width;
      cursor_svg_height = rect.height;
    };

    const loadImage = (url: any) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", (err) => reject(err));
        img.src = url;
      });

    const target_bg_rgb = hexToRgb(target_bg_color);

    const imageSRCs = [base64, cursor_svg];

    Promise.all(imageSRCs.map(loadImage)).then(([backdrop, cursor1]) => {
      if (!ctx) return;

      console.log("RENDER");

      const cBackdrop = backdrop as CanvasImageSource;
      const cCursor1 = cursor1 as CanvasImageSource;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Ensure Transparent Background:
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      applyCanvasClip(Number(image_border_radius));

      // Transform + Scale:
      if (target_scale_factor == "0.99") {
        // set default scale factor by puffer:
        target_scale_factor = Math.min(
          canvas.width / (canvas.width / 4 + _overlay_width),
          canvas.width / (canvas.width / 4 + _overlay_width),
        ).toString();
      }
      const scale = Number(target_scale_factor);
      const { width, height } = ctx.canvas;
      let trans = {
        x: _overlay_x * scale - (width - _overlay_width * scale) / 2,
        y: _overlay_y * scale - (height - _overlay_height * scale) / 2,
      };

      // Right Edge endpoint: @canvas.width*scale => max. offset @(canvas.width*scale)-canvas.width
      // Bottom Edge endpoint: @canvas.height*scale => max. offset @(canvas.height*scale)-canvas.height
      // Left max. offset @0, Top max. offset @0

      if (trans.x < 0) {
        trans.x = 0; // left checkout
      }
      if (trans.y < 0) {
        trans.y = 0; // top check
      }
      if (trans.x > canvas.width * scale - canvas.width) {
        trans.x = canvas.width * scale - canvas.width; // right checkout
      }
      if (trans.y > canvas.height * scale - canvas.height) {
        trans.y = canvas.height * scale - canvas.height; // bottom checkout
      }
      ctx.setTransform(scale, 0, 0, scale, -trans.x, -trans.y); // 2.) translate

      // Adding Image
      ctx.drawImage(cBackdrop, 0, 0, canvas.width, canvas.height);

      if (!target_replace_cursor) {
        // Outer Target stroke
        ctx.strokeStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, 1.0)`;
        ctx.lineWidth = !target_no_fillout ? _strokeWidth : _strokeWidth * 2.5;
        ctx.beginPath();
        ctx.roundRect(
          _overlay_x - _strokeWidth * 2,
          _overlay_y - _strokeWidth * 2,
          _overlay_width + _strokeWidth * 4,
          _overlay_height + _strokeWidth * 4,
          [
            Number(target_border_radius),
            Number(target_border_radius),
            Number(target_border_radius),
            Number(target_border_radius),
          ],
        );
        ctx.stroke();

        if (!target_no_fillout) {
          ctx.beginPath();
          ctx.roundRect(
            _overlay_x,
            _overlay_y,
            _overlay_width,
            _overlay_height,
            [
              Number(target_border_radius),
              Number(target_border_radius),
              Number(target_border_radius),
              Number(target_border_radius),
            ],
          );

          ctx.strokeStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, 0.333)`;
          ctx.lineWidth = _strokeWidth;
          ctx.stroke();

          // Fill the rectangle (inside)
          ctx.fillStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, 0.666)`;
          ctx.fill();
        }
      } else {
        //* add Cursor:
        const size = 75;
        ctx.drawImage(
          cCursor1,
          targetData.click_x,
          targetData.click_y,
          size,
          size,
        );
      }

      if (target_enable_arrow) {
        //* Create Arrow:
        createArrow();
        function createArrow() {
          const size1 = _overlay_x * _overlay_y; // corner tl
          const size2 =
            _overlay_x * (canvas.height - (_overlay_y + _overlay_height)); // corner bl
          const size3 =
            (canvas.width - (_overlay_x + _overlay_width)) * _overlay_y; // corner tr
          const size4 =
            (canvas.width - (_overlay_x + _overlay_width)) *
            (canvas.height - (_overlay_y + _overlay_height)); // corner br
          genArrow(
            Math.max(size1, size2, size3, size4),
            size1,
            size2,
            size3,
            size4,
          );

          function genArrow(max: number, size1, size2, size3, size4) {
            // **************************** //
            const _puffer = 10;
            let _space_x = 30 - _puffer;
            let _space_y = 30 - _puffer;
            const _length = 120;
            // **************************** //

            switch (max) {
              case size1:
                const _head1 = [_overlay_x - _space_x, _overlay_y - _space_y];
                const _end1 = [_head1[0] - _length, _head1[1] - _length];
                genLine(_head1, _end1);
                genTriangle(_head1, _end1, "tl");
                break;
              case size2:
                const _head4 = [
                  _overlay_x - _space_x,
                  _overlay_y + _overlay_height + _space_y,
                ];
                const _end4 = [_head4[0] - _length, _head4[1] + _length];
                genLine(_head4, _end4);
                genTriangle(_head4, _end4, "bl");
                break;
              case size3:
                const _head2 = [
                  _overlay_x + _overlay_width + _space_x,
                  _overlay_y - _space_y,
                ];
                const _end2 = [_head2[0] + _length, _head2[1] - _length];
                genLine(_head2, _end2);
                genTriangle(_head2, _end2, "tr");
                break;
              case size4:
                const _head3 = [
                  _overlay_x + _overlay_width + _space_x,
                  _overlay_y + _overlay_height + _space_y,
                ];
                const _end3 = [_head3[0] + _length, _head3[1] + _length];
                genLine(_head3, _end3);
                genTriangle(_head3, _end3, "br");
                break;
            }
          }
          function genLine(head: Array<number>, end: Array<number>) {
            ctx!.strokeStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, 1.0)`;
            ctx!.lineWidth = 10;
            ctx!.beginPath();
            ctx!.moveTo(head[0], head[1]);
            ctx!.lineTo(end[0], end[1]);
            ctx!.stroke();
          }
          function genTriangle(
            head: Array<number>,
            end: Array<number>,
            kind: string,
          ) {
            const x_diff = end[0] - head[0];
            const y_diff = end[1] - head[1];

            const new_x = head[0] + 0.1 * x_diff;
            const new_y = head[1] + 0.1 * y_diff;

            ctx!.fillStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, 1.0)`;
            ctx!.beginPath();

            if (kind.includes("t")) {
              ctx!.moveTo(new_x + 10, kind == "tl" ? new_y - 10 : new_y + 10);
              ctx!.lineTo(new_x - 10, kind == "tl" ? new_y + 10 : new_y - 10);
              ctx!.lineTo(
                kind == "tl" ? head[0] + 10 : head[0] - 10,
                head[1] + 10,
              );
            }
            if (kind.includes("b")) {
              ctx!.moveTo(new_x + 10, kind == "bl" ? new_y + 10 : new_y - 10);
              ctx!.lineTo(new_x - 10, kind == "bl" ? new_y - 10 : new_y + 10);
              ctx!.lineTo(
                kind == "bl" ? head[0] + 10 : head[0] - 10,
                head[1] - 10,
              );
            }

            ctx!.fill();
          }
        }
      }

      function applyCanvasClip(radius: number) {
        const width = ctx!.canvas.width;
        const height = ctx!.canvas.height;

        ctx!.beginPath();
        ctx!.moveTo(radius, 0);
        ctx!.arcTo(width, 0, width, height, radius);
        ctx!.arcTo(width, height, 0, height, radius);
        ctx!.arcTo(0, height, 0, 0, radius);
        ctx!.arcTo(0, 0, width, 0, radius);
        ctx!.closePath();

        ctx!.clip(); // Enforce clipping for all elements
      }

      // devStuff()
      function devStuff() {
        addCenterGrid();
        addPuffer();

        function addCenterGrid() {
          ctx!.beginPath();
          ctx!.moveTo(canvas.width / 2, 0);
          ctx!.lineTo(canvas.width / 2, canvas.height);
          ctx!.strokeStyle = "rgba(255, 0, 255)";
          ctx!.lineWidth = 10;
          ctx!.stroke();

          ctx!.moveTo(0, canvas.height / 2);
          ctx!.lineTo(canvas.width, canvas.height / 2);
          ctx!.stroke();

          ctx!.closePath();
        }
        function addPuffer() {
          const puffer = 177.7777777779;

          const scale = Math.min(
            canvas.width / (_overlay_width + puffer * 2),
            canvas.height / (_overlay_height + puffer * 2),
          );
          console.log("Scale needed: ", scale);
          // ...................................................................$

          ctx!.beginPath();
          ctx!.moveTo(_overlay_x - puffer, _overlay_y - puffer);
          ctx!.lineTo(
            _overlay_x + _overlay_width + puffer,
            _overlay_y - puffer,
          );
          ctx!.lineTo(
            _overlay_x + _overlay_width + puffer,
            _overlay_y + _overlay_height + puffer,
          );
          ctx!.lineTo(
            _overlay_x - puffer,
            _overlay_y + _overlay_height + puffer,
          );

          ctx!.lineTo(_overlay_x - puffer, _overlay_y - puffer); // egal
          ctx!.strokeStyle = "rgba(5, 250, 25)";
          ctx!.lineWidth = 5;
          ctx!.stroke();

          ctx!.beginPath();
          // PUFFER [center]
          ctx!.moveTo(
            _overlay_x - puffer + (puffer * 2 + _overlay_width) / 2,
            _overlay_y - puffer,
          ); // x1 center
          ctx!.lineTo(
            _overlay_x - puffer + (puffer * 2 + _overlay_width) / 2,
            _overlay_y + puffer + _overlay_height,
          );

          ctx!.moveTo(
            _overlay_x - puffer,
            _overlay_y - puffer + (puffer * 2 + _overlay_height) / 2,
          ); // y1 center
          ctx!.lineTo(
            _overlay_x + puffer + _overlay_width,
            _overlay_y - puffer + (puffer * 2 + _overlay_height) / 2,
          );

          ctx!.strokeStyle = "rgba(250, 250, 0)";
          ctx!.lineWidth = 5;
          ctx!.stroke();
        }
      }

      offscreen.convertToBlob().then((blob) => {
        // Convert to Image:
        const image = document.getElementById(
          "image_" + id,
        ) as HTMLImageElement;
        image.setAttribute("crossorigin", "anonymous");
        // image.src = canvas.toDataURL("image/png"); // png to ensure transparent parts
        image.src = URL.createObjectURL(blob);
        targetBlob = URL.createObjectURL(blob);
        image.onload = () => {
          html2canvas(
            document.querySelector("#image_wrapper_" + id) as HTMLElement,
            {
              allowTaint: true,
              useCORS: true,
              removeContainer: false,
              backgroundColor: null,
              scale: window.devicePixelRatio,
            },
          ).then(function (canvas) {
            targetBlobWithBorder = canvas.toDataURL("image/png");
          });
        };
      });
    });
  }
</script>

{#if showImage}
  <!-- <canvas id={"canvas_" + id} class="hidden" /> -->
  <div class="w-full flex justify-center items-center">
    <div
      id={"image_wrapper_" + id}
      style="
        border-radius: {image_border_radius}px; 
        width: {image_size_perc}%; 
        border: {border};"
      class="image__wrapper w-[50%] rounded-sm flex justify-center items-center size-min object-contain overflow-clip"
    >
      <img id={"image_" + id} alt={"image_" + id} />
    </div>
  </div>
{/if}
