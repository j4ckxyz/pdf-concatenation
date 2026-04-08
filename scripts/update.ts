#!/usr/bin/env bun

const BASE_BRANCH = "master";

console.log("Updating PDF Concatenation Tool...\n");

try {
  // Check if we're in a git repository
  const gitCheck = await Bun.$`git rev-parse --git-dir`.quiet();
  
  if (gitCheck.exitCode !== 0) {
    console.error("Error: Not in a git repository");
    console.error("Please navigate to the pdf-concatenation directory first");
    process.exit(1);
  }

  // Get current version (commit hash)
  const currentCommit = await Bun.$`git rev-parse --short HEAD`.text();
  console.log(`Current version: ${currentCommit.trim()}`);

  // Fetch latest changes
  console.log("\nFetching latest changes from GitHub...");
  await Bun.$`git fetch origin`;

  // Check if there are updates
  const behind = await Bun.$`git rev-list HEAD..origin/${BASE_BRANCH} --count`.text();
  const behindCount = parseInt(behind.trim());

  if (behindCount === 0) {
    console.log("\nAlready up to date.");
    process.exit(0);
  }

  console.log(`\n${behindCount} new commit${behindCount > 1 ? 's' : ''} available`);

  // Show what's new
  console.log("\nWhat's new:");
  await Bun.$`git log --oneline HEAD..origin/${BASE_BRANCH}`;

  // Pull latest changes
  console.log("\nPulling latest changes...");
  await Bun.$`git pull origin ${BASE_BRANCH}`;

  // Reinstall dependencies
  console.log("\nUpdating dependencies...");
  await Bun.$`bun install`;

  // Get new version
  const newCommit = await Bun.$`git rev-parse --short HEAD`.text();
  
  console.log("\n" + "=".repeat(60));
  console.log("Update complete.");
  console.log("=".repeat(60));
  console.log(`Updated from ${currentCommit.trim()} to ${newCommit.trim()}`);
  console.log("\nYour global 'pdfconc' command is now using the latest version!");
  console.log("No need to run 'bun link' again - the symlink is already set up.");
  
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("\nUpdate failed:", message);
  console.error("\nTry updating manually:");
  console.error(`  git pull origin ${BASE_BRANCH}`);
  console.error("  bun install");
  process.exit(1);
}
