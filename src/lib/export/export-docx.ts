import {
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  Document
} from "docx";
import type { FLOW } from "../components/func";
import { get } from "svelte/store";
import { VARIABLES } from "../../store";

export async function exportToDOCX(currFlow: FLOW) {

  if (typeof document === "undefined") return;

  const variables = get(VARIABLES)
  if (!variables) return;

  // Conversion functions:
  function pxToTwip(px: number) {
    // 1 px ≈ 15 twips (using 96 DPI and 1 inch = 1440 twips)
    return Math.round(px * 15);
  }
  function pxToHalfPoint(px: number) {
    // 1 px ≈ 0.75 pt, and since DOCX expects half-points, 1 px ≈ 1.5 half-points.
    return Math.round(px * 1.5);
  }
  function base64ToUint8Array(base64) {
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
  }


  const pageWidthTwip = Math.round(8.27 * 1440); // ≈ 11909 twips
  const pageHeightTwip = Math.round(11.69 * 1440); // ≈ 16834 twips
  const pageWidthPx = pageWidthTwip / 15;

  const docPaddingPx = Number(variables.document_padding); // in px (from your HTML input)
  const docPaddingTwip = pxToTwip(docPaddingPx);
  const contentWidthPx = pageWidthPx - docPaddingPx * 2;

  const paragraphs: Array<Paragraph> = [];

  // Title Paragraph:
  paragraphs.push(
    new Paragraph({
      alignment:
        variables.document_h_txt_align === "start"
          ? "left"
          : variables.document_h_txt_align === "center"
            ? "center"
            : variables.document_h_txt_align === "end"
              ? "right"
              : "distribute",
      children: [
        new TextRun({
          text: currFlow.title,
          bold: Number(variables.document_h_txt_size) >= 600,
          font: variables.document_txt_font.toLowerCase(),
          size: pxToHalfPoint(Number(variables.document_h_txt_size)),
          color: variables.document_h_txt_color,
        }),
      ],
    }),
  );

  // Process each step:
  currFlow.steps.forEach((step) => {

    console.log(step)

    const imageData = step.blob_target_b?.split(",")[1];
    const canvasWidth = step.target_data.canvas_width;
    const canvasHeight = step.target_data.canvas_height;
    const imgRatio = canvasWidth / canvasHeight;

    const imgWidthPx =
      contentWidthPx * (Number(variables.image_size_perc) / 100);
    const imgHeightPx = imgWidthPx / imgRatio;

    if (imageData) {
      paragraphs.push(
        new Paragraph({
          alignment: "center",
          children: [
            new ImageRun({
              type: "png",
              data: base64ToUint8Array(imageData),
              transformation: {
                width: imgWidthPx,
                height: imgHeightPx,
              },
            }),
          ],
          spacing: {
            before: pxToTwip(Number(variables.document_space_y)),
            after: pxToTwip(Number(variables.document_p_txt_size)),
          },
        }),
      );
    }

    // Body Text Paragraph:
    paragraphs.push(
      new Paragraph({
        alignment:
          variables.document_p_txt_align === "start"
            ? "left"
            : variables.document_p_txt_align === "center"
              ? "center"
              : variables.document_p_txt_align === "end"
                ? "right"
                : "both",
        children: [
          new TextRun({
            text: step["descrb"],
            bold: Number(variables.document_p_txt_size) >= 600,
            font: variables.document_txt_font,
            size: pxToHalfPoint(Number(variables.document_p_txt_size)),
            color: variables.document_p_txt_color,
          }),
        ],
        indent: {
          left: pxToTwip(imgWidthPx * 0.05),
          right: pxToTwip(imgWidthPx * 0.05),
        },
      }),
    );
  });

  const doc = new Document({
    background: {
      color: variables.document_bg_color,
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: docPaddingTwip,
              right: docPaddingTwip,
              bottom: docPaddingTwip,
              left: docPaddingTwip,
            },
            size: {
              width: pageWidthTwip,
              height: pageHeightTwip,
            },
          },
        },
        children: paragraphs,
      },
    ],
    creator: "overred",
    description: "My extremely interesting document",
    title: "My Document",
  });

  // Generate the DOCX file as a blob.
  const buffer = await Packer.toBlob(doc);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "document.docx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}