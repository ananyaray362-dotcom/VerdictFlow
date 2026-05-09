import { readFileSync, writeFileSync } from 'fs';

const file = 'app/(dashboard)/upload/page.tsx';
const content = readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find line indices (0-based)
// The new BulkUploadQueue function ends with a single "}" on its own line after the return block
// The orphaned code starts immediately after (lines with "setUploadQueue(q =>", "processQueue", old fetch etc)
// We need to find: the second "/* --- Main Page --- */" marker and the "export default function UploadPage"

let markers = [];
lines.forEach((line, i) => {
  const stripped = line.replace(/\r/, '').trim();
  if (stripped === '/* \u2500\u2500\u2500 Main Page \u2500\u2500\u2500 */') markers.push(i);
});

console.log('Main Page markers at lines:', markers.map(i => i+1));

// Find the export default
let exportLine = -1;
lines.forEach((line, i) => {
  if (line.includes('export default function UploadPage')) exportLine = i;
});
console.log('export default at line:', exportLine+1);

if (markers.length >= 2 && exportLine > markers[1]) {
  // Remove everything between markers[0]+1 and exportLine-1 (the orphaned block)
  const before = lines.slice(0, markers[0] + 1); // up to and including first Main Page marker
  const after = lines.slice(exportLine - 1); // from blank line before export default
  const newContent = [...before, ...after].join('\n');
  writeFileSync(file, newContent, 'utf8');
  console.log('Done! Removed orphaned block.');
} else if (markers.length === 1 && exportLine > -1) {
  console.log('Only one Main Page marker found, checking if there is orphaned code...');
  // Check if there's orphaned code between marker and export default
  const gapLines = lines.slice(markers[0]+1, exportLine);
  const hasOrphan = gapLines.some(l => l.includes('processQueue') || l.includes("api/analyze\""));
  if (hasOrphan) {
    const before = lines.slice(0, markers[0] + 1);
    const after = lines.slice(exportLine - 1);
    const newContent = [...before, ...after].join('\n');
    writeFileSync(file, newContent, 'utf8');
    console.log('Done! Removed orphaned code between marker and export default.');
  } else {
    console.log('No orphan detected.');
  }
} else {
  console.log('Unexpected structure. markers:', markers.length, 'exportLine:', exportLine);
}
