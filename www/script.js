const board = document.getElementById("board");
const ctx = board.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const speedEl = document.getElementById("speed");
const startBtn = document.getElementById("startBtn");
const touchPad = document.querySelector(".touch-pad");

const gridSize = 20;
const tile = board.width / gridSize;

let snake;
let direction;
let nextDirection;
let food;
let score;
let level;
let loopId;
let tickDelay;
let gameRunning;

const savedHighScore = Number(localStorage.getItem("snakeHighScore") || 0);
highScoreEl.textContent = String(savedHighScore);

function randomCell() {
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize),
  };
}

function placeFood() {
  let candidate = randomCell();
  while (snake.some((part) => part.x === candidate.x && part.y === candidate.y)) {
    candidate = randomCell();
  }
  food = candidate;
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  level = 1;
  tickDelay = 160;
  gameRunning = true;
  placeFood();
  updateHUD();
  if (loopId) {
    clearTimeout(loopId);
  }
  gameTick();
}

function updateHUD() {
  scoreEl.textContent = String(score);
  speedEl.textContent = String(level);
}

function drawGrid() {
  ctx.fillStyle = "#0f2238";
  ctx.fillRect(0, 0, board.width, board.height);

  ctx.strokeStyle = "#274060";
  ctx.lineWidth = 1;
  for (let i = 1; i < gridSize; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * tile, 0);
    ctx.lineTo(i * tile, board.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * tile);
    ctx.lineTo(board.width, i * tile);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#99ffbf" : "#66ff9c";
    ctx.fillRect(part.x * tile + 1, part.y * tile + 1, tile - 2, tile - 2);
  });
}

function drawFood() {
  ctx.fillStyle = "#ff4d6d";
  ctx.beginPath();
  ctx.arc(food.x * tile + tile / 2, food.y * tile + tile / 2, tile / 2.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, board.width, board.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText("游戏结束", board.width / 2, board.height / 2 - 10);
  ctx.font = "16px Segoe UI";
  ctx.fillText("点击“开始 / 重新开始”再玩一次", board.width / 2, board.height / 2 + 24);
}

function isOutOfBounds(head) {
  return head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize;
}

function isSelfCollision(head) {
  return snake.some((part) => part.x === head.x && part.y === head.y);
}

function stepSnake() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (isOutOfBounds(head) || isSelfCollision(head)) {
    gameRunning = false;
    drawGameOver();
    const currentHigh = Number(highScoreEl.textContent);
    if (score > currentHigh) {
      localStorage.setItem("snakeHighScore", String(score));
      highScoreEl.textContent = String(score);
    }
    return;
  }

  snake.unshift(head);

  const ateFood = head.x === food.x && head.y === food.y;
  if (ateFood) {
    score += 1;
    level = 1 + Math.floor(score / 5);
    tickDelay = Math.max(70, 160 - (level - 1) * 10);
    placeFood();
  } else {
    snake.pop();
  }

  updateHUD();
}

function gameTick() {
  if (!gameRunning) {
    return;
  }

  stepSnake();
  drawGrid();
  drawFood();
  drawSnake();

  if (gameRunning) {
    loopId = setTimeout(gameTick, tickDelay);
  }
}

function setDirection(dir) {
  const map = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const wanted = map[dir];
  if (!wanted) {
    return;
  }

  if (wanted.x === -direction.x && wanted.y === -direction.y) {
    return;
  }

  nextDirection = wanted;
}

document.addEventListener("keydown", (event) => {
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
  };

  const normalized = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const dir = keyMap[normalized];

  if (dir) {
    event.preventDefault();
    setDirection(dir);
  }
});

touchPad.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-dir]");
  if (!btn) {
    return;
  }
  setDirection(btn.dataset.dir);
});

startBtn.addEventListener("click", resetGame);

drawGrid();
drawGameOver();
