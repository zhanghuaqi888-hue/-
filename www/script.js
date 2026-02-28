const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const startBtn = document.getElementById("startBtn");
const bgm = document.getElementById("bgm");

let playerX = 175;
let score = 0;
let speed = 3;
let gameOver = false;
let enemies = [];
let highScore = localStorage.getItem("highScore") || 0;

highScoreDisplay.textContent = highScore;

function createEnemies(count) {
    for (let i = 0; i < count; i++) {
        const enemy = document.createElement("div");
        enemy.classList.add("enemy");
        enemy.style.left = Math.random() * 350 + "px";
        enemy.dataset.y = Math.random() * -500;
        game.appendChild(enemy);
        enemies.push(enemy);
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && playerX > 0) playerX -= 25;
    if (e.key === "ArrowRight" && playerX < 350) playerX += 25;
    player.style.left = playerX + "px";
});

game.addEventListener("touchmove", (e) => {
    const touchX = e.touches[0].clientX - game.offsetLeft;
    playerX = touchX - 25;
    if (playerX < 0) playerX = 0;
    if (playerX > 350) playerX = 350;
    player.style.left = playerX + "px";
});

function createExplosion(x, y) {
    const boom = document.createElement("div");
    boom.classList.add("explosion");
    boom.style.left = x + "px";
    boom.style.top = y + "px";
    game.appendChild(boom);
    setTimeout(() => boom.remove(), 500);
}

function gameLoop() {
    if (gameOver) return;

    enemies.forEach(enemy => {
        let y = parseFloat(enemy.dataset.y);
        y += speed;
        enemy.dataset.y = y;
        enemy.style.top = y + "px";

        if (
            y > 440 &&
            enemy.offsetLeft < playerX + 50 &&
            enemy.offsetLeft + 50 > playerX
        ) {
            gameOver = true;
            createExplosion(enemy.offsetLeft, y);

            if (score > highScore) {
                localStorage.setItem("highScore", score);
            }

            setTimeout(() => {
                alert("💥 游戏结束！得分：" + score);
                location.reload();
            }, 500);
        }

        if (y > 500) {
            enemy.dataset.y = 0;
            enemy.style.left = Math.random() * 350 + "px";
            score++;
            scoreDisplay.textContent = score;
            speed = 3 + score * 0.25;
        }
    });

    requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", () => {
    startBtn.style.display = "none";
    bgm.play();
    createEnemies(4);
    gameLoop();
});
