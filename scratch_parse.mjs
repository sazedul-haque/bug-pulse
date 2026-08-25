import fs from 'fs';
import Papa from 'papaparse';

const csvRaw = fs.readFileSync('raw_issues.csv', 'utf-8');
const parsed = Papa.parse(csvRaw.trim(), { header: true, skipEmptyLines: true });
fs.writeFileSync('src/data/initialData.json', JSON.stringify(parsed.data, null, 2));
console.log('Saved', parsed.data.length, 'issues to initialData.json');
