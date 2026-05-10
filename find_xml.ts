import fs from 'fs';
import path from 'path';
function walkDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') walkDir(fullPath);
    } else {
      if (file === 'strings.xml' || file === 'AndroidManifest.xml') {
        console.log(fullPath);
      }
    }
  }
}
walkDir('.');
