// Rebuilds index.html from the live V1 homepage: runs the REAL doGet() of
// FitnessDashboard/V1/MasterDashboard (no ?app → Homepage.html) through that
// project's Node test world, then makes the result a standalone static page:
//   - the <title> and tab/home-screen icon Apps Script sets on its outer page
//     are written into <head> (here we ARE the top page, so they work);
//   - the two role links point at BASE_URL below (edit it and re-run when the
//     Apps Script deployment URL changes).
//
// Usage (from this folder):
//   node build-from-v1.js [path/to/FitnessDashboard]   (default: ../FitnessDashboard)
const fs = require('fs'), path = require('path');

const BASE_URL = 'https://script.google.com/macros/s/AKfycbx1ZGtHn1s4LOvWBkrrFaeKCAYux3DklsmtvkkZSC1zAyJESa2qA9Vr0cT6gXoRt4HP/exec'; // EDIT ME (Production /exec)

const repo = path.resolve(process.argv[2] || path.join(__dirname, '..', 'FitnessDashboard'));
const v1 = path.join(repo, 'V1', 'MasterDashboard');
const { createWorld } = require(path.join(v1, 'test', 'lib', 'world.js'));
const { makeHtmlService } = require(path.join(v1, 'test', 'harness', 'htmlservice.js'));

const W = createWorld();
W.sandbox.HtmlService = makeHtmlService(path.join(v1, 'Code'), (scope, expr) => {
  W.sandbox.__tpl = scope;
  return W.run('(function () { with (__tpl) { return (' + expr + '); } })()');
});
const out = W.run('doGet({ parameter: {} })');
const testUrl = W.run('ScriptApp.getService().getUrl()');
let html = out.getContent();

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
let head = '\n  <meta charset="UTF-8">\n  <title>' + esc(out._title) + '</title>';
if (out._favicon) head += '\n  <link rel="icon" href="' + out._favicon + '">\n  <link rel="apple-touch-icon" href="' + out._favicon + '">';
html = html.replace(/<head[^>]*>/i, m => m + head);

const links = html.split(testUrl).length - 1;
if (links !== 2) throw new Error('Expected the 2 role links in Homepage.html, found ' + links + ' — check the template.');
html = html.split(testUrl).join(BASE_URL);

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html written (' + html.length + ' bytes, title "' + out._title + '").');
