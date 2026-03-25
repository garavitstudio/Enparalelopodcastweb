const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const stamp = Date.now();

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\.css(\?v=\d+)?"/g, `.css?v=${stamp}"`);
  content = content.replace(/\.js(\?v=\d+)?"/g, `.js?v=${stamp}"`);
  fs.writeFileSync(filePath, content, 'utf8');
}
