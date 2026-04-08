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

Once installed, you can use `pdfconc` from any directory:

```bash
# Navigate to your working directory
cd ~/Documents/my-project

# Run pdfconc
pdfconc
```

The tool will:
1. Create an `./input` directory if it doesn't exist
2. Wait for you to add PDF files to `./input`
3. Show a TUI to enter the output filename
4. Concatenate PDFs intelligently by filename similarity
5. Save the merged PDF to `./output`
6. Clean up the `./input` directory

## Quick Example

```bash
# Create a test directory
mkdir ~/test-pdfs && cd ~/test-pdfs

# Run pdfconc (it will create ./input directory)
pdfconc

# Add some PDFs to ./input
cp ~/Downloads/*.pdf ./input/

# Run pdfconc again
pdfconc

# Enter your desired filename in the TUI
# Press Enter

# Your merged PDF will be in ./output!
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
