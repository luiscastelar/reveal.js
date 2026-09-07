const fs = require('fs');
const path = require('path');

const slidesDir = path.join(__dirname, 'slides');
const outputFile = path.join(__dirname, 'index.html');

// Función para explorar subcarpetas de forma recursiva
function getMarkdownFiles(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach(file => {
    // Ignorar archivos y carpetas ocultos (que empiezan por .)
    if (file.startsWith('.')) return;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      // Si es una carpeta, buscar dentro
      results = results.concat(getMarkdownFiles(fullPath, baseDir));
    } else if (file.endsWith('.md')) {
      // Guardar la ruta relativa a la carpeta slides/
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const category = path.dirname(relativePath);
      
      results.push({
        relativePath: relativePath, // ej: "docker/charla-a.md" o "general.md"
        category: category === '.' ? 'Sin categoría' : category, // Nombre de la subcarpeta
        filename: file
      });
    }
  });

  return results;
}

function buildIndex() {
  const items = getMarkdownFiles(slidesDir);

  // Agrupar los archivos por categoría (nombre de la carpeta)
  const categories = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galería de Presentaciones</title>
  <link rel="stylesheet" href="/css/custom.css?v=${Date.now()}">
</head>
<body class="gallery">
  <h1>Galería de Presentaciones</h1>
  
  ${Object.keys(categories).length === 0 ? '<p class="empty">No hay presentaciones disponibles.</p>' : ''}

  ${Object.keys(categories).map(cat => `
    <div class="category-section">
      <h2 class="category-title">${cat}</h2>
      <div class="grid">
        ${categories[cat].map(item => {
          const name = decodeURIComponent(item.filename).replace('.md', '').replace(/[-_]/g, ' ');
          return `
            <a class="card" href="viewer.html?slide=${encodeURIComponent(item.relativePath)}">
              <h3>${name}</h3>
            </a>
          `;
        }).join('')}
      </div>
    </div>
  `).join('')}

</body>
</html>`;

  fs.writeFileSync(outputFile, htmlContent);
  console.log(`[WATCHER] index.html actualizado (${items.length} presentación(es) en ${Object.keys(categories).length} categoría(s))`);
}

// Generación inicial y escucha continua
buildIndex();

console.log('[WATCHER] Escuchando cambios en la carpeta slides/...');
fs.watch(slidesDir, { recursive: true }, (eventType, filename) => {
  if (filename && !path.basename(filename).startsWith('.')) {
    buildIndex();
  }
});