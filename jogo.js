const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajuste do tamanho do canvas
canvas.width = 936;
canvas.height = 230;

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

const obstacles = [];
const initialObstacleSpeed = 6;
let obstacleSpeed = initialObstacleSpeed;
let score = 0;
let gameOver = false;

// Carregar imagens
const playerImage = new Image();
playerImage.src = "player.png";

const fireImage = new Image();
fireImage.src = "fire.png";

const bookImage = new Image();
bookImage.src = "books.png";

// Detectar entrada do jogador (teclado e toque)
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

canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    jump();
});

// Gerar obstáculos
function spawnObstacle() {
    if (Math.random() < 0.3) return;

    const isFire = Math.random() < 0.35;
    const yPosition = isFire ? canvas.height - 80 : Math.random() * (canvas.height - 200) + 100;

    obstacles.push({
        x: canvas.width,
        y: yPosition,
        width: isFire ? fireImage.width * 0.8 : bookImage.width * 0.6,
        height: isFire ? fireImage.height * 0.8 : bookImage.height * 0.6,
        image: isFire ? fireImage : bookImage
    });
}

// Gerenciamento de obstáculos
function manageSpawning() {
    if (!gameOver) {
        spawnObstacle();
        setTimeout(manageSpawning, 1500);
    }
}

setTimeout(manageSpawning, 1500);

// Atualizar jogo
function update() {
    if (gameOver) return;

    score += 1 / 60;
    document.getElementById('score').innerText = `Pontos: ${Math.floor(score)}`;

    player.y += player.velocityY;
    player.velocityY += player.gravity;

    if (player.y >= canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.isJumping = false;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed;

        // Verifica se o jogador coletou um livro
        if (obstacles[i].image === bookImage) {
            if (
                player.x < obstacles[i].x + obstacles[i].width &&
                player.x + player.width > obstacles[i].x &&
                player.y < obstacles[i].y + obstacles[i].height &&
                player.y + player.height > obstacles[i].y
            ) {
                obstacles.splice(i, 1);
                score += 5; // Aumenta a pontuação ao coletar um livro
            }
        }

        // Verifica colisão com fogo
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

// Exibir tela de fim de jogo
function endGame() {
    gameOver = true;
    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").innerText = `Livros coletados: ${Math.floor(score)}`;
}

// Renderizar jogo
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Loop do jogo
function gameLoop() {
    update();
    draw();
    if (!gameOver) requestAnimationFrame(gameLoop);
}

gameLoop();
