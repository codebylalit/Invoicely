import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoicePdfOptions {
  scale?: number;
  backgroundColor?: string;
}

export const renderInvoiceElementToPdf = async (
  element: HTMLElement,
  options: InvoicePdfOptions = {},
) => {
  const { scale = 3 } = options;
  const targetWidth = 794; // Fixed standard A4 layout width at 96DPI

  const computedBg = window.getComputedStyle(element).backgroundColor;
  const resolvedBg = (computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent')
    ? computedBg
    : (options.backgroundColor || "#ffffff");

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "0px";
  container.style.left = "-9999px";
  container.style.width = `${targetWidth}px`;
  container.style.backgroundColor = resolvedBg;
  container.style.zIndex = "-9999";

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.backgroundColor = resolvedBg;
  clone.style.width = `${targetWidth}px`;
  clone.style.maxWidth = `${targetWidth}px`;
  clone.style.minWidth = `${targetWidth}px`;
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.margin = "0px";
  clone.style.boxSizing = "border-box";
  clone.style.overflow = "visible";
  clone.style.transform = "none";

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    if (document.fonts) {
      await document.fonts.ready;
    }

    const images = Array.from(clone.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    const captureH = Math.max(clone.scrollHeight, clone.offsetHeight);

    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: resolvedBg,
      logging: false,
      width: targetWidth,
      height: captureH,
      windowWidth: targetWidth,
      windowHeight: captureH,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = 210; // A4 width mm
    const imageHeight = (canvas.height * pdfWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pdfWidth, imageHeight],
    });

    // Extract r, g, b from resolvedBg if possible for page fill
    pdf.setFillColor(resolvedBg);
    pdf.rect(0, 0, pdfWidth, imageHeight, "F");
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imageHeight);

    return pdf;
  } finally {
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
  }
};

export const generateInvoicePDF = async (
  element: HTMLElement,
): Promise<jsPDF> => {
  return renderInvoiceElementToPdf(element);
};

export const downloadPDF = (filename: string, pdfData: any): void => {
  console.log(`Downloading PDF ${filename}`, pdfData);
};
