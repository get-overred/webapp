import { c as create_ssr_component, v as validate_component } from "../../chunks/ssr.js";
/* empty css                   */
import { J as Jellyfish } from "../../chunks/ArrowUp.svelte_svelte_type_style_lang.js";
import "../../chunks/client.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${``} ${`${`<div class="w-full min-h-screen flex justify-center items-center">${validate_component(Jellyfish, "Jellyfish").$$render(
    $$result,
    {
      size: "500",
      color: "#FF3E00",
      unit: "px",
      duration: "1s"
    },
    {},
    {}
  )}</div>`}`}`;
});
export {
  Page as default
};
