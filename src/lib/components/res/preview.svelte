<script lang="ts">
    import { type FLOW } from "../func";
    import { createEventDispatcher } from "svelte";
    import Screenshot from "../core/screenshot.svelte";

    export let flow: FLOW;
    const dispatch = createEventDispatcher();

    function closePreview() {
        dispatch("close");
    }
</script>

<div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
>
    <div
        class="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] relative overflow-hidden"
    >
        <!-- Close button -->
        <button
            class="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10"
            on:click={closePreview}
        >
            <i class="fas fa-times"></i>
        </button>

        <!-- Content -->
        <div class="w-full h-full overflow-y-auto p-8">
            <h1 class="text-3xl font-bold mb-8 text-center">
                {flow.title}
            </h1>

            <div class="flex flex-col items-center space-y-8">
                {#each flow.steps as step, idx}
                    <div class="w-full max-w-4xl">
                        {#if step.base64}
                            <Screenshot
                                base64={step.base64}
                                targetData={step.target_data}
                                id={`preview_${idx}`}
                                target_bg_color="rgba(255, 255, 255, 0.8)"
                                target_border_radius="4"
                                target_no_fillout={true}
                                target_replace_cursor={true}
                                target_enable_arrow={true}
                                image_border_radius="8"
                                image_size_perc="100"
                                border="1px solid #e5e7eb"
                                target_scale_factor="1"
                                targetBlob={step.blob_target}
                                targetBlobWithBorder={step.blob_target_b}
                            />
                        {/if}
                        {#if step.descrb}
                            <p class="mt-4 text-gray-700 text-lg">
                                {step.descrb}
                            </p>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    /* Add any additional styles here */
</style>
