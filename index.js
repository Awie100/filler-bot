const canvas = document.getElementById("canvas")
const log = document.getElementById("log")

//canvas properties
const gridWidth = 10n
const gridHeight = 10n
const gridSize = gridWidth * gridHeight

const width = 400
const height = width * parseInt(gridHeight) / parseInt(gridWidth)
const cellSize = width / parseInt(gridWidth)

//set up canvas
canvas.width = width
canvas.height = height
const ctx = canvas.getContext("2d")

//colors
const colors = ["#fb3d5b", "#444244", "#a4d752", "#ffe11d", "#35a9f7", "#6c4da4"]

//board data representation (BigInts)
const colorBoards = new Array(colors.length)
for (let i = 0; i < colorBoards.length; i++) {
    colorBoards[i] = 0n
}

const gameState = {
    playerColors: [0, 0],
    playerBoards: [1n << (gridWidth - 1n), 1n << (gridSize - gridWidth)], //BL UR
    colorBoards: colorBoards
}

//masks for bitwise ops
const downMask = (1n << gridWidth) - 1n
const upMask = downMask << (gridSize - gridWidth)

let verticalMask = 0n
for (let i = 0n; i < height; i++) {
    verticalMask |= 1n << (gridWidth * i)
}

const rightMask = verticalMask
const leftMask = verticalMask << (gridWidth - 1n)

//fill colors no duplicates
function fillRandom(colorBoards) {
    for (let i = 0n; i < gridSize; i++) {
        //dumb random with no repeats
        let color = 0
        const slot = 1n << i
        const colorMask = ((slot >> gridWidth) | ((slot & ~rightMask) >> 1n))
        do { color = Math.floor(Math.random() * colors.length) } while (colorMask & colorBoards[color])
        colorBoards[color] |= slot
    }
}

//init playerState
function initPlayers(gameState) {
    for (let i = 0; i < gameState.colorBoards.length; i++) {
        for (let p = 0; p < gameState.playerBoards.length; p++) {
            if (gameState.colorBoards[i] & gameState.playerBoards[p]) {
                gameState.colorBoards[i] ^= gameState.playerBoards[p]
                gameState.playerColors[p] = i
            }
        }
    }
}

//print board?
//yes ikik the board representation is horrible for this 
function printBitmap(board, color) {
    ctx.fillStyle = colors[color]
    for (let x = 0n; x < gridWidth; x++) {
        for (let y = 0n; y < gridHeight; y++) {
            const slot = 1n << (y * gridWidth + x)
            if (slot & board) ctx.fillRect(parseInt(x) * cellSize, parseInt(y) * cellSize, cellSize, cellSize)
        }
    }
}

function printBoard(gameState) {
    //colors
    for (let i = 0; i < gameState.colorBoards.length; i++) {
        printBitmap(gameState.colorBoards[i], i)
    }
    //players
    for (let i = 0; i < gameState.playerBoards.length; i++) {
        printBitmap(gameState.playerBoards[i], gameState.playerColors[i])
    }
}


//util number of bits set in a board
function numBits(board) {
    let count = 0
    while (board !== 0n) {
        board &= board - 10n
        count++
    }
    return count
}

//turn logic (0 for p1, 1 for p2)
function takeTurn(gameState, player, color) {
    const board = gameState.playerBoards[player]
    const cover = (board >> gridWidth) | (board << gridWidth) | ((board & ~rightMask) >> 1n) | ((board & ~leftMask) << 1n)
    const capture = cover & gameState.colorBoards[color]
    gameState.playerBoards[player] |= capture
    gameState.colorBoards[color] ^= capture
    gameState.playerColors[player] = color
}

//display game
fillRandom(gameState.colorBoards)
initPlayers(gameState)
printBoard(gameState)
console.log("HI")