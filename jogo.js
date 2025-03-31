const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajuste do tamanho do canvas
const gameArea = document.getElementById("gameArea");
const canvasWidth = 936;
const canvasHeight = 230;

canvas.width = canvasWidth;
canvas.height = canvasHeight;
gameArea.style.width = `${canvasWidth + 2}px`;
gameArea.style.height = `${canvasHeight + 2}px`;
gameArea.style.padding = "0";
gameArea.style.border = "2px solid red";

// Configuração do jogador
const player = {
    x: 50,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 5,
    isJumping: false,
    velocityY: 0,
    gravity: 0.9,
    jumpHeight: -13,
    frameIndex: 0,  // Índice do frame atual
    frameCount: 7,  // Número total de frames (Character_1 a Character_7)
};

// Carregar os frames do personagem em um array
const playerFrames = [];
for (let i = 1; i <= player.frameCount; i++) {
    const img = new Image();
    img.src = `Character_${i}.png`; // Ajuste o caminho conforme necessário
    playerFrames.push(img);
}

// Obstáculos
const obstacles = [];
const initialObstacleSpeed = 6;
let obstacleSpeed = initialObstacleSpeed;
const initialSpawnInterval = 1500;
let spawnInterval = initialSpawnInterval;
let score = 0;
let gameOver = false;
let spawnTime = 0;

const fireImage = new Image();
fireImage.src = "fire.png";

const bookImage = new Image();
bookImage.src = "books.png";

let backgroundClass = Math.random() < 0.05 ? 'forest' : 'city';

// Função de pulo
function jump() {
    if (!player.isJumping) {
        player.isJumping = true;
        player.velocityY = player.jumpHeight;
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "ArrowUp") {
        jump();
    }
});

canvas.addEventListener("touchstart", () => {
    jump();
});

// Gerar obstáculos
function spawnObstacle() {
    const isFire = Math.random() < 0.35;
    const isBook = !isFire;
    const fireSizeFactor = [1, 1.5];

    if (isBook) {
        const bookObstacle = {
            x: canvas.width,
            y: Math.random() * (canvas.height - 200) + 100,
            width: bookImage.width * 0.6,
            height: bookImage.height * 0.6,
            image: bookImage
        };
        obstacles.push(bookObstacle);
    }

    if (isFire) {
        const fireHeight = fireSizeFactor[Math.floor(Math.random() * fireSizeFactor.length)];
        const fireObstacle = {
            x: canvas.width,
            y: canvas.height - 70,
            width: fireImage.width * fireHeight,
            height: fireImage.height * fireHeight,
            image: fireImage
        };
        obstacles.push(fireObstacle);
    }
}

// Controla o intervalo de geração sem pausar o jogo
function manageSpawning() {
    if (!gameOver) {
        spawnObstacle();
        setTimeout(manageSpawning, spawnInterval);
    }
}

// Aumentar a dificuldade do jogo
function increaseDifficulty() {
    spawnTime += 0,5;
    if (spawnTime % 30 === 0) {
        spawnInterval = Math.max(800, spawnInterval - 50);
        obstacleSpeed += 0.1;
    }
}

setTimeout(manageSpawning, spawnInterval);
setInterval(increaseDifficulty, 1000);

// Atualizar animação do personagem
let lastFrameTime = 0;
function updateAnimation(timestamp) {
    if (timestamp - lastFrameTime > 30) { // ~18 FPS
        player.frameIndex = (player.frameIndex + 1) % player.frameCount;
        lastFrameTime = timestamp;
    }
}

// Atualizar jogo
function update(timestamp) {
    if (gameOver) return;

    updateAnimation(timestamp);

    score = Math.floor(score);
    score += 1 / 60;

    document.getElementById('score').innerText = `Pontos: ${Math.floor(score)}`;

    if (score > localStorage.getItem('highscore')) {
        localStorage.setItem('highscore', Math.floor(score));
    }
    document.getElementById('record').innerText = `Recorde: ${localStorage.getItem('highscore')}`;

    player.y += player.velocityY;
    player.velocityY += player.gravity;

    if (player.y >= canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.isJumping = false;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed;

        if (obstacles[i].image === bookImage) {
            if (
                player.x < obstacles[i].x + obstacles[i].width &&
                player.x + player.width > obstacles[i].x &&
                player.y < obstacles[i].y + obstacles[i].height &&
                player.y + player.height > obstacles[i].y
            ) {
                obstacles.splice(i, 1);
                score += 1;
            }
        }

        if (obstacles[i].image === fireImage) {
            if (
                player.x < obstacles[i].x + obstacles[i].width &&
                player.x + player.width > obstacles[i].x &&
                player.y < obstacles[i].y + obstacles[i].height &&
                player.y + player.height > obstacles[i].y
            ) {
                endGame();
            }
        }

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

// Exibe a tela de fim de jogo
function endGame() {
    gameOver = true;
    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").innerText = `Livros coletados: ${Math.floor(score)}`;
}

// Desenhar fundo
function drawBackground() {
    if (backgroundClass === 'city') {
        const cityImage = new Image();
        cityImage.src = 'city_background.png';
        ctx.drawImage(cityImage, 0, 0, canvas.width, canvas.height);
    } else {
        const forestImage = new Image();
        forestImage.src = 'forest_background.png';
        ctx.drawImage(forestImage, 0, 0, canvas.width, canvas.height);
    }
}

// Renderizar jogo
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    ctx.drawImage(playerFrames[player.frameIndex], player.x, player.y, player.width, player.height);

    for (let i = 0; i < obstacles.length; i++) {
        ctx.drawImage(obstacles[i].image, obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
    }
}

// Loop principal do jogo
function gameLoop(timestamp) {
    update(timestamp);
    draw();
    if (!gameOver) requestAnimationFrame(gameLoop);
}

gameLoop();
