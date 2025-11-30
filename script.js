// Espera a que todo el HTML esté cargado (Solución clave para Docker)
document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // 1. SELECCIÓN DE ELEMENTOS (GLOBALES)
  // =========================================================

  // Contenedores y Elementos Principales
  const modal = document.getElementById('tangram-modal');
  const modalContent = document.querySelector('.tangram-modal-content');
  const container = document.querySelector(".container");

  // --- IMPORTANTE: Seleccionamos todas las piezas aquí para usarlas al mover con CTRL ---
  const pieces = document.querySelectorAll(".piece");
  const piecesArray = Array.from(pieces); // Copia para lógica de temas

  // Botones de Control
  const openBtn = document.getElementById('open-tangram-btn');
  const closeBtn = document.querySelector('.tangram-close');
  const resizeBtn = document.getElementById('rezise-pieces');
  const resetBtn = document.getElementById('reset-tangram-btn');

  // Botones de Funcionalidad
  const toggleGridBtn = document.getElementById('toggle-grid-btn');
  const themeBtn = document.getElementById("theme");
  const toggleModeBtn = document.getElementById('toggle-mode-btn');

  // Easter Egg
  const logoTrigger = document.getElementById('tangram-logo-trigger');

  // Variables de Estado Globales
  let pressTimer = null;
  let resizeCount = 0;
  const maxResizes = 3;
  let currentScale = 1.0;
  let zIndex = 1;
  let rotations = [];
  let initialStates = [];
  let currentTheme = 0;


  // =========================================================
  // 2. LÓGICA DEL MODAL (Abrir/Cerrar)
  // =========================================================

  const openModal = () => modal.style.display = 'block';

  const closeModal = () => {
    modal.style.display = 'none';
    // Resetear zoom al cerrar
    currentScale = 1.0;
    resizeCount = 0;
    if (container) container.style.transform = 'translate(-50%, -50%) scale(1)';
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (event) => { if (event.target == modal) closeModal(); });


  // =========================================================
  // 3. FUNCIONALIDADES DE LOS BOTONES
  // =========================================================

  // --- 📏 CUADRILLA / GRID ---
  if (toggleGridBtn && container) {
    toggleGridBtn.addEventListener('click', () => {
      container.classList.toggle('show-grid');
      const isGridVisible = container.classList.contains('show-grid');
      toggleGridBtn.textContent = isGridVisible ? 'Ocultar Guías' : 'Mostrar Guías';
    });
  }

  // --- 🌙 MODO OSCURO ---
  if (toggleModeBtn && modalContent) {
    const toggleDarkMode = () => {
      modalContent.classList.toggle('dark-mode');
      toggleModeBtn.textContent = modalContent.classList.contains('dark-mode')
        ? 'Modo Claro' : 'Modo Oscuro';
    };
    toggleModeBtn.addEventListener('click', toggleDarkMode);

    // Detección automática del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      modalContent.classList.add('dark-mode');
      toggleModeBtn.textContent = 'Modo Claro';
    }
  }

  // --- 🔧 REDIMENSIONAR (ZOOM) ---
  if (resizeBtn) {
    resizeBtn.addEventListener('click', () => {
      resizeCount++;
      if (resizeCount <= maxResizes) {
        currentScale *= 0.9; // Reducir 10%
        container.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
      } else {
        // Resetear al 4to clic
        currentScale = 1.0;
        resizeCount = 0;
        container.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    });
  }

  // --- 🥚 EASTER EGG (LOGO) ---
  if (logoTrigger) {
    const startPress = (e) => {
      e.preventDefault();
      pressTimer = setTimeout(openModal, 1000);
    };
    const cancelPress = () => clearTimeout(pressTimer);

    logoTrigger.addEventListener('mousedown', startPress);
    logoTrigger.addEventListener('mouseup', cancelPress);
    logoTrigger.addEventListener('mouseleave', cancelPress);
    logoTrigger.addEventListener('touchstart', startPress, { passive: false });
    logoTrigger.addEventListener('touchend', cancelPress);
  }


  // =========================================================
  // 4. LÓGICA DEL JUEGO (Movimiento y Piezas)
  // =========================================================

  // Guardar el estado inicial de cada pieza (para poder reiniciar)
  pieces.forEach((piece, index) => {
    const cs = window.getComputedStyle(piece);
    initialStates[index] = {
      top: cs.top,
      left: cs.left,
      transform: (cs.transform === 'none') ? '' : cs.transform,
      zIndex: cs.zIndex || 1
    };
    rotations.push({ angle: 0, flip: false });

    // Iniciar la lógica de movimiento para esta pieza
    movePiece(piece, index);
  });

  // Función de Reinicio
  function resetPieces() {
    pieces.forEach((piece, index) => {
      piece.style.top = initialStates[index].top;
      piece.style.left = initialStates[index].left;
      piece.style.transform = initialStates[index].transform || "";
      piece.style.zIndex = initialStates[index].zIndex;
      piece.classList.remove("grabbing");
      rotations[index].angle = 0;
      rotations[index].flip = false;
    });
    zIndex = 1;
    currentScale = 1.0;
    resizeCount = 0;
    container.style.transform = 'translate(-50%, -50%) scale(1)';
  }

  if (resetBtn) resetBtn.addEventListener('click', resetPieces);


  // --- LÓGICA PRINCIPAL DE MOVIMIENTO Y ROTACIÓN ---
  function movePiece(piece, index) {
    let mouseX = 0, mouseY = 0, mouseXdiff = 0, mouseYdiff = 0;
    let lastTap = 0;
    let longPressTimer = null;
    let isDragging = false;

    // Asignar evento al hacer clic en la pieza (Mouse)
    piece.onmousedown = dragPieceStart;

    // Asignar eventos Touch
    piece.addEventListener('touchstart', handleTouchStart, { passive: false });

    // --- FUNCIONES DE ACCIÓN (Reutilizables) ---
    function performRotation(direction) {
      // direction: 1 = derecha (45deg), -1 = izquierda (-45deg)
      rotations[index].angle += rotations[index].flip ? (-45 * direction) : (45 * direction);
      setRotation();
    }

    function performFlip() {
      rotations[index].flip = !rotations[index].flip;
      setRotation();
    }

    function setRotation() {
      let transform = rotations[index].flip ? "scaley(-1)" : "";
      transform += " rotate(" + rotations[index].angle + "deg)";
      piece.style.transform = transform;
    }

    // --- LÓGICA MOUSE ---
    function dragPieceStart(e) {
      e.preventDefault();
      mouseX = e.clientX;
      mouseY = e.clientY;

      document.onmousemove = dragPiece;
      document.onmouseup = dragPieceStop;
      document.onkeydown = rotatePiece;

      piece.style.zIndex = zIndex;
      piece.classList.add("grabbing");
    }

    function dragPiece(e) {
      e.preventDefault();
      mouseXdiff = e.clientX - mouseX;
      mouseYdiff = e.clientY - mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      updatePiecePosition(mouseXdiff, mouseYdiff, e.ctrlKey);
    }

    function dragPieceStop(e) {
      e.preventDefault();
      document.onmouseup = null;
      document.onmousemove = null;
      document.onkeydown = null;
      piece.classList.remove("grabbing");
      zIndex++;
    }

    // --- LÓGICA TOUCH ---
    function handleTouchStart(e) {
      e.preventDefault(); // Evitar scroll
      const touch = e.touches[0];
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      // Doble Tap -> Rotar
      if (tapLength < 300 && tapLength > 0) {
        performRotation(1); // Rotar a la derecha
        clearTimeout(longPressTimer);
        lastTap = 0; // Reset
        return;
      }
      lastTap = currentTime;

      // Long Press -> Flip (Invertir)
      isDragging = false;
      longPressTimer = setTimeout(() => {
        if (!isDragging) {
          performFlip();
          if (navigator.vibrate) navigator.vibrate(50);
        }
      }, 600);

      // Iniciar Drag
      mouseX = touch.clientX;
      mouseY = touch.clientY;
      piece.style.zIndex = zIndex;
      piece.classList.add("grabbing");

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    function handleTouchMove(e) {
      e.preventDefault();
      const touch = e.touches[0];

      // Si se mueve más de 5px, consideramos que está arrastrando y cancelamos el Long Press
      if (Math.abs(touch.clientX - mouseX) > 5 || Math.abs(touch.clientY - mouseY) > 5) {
        isDragging = true;
        clearTimeout(longPressTimer);
      }

      mouseXdiff = touch.clientX - mouseX;
      mouseYdiff = touch.clientY - mouseY;
      mouseX = touch.clientX;
      mouseY = touch.clientY;

      updatePiecePosition(mouseXdiff, mouseYdiff, false);
    }

    function handleTouchEnd(e) {
      clearTimeout(longPressTimer);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      piece.classList.remove("grabbing");
      zIndex++;
    }

    // --- ACTUALIZAR POSICIÓN (Común) ---
    function updatePiecePosition(dx, dy, isCtrlPressed) {
      if (!container) return;

      if (isCtrlPressed) {
        pieces.forEach(p => {
          let newTop = p.offsetTop + dy;
          let newLeft = p.offsetLeft + dx;
          p.style.top = (100 * newTop / container.clientHeight) + "%";
          p.style.left = (100 * newLeft / container.clientWidth) + "%";
        });
      } else {
        piece.style.top = (100 * (piece.offsetTop + dy) / container.clientHeight) + "%";
        piece.style.left = (100 * (piece.offsetLeft + dx) / container.clientWidth) + "%";
      }
    }

    // --- TECLADO (Legacy Mouse) ---
    function rotatePiece(e) {
      const key = e.key;
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(key)) {
        e.preventDefault();
      }
      switch (key) {
        case "ArrowDown":
        case "ArrowUp":
          performFlip();
          break;
        case "ArrowLeft":
          performRotation(-1);
          break;
        case "ArrowRight":
          performRotation(1);
          break;
      }
    }
  }


  // =========================================================
  // 5. GESTIÓN DE TEMAS
  // =========================================================

  const themes = [
    { name: "Clásico", colors: ["#EC4339", "#F47B16", "#7CB82F", "#2b7ac4", "#00AEB3", "#8C68CB", "#EFB920"] },
    { name: "Grayscale", colors: ["#111", "#333", "#555", "#777", "#999", "#bbb", "#ddd"] },
    { name: "Green-nature", colors: ["#0b6623", "#1a7f38", "#2e8b57", "#3cb371", "#66cdaa", "#98fb98", "#c1f0c1"] },
    { name: "TicTacSoft", colors: ["#9d161f", "#830213", "#d61e2b", "#ba0920", "#830213", "#701016", "#5a0e13"] },
    { name: "Sunset-ocean", colors: ["#FF5733", "#FFC300", "#DAF7A6", "#33FFB8", "#3374FF", "#7C33FF", "#FF33B2"] },
    { name: "Cyberpunk", colors: ["#FF00A0", "#00F7F7", "#FF6600", "#9D00FF", "#00FF6A", "#C9FF00", "#300094"] },
    { name: "Wood-craft", colors: ["#8B4513", "#A0522D", "#CD853F", "#D2B48C", "#F5DEB3", "#F5F5DC", "#FAF0E6"] }
  ];

  function applyTheme(themeIndex) {
    const selected = themes[themeIndex];
    piecesArray.forEach((piece, i) => {
      const color = selected.colors[i % selected.colors.length];

      // Soporte para gradientes y colores sólidos
      if (color.startsWith("linear-gradient")) {
        piece.style.backgroundImage = color;
        piece.style.background = "none";
      } else {
        piece.style.background = color;
        piece.style.backgroundImage = "none";
      }
    });

    // Formatear nombre del tema para mostrar en botón
    const formattedName = selected.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    if (themeBtn) themeBtn.textContent = `Tema: ${formattedName}`;
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      currentTheme = (currentTheme + 1) % themes.length;
      applyTheme(currentTheme);
    });
  }

  // Aplicar tema inicial
  applyTheme(currentTheme);

}); // <--- FIN DE DOMContentLoaded