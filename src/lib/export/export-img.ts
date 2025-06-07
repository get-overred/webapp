import { get } from "svelte/store";
import { VARIABLES } from "../../store";
import type { FLOW } from "../components/func";
import JSZip from 'jszip';

export async function exportImages(currFlow: FLOW) {
    if (typeof document === "undefined") return;

    const variables = get(VARIABLES)
    if (!variables) return;

    const zip = new JSZip();
    const imagesFolder = zip.folder("images");

    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // The result is a DataURL: "data:<type>;base64,<encoded>"
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async function blobUrlToBase64(blobUrl) {
        const blob = await fetch(blobUrl).then(res => res.blob());
        return await blobToBase64(blob);
    }

    if (currFlow.steps instanceof Array) {
        // Process all images in parallel
        const imagePromises = currFlow.steps.map(async (element, index) => {
            if (element.blob_target_b) {
                const image = await blobUrlToBase64(element.blob_target_b) as string;
                const base64Data = image.split(',')[1];
                imagesFolder?.file(`flow_${index + 1}.png`, base64Data, { base64: true });
            }
        });

        // Wait for all images to be processed
        await Promise.all(imagePromises);

        // Generate and download the zip file
        const content = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = "flow_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}
