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
  <title>Presentaciones</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #191919; color: #fff; padding: 2rem; }
    h1 { text-align: center; color: #42aff0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; max-width: 1000px; margin: 0 auto; }
    .card { background: #2b2b2b; padding: 1.5rem; border-radius: 8px; text-decoration: none; color: #fff; border: 1px solid #3d3d3d; }
    .card:hover { border-color: #42aff0; }
  </style>
</head>
<body>
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
