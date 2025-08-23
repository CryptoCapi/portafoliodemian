let selectedWallpaper = 'principal';
let currentWallpaper = 'principal';
let minimizedWindows = new Set();

// Reloj
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  document.getElementById('clock').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

// Gestión de ventanas
let windowStates = {};

function openWindow(windowId) {
  const win = document.getElementById(windowId);

  if (minimizedWindows.has(windowId)) {
    restoreWindow(windowId);
    return;
  }

  win.style.display = 'block';
  setTimeout(() => { win.classList.add('show'); }, 10);

  bringToFront(win);
  updateTaskbar();
}

function closeWindow(windowId) {
  const win = document.getElementById(windowId);
  win.classList.remove('show');
  setTimeout(() => {
    win.style.display = 'none';
    minimizedWindows.delete(windowId);
    updateTaskbar();
  }, 300);
}

function minimizeWindow(windowId) {
  const win = document.getElementById(windowId);
  win.classList.add('minimizing');
  setTimeout(() => {
    win.style.display = 'none';
    win.classList.remove('minimizing', 'show');
    minimizedWindows.add(windowId);
    updateTaskbar();
  }, 400);
}

function restoreWindow(windowId) {
  const win = document.getElementById(windowId);
  win.style.display = 'block';
  win.classList.add('restoring');
  setTimeout(() => {
    win.classList.remove('restoring');
    win.classList.add('show');
    minimizedWindows.delete(windowId);
    bringToFront(win);
    updateTaskbar();
  }, 10);
}

function maximizeWindow(windowId) {
  const win = document.getElementById(windowId);

  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    if (windowStates[windowId]) {
      win.style.top = windowStates[windowId].top;
      win.style.left = windowStates[windowId].left;
      win.style.width = windowStates[windowId].width;
      win.style.height = windowStates[windowId].height;
    }
    const maximizeBtn = win.querySelector('.window-controls .window-control:nth-child(2)');
    maximizeBtn.textContent = '□';
  } else {
    windowStates[windowId] = {
      top: win.style.top,
      left: win.style.left,
      width: win.style.width,
      height: win.style.height
    };
    win.classList.add('maximized');
    const maximizeBtn = win.querySelector('.window-controls .window-control:nth-child(2)');
    maximizeBtn.textContent = '❐';
  }

  bringToFront(win);
}

function bringToFront(win) {
  const windows = document.querySelectorAll('.window');
  windows.forEach(w => w.classList.remove('active'));
  win.classList.add('active');
}

// Barra de tareas
function updateTaskbar() {
  const taskbarButtons = document.getElementById('taskbarButtons');
  taskbarButtons.innerHTML = '';

  const windowTitles = {
    'portfolio': '🎨 Portfolio',
    'about': '👩‍🎨 Sobre Mí',
    'gallery': '🖼️ Galería',
    'contact': '📧 Contacto',
    'paint': '🎨 Paint',
    'notepad': '📝 Bloc de notas',
    'calculator': '🧮 Calculadora',
    'explorer': '📁 Explorador',
    'mediaplayer': '🎵 Reproductor',
    'sales': '💰 Ventas',
    // 👇 añadido para que la vista previa salga en la barra
    'preview': '🖼️ Vista Previa'
  };

  document.querySelectorAll('.window').forEach(win => {
    const id = win.id;
    if (win.style.display === 'block' || minimizedWindows.has(id)) {
      const button = document.createElement('div');
      button.className = 'taskbar-button';
      button.textContent = windowTitles[id] || id;
      button.style.display = 'block';

      if (minimizedWindows.has(id)) {
        button.classList.remove('active');
      } else if (win.classList.contains('active')) {
        button.classList.add('active');
      }

      button.onclick = () => {
        if (minimizedWindows.has(id)) restoreWindow(id);
        else bringToFront(win);
      };

      taskbarButtons.appendChild(button);
    }
  });
}

// Selector de fondos
function minimizeWallpaperSelector() {
  document.getElementById('wallpaperSelector').style.display = 'none';
}
function maximizeWallpaperSelector() {
  const selector = document.getElementById('wallpaperSelector');
  if (selector.style.width === '100%') {
    selector.style.width = '';
    selector.style.height = '';
    selector.style.top = '50%';
    selector.style.left = '50%';
    selector.style.transform = 'translate(-50%, -50%)';
  } else {
    selector.style.width = '100%';
    selector.style.height = '100%';
    selector.style.top = '0';
    selector.style.left = '0';
    selector.style.transform = 'none';
  }
}
function openWallpaperSelector() {
  const sel = document.getElementById('wallpaperSelector');
  sel.style.display = 'block';
  document.querySelectorAll('.wallpaper-option').forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.bg === currentWallpaper) option.classList.add('selected');
  });
}
function closeWallpaperSelector() {
  document.getElementById('wallpaperSelector').style.display = 'none';
}
function selectWallpaper(wallpaper) {
  selectedWallpaper = wallpaper;
  document.querySelectorAll('.wallpaper-option').forEach(option => option.classList.remove('selected'));
  document.querySelector(`[data-bg="${wallpaper}"]`).classList.add('selected');
}
function applyWallpaper() {
  document.body.className = `bg-${selectedWallpaper}`;
  currentWallpaper = selectedWallpaper;
  localStorage.setItem('xp-wallpaper', selectedWallpaper);
  closeWallpaperSelector();
}

// Cargar fondo guardado
window.addEventListener('load', function () {
  const savedWallpaper = localStorage.getItem('xp-wallpaper');
  if (savedWallpaper) {
    currentWallpaper = savedWallpaper;
    selectedWallpaper = savedWallpaper;
    document.body.className = `bg-${savedWallpaper}`;
  }
});

// Arrastrar ventanas
let isDragging = false;
let currentWindow = null;
let offset = { x: 0, y: 0 };

document.addEventListener('mousedown', function (e) {
  if (e.target.classList.contains('title-bar')) {
    isDragging = true;
    currentWindow = e.target.parentElement;
    bringToFront(currentWindow);

    const rect = currentWindow.getBoundingClientRect();
    offset.x = e.clientX - rect.left;
    offset.y = e.clientY - rect.top;
  }
});

document.addEventListener('mousemove', function (e) {
  if (isDragging && currentWindow) {
    currentWindow.style.left = (e.clientX - offset.x) + 'px';
    currentWindow.style.top = (e.clientY - offset.y) + 'px';
  }
});

document.addEventListener('mouseup', function () {
  isDragging = false;
  currentWindow = null;
});

// Tecla Escape para cerrar selector
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeWallpaperSelector();
});

// Notificaciones
function showNotification(title, message, duration = 4000) {
  const notification = document.getElementById('notification');
  const titleEl = document.getElementById('notificationTitle');
  const messageEl = document.getElementById('notificationMessage');

  titleEl.textContent = title;
  messageEl.textContent = message;

  notification.classList.add('show');
  setTimeout(() => { notification.classList.remove('show'); }, duration);
}

// Formulario de contacto
function submitContactForm(event) {
  event.preventDefault();
  const formData = {
    name: document.getElementById('contactName').value,
    email: document.getElementById('contactEmail').value,
    phone: document.getElementById('contactPhone').value,
    service: document.getElementById('contactService').value,
    budget: document.getElementById('contactBudget').value,
    message: document.getElementById('contactMessage').value,
    newsletter: document.getElementById('contactNewsletter').checked
  };

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '📤 Enviando...';
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    showNotification(
      '✅ Mensaje Enviado',
      `¡Gracias ${formData.name}! Tu mensaje ha sido enviado correctamente. Te contactaré pronto.`
    );

    clearContactForm();
  }, 2000);
}

function clearContactForm() {
  document.getElementById('contactForm').reset();
}

// Paint
let isDrawing = false;
let canvas, ctx;

window.addEventListener('load', function () {
  canvas = document.getElementById('paintCanvas');
  if (canvas) {
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    document.getElementById('brushSize').addEventListener('input', function () {
      document.getElementById('sizeDisplay').textContent = this.value;
    });
  }
});

function startDrawing(e) {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const color = document.getElementById('colorPicker').value;
  const size = document.getElementById('brushSize').value;

  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;

  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function stopDrawing() {
  isDrawing = false;
  ctx.beginPath();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Bloc de notas
function saveNote() {
  const text = document.getElementById('notepadText').value;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nota.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function clearNote() {
  document.getElementById('notepadText').value = '';
}

// Calculadora
let calcCurrentInput = '0';
let calcOperator = null;
let calcPreviousInput = null;
let calcWaitingForOperand = false;

function updateCalcDisplay() {
  document.getElementById('calcDisplay').textContent = calcCurrentInput;
}

function calcNumber(num) {
  if (calcWaitingForOperand) {
    calcCurrentInput = num;
    calcWaitingForOperand = false;
  } else {
    calcCurrentInput = calcCurrentInput === '0' ? num : calcCurrentInput + num;
  }
  updateCalcDisplay();
}

function calcOperation(nextOperator) {
  const inputValue = parseFloat(calcCurrentInput);

  if (calcPreviousInput === null) {
    calcPreviousInput = inputValue;
  } else if (calcOperator) {
    const currentValue = calcPreviousInput || 0;
    const newValue = calculate(currentValue, inputValue, calcOperator);

    calcCurrentInput = String(newValue);
    calcPreviousInput = newValue;
    updateCalcDisplay();
  }

  calcWaitingForOperand = true;
  calcOperator = nextOperator;
}

function calcEquals() {
  const inputValue = parseFloat(calcCurrentInput);

  if (calcPreviousInput !== null && calcOperator) {
    const newValue = calculate(calcPreviousInput, inputValue, calcOperator);
    calcCurrentInput = String(newValue);
    calcPreviousInput = null;
    calcOperator = null;
    calcWaitingForOperand = true;
    updateCalcDisplay();
  }
}

function calculate(firstOperand, secondOperand, operator) {
  switch (operator) {
    case '+': return firstOperand + secondOperand;
    case '-': return firstOperand - secondOperand;
    case '*': return firstOperand * secondOperand;
    case '/': return firstOperand / secondOperand;
    default: return secondOperand;
  }
}

function clearCalc() {
  calcCurrentInput = '0';
  calcPreviousInput = null;
  calcOperator = null;
  calcWaitingForOperand = false;
  updateCalcDisplay();
}

// Explorador
function loadFolder(folderName) {
  const fileList = document.getElementById('fileList');

  const folders = {
    portfolio: `
      <div style="text-align: center; cursor: pointer;">
        <div style="font-size: 32px;">🖼️</div>
        <div style="font-size: 10px;">retrato.jpg</div>
      </div>
      <div style="text-align: center; cursor: pointer;">
        <div style="font-size: 32px;">🎨</div>
        <div style="font-size: 10px;">abstracto.png</div>
      </div>
      <div style="text-align: center; cursor: pointer;">
        <div style="font-size: 32px;">📄</div>
        <div style="font-size: 10px;">descripcion.txt</div>
      </div>
    `,
    proyectos: `
      <div style="text-align: center; cursor: pointer;">
        <div style="font-size: 32px;">📁</div>
        <div style="font-size: 10px;">Proyecto1</div>
      </div>
      <div style="text-align: center; cursor: pointer;">
        <div style="font-size: 32px;">📁</div>
        <div style="font-size: 10px;">Proyecto2</div>
      </div>
    `,
    imagenes: `
      <div style="text-align: center; cursor: pointer;">
        <div style="font-size: 32px;">🖼️</div>
        <div style="font-size: 10px;">foto1.jpg</div>
      </div>
      <div style="text-align: center; cursor: pointer;">
        <div style="font-size: 32px;">🖼️</div>
        <div style="font-size: 10px;">foto2.jpg</div>
      </div>
      <div style="text-align: center; cursor: pointer;">
        <div style="font-size: 32px;">🖼️</div>
        <div style="font-size: 10px;">foto3.jpg</div>
      </div>
    `
  };

  fileList.innerHTML = folders[folderName] || folders.portfolio;
}

// Paquetes
let packagesData = [
  {
    name: 'Paquete Básico',
    price: 299,
    description: 'Retrato digital simple con 1 revisión',
    deliveryTime: '5-7 días',
    includes: ['Retrato digital simple', '1 revisión incluida', 'Formato digital HD', 'Entrega en 5-7 días']
  },
  {
    name: 'Paquete Estándar',
    price: 599,
    description: 'Retrato detallado con fondo y múltiples revisiones',
    deliveryTime: '7-10 días',
    includes: ['Retrato detallado con fondo', '3 revisiones incluidas', 'Formato digital HD + impresión', 'Boceto preliminar', 'Entrega en 7-10 días']
  },
  {
    name: 'Paquete Premium',
    price: 999,
    description: 'Obra completa personalizada con revisiones ilimitadas',
    deliveryTime: '10-14 días',
    includes: ['Obra completa personalizada', 'Revisiones ilimitadas', 'Múltiples formatos', 'Proceso documentado', 'Marco incluido', 'Entrega en 10-14 días']
  },
  {
    name: 'Paquete Corporativo',
    price: 1899,
    description: 'Logo e identidad visual completa para empresas',
    deliveryTime: '14-21 días',
    includes: ['Logo + identidad visual', '5 propuestas iniciales', 'Manual de marca', 'Archivos vectoriales', 'Soporte post-entrega', 'Entrega en 14-21 días']
  },
  {
    name: 'Ilustración Digital',
    price: 449,
    description: 'Ilustración personalizada estilo cartoon/anime',
    deliveryTime: '6-8 días',
    includes: ['Ilustración personalizada', 'Estilo cartoon/anime', '2 revisiones incluidas', 'Alta resolución', 'Proceso paso a paso', 'Entrega en 6-8 días']
  },
  {
    name: 'Paquete Personalizado',
    price: 0,
    description: 'Proyecto único con consulta personalizada',
    deliveryTime: 'Variable',
    includes: ['Proyecto único', 'Consulta personalizada', 'Presupuesto a medida', 'Términos flexibles', 'Asesoría completa', 'Tiempo según proyecto']
  }
];

function selectPackage(packageType) {
  const packageInfo = {
    'básico': 'Has seleccionado el Paquete Básico ($299). ¡Perfecto para retratos simples!',
    'estándar': 'Has seleccionado el Paquete Estándar ($599). ¡La opción más popular!',
    'premium': 'Has seleccionado el Paquete Premium ($999). ¡La experiencia completa!',
    'corporativo': 'Has seleccionado el Paquete Corporativo ($1,899). ¡Ideal para empresas!',
    'ilustración': 'Has seleccionado Ilustración Digital ($449). ¡Perfecto para personajes!',
    'personalizado': 'Has seleccionado el Paquete Personalizado. Te contactaremos para cotizar tu proyecto único.'
  };

  const message = packageInfo[packageType] || 'Paquete seleccionado correctamente.';
  showNotification('🎨 Paquete Seleccionado', message);
}

function addNewPackage() {
  const name = prompt('Nombre del paquete:');
  if (!name) return;

  const price = parseFloat(prompt('Precio del paquete ($):'));
  if (!price || price < 0) return;

  const description = prompt('Descripción breve:');
  if (!description) return;

  const deliveryTime = prompt('Tiempo de entrega:', '7-10 días');
  if (!deliveryTime) return;

  const includesStr = prompt('¿Qué incluye? (separado por comas):');
  if (!includesStr) return;

  const includes = includesStr.split(',').map(item => item.trim());

  packagesData.push({ name, price, description, deliveryTime, includes });
  showNotification('✅ Paquete Agregado', '¡Nuevo paquete agregado exitosamente!');
}

function exportPackages() {
  let csvContent = 'Nombre,Precio,Descripción,Tiempo de Entrega,Incluye\n';

  packagesData.forEach(pkg => {
    const includesText = pkg.includes.join('; ');
    const priceText = pkg.price === 0 ? 'A Cotizar' : `$${pkg.price}`;
    csvContent += `"${pkg.name}","${priceText}","${pkg.description}","${pkg.deliveryTime}","${includesText}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'paquetes_arte.csv';
  a.click();
  URL.revokeObjectURL(url);

  showNotification('💾 Exportación Completa', 'Lista de paquetes exportada como CSV');
}

// Galería - Filtros
function showCategory(category) {
  const artPieces = document.querySelectorAll('.art-piece');
  const categoryButtons = document.querySelectorAll('.category-btn');

  categoryButtons.forEach(btn => {
    btn.style.background = '#ece9d8';
    btn.style.color = 'black';
    btn.style.border = '1px outset #ece9d8';
  });

  const activeBtn = document.getElementById(`btn-${category}`);
  if (activeBtn) {
    activeBtn.style.background = '#0054e3';
    activeBtn.style.color = 'white';
    activeBtn.style.border = '1px outset #0054e3';
  }

  artPieces.forEach(piece => {
    if (category === 'all' || piece.dataset.category === category) {
      piece.style.display = 'block';
    } else {
      piece.style.display = 'none';
    }
  });
}

// Reproductor
let isPlaying = false;
let currentTrack = 0;
let progressInterval;

const tracks = [
  'Música Inspiradora para Artistas',
  'Sonidos de la Creatividad',
  'Melodías para Pintar',
  'Ritmos Abstractos'
];

function playPause() {
  const playBtn = document.getElementById('playBtn');
  const progressBar = document.getElementById('progressBar');

  if (isPlaying) {
    playBtn.textContent = '▶️ Play';
    clearInterval(progressInterval);
    isPlaying = false;
  } else {
    playBtn.textContent = '⏸️ Pause';
    startProgress();
    isPlaying = true;
  }
}

function stopMusic() {
  const playBtn = document.getElementById('playBtn');
  const progressBar = document.getElementById('progressBar');

  playBtn.textContent = '▶️ Play';
  progressBar.style.width = '0%';
  clearInterval(progressInterval);
  isPlaying = false;
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % tracks.length;
  document.querySelector('#mediaplayer .window-content div:nth-child(2) div:first-child').textContent = tracks[currentTrack];

  if (isPlaying) {
    stopMusic();
    setTimeout(playPause, 100);
  }
}

function startProgress() {
  let progress = 0;
  const progressBar = document.getElementById('progressBar');

  progressInterval = setInterval(() => {
    progress += 1;
    progressBar.style.width = progress + '%';

    if (progress >= 100) {
      nextTrack();
      if (isPlaying) progress = 0;
    }
  }, 100);
}

/* ========= Vista Previa (para esculturas y más) ========= */
function showPreview(imgSrc, title, driveUrl) {
  const win = document.getElementById('preview');
  const img = document.getElementById('previewImg');
  const ttl = document.getElementById('previewTitle');
  const drv = document.getElementById('previewDrive');

  img.src = imgSrc;
  img.alt = title || '';
  ttl.textContent = title || 'Vista Previa';
  if (drv) {
    drv.href = driveUrl || '#';
    drv.style.display = driveUrl ? 'inline' : 'none';
  }

  // Mostrar e integrar con el gestor de ventanas
  win.style.display = 'block';
  if (typeof openWindow === 'function') openWindow('preview');
}

/* --- Bloque final copiado tal cual del snippet incluido ---
   Nota: parece ser un script de Cloudflare. Si usas esto localmente
   y te causa errores, puedes eliminarlo sin afectar tu sitio. */
(function(){
  function c(){
    var b=a.contentDocument||a.contentWindow.document;
    if(b){
      var d=b.createElement('script');
      d.innerHTML="window.__CF$cv$params={r:'972f93542784c033',t:'MTc1NTgzNjQwNC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName('head')[0].appendChild(d)
    }
  }
  if(document.body){
    var a=document.createElement('iframe');
    a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';
    document.body.appendChild(a);
    if('loading'!==document.readyState)c();
    else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);
    else{
      var e=document.onreadystatechange||function(){};
      document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}
    }
  }
  // === Música de fondo ===
const audio = document.getElementById('bgAudio');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');

// Volumen inicial
if (audio) audio.volume = 0.35;

// Autoplay tras la primera interacción (por política de los navegadores)
let started = false;
document.addEventListener('click', () => {
  if (started || !audio) return;
  started = true;
  audio.play().then(() => {
    if (playBtn) playBtn.textContent = '⏸️ Pause';
  }).catch(console.warn);
}, { once: true });

// Controles usados por tu reproductor de la ventana "mediaplayer"
window.playPause = function () {
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    if (playBtn) playBtn.textContent = '⏸️ Pause';
  } else {
    audio.pause();
    if (playBtn) playBtn.textContent = '▶️ Play';
  }
};

window.stopMusic = function () {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  if (playBtn) playBtn.textContent = '▶️ Play';
  updateProgressUI();
};

// Si más adelante tienes varias canciones, aquí rotas el índice.
// Por ahora, con una sola pista, "Siguiente" reinicia.
window.nextTrack = function () {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play();
  if (playBtn) playBtn.textContent = '⏸️ Pause';
};

// Barra de progreso
function updateProgressUI() {
  if (!audio || !progressBar || !audio.duration) {
    if (progressBar) progressBar.style.width = '0%';
    return;
  }
  const pct = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = pct + '%';
}

if (audio) {
  audio.addEventListener('timeupdate', updateProgressUI);
  audio.addEventListener('loadedmetadata', updateProgressUI);
  audio.addEventListener('ended', () => {
    if (playBtn) playBtn.textContent = '▶️ Play';
  });
}

})();
