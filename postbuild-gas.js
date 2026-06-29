import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processHtml() {
  const distHtmlPath = path.join(__dirname, 'dist', 'index.html');
  if (!fs.existsSync(distHtmlPath)) {
    console.error('dist/index.html not found! Run npm run build first.');
    process.exit(1);
  }

  let html = fs.readFileSync(distHtmlPath, 'utf8');

  // Define the Google Apps Script script injection block
  const gasInjection = `
    <!-- Google Apps Script SSO Integration (Auto-Login) -->
    <script>
      window.googleAppsScriptData = {
        token: "<?= accessToken ?>",
        email: "<?= userEmail ?>"
      };
    </script>
  `;

  // Inject right after the opening <head> tag or early in the document
  if (html.includes('<head>')) {
    html = html.replace('<head>', '<head>' + gasInjection);
  } else {
    html = gasInjection + html;
  }

  // Write the output files
  const outputPathHtml = path.join(__dirname, 'appscript-index.html');
  const outputPathTxt = path.join(__dirname, 'appscript-index.txt');

  fs.writeFileSync(outputPathHtml, html, 'utf8');
  fs.writeFileSync(outputPathTxt, html, 'utf8');

  console.log('Successfully created appscript-index.html and appscript-index.txt with SSO injection!');
}

processHtml();
