import { createCliRenderer, Box, Text, Input } from "@opentui/core";
import { concatenatePDFs, cleanupInputDirectory } from "./src/concatenate";

const INPUT_DIR = "./input";
const OUTPUT_DIR = "./output";

async function main() {
  // Check if there are PDFs in the input directory
  const pdfFiles = await Array.fromAsync(new Bun.Glob('*.pdf').scan(INPUT_DIR));
  
  if (pdfFiles.length === 0) {
    console.log("No PDF files found in ./input directory");
    console.log("Please add PDF files to ./input and run again");
    process.exit(1);
  }

  console.log(`Found ${pdfFiles.length} PDF file(s) in ${INPUT_DIR}:\n`);
  pdfFiles.forEach((file, i) => console.log(`  ${i + 1}. ${file}`));
  console.log("");

  // Create TUI to get output filename
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  });

  let outputFilename = "";
  let isSubmitted = false;

  const inputComponent = Input({
    placeholder: "Enter output filename (without .pdf extension)",
    border: true,
    borderStyle: "rounded",
    width: 60,
    onSubmit: (value: string) => {
      outputFilename = value.trim();
      isSubmitted = true;
      renderer.destroy();
    },
  });

  renderer.root.add(
    Box(
      {
        flexDirection: "column",
        gap: 1,
        padding: 2,
      },
      Text({
        content: "PDF Concatenation Tool",
        fg: "#00FF00",
        bold: true,
      }),
      Text({
        content: `Found ${pdfFiles.length} PDF file(s) in ${INPUT_DIR}`,
        fg: "#FFFF00",
      }),
      Text({
        content: "PDFs will be merged by filename relevancy",
      }),
      Box({ height: 1 }), // Spacer
      Text({
        content: "Enter output filename:",
        fg: "#00FFFF",
      }),
      inputComponent,
      Box({ height: 1 }), // Spacer
      Text({
        content: "Press Enter to continue, Ctrl+C to cancel",
        fg: "#888888",
      })
    )
  );

  // Wait for user to submit
  await new Promise<void>((resolve) => {
    const checkInterval = setInterval(() => {
      if (isSubmitted) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });

  if (!outputFilename) {
    console.log("\nNo filename provided. Exiting.");
    process.exit(1);
  }

  // Ensure .pdf extension
  if (!outputFilename.endsWith('.pdf')) {
    outputFilename += '.pdf';
  }

  const outputPath = `${OUTPUT_DIR}/${outputFilename}`;

  console.log("\n" + "=".repeat(60));
  console.log("Starting PDF concatenation...");
  console.log("=".repeat(60));

  try {
    // Concatenate PDFs
    await concatenatePDFs({
      inputDir: INPUT_DIR,
      outputPath,
    });

    // Clean up input directory
    await cleanupInputDirectory(INPUT_DIR);

    console.log("\n" + "=".repeat(60));
    console.log("Success! PDF concatenation complete.");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\nError:", error);
    process.exit(1);
  }
}

main();
