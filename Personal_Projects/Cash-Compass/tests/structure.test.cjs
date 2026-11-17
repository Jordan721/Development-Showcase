const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
test('rebuilt page has unique IDs, valid assets, all static DOM targets, and self-contained scripts', () => {
    const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);assert.equal(ids.length,new Set(ids).size);
    const sources=[];
    for(const match of html.matchAll(/<script[^>]*src="([^"]+)"/g)){
        assert(!match[1].startsWith('http'),'No network script dependency');
        const source=fs.readFileSync(path.join(root,match[1]),'utf8');new vm.Script(source);sources.push(source);
    }
    new vm.Script(sources.join('\n;\n'));
    const app=fs.readFileSync(path.join(root,'script.js'),'utf8');
    const dynamic=['importFile','importPreview','deletionSummary'];
    for(const match of app.matchAll(/\$\('([^']+)'\)/g))assert(ids.includes(match[1])||dynamic.includes(match[1]),'Missing '+match[1]);
    for(const match of html.matchAll(/<link[^>]*href="([^"?]+)"/g))assert(fs.existsSync(path.join(root,match[1])));
    const symbols=new Set([...html.matchAll(/<symbol id="i-([^"]+)"/g)].map(match=>match[1]));
    for(const match of app.matchAll(/icon\('([^']+)'\)/g))assert(symbols.has(match[1]),'Missing icon '+match[1]);
    const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
});
