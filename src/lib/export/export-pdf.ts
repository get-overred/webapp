import { jsPDF, type TextOptionsLight } from "jspdf";
import { get } from "svelte/store";
import { VARIABLES } from "../../store";
import { fontWeightToStr, hexToRgb, type FLOW } from "../components/func";


export async function exportToPDF(currFlow: FLOW) {

  const variables = get(VARIABLES)
  if (!variables) return;

  const doc = new jsPDF({ unit: "px" });
  const { width, height } = doc.internal.pageSize;

  // set background color:
  doc.setFillColor(variables.document_bg_color);
  doc.rect(0, 0, width, height, "F");
  const padding = {
    top: Number(variables.document_padding),
    right: Number(variables.document_padding),
    bottom: Number(variables.document_padding),
    left: Number(variables.document_padding),
  };
  const contentWidth = width - padding.right - padding.left / 2;
  const contentHeight = height - padding.bottom - padding.top / 2;

  let y = padding.top || 0; // track y dynamically

  // Title:
  const title = currFlow["title"];
  console.log("Setting title font:");
  doc.setFont(
    variables.document_txt_font.toLowerCase(),
    fontWeightToStr(variables.document_h_txt_weight),
  );
  doc.setFontSize(Number(variables.document_h_txt_size));
  const { r, g, b } = hexToRgb(variables.document_h_txt_color);
  doc.setTextColor(r, g, b);
  const wrappedText = doc.splitTextToSize(title, contentWidth);
  let txtHeight = doc.getTextDimensions(wrappedText).h;
  const alignment = getAlignment(variables.document_h_txt_align);
  checkY(txtHeight);
  doc.text(title, getX1(alignment), y, {
    align: alignment,
    maxWidth: contentWidth,
  });
  y += +txtHeight;

  currFlow.steps.forEach((step) => {
    const blob = step.blob_target_b;
    const canvas_height = step.target_data.canvas_height;
    const canvas_width = step.target_data.canvas_width;
    const img_ratio = canvas_width / canvas_height;
    y += Number(variables.document_space_y); // + y_space

    // adding Image:
    const img_width =
      contentWidth * (Number(variables.image_size_perc) / 100);
    const img_height = img_width / img_ratio;
    checkY(img_height);
    if (blob)
      doc.addImage(
        blob,
        "png",
        (width - img_width) / 2,
        y,
        img_width,
        img_height,
      );
    y += img_height + Number(variables.document_p_txt_size);

    // Constant Padding:
    y += Number(variables.document_p_txt_size);

    // adding BodyText:
    const bodyText = step.descrb;
    doc.setFont(
      variables.document_txt_font.toLowerCase(),

      fontWeightToStr(variables.document_p_txt_weight),
    );
    doc.setFontSize(Number(variables.document_p_txt_size));
    const { r, g, b } = hexToRgb(variables.document_p_txt_color);
    doc.setTextColor(r, g, b);
    const maxWidth = contentWidth - contentWidth * 0.1;
    const wrappedText = doc.splitTextToSize(bodyText, maxWidth);
    let txtHeight = doc.getTextDimensions(wrappedText).h;
    const alignment = getAlignment(variables.document_p_txt_align);
    checkY(txtHeight);
    doc.text(bodyText, getX2(alignment), y, {
      align: alignment,
      maxWidth: maxWidth,
    });
    // doc.rect(padding.left + contentWidth * 0.05, y, maxWidth, txtHeight);
    y += txtHeight;
  });

  function checkY(next: number) {
    if (y + next > contentHeight + padding.top) {
      doc.addPage();
      y = padding.top;
      console.log("adding new page ...");
      // set background color:
      doc.setFillColor(variables.document_bg_color);
      doc.rect(0, 0, width, height, "F");
    }
  }
  function getAlignment(align: string): TextOptionsLight["align"] {
    return align == "start"
      ? "left"
      : align == "center"
        ? "center"
        : align == "end"
          ? "right"
          : "justify";
  }
  function getX1(align: TextOptionsLight["align"]): number {
    return align == "left"
      ? padding.left
      : align == "right"
        ? width - padding.right
        : width / 2;
  }
  function getX2(align: TextOptionsLight["align"]): number {
    const bodyText_x_p = contentWidth * 0.05;

    return align == "left" || align == "justify"
      ? padding.left + bodyText_x_p
      : align == "right"
        ? width - padding.right - bodyText_x_p
        : width / 2;
  }

  doc.save("overred.pdf");
}
