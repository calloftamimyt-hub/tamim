const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/tools');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'ToolHero.tsx');

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Fix the broken import
    // Look for:
    // import React
    // import { ToolHero } from './ToolHero';
    // import { [Icon] } from 'lucide-react';, { ... } from 'react';
    // OR 
    // import { [Icon] } from 'lucide-react'; from 'react';
    
    // We can use a regex to fix it safely.
    const regex = /import React\nimport \{ ToolHero \} from '\.\/ToolHero';\nimport \{ ([A-Za-z0-9_]+) \} from 'lucide-react';(.*?from 'react';)/;
    
    content = content.replace(regex, "import React$2\nimport { ToolHero } from './ToolHero';\nimport { $1 } from 'lucide-react';");

    fs.writeFileSync(filePath, content, 'utf-8');
});
console.log("Fixed imports!");
