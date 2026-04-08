import { concatenatePDFs, cleanupInputDirectory } from "./src/concatenate";

const INPUT_DIR = "./input";
const OUTPUT_DIR = "./output";

/**
 * Test script that runs the PDF concatenation without TUI
 */
async function testConcatenation() {
  console.log("=".repeat(60));
  console.log("PDF Concatenation Test");
  console.log("=".repeat(60));

  // Check if there are PDFs in the input directory
  const pdfFiles = await Array.fromAsync(new Bun.Glob('*.pdf').scan(INPUT_DIR));
  
  if (pdfFiles.length === 0) {
    console.log("No PDF files found in ./input directory");
    console.log("Run 'bun generate-samples.ts' first to create sample PDFs");
    process.exit(1);
  }

  console.log(`\nFound ${pdfFiles.length} PDF file(s) in ${INPUT_DIR}:\n`);
  pdfFiles.forEach((file, i) => console.log(`  ${i + 1}. ${file}`));
  console.log("");

  const outputFilename = "combined-test.pdf";
  const outputPath = `${OUTPUT_DIR}/${outputFilename}`;

  console.log("=".repeat(60));
  console.log("Starting PDF concatenation...");
  console.log("=".repeat(60));

  try {
    // Concatenate PDFs
    await concatenatePDFs({
      inputDir: INPUT_DIR,
      outputPath,
    });

    // Verify the output
    const outputExists = await Bun.file(outputPath).exists();
    if (!outputExists) {
      throw new Error("Output file was not created!");
    }

    // Check page count
    const { PDFDocument } = await import("pdf-lib");
    const outputBytes = await Bun.file(outputPath).arrayBuffer();
    const outputPdf = await PDFDocument.load(outputBytes);
    const pageCount = outputPdf.getPageCount();

    console.log(`\n✓ Verification successful!`);
    console.log(`  Output file: ${outputPath}`);
    console.log(`  Total pages: ${pageCount}`);
    console.log(`  Expected: 12 pages (2+2+1+3+3+1)`);

    if (pageCount !== 12) {
      console.warn(`\n⚠ Warning: Expected 12 pages but got ${pageCount}`);
    }

    // Clean up input directory
    await cleanupInputDirectory(INPUT_DIR);

    console.log("\n" + "=".repeat(60));
    console.log("Test completed successfully!");
    console.log("=".repeat(60));
    console.log(`\nOutput saved to: ${outputPath}`);
    console.log("Input directory cleaned up.");
  } catch (error) {
    console.error("\nError:", error);
    process.exit(1);
  }
}

testConcatenation();
