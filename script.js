/* ===========================
   Windows XP Portfolio - JS
   (corregido y organizado)
   =========================== */

'use strict';

/* ==== Estado global ==== */
let selectedWallpaper = 'principal';
let currentWallpaper = 'principal';
let minimizedWindows = new Set();
let windowStates = {}; // para restaurar pos/size al desmaximizar
let isDragging = false;
let currentWindow = null;
let offset = { x: 0, y: 0 };

/* =========================
   Reloj (barra de tareas)
   ========================= */
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const el = document.getElementById('clock');
  if (el) el.textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

/* =========================
   Gestión de ventanas
   ========================= */
function openWindow(windowId) {
  const win = document.getElementById(windowId);
  if (!win) return;

  if (minimizedWindows.has(windowId)) {
    restoreWindow(windowId);
    return;
  }

  win.style.display = 'block';
  // permitir animación CSS (si la tienes)
  requestAnimationFrame(() => win.classList.add('show'));

  bringToFront(win);
}

function closeWindow(windowId) {
  const win = document.getElementById(windowId);
  if (!win) return;

  win.classList.remove('show');
  setTimeout(() => {
    win.style.display = 'none';
    minimizedWindows.delete(windowId);
    updateTaskbar();
  }, 250);
}

function minimizeWindow(windowId) {
  const win = document.getElementById(windowId);
  if (!win) return;

  win.classList.add('minimizing');
  setTimeout(() => {
    win.style.display = 'none';
    win.classList.remove('minimizing', 'show');
    minimizedWindows.add(windowId);
    updateTaskbar();
  }, 300);
}

function restoreWindow(windowId) {
  const win = document.getElementById(windowId);
  if (!win) return;

  win.style.display = 'block';
  win.classList.add('restoring');
  requestAnimationFrame(() => {
    win.classList.remove('restoring');
    win.classList.add('show');
    minimizedWindows.delete(windowId);
    bringToFront(win);
  });
}

function maximizeWindow(windowId) {
  const win = document.getElementById(windowId);
  if (!win) return;

  const maximizeBtn = win.querySelector('.window-controls .window-control:nth-child(2)');

  if (win.classList.contains('maximized')) {
    // restaurar
    win.classList.remove('maximized');
    if (windowStates[windowId]) {
      win.style.top = windowStates[windowId].top;
      win.style.left = windowStates[windowId].left;
      win.style.width = windowStates[windowId].width;
      win.style.height = windowStates[windowId].height;
    }
    if (maximizeBtn) maximizeBtn.textContent = '□';
  } else {
    // guardar estado y maximizar
    windowStates[windowId] = {
      top: win.style.top,
      left: win.style.left,
      width: win.style.width,
      height: win.style.height
    };
    win.classList.add('maximized');
    if (maximizeBtn) maximizeBtn.textContent = '❐';
  }

  bringToFront(win);
}

function bringToFront(win) {
  document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
  win.classList.add('active');
  updateTaskbar();
}

/* =========================
   Barra de tareas
   ========================= */
function updateTaskbar() {
  const taskbarButtons = document.getElementById('taskbarButtons');
  if (!taskbarButtons) return;

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
    'preview': '🖼️ Vista Previa'
  };

  document.querySelectorAll('.window').forEach(win => {
    const id = win.id;
    const isVisible = win.style.display === 'block';
    if (isVisible || minimizedWindows.has(id)) {
      const button = document.createElement('div');
      button.className = 'taskbar-button';
      button.textContent = windowTitles[id] || id;

      if (minimizedWindows.has(id)) {
        button.classList.remove('active');
      } else if (win.classList.contains('active')) {
        button.classList.add('active');
      }

      button.onclick = () => {
        if (minimizedWindows.has(id)) {
          restoreWindow(id);
        } else {
          bringToFront(win);
        }
      };

      taskbarButtons.appendChild(button);
    }
  });
}

/* =========================
   Selector de fondos
   ========================= */
function minimizeWallpaperSelector() {
  const el = document.getElementById('wallpaperSelector');
  if (el) el.style.display = 'none';
}
function maximizeWallpaperSelector() {
  const selector = document.getElementById('wallpaperSelector');
  if (!selector) return;

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
  if (!sel) return;

  sel.style.display = 'block';
  document.querySelectorAll('.wallpaper-option').forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.bg === currentWallpaper) option.classList.add('selected');
  });
}
function closeWallpaperSelector() {
  const el = document.getElementById('wallpaperSelector');
  if (el) el.style.display = 'none';
}
function selectWallpaper(wallpaper) {
  selectedWallpaper = wallpaper;
  document.querySelectorAll('.wallpaper-option').forEach(option => option.classList.remove('selected'));
  const op = document.querySelector(`[data-bg="${wallpaper}"]`);
  if (op) op.classList.add('selected');
}
function applyWallpaper() {
  document.body.className = `bg-${selectedWallpaper}`;
  currentWallpaper = selectedWallpaper;
  try { localStorage.setItem('xp-wallpaper', selectedWallpaper); } catch {}
  closeWallpaperSelector();
}

/* =========================
   Notificaciones (toast)
   ========================= */
function showNotification(title, message, duration = 4000) {
  const notification = document.getElementById('notification');
  const titleEl = document.getElementById('notificationTitle');
  const messageEl = document.getElementById('notificationMessage');
  if (!notification || !titleEl || !messageEl) return;

  titleEl.textContent = title;
  messageEl.textContent = message;

  notification.classList.add('show');
  setTimeout(() => { notification.classList.remove('show'); }, duration);
}

/* =========================
   Formulario de contacto
   ========================= */
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

  // Simulación de envío
  setTimeout(() => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    showNotification('✅ Mensaje Enviado', `¡Gracias ${formData.name}! Tu mensaje ha sido enviado correctamente. Te contactaré pronto.`);
    clearContactForm();
  }, 1500);
}

function clearContactForm() {
  const form = document.getElementById('contactForm');
  if (form) form.reset();
}

/* =========================
   Paint
   ========================= */
let isDrawing = false;
let canvas, ctx;

function initPaint() {
  canvas = document.getElementById('paintCanvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');

  const startDrawing = (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo((e.clientX || e.touches?.[0]?.clientX) - rect.left, (e.clientY || e.touches?.[0]?.clientY) - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const color = document.getElementById('colorPicker').value;
    const size = document.getElementById('brushSize').value;

    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    isDrawing = false;
    ctx.beginPath();
  };

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  // táctil
  canvas.addEventListener('touchstart', startDrawing, { passive: true });
  canvas.addEventListener('touchmove', draw, { passive: true });
  canvas.addEventListener('touchend', stopDrawing);

  const brush = document.getElementById('brushSize');
  if (brush) {
    const disp = document.getElementById('sizeDisplay');
    brush.addEventListener('input', function () {
      if (disp) disp.textContent = this.value;
    });
  }
}

function clearCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* =========================
   Bloc de notas
   ========================= */
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
  const ta = document.getElementById('notepadText');
  if (ta) ta.value = '';
}

/* =========================
   Calculadora
   ========================= */
let calcCurrentInput = '0';
let calcOperator = null;
let calcPreviousInput = null;
let calcWaitingForOperand = false;

function updateCalcDisplay() {
  const el = document.getElementById('calcDisplay');
  if (el) el.textContent = calcCurrentInput;
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
    case '/': return secondOperand === 0 ? 0 : firstOperand / secondOperand;
    default:  return secondOperand;
  }
}

function clearCalc() {
  calcCurrentInput = '0';
  calcPreviousInput = null;
  calcOperator = null;
  calcWaitingForOperand = false;
  updateCalcDisplay();
}

/* =========================
   Explorador
   ========================= */
function loadFolder(folderName) {
  const fileList = document.getElementById('fileList');
  if (!fileList) return;

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

/* =========================
   Paquetes (comisiones)
   ========================= */
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

  const priceStr = prompt('Precio del paquete ($):');
  const price = Number(priceStr);
  if (!Number.isFinite(price) || price < 0) return;

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

/* =========================
   Galería - Filtros
   ========================= */
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

/* =========================
   Reproductor (Audio real)
   ========================= */
/* Usa el <audio id="bgAudio" src="./WorldFrutti.mp3" preload="auto" loop></audio> del HTML */
function initAudioPlayer() {
  const audio = document.getElementById('bgAudio');
  const playBtn = document.getElementById('playBtn');
  const progressBar = document.getElementById('progressBar');

  if (!audio) return;

  // Volumen inicial
  audio.volume = 0.35;

  // Autoplay SOLO tras primera interacción del usuario
  let unlocked = false;
  const tryAutoplay = () => {
    if (unlocked) return;
    unlocked = true;
    audio.play().then(() => {
      if (playBtn) playBtn.textContent = '⏸️ Pause';
    }).catch(() => {
      // Si falla autoplay, no pasa nada; queda en pausa hasta que toquen Play
    });
  };
  document.addEventListener('pointerdown', tryAutoplay, { once: true });

  // Progreso
  function updateProgressUI() {
    if (!progressBar) return;
    if (!audio.duration || isNaN(audio.duration)) {
      progressBar.style.width = '0%';
      return;
    }
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = pct + '%';
  }
  audio.addEventListener('timeupdate', updateProgressUI);
  audio.addEventListener('loadedmetadata', updateProgressUI);
  audio.addEventListener('ended', () => {
    if (playBtn) playBtn.textContent = '▶️ Play';
    updateProgressUI();
  });

  // Controles llamados desde los botones del reproductor (HTML usa onclick="...")
  window.playPause = function () {
    if (audio.paused) {
      audio.play().then(() => {
        if (playBtn) playBtn.textContent = '⏸️ Pause';
      }).catch(() => {});
    } else {
      audio.pause();
      if (playBtn) playBtn.textContent = '▶️ Play';
    }
  };

  window.stopMusic = function () {
    audio.pause();
    audio.currentTime = 0;
    if (playBtn) playBtn.textContent = '▶️ Play';
    if (progressBar) progressBar.style.width = '0%';
  };

  // Solo hay una pista; "Siguiente" reinicia
  window.nextTrack = function () {
    audio.currentTime = 0;
    audio.play().then(() => {
      if (playBtn) playBtn.textContent = '⏸️ Pause';
    }).catch(() => {});
  };
}

/* =========================
   Vista Previa (galería)
   ========================= */
function showPreview(imgSrc, title, driveUrl) {
  const ttl = document.getElementById('previewTitle');
  const img = document.getElementById('previewImg');
  const drv = document.getElementById('previewDrive');

  if (ttl) ttl.textContent = title || 'Vista Previa';
  if (img) {
    img.src = imgSrc || '';
    img.alt = title || '';
  }
  if (drv) {
    drv.href = driveUrl || '#';
    drv.style.display = driveUrl ? 'inline' : 'none';
  }

  openWindow('preview');
}

/* =========================
   Arrastrar ventanas
   ========================= */
document.addEventListener('mousedown', function (e) {
  const titleBar = e.target.closest?.('.title-bar');
  if (!titleBar) return;

  // Evitar arrastrar si clic en controles (min/max/cerrar)
  if (e.target.closest('.window-controls')) return;

  currentWindow = titleBar.parentElement;
  if (!currentWindow || currentWindow.classList.contains('maximized')) return;

  isDragging = true;
  bringToFront(currentWindow);

  const rect = currentWindow.getBoundingClientRect();
  offset.x = e.clientX - rect.left;
  offset.y = e.clientY - rect.top;
});

document.addEventListener('mousemove', function (e) {
  if (!isDragging || !currentWindow) return;
  currentWindow.style.left = (e.clientX - offset.x) + 'px';
  currentWindow.style.top = (e.clientY - offset.y) + 'px';
});

document.addEventListener('mouseup', function () {
  isDragging = false;
  currentWindow = null;
});

/* =========================
   Tecla Escape: cerrar selector
   ========================= */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeWallpaperSelector();
});

/* =========================
   Inicio (DOMContentLoaded)
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  // Fondo guardado
  try {
    const savedWallpaper = localStorage.getItem('xp-wallpaper');
    if (savedWallpaper) {
      currentWallpaper = savedWallpaper;
      selectedWallpaper = savedWallpaper;
      document.body.className = `bg-${savedWallpaper}`;
    }
  } catch {}

  // Inicializar módulos
  initPaint();
  initAudioPlayer();
  updateTaskbar();

  // Selección por defecto de galería
  showCategory('all');

  // Asegurar display inicial correcto de ventanas abiertas por defecto
  document.querySelectorAll('.window').forEach(win => {
    if (win.style.display === 'block') bringToFront(win);
  });
});

/* ==== Exponer funciones necesarias al scope global (por atributos HTML) ==== */
window.openWindow = openWindow;
window.closeWindow = closeWindow;
window.minimizeWindow = minimizeWindow;
window.restoreWindow = restoreWindow;
window.maximizeWindow = maximizeWindow;

window.minimizeWallpaperSelector = minimizeWallpaperSelector;
window.maximizeWallpaperSelector = maximizeWallpaperSelector;
window.openWallpaperSelector = openWallpaperSelector;
window.closeWallpaperSelector = closeWallpaperSelector;
window.selectWallpaper = selectWallpaper;
window.applyWallpaper = applyWallpaper;

window.showNotification = showNotification;

window.submitContactForm = submitContactForm;
window.clearContactForm = clearContactForm;

window.clearCanvas = clearCanvas;

window.saveNote = saveNote;
window.clearNote = clearNote;

window.calcNumber = calcNumber;
window.calcOperation = calcOperation;
window.calcEquals = calcEquals;
window.clearCalc = clearCalc;

window.loadFolder = loadFolder;

window.selectPackage = selectPackage;
window.addNewPackage = addNewPackage;
window.exportPackages = exportPackages;

window.showCategory = showCategory;

window.showPreview = showPreview;
