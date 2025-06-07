import type { Variables } from '$lib/components/func'
import { writable, type Writable } from 'svelte/store'
import { browser } from '$app/environment';


// Variables
const _default: Variables = {
    // Document:
    document_bg_color: "#f8fafc", // x
    document_padding: "20", // x
    document_space_y: "10",
    document_width: "21cm",
    document_height: "29.7cm",
    editor_scale: 1.0,
    // Text:
    document_txt_font: "Helvetica", // x
    document_h_txt_color: "#000000", // x
    document_h_txt_size: "25", // x
    document_h_txt_weight: "700", // x
    document_h_txt_align: "center", // x
    document_p_txt_color: "#000000", // x
    document_p_txt_size: "15", // x
    document_p_txt_weight: "400", // x
    document_p_txt_align: "center", // x
    // Screenshot:
    target_bg_color: "#e66465", // x
    target_border_radius: "20", // x
    target_no_fillout: false, // x
    target_replace_cursor: false, // x
    target_enable_arrow: true, // x
    image_border_radius: "5", // x ->
    target_scale_factor: "0.99", // x
    image_size_perc: "100", // x
    image_border_color: "#e66465",
    image_border_type: "double",
    image_border_width: "10",
    image_border_show: true,
    // Video:
    video_zoom_to_element: true,
    video_speed: 1,
    video_enable_subtitles: false,
    video_click_animation: "Splash",
};
export const VARIABLES: Writable<Variables> = writable(_default)

// Access
export const access: Writable<number | null> = writable(null)

if (browser) {
    const _vS = JSON.parse(localStorage.editor_var || "[]")
    const _aS = localStorage.access as number

    if (_vS.length !== 0) { VARIABLES.set(_vS) }
    if (_aS) access.set(_aS)

    VARIABLES.subscribe((value) => {
        if (value) localStorage.editor_var = JSON.stringify(value);
    })
    access.subscribe((value) => {
        if (value) localStorage.access = value;
    })
}