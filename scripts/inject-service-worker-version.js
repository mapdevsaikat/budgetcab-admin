#!/usr/bin/env node

/**
 * Inject version into service worker file
 */

const fs = require('fs');
const path = require('path');

// Read version
const versionFile = path.join(__dirname, '..', 'public', 'version.json');
let version = 'v' + Date.now();

if (fs.existsSync(versionFile)) {
  const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
  version = versionData.version || version;
}

// Read service worker template
const swTemplatePath = path.join(__dirname, '..', 'public', 'service-worker.js');
const swContent = fs.readFileSync(swTemplatePath, 'utf-8');

// Replace CACHE_NAME with versioned cache name
const updatedContent = swContent.replace(
  /const CACHE_NAME = ['"](.*?)['"]/,
  `const CACHE_NAME = 'budgetcab-admin-${version}'`
);

// Write updated service worker
fs.writeFileSync(swTemplatePath, updatedContent);
console.log(`✓ Injected version ${version} into service worker`);
