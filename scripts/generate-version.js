#!/usr/bin/env node

/**
 * Generate a unique version for cache busting
 * Uses VERCEL_GIT_COMMIT_SHA if available, otherwise uses timestamp
 */

const fs = require('fs');
const path = require('path');

// Get version from environment or generate one
const getVersion = () => {
  // Use Vercel's commit SHA if available
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 8);
  }
  
  // Use git commit SHA if available
  try {
    const { execSync } = require('child_process');
    const gitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    if (gitSha) return gitSha;
  } catch (e) {
    // Git not available or not a git repo
  }
  
  // Fallback to timestamp
  return `v${Date.now()}`;
};

const version = getVersion();
const versionFile = path.join(__dirname, '..', 'public', 'version.json');

// Write version to file
fs.writeFileSync(
  versionFile,
  JSON.stringify({ version, timestamp: new Date().toISOString() }, null, 2)
);

console.log(`✓ Generated version: ${version}`);

// Also set as environment variable for Next.js
process.env.NEXT_PUBLIC_APP_VERSION = version;
