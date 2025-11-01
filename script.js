// Espera a que todo el HTML esté cargado
  document.addEventListener('DOMContentLoaded', () => {
    
    // Selecciona los elementos del modal
    const modal = document.getElementById('tangram-modal');
    const openBtn = document.getElementById('open-tangram-btn');
    const closeBtn = document.querySelector('.tangram-close');

    // Función para abrir el modal
    const openModal = () => {
      modal.style.display = 'block';
    };

    // Función para cerrar el modal
    const closeModal = () => {
      modal.style.display = 'none';
    };

    // Asignar eventos
    if (openBtn) {
      openBtn.addEventListener('click', openModal);
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Cerrar si se hace clic fuera del contenido
    window.addEventListener('click', (event) => {
      if (event.target == modal) {
        closeModal();
      }
    });

  });

// Botón de reinicio (agrega <button id="reset-tangram-btn">Restart</button> en tu HTML)
const resetBtn = document.getElementById('reset-tangram-btn');

// Funciones para mover y rotar las piezas del tangram
let pieces = document.querySelectorAll(".piece");
let container = document.querySelector(".container");

var rotations = [];
var zIndex = 1;
// Guardar estado inicial para reiniciar después
    let initialStates = [];

    pieces.forEach(function(piece, index){
      // capturar estilos calculados iniciales
      const cs = window.getComputedStyle(piece);
      initialStates[index] = {
        top: cs.top,
        left: cs.left,
        transform: (cs.transform === 'none') ? '' : cs.transform,
        zIndex: cs.zIndex || 1
      };

      let rotation = {
        angle: 0,
        flip: false
      }
      rotations.push(rotation);
      movePiece(piece, index);
    });


 // Función para reiniciar todas las piezas
    function resetPieces(){
      pieces.forEach(function(piece, index){
        // restaurar posición y transform
        piece.style.top = initialStates[index].top;
        piece.style.left = initialStates[index].left;
        piece.style.transform = initialStates[index].transform || "";
        // resetar rotación lógica
        rotations[index].angle = 0;
        rotations[index].flip = false;
        // restaurar zIndex visible
        piece.style.zIndex = initialStates[index].zIndex;
        piece.classList.remove("grabbing");
      });
      zIndex = 1;
    }    
    if (resetBtn) {
      resetBtn.addEventListener('click', resetPieces);
    }



function movePiece(piece, index){
  var mouseX = 0;
  var mouseY = 0;
  var mouseXdiff = 0;
  var mouseYdiff = 0;
  
  piece.onmousedown = dragPieceStart;

  function dragPieceStart(e){
    e.preventDefault();
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.onmousemove = dragPiece;
    document.onmouseup = dragPieceStop;
    document.onkeydown = rotatePiece;
    piece.style.zIndex = zIndex;
    piece.classList.add("grabbing");
  }

  function dragPiece(e){
    e.preventDefault();
    mouseXdiff = e.clientX - mouseX;
    mouseYdiff = e.clientY - mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    piece.style.top = (100 * (piece.offsetTop + mouseYdiff) / container.clientHeight) + "%";
    piece.style.left = (100 * (piece.offsetLeft + mouseXdiff) / container.clientWidth) + "%";
  }
  
  function dragPieceStop(e){
    e.preventDefault();
    document.onmouseup = null;
    document.onmousemove = null;
    document.onkeydown = null;
    piece.classList.remove("grabbing");
    zIndex++;
  }
  
  function rotatePiece(e){
    e.preventDefault();
    switch(e.key){
      case "ArrowDown":
      case "ArrowUp":
        rotations[index].flip = !rotations[index].flip;
        setRotation();
        break;
      case "ArrowLeft":
        if (rotations[index].flip){
          rotations[index].angle = rotations[index].angle + 45;
        }
        else{
          rotations[index].angle = rotations[index].angle - 45;
        }
        setRotation();
        break;
      case "ArrowRight":
        if (rotations[index].flip){
          rotations[index].angle = rotations[index].angle - 45;
        }
        else{
          rotations[index].angle = rotations[index].angle + 45;
        }
        setRotation();
        break;
      default:
        break;
    }
    function setRotation(){
      var transform = "";
      if (rotations[index].flip){
        transform = transform + " scaley(-1)";
      }
      transform = transform + "rotate(" + rotations[index].angle + "deg)";
      piece.style.transform = transform;
    }
  }
}

/*
// --- Control de reducción de tamaño ---
let resizeCount = 0; // Cuántas veces se ha reducido
const maxReductions = 3; // Límite de reducciones
const resizeStep = 0.9; // 10% menos cada vez

document.getElementById('rezise-pieces').addEventListener('click', () => {
  if (resizeCount < maxReductions) {
    resizeCount++;
    const scaleFactor = Math.pow(resizeStep, resizeCount);

    // Aplicar escala a todas las piezas
    document.querySelectorAll('.piece').forEach(piece => {
  const existingTransform = piece.style.transform || '';
  const newTransform = existingTransform.replace(/scale\([^)]+\)/, '').trim();
  piece.style.transform = `${newTransform} scale(${scaleFactor})`;
});

  } else {
    // Si ya llegó al máximo, reinicia
    resizeCount = 0;
    document.querySelectorAll('.piece').forEach(piece => {
  const existingTransform = piece.style.transform || '';
  const newTransform = existingTransform.replace(/scale\([^)]+\)/, '').trim();
      piece.style.transform = `${newTransform} scale(${scaleFactor})`;
    }
  );
  }
});
*/