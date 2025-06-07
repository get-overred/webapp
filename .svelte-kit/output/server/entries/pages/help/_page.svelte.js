import { c as create_ssr_component, d as each, f as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import "@ffmpeg/util";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const animationTypes = [
    { id: "ripple", name: "Ripple Effect" },
    { id: "twinkle", name: "Twinkle Click" },
    { id: "shift-bounce", name: "Shift Bounce" }
  ];
  new FFmpeg();
  return `<div style="transform-origin: top center; position: relative; margin-top: 0; width: 100%; padding: 0 5rem; " class="w-full flex justify-center items-center flex-col"><div class="mb-4"><select class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">${each(animationTypes, (type) => {
    return `<option${add_attribute("value", type.id, 0)}>${escape(type.name)}</option>`;
  })}</select></div> <div style="margin-top: 75px; transform-origin: top center; " class="flex justify-center items-center relative" data-svelte-h="svelte-4jyi7t"><canvas id="my_canvas" style="width: 300px; height: 300px;" class="bg-white border-blue-500 border-opacity-50 border-8 rounded-2xl overflow-clip"></canvas></div> <div class="mt-4 flex gap-4"><button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" data-svelte-h="svelte-1duh8y7">Start Recording</button> <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" data-svelte-h="svelte-ykajks">Stop &amp; Export</button></div></div>`;
});
export {
  Page as default
};
