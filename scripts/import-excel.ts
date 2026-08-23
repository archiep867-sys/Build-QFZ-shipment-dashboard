import fs from 'node:fs'; import path from 'node:path';
const file=process.argv[2];
if(!file||!fs.existsSync(file)){console.error('Usage: npm run import:excel -- "path/to/workbook.xlsx"');process.exit(1)}
console.log(`Use the Admin Dashboard import for a preview and duplicate-safe import: ${path.resolve(file)}`);
