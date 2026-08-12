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
  const { scale = 3, backgroundColor = "#ffffff" } = options;
  const sourceRect = element.getBoundingClientRect();
  const targetWidth = Math.max(1, Math.ceil(sourceRect.width));

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = `${targetWidth}px`;
  container.style.backgroundColor = "transparent";

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.backgroundColor = "transparent";
  clone.style.width = `${targetWidth}px`;
  clone.style.maxWidth = `${targetWidth}px`;
  clone.style.minWidth = `${targetWidth}px`;
  clone.style.margin = "0px";
  clone.style.boxSizing = "border-box";
  clone.style.overflow = "visible";

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

    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor,
      logging: false,
      windowWidth: targetWidth,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imageHeight);

    let remainingHeight = imageHeight - pdfHeight;
    let offset = imageHeight - pdfHeight;

    while (remainingHeight > 0) {
      pdf.addPage();
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
      pdf.addImage(imgData, "PNG", 0, -offset, pdfWidth, imageHeight);
      remainingHeight -= pdfHeight;
      offset += pdfHeight;
    }

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
