let pieces = document.querySelectorAll(".piece");
let container = document.querySelector(".container");

var rotations = [];
var zIndex = 1;

pieces.forEach(
  function(piece, index){
    let rotation = {
      angle: 0,
      flip: false
    }
    rotations.push(rotation);
    movePiece(piece, index);
  }
);

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

