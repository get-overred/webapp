import { c as create_ssr_component, a as subscribe, v as validate_component } from "../../../chunks/ssr.js";
/* empty css                      */
import "docx";
import { w as writable } from "../../../chunks/index.js";
import "jspdf";
import "jszip";
import { J as Jellyfish } from "../../../chunks/ArrowUp.svelte_svelte_type_style_lang.js";
import "@ffmpeg/ffmpeg";
import "@ffmpeg/util";
import { p as page } from "../../../chunks/stores.js";
const _default = {
  // Document:
  document_bg_color: "#f8fafc",
  // x
  document_padding: "20",
  // x
  document_space_y: "10",
  document_width: "21cm",
  document_height: "29.7cm",
  editor_scale: 1,
  // Text:
  document_txt_font: "Helvetica",
  // x
  document_h_txt_color: "#000000",
  // x
  document_h_txt_size: "25",
  // x
  document_h_txt_weight: "700",
  // x
  document_h_txt_align: "center",
  // x
  document_p_txt_color: "#000000",
  // x
  document_p_txt_size: "15",
  // x
  document_p_txt_weight: "400",
  // x
  document_p_txt_align: "center",
  // x
  // Screenshot:
  target_bg_color: "#e66465",
  // x
  target_border_radius: "20",
  // x
  target_no_fillout: false,
  // x
  target_replace_cursor: false,
  // x
  target_enable_arrow: true,
  // x
  image_border_radius: "5",
  // x ->
  target_scale_factor: "0.99",
  // x
  image_size_perc: "100",
  // x
  image_border_color: "#e66465",
  image_border_type: "double",
  image_border_width: "10",
  image_border_show: true,
  // Video:
  video_zoom_to_element: true,
  video_speed: 1,
  video_enable_subtitles: false,
  video_click_animation: "Splash"
};
const VARIABLES = writable(_default);
const access = writable(null);
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_access;
  let $$unsubscribe_page;
  let $$unsubscribe_VARIABLES;
  $$unsubscribe_access = subscribe(access, (value) => value);
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe_VARIABLES = subscribe(VARIABLES, (value) => value);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${`${`<div class="w-full min-h-screen flex justify-center items-center">${validate_component(Jellyfish, "Jellyfish").$$render(
      $$result,
      {
        size: "500",
        color: "#FF3E00",
        unit: "px",
        duration: "1s"
      },
      {},
      {}
    )}</div>`}`} `;
  } while (!$$settled);
  $$unsubscribe_access();
  $$unsubscribe_page();
  $$unsubscribe_VARIABLES();
  return $$rendered;
});
export {
  Page as default
};
