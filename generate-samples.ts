import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Script to generate sample PDF files for testing
 */
async function generateSamplePDFs() {
  const samples = [
    { filename: "invoice-january-2024.pdf", pages: 2, content: "Invoice January 2024" },
    { filename: "invoice-february-2024.pdf", pages: 2, content: "Invoice February 2024" },
    { filename: "invoice-march-2024.pdf", pages: 1, content: "Invoice March 2024" },
    { filename: "annual-report-2023.pdf", pages: 3, content: "Annual Report 2023" },
    { filename: "annual-report-2024.pdf", pages: 3, content: "Annual Report 2024" },
    { filename: "meeting-notes-q1.pdf", pages: 1, content: "Meeting Notes Q1" },
  ];

  console.log("Generating sample PDF files...\n");

  for (const sample of samples) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (let i = 0; i < sample.pages; i++) {
      const page = pdfDoc.addPage([595, 842]); // A4 size
      
      // Title
      page.drawText(sample.content, {
        x: 50,
        y: 750,
        size: 24,
        font,
        color: rgb(0, 0, 0),
      });
      
      // Page number
      page.drawText(`Page ${i + 1} of ${sample.pages}`, {
        x: 50,
        y: 700,
        size: 14,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Some sample content
      const contentFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.drawText(
        `This is a sample PDF document created for testing.\n\nFilename: ${sample.filename}`,
        {
          x: 50,
          y: 600,
          size: 12,
          font: contentFont,
          color: rgb(0, 0, 0),
        }
      );
    }

    const pdfBytes = await pdfDoc.save();
    await Bun.write(`./input/${sample.filename}`, pdfBytes);
    
    console.log(`✓ Created ${sample.filename} (${sample.pages} page${sample.pages > 1 ? 's' : ''})`);
  }

  console.log("\n✓ All sample PDFs generated in ./input/");
  console.log("\nExpected sorting order by relevancy:");
  console.log("  1. invoice-january-2024.pdf");
  console.log("  2. invoice-february-2024.pdf");
  console.log("  3. invoice-march-2024.pdf");
  console.log("  4. annual-report-2023.pdf");
  console.log("  5. annual-report-2024.pdf");
  console.log("  6. meeting-notes-q1.pdf");
  console.log("\nRun 'bun index.ts' to concatenate these PDFs.");
}

generateSamplePDFs();
