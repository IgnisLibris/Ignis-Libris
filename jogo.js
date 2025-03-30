const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajustar o tamanho do canvas com base nas dimensões da área de jogo
const gameArea = document.getElementById("gameArea");

// Variáveis de controle de jogo
let canvasWidth = 936;
let canvasHeight = 230;

// Função para ajustar o tamanho do canvas dependendo do dispositivo
function adjustCanvasSize() {
    if (isMobile()) {
        // Se for dispositivo móvel, pegar o tamanho dinâmico da área
        canvasWidth = window.innerWidth * 0.9; // 90% da largura da tela
        canvasHeight = window.innerHeight * 0.5; // 50% da altura da tela
    } else {
        // Para desktop, manter o tamanho fixo
        canvasWidth = 936;
        canvasHeight = 230;
    }
    // Atualizar as dimensões do canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Atualizar a área de jogo
    gameArea.style.width = `${canvasWidth + 2}px`;
    gameArea.style.height = `${canvasHeight + 2}px`;
}

// Chama a função de ajuste do canvas ao carregar a página e ao redimensionar a janela
window.addEventListener("load", adjustCanvasSize);
window.addEventListener("resize", adjustCanvasSize);

// Função para detectar dispositivos móveis
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Player
const player = {
    x: 50,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 5,
    isJumping: false,
    velocityY: 0,
    gravity: 0.6,
    jumpHeight: -12
};

// Obstáculos
const obstacles = [];
const initialObstacleSpeed = 6;
let obstacleSpeed = initialObstacleSpeed;
const initialSpawnInterval = 1500;
let spawnInterval = initialSpawnInterval;
let score = 0;
let gameOver = false;
let spawnTime = 0;

// Imagens
const playerImage = new Image();
playerImage.src = "player.png";

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
    const fireSizeFactor = [1, 1.5]; // Fogo com 100% ou 150% do tamanho

    // Gerar livros (moeda)
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

    // Gerar fogo
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

// Controlar o intervalo de geração de obstáculos
function manageSpawning() {
    if (!gameOver) {
        spawnObstacle();
        setTimeout(manageSpawning, spawnInterval);
    }
}

// Aumentar a dificuldade com o tempo
function increaseDifficulty() {
    spawnTime += 1;
    if (spawnTime % 30 === 0) {
        spawnInterval = Math.max(800, spawnInterval - 50);
        obstacleSpeed += 0.1;
    }
}

setTimeout(manageSpawning, spawnInterval);
setInterval(increaseDifficulty, 1000);

// Atualizar o jogo
function update() {
    if (gameOver) return;

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

// Desenhar o fundo
function drawBackground() {
    const cityImage = new Image();
    const forestImage = new Image();

    if (backgroundClass === 'city') {
        cityImage.src = 'city_background.png';
        ctx.drawImage(cityImage, 0, 0, canvas.width, canvas.height);
    } else {
        forestImage.src = 'forest_background.png';
        ctx.drawImage(forestImage, 0, 0, canvas.width, canvas.height);
    }
}

// Renderizar o jogo
function draw() {
    drawBackground();
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    for (let i = 0; i < obstacles.length; i++) {
        ctx.drawImage(obstacles[i].image, obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
    }
}

// Loop principal do jogo
function gameLoop() {
    update();
    draw();
    if (!gameOver) requestAnimationFrame(gameLoop);
}

gameLoop();



