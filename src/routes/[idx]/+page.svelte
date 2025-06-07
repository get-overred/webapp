<script lang="ts">
    import { onMount } from "svelte";
    import "@fortawesome/fontawesome-free/css/all.min.css";
    import TransGrid from "$lib/components/res/trans_grid.svelte";
    import Document from "$lib/components/core/document.svelte";
    import DocumentSize from "$lib/components/res/size_widget.svelte";
    import ScaleWidget from "$lib/components/res/scale_widget.svelte";
    import { exportToDOCX } from "$lib/export/export-docx";
    import { exportToPDF } from "$lib/export/export-pdf";
    import { exportImages } from "$lib/export/export-img";
    import { ID, debugID } from "$lib/config";
    import EditorHeader from "$lib/components/core/editor-header.svelte";
    import { access, VARIABLES } from "../../store";
    import type { FLOW } from "$lib/components/func";
    import ExportButton from "$lib/components/res/export_button.svelte";
    import { Jellyfish } from "svelte-loading-spinners";
    import Video from "$lib/components/core/video.svelte";
    import { page } from "$app/stores";
    import { supabase } from "../../supabaseClient";
    import MultiLang from "$lib/components/res/multi_lang.svelte";

    let scroll_to_export: boolean = false;
    let startedUp: boolean = false;
    let isError: boolean = false;
    let yScroll = 0;
    let activeTab: "file" | "video" = "file";

    let currFlow: FLOW | null = null;
    let _wholeFlow: Array<FLOW> | null = null;
    let downloadVideo: boolean = false;

    onMount(() => startUp());
    async function startUp() {
        try {
            const res = await chrome.runtime.sendMessage(
                import.meta.env.DEV ? debugID : ID,
                {
                    action: "webapp_transfer",
                },
            );
            console.log(res);
            if (res.flow) {
                const flow = JSON.parse(res.flow);
                if (flow instanceof Array) {
                    _wholeFlow = flow;
                    const idx = Number($page.params.idx);
                    $access = idx === -1 ? flow.length - 1 : idx;
                    currFlow = _wholeFlow[$access];
                    startedUp = true;
                }
            }
        } catch (error) {
            isError = true;
            console.log(error);
        }
    }

    async function updateSupabaseFlows(flows: Array<FLOW>) {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const { user } = session;

        const { error } = await supabase
            .from("profiles")
            .update({ flows: flows })
            .eq("id", user.id)
            .select();

        if (error) {
            console.error("Error updating flows in Supabase:", error);
        }
    }

    $: if (currFlow && startedUp) updateFlow();
    async function updateFlow() {
        if (_wholeFlow instanceof Array && currFlow && $access) {
            if ($access && $access !== _wholeFlow.length - 1) {
                _wholeFlow[$access] = currFlow;
            } else {
                _wholeFlow.pop();
                _wholeFlow.push(currFlow);
            }
            const res = await chrome.runtime.sendMessage(
                import.meta.env.DEV ? debugID : ID,
                {
                    action: "flow_override",
                    data: _wholeFlow,
                },
            );
            await updateSupabaseFlows(_wholeFlow);
        }
    }

    async function exportTo(e: CustomEvent<string>) {
        if (!currFlow) return;

        switch (e.detail) {
            case "pdf":
                exportToPDF(currFlow);
                break;
            case "docx":
                exportToDOCX(currFlow);
                break;
            case "png":
                await exportImages(currFlow);
                break;
            case "mp4":
                if (activeTab !== "video") activeTab = "video";
                setTimeout(() => {
                    downloadVideo = true;
                }, 500);
                break;
        }
    }
</script>

{#if currFlow && _wholeFlow && $VARIABLES && startedUp}
    <div class="relative w-full min-h-screen">
        <div class="fixed"><TransGrid /></div>
        <EditorHeader
            {yScroll}
            {activeTab}
            bind:scroll_to_export
            on:export={exportTo}
        />
        <main class="relative w-full">
            {#if activeTab === "file"}
                <Document VARIABLES={$VARIABLES} bind:currFlow />
            {:else if currFlow}
                <div class="flex-grow">
                    <Video
                        VARIABLES={$VARIABLES}
                        cFlow={currFlow}
                        bind:downloadVideo
                    />
                </div>
            {/if}
        </main>

        <!-- Tab Navigation -->
        <div
            class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]"
        >
            <div class="container mx-auto px-4">
                <div class="flex justify-center space-x-5 py-2">
                    <button
                        class="px-4 py-2 rounded-t-lg transition-colors {activeTab ===
                        'file'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                        on:click={() => (activeTab = "file")}
                    >
                        <i class="fas fa-file-alt mr-2"></i>Document
                    </button>
                    <button
                        class="px-4 py-2 rounded-t-lg transition-colors {activeTab ===
                        'video'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                        on:click={() => (activeTab = "video")}
                    >
                        <i class="fas fa-video mr-2"></i>Video
                    </button>
                </div>
            </div>
        </div>
    </div>

    <ScaleWidget bind:scaleFactor={$VARIABLES.editor_scale} />
    <ExportButton on:export={() => (scroll_to_export = true)} />
    <DocumentSize
        activeTab={activeTab}
        docWidth={$VARIABLES.document_width}
        docHeight={$VARIABLES.document_height}
    />
    <MultiLang />
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
