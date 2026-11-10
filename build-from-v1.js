// Rebuilds index.html from the live V1 homepage: runs the REAL doGet() of
// FitnessDashboard/V1/MasterDashboard (no ?app → Homepage.html) through that
// project's Node test world, then makes the result a standalone static page:
//   - the <title> Apps Script sets on its outer page, and the icon set (favicon,
//     bookmark, iPhone + Android home screen: icons/ + manifest.webmanifest),
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

// Icons: real files (icons/, made by make-icons.py from the same brand drawing) — iOS ignores a data: URL home-screen
// icon and Android reads its icons from the manifest. icons/apple-touch-icon.png is ALSO the V1 app's own tab icon:
// doGet's setFaviconUrl(BRAND_ICON_URL) points here. So it must be byte-identical to V1's "touch", and V1 must point here.
const PAGES_URL = 'https://sahilchopra03.github.io/FitnessDashboard-redirect/';
const icons = path.join(__dirname, 'icons');
const touch = String(W.run('brandAsset_("touch")')).replace(/^data:image\/png;base64,/, '');
if (fs.readFileSync(path.join(icons, 'apple-touch-icon.png')).toString('base64') !== touch)
  throw new Error('icons/ no longer match the V1 brand icon ("touch") — run `python3 make-icons.py` first.');
if (out._favicon !== PAGES_URL + 'icons/apple-touch-icon.png')
  throw new Error('V1 BRAND_ICON_URL is ' + out._favicon + ' — expected this page\'s icons/apple-touch-icon.png.');
const css = fs.readFileSync(path.join(v1, 'Code', 'SharedStyles.html'), 'utf8');
const hex = token => '#' + css.match(new RegExp('\\n\\s*' + token + '-rgb:\\s*([\\d,\\s]+);'))[1].split(',').map(v => (+v).toString(16).padStart(2, '0')).join('');
const dark = hex('--ss-green-deep');
// Cache-buster from the icons' own bytes: a browser keeps an old favicon for a long time, so a new drawing gets a new URL.
const h = require('crypto').createHash('sha256');
fs.readdirSync(icons).sort().forEach(f => h.update(fs.readFileSync(path.join(icons, f))));
const v = h.digest('hex').slice(0, 10);
fs.writeFileSync(path.join(__dirname, 'manifest.webmanifest'), JSON.stringify({
  name: out._title, short_name: out._title, start_url: './', scope: './', display: 'browser',
  background_color: dark, theme_color: dark,
  icons: [
    { src: 'icons/icon-192.png?v=' + v, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png?v=' + v, sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-maskable-512.png?v=' + v, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2) + '\n');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const head = '\n  <meta charset="UTF-8">\n  <title>' + esc(out._title) + '</title>' +
  '\n  <link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png?v=' + v + '">' +
  '\n  <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png?v=' + v + '">' +
  '\n  <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png?v=' + v + '">' +
  '\n  <link rel="manifest" href="manifest.webmanifest?v=' + v + '">' +
  '\n  <meta name="apple-mobile-web-app-title" content="' + esc(out._title) + '">' +
  '\n  <meta name="application-name" content="' + esc(out._title) + '">' +
  '\n  <meta name="theme-color" content="' + dark + '">';
html = html.replace(/<head[^>]*>/i, m => m + head);

const links = html.split(testUrl).length - 1;
if (links !== 2) throw new Error('Expected the 2 role links in Homepage.html, found ' + links + ' — check the template.');
html = html.split(testUrl).join(BASE_URL);

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html written (' + html.length + ' bytes, title "' + out._title + '").');
