import * as esbuild from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, statSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');

// Clean dist directory
function rmrf(p) {
  if (!existsSync(p)) return;
  if (statSync(p).isDirectory()) {
    readdirSync(p).forEach(f => rmrf(resolve(p, f)));
  } else {
    unlinkSync(p);
  }
}
if (existsSync(outDir)) rmrf(outDir);
mkdirSync(outDir, { recursive: true });

// Copy public folder
const publicDir = resolve(__dirname, 'public');
if (existsSync(publicDir)) {
  cpSync(publicDir, outDir, { recursive: true });
}

// Create assets directory
mkdirSync(resolve(outDir, 'assets'), { recursive: true });

// Process CSS with PostCSS + TailwindCSS v3
console.log('Processing CSS...');
const cssInput = readFileSync(resolve(srcDir, 'index.css'), 'utf8');
const cssResult = await postcss([
  tailwindcss,
  autoprefixer,
]).process(cssInput, {
  from: resolve(srcDir, 'index.css'),
  to: resolve(outDir, 'assets/main.css'),
});
writeFileSync(resolve(outDir, 'assets/main.css'), cssResult.css);
console.log('CSS processed.');

// Bundle JS with esbuild
console.log('Bundling JavaScript...');
const result = await esbuild.build({
  entryPoints: [resolve(srcDir, 'main.tsx')],
  bundle: true,
  outfile: resolve(outDir, 'assets/main.js'),
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  minify: false,
  sourcemap: false,
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.jsx': 'jsx',
    '.js': 'js',
    '.css': 'empty',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.png': 'file',
    '.gif': 'file',
    '.svg': 'dataurl',
    '.woff': 'file',
    '.woff2': 'file',
    '.json': 'json',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.MODE': '"production"',
    'import.meta.env.PROD': '"true"',
    'import.meta.env.DEV': '"false"',
    'import.meta.env.BASE_URL': '"/"',
  },
  alias: {
    '@': resolve(__dirname, './src'),
  },
  metafile: true,
});

console.log('JavaScript bundled.');

// Update index.html
let indexHtml = readFileSync(resolve(__dirname, 'index.html'), 'utf8');
// Remove source script tag (Vite normally removes this during build)
indexHtml = indexHtml.replace(/<script type="module" src="\/src\/main\.tsx"><\/script>/, '');
// Add CSS and JS references
indexHtml = indexHtml.replace(
  '</head>',
  '    <link rel="stylesheet" href="/assets/main.css" />\n  </head>'
);
indexHtml = indexHtml.replace(
  '</body>',
  '    <script type="module" src="/assets/main.js"></script>\n  </body>'
);
writeFileSync(resolve(outDir, 'index.html'), indexHtml);

console.log('Build complete!');
for (const [path, info] of Object.entries(result.metafile.outputs)) {
  console.log(`  ${path}: ${(info.bytes / 1024).toFixed(1)} KB`);
}
const cssSize = readFileSync(resolve(outDir, 'assets/main.css')).length;
console.log(`  assets/main.css: ${(cssSize / 1024).toFixed(1)} KB`);
