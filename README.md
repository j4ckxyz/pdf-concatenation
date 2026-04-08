# PDF Concatenation Tool

A powerful CLI tool built with Bun that concatenates multiple PDF files into a single document. PDFs are intelligently sorted by filename similarity before merging, ensuring related documents stay together.

## Features

- **Smart Sorting**: PDFs are grouped by filename relevancy using a similarity algorithm
- **Multi-page Support**: Preserves all pages from each PDF in the correct order
- **Interactive TUI**: Beautiful terminal UI built with OpenTUI for entering the output filename
- **Two Working Modes**: 
  - **Current Directory Mode**: Works with PDFs in your current folder (preserves originals)
  - **Dedicated Folder Mode**: Uses `./input` folder (cleans up after merging)
- **Fast**: Built with Bun for maximum performance
- **Well Tested**: Comprehensive test suite included

## Installation

### Global Installation (Recommended)

Install `pdfconc` globally to use it from any directory:

```bash
# Clone and install
git clone https://github.com/j4ckxyz/pdf-concatenation.git
cd pdf-concatenation
bun install
bun link

# Now use 'pdfconc' from anywhere!
cd ~/Documents/my-project
pdfconc
```

### Local Installation

```bash
git clone https://github.com/j4ckxyz/pdf-concatenation.git
cd pdf-concatenation
bun install
```

## Updating

Use the standard Git-based CLI update flow:

```bash
# Navigate to the installation directory
cd path/to/pdf-concatenation

# Pull latest changes
git pull --ff-only

# Reinstall dependencies (if any new ones)
bun install

# The global 'pdfconc' command is automatically updated!
```

Or use the built-in update script:

```bash
# From anywhere, if you're in the repo directory
bun run update

# Or navigate to the repo first
cd ~/pdf-concatenation
bun run update
```

You only need to run `bun link` once at initial install. Because Bun links this repo into your global bin, `git pull` updates the installed CLI immediately.

## Usage

### CLI Flags

```bash
pdfconc --help
pdfconc --version
pdfconc --no-tui
```

- `-h, --help`: show usage help
- `-v, --version`: print CLI version
- `--no-tui`: use plain prompt mode (helpful if terminal key handling is flaky)

The tool has **two working modes**:

### Mode 1: Current Directory (Preserves PDFs)

Use this when you have PDFs in your current directory that you want to keep:

```bash
# Navigate to directory with PDFs
cd ~/Documents/invoices

# Run pdfconc (PDFs will NOT be deleted)
pdfconc

# If Enter key is unreliable in your terminal, use fallback prompt mode
pdfconc --no-tui
```

The tool will:
- Find all PDFs in current directory
- Merge them by filename relevancy
- Save to `./output/<filename>.pdf`
- **Keep original PDFs** (they are NOT deleted)

### Mode 2: Dedicated Folder (Cleans Up)

Use this for a clean workflow where source PDFs are removed after merging:

```bash
# Create input folder
mkdir input

# Add PDFs to input folder
cp ~/Downloads/*.pdf input/

# Run pdfconc
pdfconc
```

The tool will:
- Find all PDFs in `./input`
- Merge them by filename relevancy  
- Save to `./output/<filename>.pdf`
- **Delete PDFs from `./input`** (cleanup after merge)

### Local Usage (Development)

### 1. Add PDF files to the input directory

```bash
# Create sample PDFs for testing
bun generate-samples.ts
```

Or manually place your PDF files in the `./input` directory.

### 2. Run the tool

```bash
bun index.ts
```

The tool will:
1. Detect PDF files (in `./input` or current directory)
2. Show you a beautiful TUI to enter the output filename
3. Sort PDFs by filename relevancy
4. Concatenate them into a single PDF
5. Save the result to `./output/<your-filename>.pdf`
6. Clean up source PDFs (only if using `./input` folder)

### 3. Find your merged PDF

Check the `./output` directory for your concatenated PDF.

## How It Works

### Filename Similarity Algorithm

The tool uses a Jaccard similarity algorithm to group related PDFs:

- Removes file extensions and normalizes names
- Splits filenames into words
- Calculates similarity based on common words
- Groups similar files together (e.g., all invoices, all reports)

Example:
- `invoice-january-2024.pdf` and `invoice-february-2024.pdf` will be grouped together
- `annual-report-2023.pdf` and `annual-report-2024.pdf` will be grouped together
- These groups are then ordered by relevancy

## Project Structure

```
pdf-concatenation/
├── src/
│   ├── similarity.ts      # Filename similarity matching algorithm
│   └── concatenate.ts     # PDF concatenation and cleanup logic
├── tests/
│   ├── similarity.test.ts # Unit tests for similarity algorithm
│   └── concatenate.test.ts # Integration tests for PDF operations
├── input/                 # Place PDF files here
├── output/                # Merged PDFs appear here
├── index.ts              # Main CLI application with TUI
├── generate-samples.ts   # Script to create sample PDFs
└── test-e2e.ts          # End-to-end test script
```

## Scripts

### Run the main application
```bash
bun index.ts
```

### Generate sample PDFs
```bash
bun generate-samples.ts
```

### Run tests
```bash
# Run all tests
bun test

# Run specific test file
bun test tests/similarity.test.ts
bun test tests/concatenate.test.ts
```

### Run end-to-end test
```bash
# First generate samples, then run the test
bun generate-samples.ts
bun test-e2e.ts
```

## Testing

The project includes comprehensive tests:

### Unit Tests (`tests/similarity.test.ts`)
- Tests for filename similarity calculation
- Tests for relevancy-based sorting
- Edge cases (empty files, special characters, etc.)

### Integration Tests (`tests/concatenate.test.ts`)
- PDF creation and concatenation
- Multi-page PDF handling
- Directory cleanup
- Error handling

### End-to-End Test (`test-e2e.ts`)
- Full workflow test without interactive input
- Verifies correct page count and file creation
- Tests cleanup functionality

All tests pass:
```bash
$ bun test
 18 pass
 0 fail
 26 expect() calls
Ran 18 tests across 2 files. [168.00ms]
```

## Technologies

- **[Bun](https://bun.sh)**: Fast JavaScript runtime and package manager
- **[pdf-lib](https://pdf-lib.js.org/)**: Create and modify PDF documents
- **[OpenTUI](https://opentui.com)**: Terminal UI framework for beautiful CLIs
- **TypeScript**: Type-safe code

## Example Output

```
Found 6 PDF file(s) in ./input:
  1. invoice-january-2024.pdf
  2. invoice-february-2024.pdf
  3. invoice-march-2024.pdf
  4. annual-report-2023.pdf
  5. annual-report-2024.pdf
  6. meeting-notes-q1.pdf

Processing PDFs in order:
  1. invoice-january-2024.pdf
  2. invoice-february-2024.pdf
  3. invoice-march-2024.pdf
  4. annual-report-2023.pdf
  5. annual-report-2024.pdf
  6. meeting-notes-q1.pdf
  ✓ Added 2 page(s) from invoice-january-2024.pdf
  ✓ Added 2 page(s) from invoice-february-2024.pdf
  ✓ Added 1 page(s) from invoice-march-2024.pdf
  ✓ Added 3 page(s) from annual-report-2023.pdf
  ✓ Added 3 page(s) from annual-report-2024.pdf
  ✓ Added 1 page(s) from meeting-notes-q1.pdf

✓ Created merged PDF: ./output/combined-documents.pdf
  Total pages: 12

✓ Cleaned up 6 PDF file(s) from ./input
```

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
