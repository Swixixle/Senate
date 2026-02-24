const fs = require('fs');
const path = require('path');
const cliPath = path.join(__dirname, '../dist/cli/index.js');
const shebang = '#!/usr/bin/env node\n';

if (fs.existsSync(cliPath)) {
  const content = fs.readFileSync(cliPath, 'utf8');
  if (!content.startsWith(shebang)) {
    fs.writeFileSync(cliPath, shebang + content, 'utf8');
    console.log('Shebang added to dist/cli/index.js');
  } else {
    console.log('Shebang already present in dist/cli/index.js');
  }
}