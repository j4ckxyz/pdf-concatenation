#!/usr/bin/env bun
import { createCliRenderer, Box, Text, Input } from "@opentui/core";
import { PDFDocument } from "pdf-lib";

const INPUT_DIR = "./input";
const OUTPUT_DIR = "./output";
const CLI_VERSION = "1.0.1";

interface CliOptions {
  help: boolean;
  version: boolean;
  noTui: boolean;
}

function parseCliArgs(argv: string[]): CliOptions {
  return {
    help: argv.includes("-h") || argv.includes("--help"),
    version: argv.includes("-v") || argv.includes("--version"),
    noTui: argv.includes("--no-tui"),
  };
}

function printHelp(): void {
  console.log(`pdfconc ${CLI_VERSION}`);
  console.log("Merge PDF files by filename relevancy.");
  console.log("");
  console.log("Usage:");
  console.log("  pdfconc [options]");
  console.log("");
  console.log("Options:");
  console.log("  -h, --help       Show help");
  console.log("  -v, --version    Show version");
  console.log("  --no-tui         Use plain text prompt instead of TUI");
  console.log("");
  console.log("Modes:");
  console.log("  - If ./input exists: uses ./input and deletes processed PDFs from ./input");
  console.log("  - If ./input does not exist: uses current directory and preserves PDFs");
}

/**
 * Calculates similarity between two filenames based on common words
 */
function calculateSimilarity(filename1: string, filename2: string): number {
  const normalize = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\.pdf$/i, '')
      .replace(/[_-]/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
  };

  const name1 = normalize(filename1);
  const name2 = normalize(filename2);

  const words1 = new Set(name1.split(/\s+/).filter(w => w.length > 0));
  const words2 = new Set(name2.split(/\s+/).filter(w => w.length > 0));

  if (words1.size === 0 || words2.size === 0) {
    return 0;
  }

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Sort PDF filenames by relevancy
 */
function sortByRelevancy(filenames: string[]): string[] {
  if (filenames.length <= 1) {
    return [...filenames];
  }

  const sorted: string[] = [];
  const remaining = [...filenames];

  sorted.push(remaining.shift()!);

  while (remaining.length > 0) {
    const lastFile = sorted[sorted.length - 1];
    let bestIndex = 0;
    let bestScore = -1;

    for (let i = 0; i < remaining.length; i++) {
      const score = calculateSimilarity(lastFile, remaining[i]);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    sorted.push(remaining.splice(bestIndex, 1)[0]);
  }

  return sorted;
}

/**
 * Concatenate PDFs
 */
async function concatenatePDFs(inputDir: string, outputPath: string): Promise<void> {
  const files = await Array.fromAsync(new Bun.Glob('*.pdf').scan(inputDir));

  if (files.length === 0) {
    throw new Error('No PDF files found in input directory');
  }

  const sortedFiles = sortByRelevancy(files);

  console.log('\nProcessing PDFs in order:');
  sortedFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  const mergedPdf = await PDFDocument.create();

  for (const filename of sortedFiles) {
    const filePath = `${inputDir}/${filename}`;
    const fileData = await Bun.file(filePath).arrayBuffer();
    const pdf = await PDFDocument.load(fileData);

    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));

    console.log(`  ✓ Added ${pdf.getPageCount()} page(s) from ${filename}`);
  }

  const mergedPdfBytes = await mergedPdf.save();
  await Bun.write(outputPath, mergedPdfBytes);

  console.log(`\n✓ Created merged PDF: ${outputPath}`);
  console.log(`  Total pages: ${mergedPdf.getPageCount()}`);
}

/**
 * Clean up input directory (only when using dedicated input/output folder structure)
 */
async function cleanupInputDirectory(inputDir: string): Promise<void> {
  const files = await Array.fromAsync(new Bun.Glob('*.pdf').scan(inputDir));

  for (const filename of files) {
    const filePath = `${inputDir}/${filename}`;
    await Bun.$`rm ${filePath}`;
  }

  console.log(`\n✓ Cleaned up ${files.length} PDF file(s) from ${inputDir}`);
}

async function promptOutputFilename(
  pdfCount: number,
  modeText: string,
  useTui: boolean,
): Promise<string> {
  if (!useTui || !process.stdin.isTTY || !process.stdout.isTTY) {
    const value = prompt("Enter output filename (without .pdf extension):")?.trim() ?? "";
    if (!value) {
      throw new Error("No filename provided");
    }
    return value;
  }

  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  });

  const inputComponent = Input({
    placeholder: "Enter output filename (without .pdf extension)",
    border: true,
    borderStyle: "rounded",
    width: 60,
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
        content: `Found ${pdfCount} PDF file(s)`,
        fg: "#FFFF00",
      }),
      Text({
        content: modeText,
        fg: modeText.includes("NOT") ? "#FF8800" : "#00FFFF",
      }),
      Text({
        content: "PDFs will be merged by filename relevancy",
      }),
      Box({ height: 1 }),
      Text({
        content: "Enter output filename:",
        fg: "#00FFFF",
      }),
      inputComponent,
      Box({ height: 1 }),
      Text({
        content: "Press Enter to continue, Ctrl+C to cancel",
        fg: "#888888",
      }),
    ),
  );

  inputComponent.focus();

  return await new Promise<string>((resolve, reject) => {
    let done = false;

    const finish = (value: string) => {
      if (done) {
        return;
      }
      done = true;
      renderer.keyInput.off("keypress", onKeyPress);
      renderer.destroy();
      resolve(value);
    };

    const fail = (message: string) => {
      if (done) {
        return;
      }
      done = true;
      renderer.keyInput.off("keypress", onKeyPress);
      renderer.destroy();
      reject(new Error(message));
    };

    const submit = () => {
      const value = String(inputComponent.value ?? "").trim();
      if (!value) {
        return;
      }
      finish(value);
    };

    const onKeyPress = (key: { name?: string; ctrl?: boolean; sequence?: string }) => {
      const isEnter = key.name === "return" || key.name === "enter" || key.name === "linefeed" || key.sequence === "\r" || key.sequence === "\n";
      if (isEnter) {
        submit();
        return;
      }

      if (key.ctrl && key.name === "c") {
        fail("Cancelled by user");
      }
    };

    inputComponent.onSubmit = () => submit();
    renderer.keyInput.on("keypress", onKeyPress);
  });
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.version) {
    console.log(CLI_VERSION);
    process.exit(0);
  }

  const cwd = process.cwd();
  
  // Check if dedicated input directory exists
  const inputDirPath = `${cwd}/${INPUT_DIR}`;
  const inputDirExists = await Bun.file(inputDirPath).exists();
  
  let sourceDir: string;
  let shouldCleanup: boolean;
  let workingMode: string;
  
  if (inputDirExists) {
    // Mode 1: Using dedicated input/output folders
    sourceDir = inputDirPath;
    shouldCleanup = true;
    workingMode = "dedicated folders";
  } else {
    // Mode 2: Using current directory for PDFs
    sourceDir = cwd;
    shouldCleanup = false;
    workingMode = "current directory";
  }

  // Check for PDFs in the source directory
  const pdfFiles = await Array.fromAsync(new Bun.Glob('*.pdf').scan(sourceDir));
  
  if (pdfFiles.length === 0) {
    if (workingMode === "current directory") {
      console.log("No PDF files found in current directory.");
      console.log("\nYou can either:");
      console.log(`  1. Add PDF files to this directory and run 'pdfconc' again`);
      console.log(`  2. Create an ${INPUT_DIR} folder, add PDFs there, and run 'pdfconc'`);
    } else {
      console.log(`No PDF files found in ${inputDirPath}`);
      console.log("Please add PDF files and run pdfconc again");
    }
    process.exit(1);
  }

  // Show which mode we're in
  console.log(`Mode: ${workingMode}`);
  console.log(`Found ${pdfFiles.length} PDF file(s)${workingMode === "current directory" ? " in current directory" : ` in ${INPUT_DIR}`}:\n`);
  pdfFiles.forEach((file, i) => console.log(`  ${i + 1}. ${file}`));
  
  if (workingMode === "current directory") {
    console.log(`\n⚠️  PDFs will NOT be deleted after merging (working in current directory)`);
  } else {
    console.log(`\n✓ PDFs will be moved to archive after merging`);
  }
  console.log("");

  const modeText = workingMode === "current directory" 
    ? "PDFs from current directory (will NOT be deleted)"
    : `PDFs from ${INPUT_DIR} (will be cleaned up)`;

  let outputFilename = "";
  try {
    outputFilename = await promptOutputFilename(pdfFiles.length, modeText, !args.noTui);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`\n${message}. Exiting.`);
    process.exit(1);
  }

  // Ensure .pdf extension
  if (!outputFilename.endsWith('.pdf')) {
    outputFilename += '.pdf';
  }

  // Create output directory
  const outputDir = `${cwd}/${OUTPUT_DIR}`;
  await Bun.$`mkdir -p ${outputDir}`;

  const outputPath = `${outputDir}/${outputFilename}`;

  console.log("\n" + "=".repeat(60));
  console.log("Starting PDF concatenation...");
  console.log("=".repeat(60));

  try {
    await concatenatePDFs(sourceDir, outputPath);
    
    // Only cleanup if using dedicated input folder
    if (shouldCleanup) {
      await cleanupInputDirectory(sourceDir);
    } else {
      console.log(`\n✓ Source PDFs preserved in current directory`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("Success! PDF concatenation complete.");
    console.log("=".repeat(60));
    console.log(`\nOutput: ${outputPath}`);
  } catch (error) {
    console.error("\nError:", error);
    process.exit(1);
  }
}

main();
