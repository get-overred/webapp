import { ID } from "$lib/config"

export interface Variables {
    // Document properties
    document_bg_color: string
    document_padding: string
    document_space_y: string
    document_width: string
    document_height: string
    editor_scale: number

    // Text properties
    document_txt_font: string
    document_h_txt_color: string
    document_h_txt_size: string
    document_h_txt_weight: string
    document_h_txt_align: string
    document_p_txt_color: string
    document_p_txt_size: string
    document_p_txt_weight: string
    document_p_txt_align: string

    // Screenshot properties
    target_bg_color: string
    target_border_radius: string
    target_no_fillout: boolean
    target_replace_cursor: boolean
    target_enable_arrow: boolean
    image_border_radius: string
    target_scale_factor: string
    image_size_perc: string
    image_border_width: string
    image_border_type: string
    image_border_color: string,
    image_border_show: boolean

    // Video properties
    video_zoom_to_element: boolean
    video_speed: number
    video_enable_subtitles: boolean
    video_click_animation: string
}
export interface targetData {
    click_x: number,
    click_y: number,
    left: number;
    top: number;
    width: number;
    height: number;
    canvas_width: number;
    canvas_height: number,
    url: string,
    hmtl: string,
    x_path: string,
    descrb: string | null,
    title: string // global, set last,
}
export interface FlowEntry {
    base64: string,
    blob_target: string | null, // to display border via html2canvas
    blob_target_b: string | null,
    descrb: string,
    target_data: targetData,
}
export interface FLOW {
    date_create: number,
    date_create_str: string,
    date_edit: number,
    date_edit_str: string,
    title: string,
    steps: Array<FlowEntry>
}


export function fontWeightToStr(weight: any): string {

    let returnWeight: string = "";
    console.log("weight: ", weight)
    weight = Number(weight)


    switch (weight) {
        case 100:
            returnWeight = "light";
        case 200:
            returnWeight = "light";
        case 300:
            returnWeight = "light";
        case 400:
            returnWeight = "normal";
        case 500:
            returnWeight = "medium";
        case 600:
            returnWeight = "semi-bold";
        case 700:
            returnWeight = "bold";
        case 800:
            returnWeight = "bold";
        case 900:
            returnWeight = "bold";
    }

    console.log("return: ", returnWeight)

    return returnWeight;
}
export function hexToRgb(hex_color: string) {
    var hex_color = hex_color.replace("#", "")
    return {
        r: parseInt(hex_color.substring(0, 2), 16),
        g: parseInt(hex_color.substring(2, 4), 16),
        b: parseInt(hex_color.substring(4, 6), 16)
    }
}