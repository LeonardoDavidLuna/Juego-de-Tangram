// Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. SELECCIÓN DE ELEMENTOS ---
  const modal = document.getElementById('tangram-modal');
  const openBtn = document.getElementById('open-tangram-btn');
  const closeBtn = document.querySelector('.tangram-close');
  const resizeBtn = document.getElementById('rezise-pieces');
  const resetBtn = document.getElementById('reset-tangram-btn');

  const container = document.querySelector(".container"); 

  // --- Easter Egg ---
  const logoTrigger = document.getElementById('tangram-logo-trigger'); 
  let pressTimer = null;

  // --- Variables de redimensionar ---
  let resizeCount = 0;
  const maxResizes = 3;
  let currentScale = 1.0;

  // --- LÓGICA DEL MODAL ---
  const openModal = () => modal.style.display = 'block';

  const closeModal = () => {
    modal.style.display = 'none';
    // Reset de escala
    currentScale = 1.0;
    resizeCount = 0;
    if (container) container.style.transform = 'translate(-50%, -50%) scale(1)';
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (event) => { if (event.target == modal) closeModal(); });

  // --- Easter Egg ---
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

  // --- 🔧 AJUSTE: Evento del botón Redimensionar ---
  if (resizeBtn) {
    resizeBtn.addEventListener('click', () => {
      resizeCount++;

      if (resizeCount <= maxResizes) {
        // Cada clic reduce un 10%
        currentScale *= 0.9;
        container.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
      } else {
        // 🔁 En la 4ª pulsación, regresa al tamaño original
        currentScale = 1.0;
        resizeCount = 0; // Reinicia el contador
        container.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    });
  }

  // --- LÓGICA DEL JUEGO Y REINICIO ---
  const pieces = document.querySelectorAll(".piece");
  let rotations = [];
  let zIndex = 1;
  let initialStates = [];

  // Guardar el estado inicial de cada pieza
  pieces.forEach((piece, index) => {
    const cs = window.getComputedStyle(piece);
    initialStates[index] = {
      top: cs.top,
      left: cs.left,
      transform: (cs.transform === 'none') ? '' : cs.transform,
      zIndex: cs.zIndex || 1
    };
    rotations.push({ angle: 0, flip: false });
    movePiece(piece, index);
  });

  // Reinicio de piezas
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

    // 🔧 Reinicia tamaño también
    currentScale = 1.0;
    resizeCount = 0;
    container.style.transform = 'translate(-50%, -50%) scale(1)';
  }

  if (resetBtn) resetBtn.addEventListener('click', resetPieces);

  // --- Movimiento y rotación ---
  function movePiece(piece, index) {
    let mouseX = 0, mouseY = 0, mouseXdiff = 0, mouseYdiff = 0;
    piece.onmousedown = dragPieceStart;

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
      if (!container) return; 
      piece.style.top = (100 * (piece.offsetTop + mouseYdiff) / container.clientHeight) + "%";
      piece.style.left = (100 * (piece.offsetLeft + mouseXdiff) / container.clientWidth) + "%";
    }

    function dragPieceStop(e) {
      e.preventDefault();
      document.onmouseup = null;
      document.onmousemove = null;
      document.onkeydown = null;
      piece.classList.remove("grabbing");
      zIndex++;
    }

    function rotatePiece(e) {
      e.preventDefault();
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp":
          rotations[index].flip = !rotations[index].flip;
          setRotation();
          break;
        case "ArrowLeft":
          rotations[index].angle += rotations[index].flip ? 45 : -45;
          setRotation();
          break;
        case "ArrowRight":
          rotations[index].angle += rotations[index].flip ? -45 : 45;
          setRotation();
          break;
      }
      function setRotation() {
        let transform = rotations[index].flip ? "scaley(-1)" : "";
        transform += " rotate(" + rotations[index].angle + "deg)";
        piece.style.transform = transform;
      }
    }
  }

}); // Fin de DOMContentLoaded

/* TEMAS PARA TANGRAM */

  // --- 🎨 CAMBIO DE TEMA ---
  const themeBtn = document.getElementById("theme");
  const piecesArray = Array.from(document.querySelectorAll(".piece"));

  // Lista de temas
  const themes = [
    {
        name: "Clásico",
        colors: ["#EC4339", "#F47B16", "#7CB82F", "#2b7ac4", "#00AEB3", "#8C68CB", "#EFB920"]
    },
    {
        name: "Grayscale",
        colors: ["#111", "#333", "#555", "#777", "#999", "#bbb", "#ddd"]
    },
    {
        name: "Green-nature",
        colors: ["#0b6623", "#1a7f38", "#2e8b57", "#3cb371", "#66cdaa", "#98fb98", "#c1f0c1"]
    },
    {
        name: "TicTacSoft",
        colors: ["#9d161f", "#830213", "#d61e2b", "#ba0920", "#830213", "#701016", "#5a0e13"]
    },
    {
        name: "Sunset-ocean",
        colors: ["#FF5733", "#FFC300", "#DAF7A6", "#33FFB8", "#3374FF", "#7C33FF", "#FF33B2"]
    },
    {
        name: "Cyberpunk",
        colors: ["#FF00A0", "#00F7F7", "#FF6600", "#9D00FF", "#00FF6A", "#C9FF00", "#300094"]
    },
    {
        name: "Wood-craft",
        colors: ["#8B4513", "#A0522D", "#CD853F", "#D2B48C", "#F5DEB3", "#F5F5DC", "#FAF0E6"]
    }
    // --------------------
];

  let currentTheme = 0;

  function applyTheme(themeIndex) {
    const selected = themes[themeIndex];
    piecesArray.forEach((piece, i) => {
      const color = selected.colors[i % selected.colors.length];
      // Si es degradado, usar backgroundImage; si no, usar background
      if (color.startsWith("linear-gradient")) {
        piece.style.backgroundImage = color;
        piece.style.background = "none";
      } else {
        piece.style.background = color;
        piece.style.backgroundImage = "none";
      }
    });
    const formattedName = selected.name
        .split('-') // Separa por guiones (ej: ['green', 'nature'])
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitaliza cada palabra
        .join(' '); // Une con espacios
        
    // Asigna el texto al botón.
    themeBtn.textContent = `Tema: ${formattedName}`;
  }

  // Al hacer clic, cambiar al siguiente tema
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      currentTheme = (currentTheme + 1) % themes.length;
      applyTheme(currentTheme);
    });
  }

  // Aplicar tema inicial (original)
  applyTheme(currentTheme);


// --- 🌙 LÓGICA DEL MODO OSCURO/CLARO ---

  // --- 1. SELECCIÓN DE ELEMENTOS ---
  // ... (tus otras variables)
  const modal = document.getElementById('tangram-modal');
  const modalContent = document.querySelector('.tangram-modal-content'); // Asegúrate de tener esta línea
  const toggleModeBtn = document.getElementById('toggle-mode-btn'); // <-- AÑADE ESTA


  if (toggleModeBtn && modalContent) {
    // Función para cambiar el modo
    const toggleDarkMode = () => {
      // Intercambia (toggle) la clase 'dark-mode' en el contenido del modal
      modalContent.classList.toggle('dark-mode');

      // Actualiza el texto del botón basado en el estado
      if (modalContent.classList.contains('dark-mode')) {
        toggleModeBtn.textContent = 'Modo Claro';
      } else {
        toggleModeBtn.textContent = 'Modo Oscuro';
      }
    };

    // Asigna la función al clic del botón
    toggleModeBtn.addEventListener('click', toggleDarkMode);
    
    // Opcional: Establecer un modo inicial basado en las preferencias del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Si el sistema prefiere el modo oscuro, lo activamos por defecto al abrir.
      modalContent.classList.add('dark-mode');
      toggleModeBtn.textContent = 'Modo Claro';
    }
  }


// GRID BACKGROUND
const toggleGridBtn = document.getElementById('toggle-grid-btn');
const container = document.querySelector(".container");

if (toggleGridBtn) {
    toggleGridBtn.addEventListener('click', () => {
        container.classList.toggle('show-grid');
        const isGridVisible = container.classList.contains('show-grid');
        toggleGridBtn.textContent = isGridVisible ? 'Ocultar Guías' : 'Mostrar Guías';
    });
}