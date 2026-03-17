/**
 * Client-side PDF text extraction using pdf.js.
 * Extracts all text from a PDF file in the browser — no server needed.
 */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");

  // Use local worker from public folder
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group text items by y-position to reconstruct lines
    const items = content.items.filter(
      (item): item is { str: string; transform: number[] } =>
        "str" in item && item.str.length > 0
    );

    // Sort by y (descending = top to bottom) then x (left to right)
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    // Group into lines based on y-position proximity
    const lines: string[][] = [];
    let currentY = -Infinity;

    for (const item of items) {
      const y = item.transform[5];
      if (Math.abs(y - currentY) > 2) {
        lines.push([]);
        currentY = y;
      }
      lines[lines.length - 1].push(item.str);
    }

    const pageText = lines.map((line) => line.join(" ")).join("\n");
    pages.push(`--- Seite ${i} ---\n${pageText}`);
  }

  return pages.join("\n\n");
}
