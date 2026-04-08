/**
 * Calculates similarity between two filenames based on common words
 * Returns a score between 0 and 1, where 1 means identical word sets
 */
export function calculateSimilarity(filename1: string, filename2: string): number {
  // Remove file extensions and normalize
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

  // Split into words
  const words1 = new Set(name1.split(/\s+/).filter(w => w.length > 0));
  const words2 = new Set(name2.split(/\s+/).filter(w => w.length > 0));

  if (words1.size === 0 || words2.size === 0) {
    return 0;
  }

  // Calculate Jaccard similarity (intersection over union)
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Sort PDF filenames by relevancy (similarity to each other)
 * Uses a greedy approach: start with first file, then pick the most similar remaining file
 */
export function sortByRelevancy(filenames: string[]): string[] {
  if (filenames.length <= 1) {
    return [...filenames];
  }

  const sorted: string[] = [];
  const remaining = [...filenames];

  // Start with the first file
  sorted.push(remaining.shift()!);

  // Greedily pick the most similar file to the last sorted file
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
