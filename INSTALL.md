# Installation Guide

## Global Installation

Install the `pdfconc` command globally so you can use it from anywhere:

```bash
# Clone the repository
git clone https://github.com/j4ckxyz/pdf-concatenation.git
cd pdf-concatenation

# Install dependencies
bun install

# Link globally
bun link

# The 'pdfconc' command is now available globally!
```

## Usage

Once installed, `pdfconc` works in **two modes**:

### Mode 1: Current Directory (Preserves PDFs)

```bash
# Navigate to directory with PDFs
cd ~/Documents/invoices

# Run pdfconc - it will use PDFs in current directory
pdfconc

# PDFs are merged but NOT deleted!
```

### Mode 2: Dedicated Folder (Cleans Up)

```bash
# Navigate to your working directory
cd ~/Documents/my-project

# Create input folder and add PDFs
mkdir input
cp ~/Downloads/*.pdf input/

# Run pdfconc - it will use PDFs from ./input
pdfconc

# PDFs are merged and ./input is cleaned up
```

The tool automatically detects which mode to use:
- If `./input` folder exists → Uses dedicated folder mode (cleans up)
- If no `./input` folder → Uses current directory mode (preserves PDFs)

## Updating (Standard Workflow)

Update using the standard Git CLI flow:

```bash
cd ~/pdf-concatenation
git pull --ff-only
bun install
```

Or run the helper script:

```bash
cd ~/pdf-concatenation
bun run update
```

Because `bun link` creates a symlink, updating the repo updates `pdfconc` globally without relinking.

## Quick Examples

### Example 1: Merge PDFs in current directory (keep originals)

```bash
cd ~/Documents/reports
# (directory has: report1.pdf, report2.pdf, report3.pdf)

pdfconc
# Enter filename: "combined-reports"
# Result: ./output/combined-reports.pdf
# Originals: KEPT in current directory
```

### Example 2: Merge PDFs from input folder (cleanup)

```bash
mkdir ~/project && cd ~/project
mkdir input
cp ~/Downloads/*.pdf input/

pdfconc
# Enter filename: "merged"
# Result: ./output/merged.pdf
# Originals: DELETED from ./input
```

## Uninstall

To remove the global command:

```bash
bun unlink pdf-concatenation
```

## System Requirements

- [Bun](https://bun.sh) runtime installed
- macOS, Linux, or WSL (Bun requirement)

## Installation via GitHub

You can also install directly from GitHub:

```bash
git clone https://github.com/j4ckxyz/pdf-concatenation.git
cd pdf-concatenation
bun install
bun link
```

## Development

To run tests or modify the tool:

```bash
# Run all tests
bun test

# Generate sample PDFs
bun generate-samples.ts

# Run end-to-end test
bun test-e2e.ts

# Run the tool locally (without global install)
bun index.ts
```

## Features

- **Global Command**: Use `pdfconc` from any directory
- **Smart Sorting**: Groups similar PDFs together (e.g., all invoices, all reports)
- **Beautiful TUI**: Clean terminal interface for entering output filename
- **Auto Directory Creation**: Creates `./input` and `./output` as needed
- **Auto Cleanup**: Removes processed PDFs after merging
- **Well Tested**: 18 tests, all passing

## Troubleshooting

### Command not found: pdfconc

Make sure you ran `bun link` in the project directory. Check if Bun's bin directory is in your PATH:

```bash
echo $PATH | grep -q .bun/bin && echo "Bun bin in PATH" || echo "Add ~/.bun/bin to PATH"
```

### No PDFs found

Make sure you have PDF files in the `./input` directory of your current working directory.

### Permission denied

Make sure the bin script is executable:

```bash
chmod +x bin/pdfconc.ts
```

## License

MIT - See LICENSE file for details

## Repository

https://github.com/j4ckxyz/pdf-concatenation
