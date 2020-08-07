const EMPTY = " ", MINE = "X";
var boardDimension = 10;
var cellElements;
var board;
var endGameScreen = document.getElementById("end-game-screen");
var endGameMessage = document.getElementById("end-game-message");
var buttonElement = document.getElementById("play-again-button");
var settingsElement = document.getElementById("settings-bar");
var boardDimensionInfoText = document.getElementById("board-dimension-info");
document.getElementById("restart-button").addEventListener("click", startNewGame);
document.getElementById("toggle-menu").addEventListener("click", toggleMenu);
document.getElementById("dimension-button-increase").addEventListener("click", increaseDimensions);
document.getElementById("dimension-button-decrease").addEventListener("click", decreaseDimensions);
buttonElement.addEventListener("click", startNewGame);
setBoardDimensions(boardDimension);
startNewGame();

function increaseDimensions() {
    setBoardDimensions(++boardDimension);
}

function decreaseDimensions() {
    if (boardDimension > 1) setBoardDimensions(--boardDimension);
}

function toggleMenu() {
    if (settingsElement.style.transform == "translate(0px)") settingsElement.style.transform = "translate(-100%)"
    else settingsElement.style.transform = "translate(0px)"
}

function startNewGame() {
    endGameScreen.classList.remove("show-end-screen");
    cellElements.forEach(cell => {
        cell.classList.remove("show");
        cell.classList.remove("flag");
        cell.classList.remove("warning");
        cell.innerHTML = "";
        cell.style.color = "black";
    })
    clearBoard();
    setMines();
    setBoardNumbers();
    console.log("Stop cheating stupid.\n" + boardToString());
}

function cellRightClicked(e) {
    var cell = e.target;
    if (cell.classList.contains("show")) return;
    if (cell.classList.contains("flag")) {
        cell.classList.remove("flag");
        cell.classList.add("warning");
    } else if (cell.classList.contains("warning")) {
        cell.classList.remove("warning");
    }
    else cell.classList.add("flag");
    if (checkWin()) {
        endGame(true);
    }
}

function cellClicked(e) {
    var cell = e.target;
    //if (cell.classList.contains("warning")) cell.classList.remove("warning"); // Remove this to protect cells with warning
    if (cell.classList.contains("flag") || cell.classList.contains("warning")) return;
    var cellIndex;
    for (var i = 0; i < cellElements.length; i++) {
        if (cell == cellElements[i]) {
            cellIndex = i;
            break;
        }
    }
    var coord = indexToCoord(cellIndex);
    if (board[coord[0]][coord[1]] == MINE) {
        endGame(false);
        return;
    }
    if (cellElements[cellIndex].classList.contains("show")) {
        var flagCount = 0;
        var neighbors = getNeighborCellsCoords(cellIndex);
        neighbors.forEach(neighbor => {
            if (cellElements[coordToIndex(neighbor)].classList.contains("flag")) flagCount++;
        });
        if (flagCount == board[coord[0]][coord[1]]) {
            neighbors.forEach(neighbor => {
                if (board[neighbor[0]][neighbor[1]] == MINE && !cellElements[coordToIndex(neighbor)].classList.contains("flag")) endGame();
                else if (!cellElements[coordToIndex(neighbor)].classList.contains("flag")) showCell(coordToIndex(neighbor));
            });
        }
    }
    else showCell(cellIndex)
    if (checkWin()) {
        endGame(true);
    }
}

function checkWin() {
    for (var x = 0; x < board.length; x++) {
        for (var y = 0; y < board.length; y++) {
            if (board[x][y] != MINE && !cellElements[coordToIndex([x,y])].classList.contains("show")) return false;
            if (board[x][y] == MINE && !cellElements[coordToIndex([x,y])].classList.contains("flag")) return false;
        }
    }
    return true;
}

function endGame(playerWon) {
    if (playerWon) endGameMessage.innerHTML = "You Win!";
    else {
        for (var x = 0; x < board.length; x++) {
            for (var y = 0; y < board.length; y++) {
                var cell = cellElements[coordToIndex([x,y])];
                if (board[x][y] == MINE) {
                    cell.innerHTML = board[x][y];
                    cell.classList.add("show");
                    cell.style.color = "red";
                }
            }
        }
        endGameMessage.innerHTML = "You Lose, Loser!";
    }
    endGameScreen.classList.add("show-end-screen");
}

function showCell(cellIndex) {
    var coord = indexToCoord(cellIndex);
    cellElements[cellIndex].classList.add("show");
    cellElements[cellIndex].innerHTML = board[coord[0]][coord[1]];

    if (board[coord[0]][coord[1]] != EMPTY) return; 

    var neighbors = getNeighborCellsCoords(cellIndex);
    neighbors.forEach(neighbor => {
        if (!cellElements[coordToIndex(neighbor)].classList.contains("show") && !cellElements[coordToIndex(neighbor)].classList.contains("flag") && !cellElements[coordToIndex(neighbor)].classList.contains("warning") && board[neighbor[0]][neighbor[1]] != MINE) {
            showCell(coordToIndex(neighbor));
        }  

    });
    

}

function setBoardNumbers() {
    for (var x = 0; x < board.length; x++) {
        for (var y = 0; y < board.length; y++) {
            if (board[x][y] == MINE) continue;
            var mineCount = 0;
            var coordsToCheck = getNeighborCellsCoords(coordToIndex([x,y]));
            coordsToCheck.forEach(coord => {
                if (board[coord[0]][coord[1]] == MINE) mineCount++;
            });
            if (mineCount != 0) board[x][y] = mineCount;
        }
    }
}

function getNeighborCellsCoords(index) {
    var neighbors = new Array();
    var coord = indexToCoord(index);
    if (coord[1]-1 != -1) neighbors.push([coord[0],coord[1]-1]); // up
    if (coord[1]+1 != board.length) neighbors.push([coord[0],coord[1]+1]); // down

    if (coord[0]+1 != board.length) { // to the right
        neighbors.push([coord[0]+1,coord[1]]); // just right
        if (coord[1]-1 != -1) neighbors.push([coord[0]+1,coord[1]-1]); // and up  
        if (coord[1]+1 != board.length) neighbors.push([coord[0]+1,coord[1]+1]); // and down          
    }
    if (coord[0]-1 != -1) { // to the left
        neighbors.push([coord[0]-1,coord[1]]); // just left
        if (coord[1]-1 != -1) neighbors.push([coord[0]-1,coord[1]-1]); // and up  
        if (coord[1]+1 != board.length) neighbors.push([coord[0]-1,coord[1]+1]); // and down          
    }
    return neighbors;
}

function indexToCoord(index) {
    var xPos = index%board.length;
    return [xPos, Math.round((index-xPos)/(board.length))];
}

function coordToIndex(coord) {
    return board.length*coord[1] + coord[0];
}

function clearBoard() {
    for (var x = 0; x < board.length; x++) {
        for (var y = 0; y < board.length; y++) {
            board[x][y] = EMPTY;
        }
    }
}

function setMines() {
    var mineCount = 0;
    do {
        var randX = Math.round(Math.random() * (board.length-1));
        var randY = Math.round(Math.random() * (board.length-1));
        if (board[randX][randY] == EMPTY) {
            board[randX][randY] = MINE;
            mineCount++;
        }
    } while(mineCount < Math.round(Math.pow(board.length,2)/8));
}

function setBoardDimensions(dimension) {

    boardDimensionInfoText.innerHTML = boardDimension + "x" + boardDimension;

    var elements = document.getElementsByClassName("cell");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }

    board = new Array()
    for (var i = 0; i < dimension; i++) {
        board[i] = new Array();
    }
    
    for (var x = 0; x < dimension; x++) {
        for (var y = 0; y < dimension; y++) {
            board[x][y] = EMPTY; // dimension*y + x;
        }
    }
    var boardElement = document.getElementById("board");
    for (var i = 0; i < Math.pow(dimension,2); i++) {
        var cell = document.createElement("div");
        cell.classList.add("cell");
        boardElement.appendChild(cell);
    }
    document.documentElement.style.setProperty("--board-dimension",dimension);
    boardElement.style.gridTemplateColumns = "repeat("+dimension+",auto)";
    cellElements = document.querySelectorAll(".cell");
    cellElements.forEach(cell => {
        cell.addEventListener("click", cellClicked);
        cell.addEventListener("contextmenu", cellRightClicked);
    });

    startNewGame();
}

function boardToString() {
    var string = "";
    for (var y = 0; y < board.length; y++) {
        for (var x = 0; x < board.length; x++) {
            string += "|" + board[x][y];
        }
        string += "|\n";
    }
    return string;
}