const fs = require('fs');
const path = require('path');

const slidesDir = path.join(__dirname, 'slides');
const outputFile = path.join(__dirname, 'index.html');

function buildIndex() {
  let files = [];
  if (fs.existsSync(slidesDir)) {
    files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.md'));
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galería de Presentaciones</title>
  <link rel="stylesheet" href="/css/custom.css?v=2">
</head>
<body class="gallery">
  <h1>Galería de Presentaciones</h1>
  <div class="grid">
    ${files.map(f => `<a class="card" href="viewer.html?slide=${f}"><h2>${f.replace('.md','')}</h2></a>`).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(outputFile, htmlContent);
  console.log(`[WATCHER] index.html actualizado (${files.length} archivos)`);
}

// Genera el primer build
buildIndex();

// Escucha cambios en la carpeta slides
fs.watch(slidesDir, (eventType, filename) => {
  if (filename && filename.endsWith('.md')) {
    buildIndex();
  }
});
