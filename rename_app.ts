import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/Muslim Sathi/g, 'Halal Circle');
  newContent = newContent.replace(/মুসলিম সাথী/g, 'Halal Circle');
  newContent = newContent.replace(/MuslimSathi/g, 'HalalCircle');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        walkDir(fullPath);
      }
    } else {
      if (
        fullPath.endsWith('.ts') ||
        fullPath.endsWith('.tsx') ||
        fullPath.endsWith('.json') ||
        fullPath.endsWith('.html') ||
        fullPath.endsWith('.md')
      ) {
        replaceInFile(fullPath);
      }
    }
  }
}

walkDir('./src');
walkDir('./public');
replaceInFile('./index.html');
replaceInFile('./metadata.json');
