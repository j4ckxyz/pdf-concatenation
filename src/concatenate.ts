import { PDFDocument } from 'pdf-lib';
import { sortByRelevancy } from './similarity';

export interface ConcatenateOptions {
  inputDir: string;
  outputPath: string;
}

/**
 * Concatenate all PDFs in the input directory into a single PDF
 * PDFs are sorted by filename relevancy before concatenation
 */
export async function concatenatePDFs(options: ConcatenateOptions): Promise<void> {
  const { inputDir, outputPath } = options;

  // Get all PDF files from input directory
  const files = await Array.fromAsync(new Bun.Glob('*.pdf').scan(inputDir));

  if (files.length === 0) {
    throw new Error('No PDF files found in input directory');
  }

  // Sort files by relevancy
  const sortedFiles = sortByRelevancy(files);

  console.log('\nProcessing PDFs in order:');
  sortedFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  // Create a new PDF document
  const mergedPdf = await PDFDocument.create();

  // Process each PDF file
  for (const filename of sortedFiles) {
    const filePath = `${inputDir}/${filename}`;
    const fileData = await Bun.file(filePath).arrayBuffer();
    const pdf = await PDFDocument.load(fileData);

    // Copy all pages from this PDF
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));

    console.log(`  ✓ Added ${pdf.getPageCount()} page(s) from ${filename}`);
  }

  // Save the merged PDF
  const mergedPdfBytes = await mergedPdf.save();
  await Bun.write(outputPath, mergedPdfBytes);

  console.log(`\n✓ Created merged PDF: ${outputPath}`);
  console.log(`  Total pages: ${mergedPdf.getPageCount()}`);
}

/**
 * Clean up input directory by deleting all PDF files
 */
export async function cleanupInputDirectory(inputDir: string): Promise<void> {
  const files = await Array.fromAsync(new Bun.Glob('*.pdf').scan(inputDir));

  for (const filename of files) {
    const filePath = `${inputDir}/${filename}`;
    await Bun.$`rm ${filePath}`;
  }

  console.log(`\n✓ Cleaned up ${files.length} PDF file(s) from ${inputDir}`);
}
