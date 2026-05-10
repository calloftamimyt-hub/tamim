const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/tools');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'ToolHero.tsx');

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find all lucide-react imports
    const lucideRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/g;
    let match;
    const icons = new Set();
    let numMatches = 0;
    
    while ((match = lucideRegex.exec(content)) !== null) {
        numMatches++;
        const captured = match[1].split(',').map(s => s.trim()).filter(Boolean);
        captured.forEach(c => icons.add(c));
    }
    
    if (numMatches > 0) {
        // remove all old imports
        content = content.replace(lucideRegex, '');
        // insert the merged one after ToolHero import
        const mergedImport = `import { ${Array.from(icons).join(', ')} } from 'lucide-react';\n`;
        content = content.replace("import { ToolHero } from './ToolHero';\n", "import { ToolHero } from './ToolHero';\n" + mergedImport);
        fs.writeFileSync(filePath, content, 'utf-8');
    }
});
console.log("Imports merged!");
