const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/tools');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'ToolHero.tsx');

// We need to parse Tools.tsx to get the tools data
const toolsCode = fs.readFileSync(path.join(__dirname, 'src/pages/Tools.tsx'), 'utf-8');

// Match the SOCIAL_TOOLS array to extract bg and icon info
const regex = /id:\s*'([^']+)',\s*title:\s*\{[^}]+\},\s*icon:\s*([A-Za-z0-9_]+),\s*color.*?bg:\s*'([^']+)'/g;
let match;
const toolData = {};

while ((match = regex.exec(toolsCode)) !== null) {
    const [_, id, icon, bg] = match;
    toolData[id] = { icon, bg };
}

// Convert component filename to tool ID (rough guess)
// Actually we can parse Tools.tsx to see which component maps to which ID
const ID_REGEX = /activeToolId === '([^']+)' \? \(\s*<motion[^\>]+>\s*<([A-Za-z0-9_]+) /g;
let idMatch;
const compToId = {};
while ((idMatch = ID_REGEX.exec(toolsCode)) !== null) {
    const [_, id, comp] = idMatch;
    compToId[comp] = id;
}

// Now replace in each file
files.forEach(file => {
    const componentName = file.replace('.tsx', '');
    const id = compToId[componentName];
    if (!id || !toolData[id]) {
        console.log("Skipping", file, "- not found in tool data mapping");
        return;
    }

    const { icon, bg } = toolData[id];
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Extract title
    const titleRegex = /<h2[^>]*>\s*\{language === 'bn' \? '([^']+)' : '([^']+)'\}\s*<\/h2>/;
    const titleMatch = content.match(titleRegex);
    let titleBn = titleMatch ? titleMatch[1] : '';
    let titleEn = titleMatch ? titleMatch[2] : '';

    // Extract desc
    const descRegex = /<p[^>]*>\s*\{language === 'bn' \? '([^']+)' : '([^']+)'\}\s*<\/p>/;
    const descMatch = content.match(descRegex);
    let descBn = descMatch ? descMatch[1] : '';
    let descEn = descMatch ? descMatch[2] : '';

    // Add import ToolHero
    if (!content.includes('ToolHero')) {
        content = content.replace("import React", "import React\nimport { ToolHero } from './ToolHero';\nimport { " + icon + " } from 'lucide-react';");
    }

    // Replace header block
    // The header starts with <div className="bg-white dark:bg-slate-900 border-b
    // And ends with </div> before the content starts
    const headerStart = content.search(/<div[^>]+bg-white[^>]+border-b[^>]+px-6[^>]+py-4/);
    if (headerStart === -1) {
        console.log("Could not find header in", file);
        return;
    }

    // Rough extraction: find the div and count braces to find closing </div>
    let depth = 0;
    let i = headerStart;
    let inStr=false;
    let strChar='';
    while(i < content.length) {
        if (!inStr && (content[i] === '"' || content[i] === "'")) {
             inStr=true; strChar=content[i];
        } else if (inStr && content[i] === strChar && content[i-1] !== '\\') {
             inStr=false;
        }

        if(!inStr) {
            if (content.substr(i, 4) === '<div') depth++;
            if (content.substr(i, 5) === '</div') depth--;
        }

        i++;
        if (depth === 0 && i > headerStart + 10) break;
    }
    const headerEnd = i + 5; // to include '</div>'

    if (depth !== 0) {
        console.log("Failed to parse div matching in", file);
        return;
    }

    const newHeader = `<ToolHero title={{ bn: '${titleBn}', en: '${titleEn}' }} description={{ bn: '${descBn}', en: '${descEn}' }} Icon={${icon}} bgGradient="${bg}" onBack={onBack} />`;
    
    content = content.substring(0, headerStart) + newHeader + content.substring(headerEnd);

    fs.writeFileSync(filePath, content, 'utf-8');
});
console.log("Done refactoring headers!");
