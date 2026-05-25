/**
 * Patches Expo CLI for reliable `expo start --tunnel`:
 * 1. Longer ngrok timeout (default 10s is too short on Windows).
 * 2. Optional personal NGROK_AUTH_TOKEN (avoids Expo shared token session limits).
 */
const fs = require('fs');
const path = require('path');

const EXPO_SHARED_NGROK_TOKEN = '5W1bR67GNbWcXqmxZzBG1_56GezNeaX6sSRvn8npeQ8';

const cliRoots = [
  path.join(__dirname, '..', 'node_modules', 'expo', 'node_modules', '@expo', 'cli'),
  path.join(__dirname, '..', 'node_modules', '@expo', 'cli'),
];

const patches = [
  {
    file: 'build/src/start/server/AsyncNgrok.js',
    from: 'const TUNNEL_TIMEOUT = 10 * 1000;',
    to: 'const TUNNEL_TIMEOUT = parseInt(process.env.EXPO_TUNNEL_TIMEOUT || "120000", 10);',
  },
  {
    file: 'build/src/start/server/BundlerDevServer.js',
    from: 'await this.tunnel.startAsync();',
    to: 'await this.tunnel.startAsync({ timeout: parseInt(process.env.EXPO_TUNNEL_TIMEOUT || "120000", 10) });',
  },
  {
    file: 'build/src/start/server/AsyncNgrok.js',
    from: `            const urlProps = await this._getConnectionPropsAsync();
            const url = await instance.connect({
                ...urlProps,
                authtoken: NGROK_CONFIG.authToken,
                configPath,`,
    to: `            const personalToken = process.env.NGROK_AUTH_TOKEN || process.env.NGROK_AUTHTOKEN;
            const usePersonal = Boolean(personalToken);
            const urlProps = usePersonal ? {} : await this._getConnectionPropsAsync();
            const connectOpts = {
                ...urlProps,
                authtoken: personalToken || NGROK_CONFIG.authToken,`,
  },
  {
    file: 'build/src/start/server/AsyncNgrok.js',
    from: `                port: this.port
            });
            return url;`,
    to: `                port: this.port
            };
            if (!usePersonal) connectOpts.configPath = configPath;
            const url = await instance.connect(connectOpts);
            return url;`,
  },
];

function patchFile(root, relPath, from, to) {
  const filePath = path.join(root, relPath);
  if (!fs.existsSync(filePath)) return false;
  const src = fs.readFileSync(filePath, 'utf8');
  if (src.includes(to)) return true;
  if (!src.includes(from)) return false;
  fs.writeFileSync(filePath, src.replace(from, to));
  return true;
}

let applied = 0;
for (const root of cliRoots) {
  if (!fs.existsSync(root)) continue;
  for (const { file, from, to } of patches) {
    if (patchFile(root, file, from, to)) applied += 1;
  }
}

if (applied > 0) {
  console.log(`[patch-expo-tunnel-timeout] Applied ${applied} patch(es).`);
}

const ngrokYml = path.join(
  process.env.USERPROFILE || process.env.HOME || '',
  '.expo',
  'ngrok.yml'
);
if (fs.existsSync(ngrokYml)) {
  const content = fs.readFileSync(ngrokYml, 'utf8');
  if (content.includes(EXPO_SHARED_NGROK_TOKEN)) {
    console.warn(
      '[patch-expo-tunnel-timeout] ~/.expo/ngrok.yml uses Expo\'s shared ngrok token (session limit).'
    );
    console.warn(
      '  Add your own token: https://dashboard.ngrok.com/get-started/your-authtoken'
    );
    console.warn('  Then set NGROK_AUTH_TOKEN in mobile/.env and restart tunnel.');
  }
}
