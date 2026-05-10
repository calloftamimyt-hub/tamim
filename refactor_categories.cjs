const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages/features');

const replaceDuaType = (file, varName, titleKey, label, searchPlaceholder, emptyText) => {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // extract the array
  const regex = new RegExp(`const ${varName} = (\\[.*?\\]);`, 's');
  const match = content.match(regex);
  if (!match) return;
  
  const arrayCode = match[1];
  
  const newContent = `import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DuaView, Dua } from './Dua';

const ${varName} = ${arrayCode};

export function ${file.replace('.tsx', 'View')}() {
  const { t } = useLanguage();

  const items: Dua[] = ${varName}.map(item => ({
    id: item.id + 2000,
    title: item.name,
    arabic: item.arabic,
    translation: \`উচ্চারণ: \${item.pronunciation}\\n\\nঅর্থ: \${item.meaning}\`,
  }));

  return (
    <DuaView 
      onBack={() => window.history.back()} 
      initialDuas={items} 
      title={t('${titleKey}') || '${label}'}
      itemLabel="${label}"
      searchPlaceholder="${searchPlaceholder}"
      emptyText="${emptyText}"
    />
  );
}
`;
  fs.writeFileSync(filePath, newContent);
};

const replaceQuoteType = (file, varName, titleKey, label, searchPlaceholder, emptyText) => {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // extract the array
  const regex = new RegExp(`const ${varName} = (\\[.*?\\]);`, 's');
  const match = content.match(regex);
  if (!match) return;
  
  const arrayCode = match[1];
  
  const newContent = `import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DuaView, Dua } from './Dua';

const ${varName} = ${arrayCode};

export function ${file.replace('.tsx', 'View')}() {
  const { t } = useLanguage();

  const items: Dua[] = ${varName}.map(item => ({
    id: item.id + 3000,
    title: item.author,
    sections: [
      { type: 'text', content: \`"\${item.quote}"\` },
      { type: 'subheading', title: \`রেফারেন্স: \${item.reference}\` }
    ]
  }));

  return (
    <DuaView 
      onBack={() => window.history.back()} 
      initialDuas={items} 
      title={t('${titleKey}') || '${label}'}
      itemLabel="${label}"
      searchPlaceholder="${searchPlaceholder}"
      emptyText="${emptyText}"
    />
  );
}
`;
  fs.writeFileSync(filePath, newContent);
};

const replaceArticleType = (file, varName, titleKey, label, searchPlaceholder, emptyText) => {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // extract the array
  const regex = new RegExp(`const ${varName} = (\\[.*?\\]);`, 's');
  const match = content.match(regex);
  if (!match) return;
  
  const arrayCode = match[1];
  
  const newContent = `import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DuaView, Dua } from './Dua';

const ${varName} = ${arrayCode};

export function ${file.replace('.tsx', 'View')}() {
  const { t } = useLanguage();

  const items: Dua[] = ${varName}.map(item => ({
    id: item.id + 4000,
    title: item.title,
    sections: [
      { type: 'text', content: item.content }
    ]
  }));

  return (
    <DuaView 
      onBack={() => window.history.back()} 
      initialDuas={items} 
      title={t('${titleKey}') || '${label}'}
      itemLabel="${label}"
      searchPlaceholder="${searchPlaceholder}"
      emptyText="${emptyText}"
    />
  );
}
`;
  fs.writeFileSync(filePath, newContent);
};

replaceDuaType('Roza.tsx', 'ROZA_STEPS', 'roza', 'রোজা', 'রোজা সম্পর্কিত খুঁজুন...', 'কোনো তথ্য পাওয়া যায়নি');
replaceDuaType('Darood.tsx', 'DAROODS', 'darood', 'দরূদ', 'দরূদ খুঁজুন...', 'কোনো দরূদ পাওয়া যায়নি');
replaceDuaType('Azkar.tsx', 'AZKAR', 'azkar', 'যিকির', 'যিকির খুঁজুন...', 'কোনো যিকির পাওয়া যায়নি');
replaceQuoteType('IslamicQuotes.tsx', 'QUOTES', 'islamic-quotes', 'উক্তি', 'উক্তি বা লেখক খুঁজুন...', 'কোনো উক্তি পাওয়া যায়নি');
replaceArticleType('Seerah.tsx', 'SEERAH', 'seerah', 'সীরাত', 'নবীদের নাম খুঁজুন...', 'কোনো তথ্য পাওয়া যায়নি');
replaceArticleType('Sahaba.tsx', 'SAHABA', 'sahaba', 'সাহাবী', 'সাহাবীর নাম খুঁজুন...', 'কোনো তথ্য পাওয়া যায়নি');
replaceArticleType('HalalHaram.tsx', 'HALAL_HARAM', 'halal-haram', 'হালাল ও হারাম', 'বিষয় খুঁজুন...', 'কোনো বিষয় পাওয়া যায়নি');

console.log('Refactor complete');
