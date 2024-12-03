const board = document.getElementById('board');
const result = document.getElementById('result');
let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let difficulty = 'hard'; 

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function setDifficulty(level) {
  difficulty = level;
  resetGame();
}

function handleCellClick(event) {
  const cell = event.target;
  const cellIndex = cell.getAttribute('data-index');

  if (gameState[cellIndex] !== '' || !gameActive || currentPlayer === 'O') {
    return;
  }

  playAudio('clickSound'); 

  gameState[cellIndex] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add('taken');

  if (checkWin()) {
    return;
  }

  if (gameState.every(cell => cell !== '')) {
    playAudio('tieSound'); 
    result.textContent = "It's a tie!";
    gameActive = false;
    return;
  }

  currentPlayer = 'O';
  setTimeout(aiMove, 500);
}

function playAudio(audioId) {
  const audio = document.getElementById(audioId);
  if (audio) {
    audio.currentTime = 0;  
    audio.play();
  }
}

function aiMove() {
  if (!gameActive) return;

  let move;
  if (difficulty === 'easy') {
    move = findRandomMove();
  } else if (difficulty === 'medium') {
    move = Math.random() < 0.5 ? findBestMove() : findRandomMove();
  } else {
    move = findBestMove();
  }

  gameState[move] = currentPlayer;
  const cell = document.querySelector(`[data-index='${move}']`);
  cell.textContent = currentPlayer;
  cell.classList.add('taken');

  if (checkWin()) {
    playAudio('lossSound');  
    result.textContent = "AI wins!";
    gameActive = false;
    return;
  }

  if (gameState.every(cell => cell !== '')) {
    playAudio('tieSound'); 
    result.textContent = "It's a tie!";
    gameActive = false;
    return;
  }

  currentPlayer = 'X';
}

function findRandomMove() {
  const availableMoves = gameState
    .map((cell, index) => (cell === '' ? index : null))
    .filter(index => index !== null);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function findBestMove() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i] === '') {
      gameState[i] = 'O';
      let score = minimax(gameState, 0, false);
      gameState[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(state, depth, isMaximizing) {
  if (checkWinState('O')) return 10 - depth;
  if (checkWinState('X')) return depth - 10;
  if (state.every(cell => cell !== '')) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < state.length; i++) {
      if (state[i] === '') {
        state[i] = 'O';
        let score = minimax(state, depth + 1, false);
        state[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < state.length; i++) {
      if (state[i] === '') {
        state[i] = 'X';
        let score = minimax(state, depth + 1, true);
        state[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWin() {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (gameState[a] === currentPlayer && gameState[b] === currentPlayer && gameState[c] === currentPlayer) {
      if (currentPlayer === 'X') {
        playAudio('winSound'); 
        result.textContent = "Player X wins!";
      } else {
        playAudio('lossSound'); 
        result.textContent = "AI wins!";
      }
      gameActive = false;
      return true;
    }
  }
  return false;
}

function checkWinState(player) {
  return winningConditions.some(condition => {
    const [a, b, c] = condition;
    return gameState[a] === player && gameState[b] === player && gameState[c] === player;
  });
}

function resetGame() {
  gameState = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;
  result.textContent = '';
  board.innerHTML = '';
  createBoard();
}

function createBoard() {
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('data-index', i);
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
  }
}

createBoard();
