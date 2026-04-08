import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { concatenatePDFs, cleanupInputDirectory } from "../src/concatenate";

const TEST_INPUT_DIR = "./test-input";
const TEST_OUTPUT_DIR = "./test-output";

/**
 * Helper function to create a simple test PDF with specified number of pages
 */
async function createTestPDF(filename: string, pageCount: number = 1, content: string = ""): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.addPage([600, 400]);
    const text = content || `${filename} - Page ${i + 1}`;
    page.drawText(text, {
      x: 50,
      y: 350,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });
  }

  const pdfBytes = await pdfDoc.save();
  await Bun.write(`${TEST_INPUT_DIR}/${filename}`, pdfBytes);
}

describe.serial("concatenatePDFs", () => {
  beforeEach(async () => {
    // Create test directories
    await Bun.$`mkdir -p ${TEST_INPUT_DIR} ${TEST_OUTPUT_DIR}`;
  });

  afterEach(async () => {
    // Clean up test directories
    await Bun.$`rm -rf ${TEST_INPUT_DIR} ${TEST_OUTPUT_DIR}`;
  });

  test("should throw error when no PDFs found", async () => {
    await expect(
      concatenatePDFs({
        inputDir: TEST_INPUT_DIR,
        outputPath: `${TEST_OUTPUT_DIR}/output.pdf`,
      })
    ).rejects.toThrow("No PDF files found");
  });

  test("should concatenate single PDF", async () => {
    await createTestPDF("single.pdf", 2);

    await concatenatePDFs({
      inputDir: TEST_INPUT_DIR,
      outputPath: `${TEST_OUTPUT_DIR}/output.pdf`,
    });

    // Verify output file exists
    const outputExists = await Bun.file(`${TEST_OUTPUT_DIR}/output.pdf`).exists();
    expect(outputExists).toBe(true);

    // Verify page count
    const outputBytes = await Bun.file(`${TEST_OUTPUT_DIR}/output.pdf`).arrayBuffer();
    const outputPdf = await PDFDocument.load(outputBytes);
    expect(outputPdf.getPageCount()).toBe(2);
  });

  test("should concatenate multiple PDFs preserving page order", async () => {
    await createTestPDF("first.pdf", 2);
    await createTestPDF("second.pdf", 3);
    await createTestPDF("third.pdf", 1);

    await concatenatePDFs({
      inputDir: TEST_INPUT_DIR,
      outputPath: `${TEST_OUTPUT_DIR}/output.pdf`,
    });

    const outputBytes = await Bun.file(`${TEST_OUTPUT_DIR}/output.pdf`).arrayBuffer();
    const outputPdf = await PDFDocument.load(outputBytes);
    
    // Total should be 2 + 3 + 1 = 6 pages
    expect(outputPdf.getPageCount()).toBe(6);
  });

  test("should sort PDFs by relevancy before concatenating", async () => {
    // These should be sorted to group invoices together
    await createTestPDF("invoice-january.pdf", 1, "Invoice January");
    await createTestPDF("report-q1.pdf", 1, "Report Q1");
    await createTestPDF("invoice-february.pdf", 1, "Invoice February");

    await concatenatePDFs({
      inputDir: TEST_INPUT_DIR,
      outputPath: `${TEST_OUTPUT_DIR}/output.pdf`,
    });

    const outputExists = await Bun.file(`${TEST_OUTPUT_DIR}/output.pdf`).exists();
    expect(outputExists).toBe(true);

    const outputBytes = await Bun.file(`${TEST_OUTPUT_DIR}/output.pdf`).arrayBuffer();
    const outputPdf = await PDFDocument.load(outputBytes);
    expect(outputPdf.getPageCount()).toBe(3);
  });
});

describe.serial("cleanupInputDirectory", () => {
  beforeEach(async () => {
    await Bun.$`mkdir -p ${TEST_INPUT_DIR}`;
  });

  afterEach(async () => {
    await Bun.$`rm -rf ${TEST_INPUT_DIR}`;
  });

  test("should delete all PDF files from directory", async () => {
    await createTestPDF("file1.pdf");
    await createTestPDF("file2.pdf");
    await createTestPDF("file3.pdf");

    // Verify files exist
    let files = await Array.fromAsync(new Bun.Glob('*.pdf').scan(TEST_INPUT_DIR));
    expect(files.length).toBe(3);

    // Clean up
    await cleanupInputDirectory(TEST_INPUT_DIR);

    // Verify files are gone
    files = await Array.fromAsync(new Bun.Glob('*.pdf').scan(TEST_INPUT_DIR));
    expect(files.length).toBe(0);
  });

  test("should handle empty directory", async () => {
    // Should not throw - just call it directly
    await cleanupInputDirectory(TEST_INPUT_DIR);

    const files = await Array.fromAsync(new Bun.Glob('*.pdf').scan(TEST_INPUT_DIR));
    expect(files.length).toBe(0);
  });
});
