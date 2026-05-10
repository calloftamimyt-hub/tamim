const fs = require('fs');
const path = require('path');

const toolsPath = path.join(__dirname, 'src/pages/Tools.tsx');
let content = fs.readFileSync(toolsPath, 'utf8');

// Replace all occurrences of setActiveToolId(null) within Tool components with handleCloseTool()
const replaceRegex = /onBack=\{[^{}]*setActiveToolId\(null\)[^}]*\}/g;
content = content.replace(replaceRegex, 'onBack={handleCloseTool}');

fs.writeFileSync(toolsPath, content, 'utf8');
console.log('Fixed close tool handlers');
