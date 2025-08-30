
        // Variables globales
        let minimizedWindows = new Set();
        let windowStates = {};
        let isDrawing = false;
        let canvas, ctx;
        let calcCurrentInput = '0';
        let calcOperator = null;
        let calcPreviousInput = null;
        let calcWaitingForOperand = false;
        let isPlaying = false;
        let currentTrack = 0;
        let progressInterval;
        let currentBackground = 'default';
        let startMenuOpen = false;

        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            createFloatingElements();
            updateClock();
            setInterval(updateClock, 1000);
            initializePaint();
            initializeDragEvents();
            initializeStartMenu();
        });

        // Inicializar menú de inicio
        function initializeStartMenu() {
            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', function(e) {
                const startMenu = document.getElementById('startMenu');
                const startButton = document.querySelector('.start-button');
                
                if (startMenuOpen && !startMenu.contains(e.target) && !startButton.contains(e.target)) {
                    closeStartMenu();
                }
            });
        }

        // Toggle del menú de inicio
        function toggleStartMenu() {
            if (startMenuOpen) {
                closeStartMenu();
            } else {
                openStartMenu();
            }
        }

        // Abrir menú de inicio
        function openStartMenu() {
            const startMenu = document.getElementById('startMenu');
            startMenu.classList.add('show');
            startMenuOpen = true;
        }

        // Cerrar menú de inicio
        function closeStartMenu() {
            const startMenu = document.getElementById('startMenu');
            startMenu.classList.remove('show');
            startMenuOpen = false;
        }

        // Abrir ventana desde el menú de inicio
        function openWindowFromStart(windowId) {
            openWindow(windowId);
            closeStartMenu();
        }

        // Mostrar opciones de apagado
        function showPowerOptions() {
            showNotification(
                '⚡ Opciones de Energía',
                'En un sistema real, aquí aparecerían las opciones de apagar, reiniciar o suspender el equipo.'
            );
        }

        // Cambiar fondo desde la app
        function changeBackgroundFromApp(bgType) {
            const body = document.body;
            const bgOptions = document.querySelectorAll('#backgrounds .bg-option');
            
            // Remover clase activa de todas las opciones
            bgOptions.forEach(option => option.classList.remove('active'));
            
            // Activar la opción seleccionada
            event.target.classList.add('active');
            
            currentBackground = bgType;
            
            const backgroundNames = {
                'default': 'Naturaleza Cristal',
                'eco': 'Eco Burbujas',
                'abstract': 'Abstracto Azul',
                'vista': 'Vista Clásico',
                'gradient': 'Gradiente Dinámico'
            };
            
            switch(bgType) {
                case 'default':
                    body.style.background = "url('https://miro.medium.com/v2/resize:fit:1400/1*_zqJUXJaDneHRrXeXtR5vQ.webp') center/cover no-repeat";
                    body.classList.remove('gradient-mode');
                    break;
                case 'eco':
                    body.style.background = "url('https://frutiger-aero.org/img/frutiger-eco-2.webp') center/cover no-repeat";
                    body.classList.remove('gradient-mode');
                    break;
                case 'abstract':
                    body.style.background = "url('https://media.licdn.com/dms/image/v2/D4E12AQGxNln4sKkPqw/article-cover_image-shrink_720_1280/B4EZXRm0VOGgAM-/0/1729688400000?e=2147483647&v=beta&t=9bqrAjryHh18QspmCmg-_FpAl33ddSvW_xZKKZfGFtY') center/cover no-repeat";
                    body.classList.remove('gradient-mode');
                    break;
                case 'vista':
                    body.style.background = "url('https://i.ytimg.com/vi/5SMiXLjW0g8/hq720.jpg') center/cover no-repeat";
                    body.classList.remove('gradient-mode');
                    break;
                case 'gradient':
                    body.style.background = '';
                    body.classList.add('gradient-mode');
                    break;
            }
            
            showNotification('🎨 Fondo Cambiado', `Ahora usando: ${backgroundNames[bgType]}`);
        }

        // Crear elementos flotantes Frutiger Aero
        function createFloatingElements() {
            const container = document.getElementById('floatingElements');
            
            // Menos burbujas en móvil para mejor rendimiento
            const bubbleCount = window.innerWidth <= 768 ? 8 : 15;
            
            for (let i = 0; i < bubbleCount; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                
                // Tamaños más pequeños en móvil
                const maxSize = window.innerWidth <= 768 ? 40 : 60;
                const minSize = window.innerWidth <= 768 ? 15 : 20;
                const size = Math.random() * (maxSize - minSize) + minSize;
                
                bubble.style.width = size + 'px';
                bubble.style.height = size + 'px';
                bubble.style.left = Math.random() * 100 + '%';
                bubble.style.animationDelay = Math.random() * 20 + 's';
                bubble.style.animationDuration = (Math.random() * 10 + 15) + 's';
                
                container.appendChild(bubble);
            }
        }

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

        // Gestión de ventanas
        function openWindow(windowId) {
            const window = document.getElementById(windowId);
            
            if (minimizedWindows.has(windowId)) {
                restoreWindow(windowId);
                return;
            }
            
            window.style.display = 'block';
            setTimeout(() => {
                window.classList.add('show');
            }, 10);
            
            bringToFront(window);
            updateTaskbar();
        }

        function closeWindow(windowId) {
            const window = document.getElementById(windowId);
            window.classList.remove('show');
            
            setTimeout(() => {
                window.style.display = 'none';
                minimizedWindows.delete(windowId);
                updateTaskbar();
            }, 400);
        }

        function minimizeWindow(windowId) {
            const window = document.getElementById(windowId);
            window.classList.remove('show');
            
            setTimeout(() => {
                window.style.display = 'none';
                minimizedWindows.add(windowId);
                updateTaskbar();
            }, 400);
        }

        function restoreWindow(windowId) {
            const window = document.getElementById(windowId);
            window.style.display = 'block';
            
            setTimeout(() => {
                window.classList.add('show');
                minimizedWindows.delete(windowId);
                bringToFront(window);
                updateTaskbar();
            }, 10);
        }

        function maximizeWindow(windowId) {
            const window = document.getElementById(windowId);
            
            if (window.classList.contains('maximized')) {
                window.classList.remove('maximized');
                if (windowStates[windowId]) {
                    window.style.top = windowStates[windowId].top;
                    window.style.left = windowStates[windowId].left;
                    window.style.width = windowStates[windowId].width;
                    window.style.height = windowStates[windowId].height;
                }
            } else {
                windowStates[windowId] = {
                    top: window.style.top,
                    left: window.style.left,
                    width: window.style.width,
                    height: window.style.height
                };
                window.classList.add('maximized');
            }
            
            bringToFront(window);
        }

        function bringToFront(window) {
            const windows = document.querySelectorAll('.window');
            windows.forEach(w => w.classList.remove('active'));
            window.classList.add('active');
        }

        function updateTaskbar() {
            const taskbarButtons = document.getElementById('taskbarButtons');
            taskbarButtons.innerHTML = '';
            
            const windowTitles = {
                'portfolio': '🎨 Portfolio',
                'about': '👨‍🎨 Sobre Mí',
                'gallery': '🔮 Galería',
                'contact': '📧 Contacto',
                'services': '💰 Comisiones',
                'paint': '🎨 Paint',
                'notepad': '📝 Bloc de notas',
                'calculator': '🧮 Calculadora',
                'explorer': '📁 Explorador',
                'mediaplayer': '🎵 Reproductor',
                'backgrounds': '🌈 Fondos'
            };
            
            document.querySelectorAll('.window').forEach(window => {
                const windowId = window.id;
                if (window.style.display === 'block' || minimizedWindows.has(windowId)) {
                    const button = document.createElement('div');
                    button.className = 'taskbar-button';
                    button.textContent = windowTitles[windowId] || windowId;
                    button.style.display = 'block';
                    
                    if (minimizedWindows.has(windowId)) {
                        button.classList.remove('active');
                    } else if (window.classList.contains('active')) {
                        button.classList.add('active');
                    }
                    
                    button.onclick = () => {
                        if (minimizedWindows.has(windowId)) {
                            restoreWindow(windowId);
                        } else {
                            bringToFront(window);
                        }
                    };
                    
                    taskbarButtons.appendChild(button);
                }
            });
        }

        // Arrastrar ventanas
        function initializeDragEvents() {
            let isDragging = false;
            let currentWindow = null;
            let offset = { x: 0, y: 0 };

            document.querySelectorAll('.title-bar').forEach(titleBar => {
                titleBar.addEventListener('mousedown', handleStart);
                titleBar.addEventListener('touchstart', handleStart, { passive: false });
            });
            
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleEnd);

            function getEventCoords(e) {
                if (e.touches && e.touches.length > 0) {
                    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }
                return { x: e.clientX, y: e.clientY };
            }

            function handleStart(e) {
                if (window.innerWidth <= 768) return;
                
                isDragging = true;
                currentWindow = e.target.closest('.window');
                if (currentWindow) {
                    bringToFront(currentWindow);
                    
                    const coords = getEventCoords(e);
                    const rect = currentWindow.getBoundingClientRect();
                    offset.x = coords.x - rect.left;
                    offset.y = coords.y - rect.top;
                    
                    e.preventDefault();
                }
            }

            function handleMove(e) {
                if (isDragging && currentWindow && window.innerWidth > 768) {
                    const coords = getEventCoords(e);
                    currentWindow.style.left = (coords.x - offset.x) + 'px';
                    currentWindow.style.top = (coords.y - offset.y) + 'px';
                    e.preventDefault();
                }
            }

            function handleEnd() {
                isDragging = false;
                currentWindow = null;
            }
        }

        // Notificaciones
        function showNotification(title, message, duration = 4000) {
            const notification = document.getElementById('notification');
            const titleEl = document.getElementById('notificationTitle');
            const messageEl = document.getElementById('notificationMessage');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, duration);
        }

        // Formulario de contacto
        const FORM_ENDPOINT = 'https://formspree.io/f/xrbapazl';

        async function submitContactForm(event) {
            event.preventDefault();
            const submitBtn = event.target.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : 'Enviar';
            if (submitBtn) { submitBtn.textContent = '🔮 Enviando...'; submitBtn.disabled = true; }

            const fd = new FormData();
            fd.append('name', document.getElementById('contactName').value);
            fd.append('email', document.getElementById('contactEmail').value);
            fd.append('service', document.getElementById('contactService').value);
            fd.append('budget', document.getElementById('contactBudget').value);
            fd.append('message', document.getElementById('contactMessage').value);
            fd.append('_replyto', document.getElementById('contactEmail').value);

            try {
                const res = await fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    body: fd,
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    showNotification('✅ Consulta Enviada', `¡Gracias ${fd.get('name')}! Revisa tu correo — responderé a ${fd.get('email')}.`);
                    clearContactForm();
                } else {
                    const data = await res.json().catch(() => null);
                    showNotification('Error al enviar', (data && data.error) ? data.error : 'Error en el envío.');
                }
            } catch (err) {
                showNotification('Error de red', 'No se pudo enviar. Revisa tu conexión.');
            } finally {
                if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
            }
        }

        function clearContactForm() {
            const form = document.getElementById('contactForm');
            if (form) form.reset();
        }

        // Seleccionar paquete
        function selectPackage(packageType) {
            const packageInfo = {
                'carta-individual': 'Has seleccionado una Carta Individual ($800). ¡Perfecto para comenzar tu colección personalizada!',
                'set-3-cartas': 'Has seleccionado el Set de 3 Cartas ($2,100). ¡La opción más popular para temas relacionados!',
                'arcano-mayor': 'Has seleccionado Arcano Mayor Completo ($15,000). ¡Un proyecto ambicioso y hermoso!',
                'baraja-completa': 'Has seleccionado Baraja Completa ($35,000). ¡El proyecto más completo y único!',
                'arte-conceptual': 'Has seleccionado Arte Conceptual ($1,200). ¡Perfecto para explorar simbolismo único!',
                'personalizada': 'Has seleccionado Comisión Personalizada. Te contactaremos para discutir tu visión única y cotizar el proyecto.'
            };

            const message = packageInfo[packageType] || 'Comisión seleccionada correctamente.';
            showNotification('🔮 Comisión Seleccionada', message);
        }

        // Galería - Filtros por categoría
       function showCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btn-${category}`);
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.art-piece').forEach(piece => {
        if (category === 'all' || piece.dataset.category === category) {
            piece.style.display = 'block';
        } else {
            piece.style.display = 'none';
        }
    });
}
// Mostrar todas al cargar
document.addEventListener('DOMContentLoaded', function() {
    showCategory('all');
});

        // Paint
        function initializePaint() {
            canvas = document.getElementById('paintCanvas');
            if (canvas) {
                ctx = canvas.getContext('2d');
                
                canvas.addEventListener('mousedown', startDrawing);
                canvas.addEventListener('mousemove', draw);
                canvas.addEventListener('mouseup', stopDrawing);
                canvas.addEventListener('mouseout', stopDrawing);
                canvas.addEventListener('touchstart', startDrawing, { passive: false });
                canvas.addEventListener('touchmove', draw, { passive: false });
                canvas.addEventListener('touchend', stopDrawing);

                document.getElementById('brushSize').addEventListener('input', function() {
                    document.getElementById('sizeDisplay').textContent = this.value;
                });
            }
        }

        function getCanvasCoords(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            let clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        function startDrawing(e) {
            e.preventDefault();
            isDrawing = true;
            const coords = getCanvasCoords(e);
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        }

        function draw(e) {
            if (!isDrawing) return;
            e.preventDefault();
            
            const coords = getCanvasCoords(e);
            const color = document.getElementById('colorPicker').value;
            const size = document.getElementById('brushSize').value;
            
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.strokeStyle = color;
            
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        }

        function stopDrawing(e) {
            if (e) e.preventDefault();
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
                esculturas: `
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🗿</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Escultura_01.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🏺</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Ceramica_02.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🎭</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Figura_03.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🗿</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Busto_05.jpg</div>
                    </div>
                `,
                bisuteria: `
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">💎</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Collar_01.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">✨</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Pulsera_02.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">💍</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Anillo_03.jpg</div>
                    </div>
                `,
                collage: `
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">📄</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Collage_01.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🎨</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Mixto_02.jpg</div>
                    </div>
                `,
                tarot: `
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🔮</div>
                        <div style="font-size: 11px; word-wrap: break-word;">La_Justicia.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">👑</div>
                        <div style="font-size: 11px; word-wrap: break-word;">La_Emperatriz.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🌍</div>
                        <div style="font-size: 11px; word-wrap: break-word;">El_Mundo.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">⭐</div>
                        <div style="font-size: 11px; word-wrap: break-word;">La_Estrella.jpg</div>
                    </div>
                `,
                emotes: `
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">😊</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Emote_Feliz.png</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🤔</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Emote_Pensativo.png</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">😍</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Emote_Amor.png</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">😎</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Emote_Cool.png</div>
                    </div>
                `,
                digital: `
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🎨</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Digital_01.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🖌️</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Digital_02.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🎭</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Digital_03.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🌸</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Digital_04.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🦋</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Digital_05.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🌺</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Digital_06.jpg</div>
                    </div>
                `,
                tradicional: `
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">✏️</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Tradicional_01.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">📝</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Boceto_02.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🖊️</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Lapiz_03.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🎨</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Carboncillo_04.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">📋</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Estudio_05.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">✏️</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Retrato_06.jpg</div>
                    </div>
                `,
                conceptual: `
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">✨</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Concepto1.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🌙</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Luna_Mistica.jpg</div>
                    </div>
                `,
                esculturas: `
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🗿</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Escultura_01.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🏺</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Ceramica_02.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🎭</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Figura_03.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🏛️</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Relieve_04.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🗿</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Busto_05.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🏺</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Vasija_06.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🎨</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Abstracta_07.jpg</div>
                    </div>
                `,
                simbolico: `
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🔯</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Geometria.jpg</div>
                    </div>
                    <div style="text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                        <div style="font-size: 40px; margin-bottom: 5px;">🌿</div>
                        <div style="font-size: 11px; word-wrap: break-word;">Naturaleza.jpg</div>
                    </div>
                `
            };
            
            fileList.innerHTML = folders[folderName] || folders.esculturas;
        }

        // Reproductor de música
        // Playlist: añade URLs (remotas o locales). Si usas archivos locales, colócalos en la carpeta "music/" y pon "music/mi-pista.mp3"
        const PLAYLIST = [
            'music/WorldFrutti.mp3'
        ];

        let audio = null;

        function initPlayer() {
            audio = document.getElementById('audioPlayer');
            const progressBar = document.getElementById('progressBar');

            if (!audio) return;

            audio.addEventListener('timeupdate', () => {
                if (!audio.duration) return;
                const pct = (audio.currentTime / audio.duration) * 100;
                if (progressBar) progressBar.style.width = pct + '%';
            });

            audio.addEventListener('ended', () => nextTrack());

            // carga la primera pista (si existe)
            loadTrack(currentTrack);
        }

        function setTrackTitle(text) {
            const titleEl = document.getElementById('trackTitle');
            if (titleEl) titleEl.textContent = text;
        }

        function loadTrack(index) {
            if (!audio) return;
            if (PLAYLIST.length === 0) {
                audio.src = '';
                setTrackTitle('Sin pista seleccionada');
                return;
            }
            currentTrack = (index + PLAYLIST.length) % PLAYLIST.length;
            audio.src = PLAYLIST[currentTrack];
            setTrackTitle(PLAYLIST[currentTrack].split('/').pop());
            audio.load();
        }

        function updatePlayBtn(text) {
            const playBtn = document.getElementById('playBtn');
            if (playBtn) playBtn.textContent = text;
        }

        function playPause() {
            if (!audio) return;
            if (!audio.src) loadTrack(0);
            if (audio.paused) {
                audio.play();
                isPlaying = true;
                updatePlayBtn('⏸️ Pausa');
            } else {
                audio.pause();
                isPlaying = false;
                updatePlayBtn('▶️ Play');
            }
        }

        function stopMusic() {
            if (!audio) return;
            audio.pause();
            audio.currentTime = 0;
            isPlaying = false;
            updatePlayBtn('▶️ Play');
            const progressBar = document.getElementById('progressBar');
            if (progressBar) progressBar.style.width = '0%';
        }

        function nextTrack() {
            if (!audio || PLAYLIST.length === 0) return;
            loadTrack(currentTrack + 1);
            if (isPlaying) {
                audio.play();
                updatePlayBtn('⏸️ Pausa');
            }
        }

        // Inicializa el player cuando DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            try { initPlayer(); } catch (e) { console.warn('Player init error', e); }
        });
    