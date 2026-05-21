import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.join(__dirname, '../src/App.jsx');
let s = fs.readFileSync(appPath, 'utf8');

const imports = `import { buildAdminRoute } from "./utils/buildAdminRoute";
import Unauthorized from "./Pages/Unauthorized";
import Notifications from "./Pages/Notifications";
`;

if (!s.includes('buildAdminRoute')) {
  s = s.replace(
    "import { useParams } from 'react-router-dom';",
    `${imports}import { useParams } from 'react-router-dom';`
  );
}

const re =
  /element:\s*\(\s*<>\s*<section className="main">[\s\S]*?<\/section>\s*<\/>\s*\),/g;

let n = 0;
s = s.replace(re, (m) => {
  const compMatch = m.match(
    /<([A-Za-z][A-Za-z0-9_]*)\s*\/>\s*<\/div>\s*<\/div>\s*<\/section>/
  );
  if (!compMatch) return m;
  const name = compMatch[1];
  if (name === 'Header' || name === 'Sidebar') return m;
  n++;
  let opts = '';
  if (m.includes("width: isSidebarOpen === false ? \"100%\" : '82%'")) {
    opts = ', { contentWidth: \'82%\' }';
  } else if (!m.includes('py-4 px-5')) {
    opts = ', { contentClass: \'\' }';
  }
  return `element: buildAdminRoute(${name}${opts}),`;
});

fs.writeFileSync(appPath, s);
console.log('Replaced', n, 'routes');
