const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const manifestPath = path.join(rootDir, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const version = manifest.version || "0.2.0";

const zipFileName = `chord-side-panel-v${version}.zip`;
const zipFilePath = path.join(rootDir, zipFileName);

// Delete existing zip if present
if (fs.existsSync(zipFilePath)) {
  fs.unlinkSync(zipFilePath);
}

// Build new zip with only required files
const includeFiles = [
  "manifest.json",
  "background.js",
  "panel.html",
  "panel.css",
  "panel.js",
  "content",
  "icons",
];

const cmd = `zip -r "${zipFileName}" ${includeFiles.join(" ")} -x "*.DS_Store"`;
console.log(`Executing: ${cmd}`);

try {
  execSync(cmd, { cwd: rootDir, stdio: "inherit" });
  const stat = fs.statSync(zipFilePath);
  console.log(`\nSuccessfully built: ${zipFileName} (${(stat.size / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error("Failed to package zip:", err);
  process.exit(1);
}
