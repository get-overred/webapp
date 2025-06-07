import { createClient } from "@supabase/supabase-js";
import { c as create_ssr_component, d as each, e as escape } from "./ssr.js";
const supabaseUrl = "https://lifrsexnnjnjwnosutnu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZnJzZXhubmpuandub3N1dG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4ODg1OTIsImV4cCI6MjA0NTQ2NDU5Mn0.SIR8hsIqlEPQFQ5uPZk_DbuyGo_DpBkJg-hXZJdKl4A";
createClient(supabaseUrl, supabaseAnonKey);
const durationUnitRegex = /[a-zA-Z]/;
const range = (size, startAt = 0) => [...Array(size).keys()].map((i) => i + startAt);
const css = {
  code: ".wrapper.svelte-1rvptk{position:relative;display:flex;justify-content:center;align-items:center;width:var(--size);height:var(--size)}.ring.svelte-1rvptk{position:absolute;border:2px solid var(--color);border-radius:50%;background-color:transparent;animation:svelte-1rvptk-motion var(--duration) ease infinite}.pause-animation.svelte-1rvptk{animation-play-state:paused}@keyframes svelte-1rvptk-motion{0%{transform:translateY(var(--motionOne))}50%{transform:translateY(var(--motionTwo))}100%{transform:translateY(var(--motionThree))}}",
  map: `{"version":3,"file":"Jellyfish.svelte","sources":["Jellyfish.svelte"],"sourcesContent":["<script>import { range, durationUnitRegex } from './utils';\\nexport let color = '#FF3E00';\\nexport let unit = 'px';\\nexport let duration = '2.5s';\\nexport let size = '60';\\nexport let pause = false;\\nlet durationUnit = duration.match(durationUnitRegex)?.[0] ?? 's';\\nlet durationNum = duration.replace(durationUnitRegex, '');\\n<\/script>\\n\\n<div\\n\\tclass=\\"wrapper\\"\\n\\tstyle=\\"--size: {size}{unit}; --color: {color}; --motionOne: {-size /\\n\\t\\t5}{unit}; --motionTwo: {+size / 4}{unit}; --motionThree: {-size /\\n\\t\\t5}{unit}; --duration: {duration};\\"\\n>\\n\\t{#each range(6, 0) as version}\\n\\t\\t<div\\n\\t\\t\\tclass=\\"ring\\"\\n\\t\\t\\tclass:pause-animation={pause}\\n\\t\\t\\tstyle=\\"animation-delay: {version * (+durationNum / 25)}{durationUnit}; width: {version *\\n\\t\\t\\t\\t(+size / 6) +\\n\\t\\t\\t\\tunit}; height: {(version * (+size / 6)) / 2 + unit}; \\"\\n\\t\\t/>\\n\\t{/each}\\n</div>\\n\\n<style>\\n\\t.wrapper {\\n\\t\\tposition: relative;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\twidth: var(--size);\\n\\t\\theight: var(--size);\\n\\t}\\n\\t.ring {\\n\\t\\tposition: absolute;\\n\\t\\tborder: 2px solid var(--color);\\n\\t\\tborder-radius: 50%;\\n\\t\\tbackground-color: transparent;\\n\\t\\tanimation: motion var(--duration) ease infinite;\\n\\t}\\n\\t.pause-animation {\\n\\t\\tanimation-play-state: paused;\\n\\t}\\n\\t@keyframes motion {\\n\\t\\t0% {\\n\\t\\t\\ttransform: translateY(var(--motionOne));\\n\\t\\t}\\n\\t\\t50% {\\n\\t\\t\\ttransform: translateY(var(--motionTwo));\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\ttransform: translateY(var(--motionThree));\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA4BC,sBAAS,CACR,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,IAAI,MAAM,CAAC,CAClB,MAAM,CAAE,IAAI,MAAM,CACnB,CACA,mBAAM,CACL,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,OAAO,CAAC,CAC9B,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,WAAW,CAC7B,SAAS,CAAE,oBAAM,CAAC,IAAI,UAAU,CAAC,CAAC,IAAI,CAAC,QACxC,CACA,8BAAiB,CAChB,oBAAoB,CAAE,MACvB,CACA,WAAW,oBAAO,CACjB,EAAG,CACF,SAAS,CAAE,WAAW,IAAI,WAAW,CAAC,CACvC,CACA,GAAI,CACH,SAAS,CAAE,WAAW,IAAI,WAAW,CAAC,CACvC,CACA,IAAK,CACJ,SAAS,CAAE,WAAW,IAAI,aAAa,CAAC,CACzC,CACD"}`
};
const Jellyfish = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { color = "#FF3E00" } = $$props;
  let { unit = "px" } = $$props;
  let { duration = "2.5s" } = $$props;
  let { size = "60" } = $$props;
  let { pause = false } = $$props;
  let durationUnit = duration.match(durationUnitRegex)?.[0] ?? "s";
  let durationNum = duration.replace(durationUnitRegex, "");
  if ($$props.color === void 0 && $$bindings.color && color !== void 0) $$bindings.color(color);
  if ($$props.unit === void 0 && $$bindings.unit && unit !== void 0) $$bindings.unit(unit);
  if ($$props.duration === void 0 && $$bindings.duration && duration !== void 0) $$bindings.duration(duration);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
  if ($$props.pause === void 0 && $$bindings.pause && pause !== void 0) $$bindings.pause(pause);
  $$result.css.add(css);
  return `<div class="wrapper svelte-1rvptk" style="${"--size: " + escape(size, true) + escape(unit, true) + "; --color: " + escape(color, true) + "; --motionOne: " + escape(-size / 5, true) + escape(unit, true) + "; --motionTwo: " + escape(+size / 4, true) + escape(unit, true) + "; --motionThree: " + escape(-size / 5, true) + escape(unit, true) + "; --duration: " + escape(duration, true) + ";"}">${each(range(6, 0), (version) => {
    return `<div class="${["ring svelte-1rvptk", pause ? "pause-animation" : ""].join(" ").trim()}" style="${"animation-delay: " + escape(version * (+durationNum / 25), true) + escape(durationUnit, true) + "; width: " + escape(version * (+size / 6) + unit, true) + "; height: " + escape(version * (+size / 6) / 2 + unit, true) + ";"}"></div>`;
  })} </div>`;
});
export {
  Jellyfish as J
};
