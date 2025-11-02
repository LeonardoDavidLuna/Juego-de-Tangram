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