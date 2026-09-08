const fs = require('fs');
const path = require('path');

const slidesDir = path.join(__dirname, 'slides');
const outputFile = path.join(__dirname, 'index.html');

function getMarkdownFiles(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file.startsWith('o.')) return;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath, baseDir));
    } else if (file.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const category = path.dirname(relativePath);
      
      results.push({
        relativePath: relativePath,
        category: category === '.' ? 'Sin categoría' : category,
        filename: file
      });
    }
  });

  return results;
}

// Función auxiliar para crear IDs válidos en HTML a partir del nombre de la categoría
function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
}

function buildIndex() {
  const items = getMarkdownFiles(slidesDir);

  const categories = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const catKeys = Object.keys(categories);

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galería de Presentaciones</title>
  <link rel="stylesheet" href="/css/custom.css?v=${Date.now()}">
</head>
<body class="gallery">

  ${catKeys.length > 0 ? `
    <!-- Barra de navegación fija con enlaces a cada sección -->
    <nav class="navbar">
      <div class="navbar-container">
        <span class="navbar-title">Categorías:</span>
        <div class="navbar-links">
          ${catKeys.map(cat => `<a href="#cat-${slugify(cat)}">${cat}</a>`).join('')}
        </div>
      </div>
    </nav>
  ` : ''}

  <div class="main-content">
    <h1>Galería de Presentaciones</h1>
    
    ${catKeys.length === 0 ? '<p class="empty">No hay presentaciones disponibles.</p>' : ''}

    ${catKeys.map(cat => {
      const catId = `cat-${slugify(cat)}`;
      return `
        <section id="${catId}" class="category-section">
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
        </section>
      `;
    }).join('')}
  </div>

</body>
</html>`;

  fs.writeFileSync(outputFile, htmlContent);
  console.log(`[WATCHER] index.html actualizado con navbar.`);
}

buildIndex();

console.log('[WATCHER] Escuchando cambios en slides/...');
fs.watch(slidesDir, { recursive: true }, (eventType, filename) => {
  if (filename && !path.basename(filename).startsWith('.')) {
    buildIndex();
  }
});