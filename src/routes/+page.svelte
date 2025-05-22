<script lang="ts">
    import { onMount } from "svelte";
    import "@fortawesome/fontawesome-free/css/all.min.css";
    import TransGrid from "$lib/components/res/trans_grid.svelte";
    import Document from "$lib/components/core/document.svelte";
    import DocumentSize from "$lib/components/res/size_widget.svelte";
    import ScaleWidget from "$lib/components/res/scale_widget.svelte";
    import { exportToDOCX } from "$lib/export-docx";
    import { exportToPDF } from "$lib/export-pdf";
    import { exportToHTML } from "$lib/export-html";
    import { ID } from "$lib/config";
    import EditorHeader from "$lib/components/core/editor-header.svelte";
    import { access, VARIABLES } from "../store";
    import type { FLOW } from "$lib/components/func";
    import ExportButton from "$lib/components/res/export_button.svelte";
    import { Jellyfish } from "svelte-loading-spinners";
    import { navigating } from "$app/stores";

    let scroll_to_export: boolean = false;
    let startedUp: boolean = false;
    let isError: boolean = false;
    let yScroll = 0;

    let currFlow: FLOW | null = null;
    let _wholeFlow: Array<FLOW> | null = null;

    onMount(() => {
        console.log("starting up ...");
        startUp();
    });
    async function startUp() {
        try {
            const res = await chrome.runtime.sendMessage(ID, {
                action: "webapp_transfer",
            });
            if (res.flow) {
                const flow = JSON.parse(res.flow);
                if (flow instanceof Array) {
                    _wholeFlow = flow;
                    $access =
                        res.access != "" && res.access != null
                            ? Number(res.access)
                            : flow.length - 1;

                    currFlow = _wholeFlow[$access];
                    startedUp = true;
                }
            }
        } catch (error) {
            isError = true;
            console.log(error);
        }
    }

    $: if (currFlow && startedUp) updateFlow();
    async function updateFlow() {
        console.log("updating currFlow");

        if (_wholeFlow instanceof Array && currFlow && $access) {
            if ($access && $access !== _wholeFlow.length - 1) {
                _wholeFlow[$access] = currFlow;
            } else {
                // just last flow
                _wholeFlow.pop();
                _wholeFlow.push(currFlow);
            }
            const res = await chrome.runtime.sendMessage(ID, {
                action: "flow_override",
                data: _wholeFlow,
            });
            console.log(res);
        }
    }

    async function exportTo(e: CustomEvent<string>) {
        if (!currFlow) return;

        console.log(currFlow);

        switch (e.detail) {
            case "pdf":
                exportToPDF(currFlow);
                break;
            case "docx":
                exportToDOCX(currFlow);
                break;
            case "html":
                await exportToHTML(currFlow);
                break;
        }
    }
</script>

{#if currFlow && $access !== null && _wholeFlow && $VARIABLES && startedUp}
    <div class="relative w-full h-full min-h-screen flex">
        <div class="fixed"><TransGrid /></div>

        <div class="absolute flex flex-col w-full overflow-x-clip min-h-screen">
            <EditorHeader
                {yScroll}
                bind:scroll_to_export
                on:export={exportTo}
            />

            <Document VARIABLES={$VARIABLES} bind:currFlow />
        </div>

        <ExportButton on:export={() => scroll_to_export = true} />

        <DocumentSize
            docWidth={$VARIABLES.document_width}
            docHeight={$VARIABLES.document_height}
        />

        <ScaleWidget bind:scaleFactor={$VARIABLES.editor_scale} />
    </div>
{:else if isError}
    <div class="w-full min-h-screen flex justify-center items-center">
        <h1 class="font-bold text-5xl text-[#FF3E00]">
            Our Extension isn't installed
        </h1>
    </div>
{:else}
    <div class="w-full min-h-screen flex justify-center items-center">
        <Jellyfish size="500" color="#FF3E00" unit="px" duration="1s" />
    </div>
{/if}

<svelte:window bind:scrollY={yScroll} />
