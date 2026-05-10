import fs from 'fs';
const file = 'android/app/src/main/res/values/strings.xml';
console.log(fs.readFileSync(file, 'utf8'));
