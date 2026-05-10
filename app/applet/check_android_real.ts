import fs from 'fs';
import path from 'path';

function walkDir(dir: string, indent = '') {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
       console.log(indent + file + '/');
       walkDir(fullPath, indent + '  ');
    } else {
       if (file.endsWith('.xml') || file.endsWith('.json')) {
         console.log(indent + file);
       }
    }
  }
}
walkDir('.');
