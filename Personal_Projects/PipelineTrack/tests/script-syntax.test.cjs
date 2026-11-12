const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('all local page scripts exist and parse in page order', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="(javascript\/[^\"]+)"/g)];
  const sources = scripts.map(([, file]) => {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    new vm.Script(source, { filename: file });
    return source;
  });
  // Catch duplicate top-level declarations across classic scripts as well.
  new vm.Script(sources.join('\n;\n'), { filename: 'page-scripts.js' });
});
