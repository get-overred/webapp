<script lang="ts">
    import { onMount } from "svelte";
    import "@fortawesome/fontawesome-free/css/all.min.css";
    import { ID, debugID } from "$lib/config";
    import type { FLOW } from "$lib/components/func";
    import { Jellyfish } from "svelte-loading-spinners";
    import { supabase } from "../supabaseClient";
    import type { AuthSession } from "@supabase/supabase-js";
    import { goto } from "$app/navigation";
    import logo from "$lib/assets/overred_og.png";
    import Preview from "$lib/components/res/preview.svelte";

    let startedUp: boolean = false;
    let isError: boolean = false;
    let _wholeFlow: Array<FLOW> | null = null;
    let previewFlow: FLOW | null = null;

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
                    startedUp = true;
                }
            }
        } catch (error) {
            isError = true;
            console.log(error);
        }
    }

    async function deleteFlow(index: number) {
        if (!_wholeFlow) return;
        _wholeFlow.splice(index, 1);
        await updateSupabaseFlows(_wholeFlow);
    }
    async function updateSupabaseFlows(flows: Array<FLOW>) {
        supabase.auth.getSession().then(async ({ data }) => {
            if (!data.session) return;

            const { error } = await supabase
                .from("profiles")
                .update({ flows: flows })
                .eq("id", data.session?.user.id)
                .select();

            if (error) {
                console.error("Error updating flows in Supabase:", error);
            }
        });
    }

    function handlePreviewClose() {
        previewFlow = null;
    }
</script>

{#if previewFlow}
    <Preview flow={previewFlow} on:close={handlePreviewClose} />
{/if}

{#if _wholeFlow && startedUp}
    <div class="w-full min-h-screen flex flex-col">
        <div class="flex justify-center items-center py-4">
            <img src={logo} alt="logo" class="h-64 w-auto object-contain" />
        </div>
        <div class="container mx-auto px-5 pb-12">
            <div class="flex flex-wrap justify-center">
                {#each _wholeFlow as flow, i}
                    <div
                        class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-[555px] m-10"
                    >
                        <div class="relative">
                            {#if flow.steps[0]?.base64}
                                <img
                                    src={flow.steps[0].base64}
                                    alt={flow.title}
                                    class="w-full h-48 object-cover"
                                />
                            {/if}
                            <div
                                class="absolute top-2 left-2 bg-blue-500 text-white px-2.5 py-1 rounded-full text-sm font-bold"
                            >
                                {flow.steps.length} steps
                            </div>
                            <button
                                class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-600 transition-colors"
                                on:click={() => deleteFlow(i)}
                            >
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="p-6">
                            <div class="mb-4">
                                <h3 class="text-2xl font-bold text-gray-800">
                                    {flow.title}
                                </h3>
                            </div>

                            <div class="space-y-3 mb-6">
                                <div class="flex items-center text-gray-600">
                                    <i class="fas fa-calendar-alt w-5"></i>
                                    <span class="ml-2"
                                        >Created: {new Date(
                                            flow.date_create,
                                        ).toLocaleDateString()}</span
                                    >
                                </div>
                                <div class="flex items-center text-gray-600">
                                    <i class="fas fa-clock w-5"></i>
                                    <span class="ml-2"
                                        >Last updated: {new Date(
                                            flow.date_edit,
                                        ).toLocaleDateString()}</span
                                    >
                                </div>
                                {#if flow.steps[0]?.descrb}
                                    <div
                                        class="flex items-center text-gray-600"
                                    >
                                        <i class="fas fa-info-circle w-5"></i>
                                        <span class="ml-2 truncate"
                                            >{flow.steps[0].descrb}</span
                                        >
                                    </div>
                                {/if}
                            </div>

                            <div class="flex space-x-3">
                                <button
                                    class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    on:click={() => goto(`/${i}`)}
                                >
                                    <i class="fas fa-pen mr-2"></i>Launch Editor
                                </button>
                                <button
                                    class="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                    on:click={() => {
                                        previewFlow = flow;
                                    }}
                                >
                                    <i class="fas fa-eye mr-2"></i>Preview
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
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
