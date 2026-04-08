# PDF Concatenation Tool - Visual Guide

## TUI Interface

When you run `bun index.ts`, you'll see a beautiful terminal interface:

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  PDF Concatenation Tool                                   │
│                                                            │
│  Found 6 PDF file(s) in ./input                          │
│  PDFs will be merged by filename relevancy               │
│                                                            │
│  Enter output filename:                                   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [Your filename here]                                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Press Enter to continue, Ctrl+C to cancel               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Example Usage

### Step 1: Add PDFs to input directory
```bash
$ ls input/
invoice-january-2024.pdf
invoice-february-2024.pdf
invoice-march-2024.pdf
annual-report-2023.pdf
annual-report-2024.pdf
meeting-notes-q1.pdf
```

### Step 2: Run the tool
```bash
$ bun index.ts
```

### Step 3: Enter filename in TUI
Type your desired filename (e.g., "quarterly-documents") and press Enter.

### Step 4: Watch the magic happen
```
============================================================
Starting PDF concatenation...
============================================================

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

✓ Created merged PDF: ./output/quarterly-documents.pdf
  Total pages: 12

✓ Cleaned up 6 PDF file(s) from ./input

============================================================
Success! PDF concatenation complete.
============================================================
```

### Step 5: Check your output
```bash
$ ls output/
quarterly-documents.pdf

$ ls input/
# Empty - files have been cleaned up!
```

## Features Demo

### Filename Similarity Grouping

The tool intelligently groups similar files:

**Before sorting (alphabetical):**
1. annual-report-2023.pdf
2. annual-report-2024.pdf
3. invoice-february-2024.pdf
4. invoice-january-2024.pdf
5. invoice-march-2024.pdf
6. meeting-notes-q1.pdf

**After smart sorting (by relevancy):**
1. invoice-january-2024.pdf ← Similar to each other
2. invoice-february-2024.pdf ← Grouped together
3. invoice-march-2024.pdf ← All invoices adjacent
4. annual-report-2023.pdf ← Similar to each other
5. annual-report-2024.pdf ← Grouped together
6. meeting-notes-q1.pdf ← Different category

This ensures related documents stay together in the final PDF!

## Testing

Run the automated test (no TUI interaction needed):

```bash
$ bun test-e2e.ts
============================================================
PDF Concatenation Test
============================================================

Found 6 PDF file(s) in ./input:
...
✓ Verification successful!
  Output file: ./output/combined-test.pdf
  Total pages: 12
  Expected: 12 pages (2+2+1+3+3+1)
...
Test completed successfully!
```

## Unit Tests

```bash
$ bun test

 18 pass
 0 fail
 26 expect() calls
Ran 18 tests across 2 files. [168.00ms]
```

All tests passing!
