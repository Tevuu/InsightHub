import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
} from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { DocumentInitParameters } from "pdfjs-dist/types/src/display/api";

GlobalWorkerOptions.workerSrc = workerSrc;

export type PdfInsights = {
  text: string;
  outline: string[];
  metadata: {
    title?: string | null;
    author?: string | null;
    subject?: string | null;
    keywords?: string | null;
  };
  pageCount: number;
  bytes: number;
};

const PAGE_LIMIT = 8;

const readPageText = async (doc: PDFDocumentProxy, pageNumber: number) => {
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();

  return content.items
    .map((item) => ("str" in item ? item.str : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

export const extractPdfInsights = async (
  file: File,
): Promise<PdfInsights | null> => {
  const arrayBuffer = await file.arrayBuffer();
  const data: DocumentInitParameters = { data: arrayBuffer };

  const docTask = getDocument(data);
  const pdf = await docTask.promise;

  const limit = Math.min(pdf.numPages, PAGE_LIMIT);
  const pages: string[] = [];

  for (let pageIndex = 1; pageIndex <= limit; pageIndex += 1) {
    try {
      const text = await readPageText(pdf, pageIndex);
      if (text) {
        pages.push(text);
      }
    } catch {
      // ignore individual page failures
    }
  }

  const metadata = await pdf.getMetadata().catch(() => null);
  const info =
    (metadata?.info as Record<string, unknown> | undefined) ?? undefined;
  const metaInfo =
    ((metadata?.metadata as { _metadata?: Record<string, unknown> } | undefined)
      ?._metadata as Record<string, unknown> | undefined) ?? undefined;

  const pickValue = (
    source: Record<string, unknown> | undefined,
    key: string,
  ) => {
    if (!source) return undefined;
    const value = source[key];
    return typeof value === "string" ? value : undefined;
  };
  const outline = (await pdf.getOutline().catch(() => [])) ?? [];

  const insight: PdfInsights = {
    text: pages.join("\n\n"),
    outline: outline
      .map((entry) => entry?.title)
      .filter((title): title is string => Boolean(title))
      .slice(0, 20),
    metadata: {
      title: pickValue(info, "Title") ?? pickValue(metaInfo, "title"),
      author: pickValue(info, "Author") ?? pickValue(metaInfo, "author"),
      subject: pickValue(info, "Subject") ?? pickValue(metaInfo, "subject"),
      keywords: pickValue(info, "Keywords") ?? pickValue(metaInfo, "keywords"),
    },
    pageCount: pdf.numPages,
    bytes: file.size,
  };

  return insight;
};

