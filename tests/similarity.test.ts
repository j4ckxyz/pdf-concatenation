import { test, expect, describe } from "bun:test";
import { calculateSimilarity, sortByRelevancy } from "../src/similarity";

describe("calculateSimilarity", () => {
  test("identical filenames should have similarity of 1", () => {
    const result = calculateSimilarity("report.pdf", "report.pdf");
    expect(result).toBe(1);
  });

  test("completely different filenames should have similarity of 0", () => {
    const result = calculateSimilarity("apple.pdf", "banana.pdf");
    expect(result).toBe(0);
  });

  test("should handle different separators (dashes and underscores)", () => {
    const result = calculateSimilarity("annual-report-2024.pdf", "annual_report_2024.pdf");
    expect(result).toBe(1);
  });

  test("should be case insensitive", () => {
    const result = calculateSimilarity("Annual Report.pdf", "annual report.pdf");
    expect(result).toBe(1);
  });

  test("should calculate partial similarity", () => {
    // "annual report" vs "annual report 2024" = 2 common words / 3 total words
    const result = calculateSimilarity("annual report.pdf", "annual report 2024.pdf");
    expect(result).toBeCloseTo(2/3, 2);
  });

  test("should ignore file extension", () => {
    const result = calculateSimilarity("document.PDF", "document.pdf");
    expect(result).toBe(1);
  });

  test("should handle special characters and separators", () => {
    // Periods create word boundaries, so "v1.2" becomes ["v1", "2"]
    const result = calculateSimilarity("my-file-version-1.pdf", "my file version 1.pdf");
    expect(result).toBe(1);
  });

  test("should return 0 for empty filenames", () => {
    const result = calculateSimilarity(".pdf", "test.pdf");
    expect(result).toBe(0);
  });
});

describe("sortByRelevancy", () => {
  test("should keep single file as-is", () => {
    const result = sortByRelevancy(["file.pdf"]);
    expect(result).toEqual(["file.pdf"]);
  });

  test("should keep empty array as-is", () => {
    const result = sortByRelevancy([]);
    expect(result).toEqual([]);
  });

  test("should group similar files together", () => {
    const files = [
      "invoice-march.pdf",
      "report-q1.pdf",
      "invoice-april.pdf",
      "report-q2.pdf",
      "invoice-may.pdf"
    ];
    
    const result = sortByRelevancy(files);
    
    // First file stays first
    expect(result[0]).toBe("invoice-march.pdf");
    
    // Next should be most similar to invoice-march (invoice-april or invoice-may)
    expect(result[1]).toMatch(/invoice-(april|may)\.pdf/);
    
    // The invoices should be grouped together
    const invoiceIndices = result
      .map((f, i) => f.includes("invoice") ? i : -1)
      .filter(i => i !== -1);
    
    // Check that invoice indices are consecutive (no gaps > 1)
    for (let i = 0; i < invoiceIndices.length - 1; i++) {
      expect(invoiceIndices[i + 1] - invoiceIndices[i]).toBeLessThanOrEqual(1);
    }
  });

  test("should sort by relevancy starting from first file", () => {
    const files = [
      "annual-report-2023.pdf",
      "monthly-summary-jan.pdf", 
      "annual-report-2024.pdf"
    ];
    
    const result = sortByRelevancy(files);
    
    // First file stays
    expect(result[0]).toBe("annual-report-2023.pdf");
    
    // Second should be annual-report-2024 (more similar to annual-report-2023)
    expect(result[1]).toBe("annual-report-2024.pdf");
    
    // Third should be monthly-summary-jan
    expect(result[2]).toBe("monthly-summary-jan.pdf");
  });
});
