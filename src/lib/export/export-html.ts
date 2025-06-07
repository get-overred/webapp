import { get } from "svelte/store";
import { VARIABLES } from "../../store";
import type { FLOW } from "../components/func";

export async function exportToHTML(currFlow: FLOW) {

    if (typeof document === "undefined") return;

    const variables = get(VARIABLES)
    if (!variables) return;

    let child_array: Array<string> = []
    let combined_childs: string = ""; // maybe problem here

    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // The result is a DataURL: "data:<type>;base64,<encoded>"
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob); // Converts blob to base64-encoded DataURL
        });
    }
    async function blobUrlToBase64(blobUrl) {
        const blob = await fetch(blobUrl).then(res => res.blob());
        return await blobToBase64(blob);
    }

    if (currFlow.steps instanceof Array) {
        currFlow.steps.forEach(async element => {

            const image = await blobUrlToBase64(element.blob_target)

            child_array.push(
                `
                <div class="list_child">

                    <img class="screenshot" src="${image}" alt="my_image"/>

                    <span style="margin-top: ${variables.document_p_txt_size}px;" />

                    <p class="body_text">
                        ${element.descrb}
                    </p>
                    
                </div>
                `
            )
        })
        combined_childs = child_array.join(" ")
    }

    const screenshot_border = `${variables.image_border_color} ${variables.image_border_width}px ${variables.image_border_type}`

    let fullHTML = `

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exported HTML</title>
        <style>
            body { font-family: ${variables.document_txt_font}, sans-serif; }
            .page { margin: 50px; margin-left: auto; margin-right: auto; background-color: ${variables.document_bg_color}; display: flex; flex-direction: column; height: 100%; padding:${variables.document_padding}px; width: ${variables.document_width};  min-height: ${variables.document_height}px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); position: relative; overflow: hidden; page-break-after: always; break-after: always; }
            .heading { color: ${variables.document_h_txt_color}; font-size: ${variables.document_h_txt_size}px; line-height: ${Number(variables.document_h_txt_size) * 1.618}px; font-weight: ${variables.document_h_txt_weight}; text-align: ${variables.document_h_txt_align}; width: 100%; height: 100%; } 
            .body_text { color: ${variables.document_p_txt_color}; font-size: ${variables.document_p_txt_size}px; line-height: ${Number(variables.document_p_txt_size) * 1.618}px; font-weight: ${variables.document_p_txt_weight}; text-align: ${variables.document_p_txt_align}; width: 100%; height: 100%; } 
            .screenshot { margin-top: ${variables.document_space_y}px; width: 100%; overflow: clip; border: ${screenshot_border}; object-fit: contain; height: min-content; display: flex; justify-content: center; align-items: center; border-radius: ${variables.image_border_radius}px; }
            .list_child { display: flex; justify-content: center; flex-direction: column; width: 100%; height: 100%; align-items: center; }
        </style>
    </head>
    <body>
        <div class="page">

            <h1 class="heading">
                ${currFlow.title}
            </h1>

            <div class="children">
                ${combined_childs}
            </div>

        </div>

        <script>
        </script>
    </body>
    </html>
    `;
    
    const downloadLink = document.createElement("a")
    const blob = new Blob([fullHTML], { type: "text/html" });
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.download = `overred`
    downloadLink.click()

    console.log("downloading ...")
}
