const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajuste do tamanho do canvas para a área de jogo fixada em 936x230px
const gameArea = document.getElementById("gameArea");

// Definindo o tamanho fixo para o canvas
const canvasWidth = 936;
const canvasHeight = 230;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

gameArea.style.width = `${canvasWidth + 2}px`; // Largura da área com a moldura
gameArea.style.height = `${canvasHeight + 2}px`; // Altura da área com a moldura
gameArea.style.padding = "0"; // Sem padding adicional
gameArea.style.border = "2px solid red"; // Moldura vermelha de 2px

const player = {
    x: 50,
    y: canvas.height - 80, // Ajustado para aumentar o espaço para o personagem
    width: 50,
    height: 50,
    speed: 5,
    isJumping: false,
    velocityY: 0,
    gravity: 0.6,
    jumpHeight: -12 // Aumento da altura do pulo
};

const obstacles = [];
const initialObstacleSpeed = 6;
let obstacleSpeed = initialObstacleSpeed;
const initialSpawnInterval = 1500;
let spawnInterval = initialSpawnInterval;
let score = 0;
let gameOver = false;
let spawnTime = 0;

const playerImage = new Image();
playerImage.src = "player.png"; // Certifique-se de que a imagem do jogador esteja na pasta correta

const fireImage = new Image();
fireImage.src = "fire.png"; // Certifique-se de que a imagem do fogo esteja na pasta correta

const bookImage = new Image();
bookImage.src = "books.png"; // Certifique-se de que a imagem dos livros esteja na pasta correta

let backgroundClass = Math.random() < 0.05 ? 'forest' : 'city'; // 5% chance de ser floresta

// Função de pulo
function jump() {
    if (!player.isJumping) {
        player.isJumping = true;
        player.velocityY = player.jumpHeight; // Ajustando a força do pulo
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
    if (Math.random() < 0.3) { // Menor chance de gerar obstáculos para reduzir a carga no jogo
        return;
    }

    const isFire = Math.random() < 0.35; // 35% chance de gerar fogo
    const isBook = !isFire;  // O restante será livro
    const fireSizeFactor = [1, 1.5]; // Tamanhos do fogo: 100% e 150% do tamanho original

    // Gerar livros (moeda)
    if (isBook) {
        const bookObstacle = {
            x: canvas.width,
            y: Math.random() * (canvas.height - 200) + 100, // Livros gerados mais altos para forçar o pulo
            width: bookImage.width * 0.6,  // Tamanho aumentado
            height: bookImage.height * 0.6,  // Tamanho aumentado
            image: bookImage
        };
        obstacles.push(bookObstacle);
    }

    // Gerar apenas um fogo
    if (isFire) {
        const fireHeight = fireSizeFactor[Math.floor(Math.random() * fireSizeFactor.length)];
        const fireObstacle = {
            x: canvas.width,
            y: canvas.height - 80, // Fogo gerado um pouco mais alto para que caibam na área jogável
            width: fireImage.width * fireHeight, // Tamanho ajustado
            height: fireImage.height * fireHeight, // Tamanho ajustado
            image: fireImage
        };
        obstacles.push(fireObstacle);
    }
}

// Controla o intervalo de geração sem pausar o jogo
function manageSpawning() {
    if (!gameOver) {
        spawnObstacle(); // Gera o próximo obstáculo
        setTimeout(manageSpawning, spawnInterval); // Chamando a função novamente após o intervalo
    }
}

// Aumentar a frequência dos obstáculos a cada 30 segundos
function increaseDifficulty() {
    spawnTime += 1;
    if (spawnTime % 30 === 0) { // A cada 30 segundos
        spawnInterval = Math.max(800, spawnInterval - 50); // Intervalo não vai abaixo de 800ms
        obstacleSpeed += 0.1; // Aumento mais suave na velocidade
    }
}

setTimeout(manageSpawning, spawnInterval); // Inicia a geração de obstáculos
setInterval(increaseDifficulty, 1000); // Verifica a cada segundo a dificuldade

// Atualizar jogo
function update() {
    if (gameOver) return;

    // Atualiza a pontuação
    score = Math.floor(score); // Pontuação inteira
    score += 1 / 60;  // Incrementa 1 ponto a cada segundo (dividido por 60 para ficar mais suave)

    // Atualiza o display da pontuação no HTML
    document.getElementById('score').innerText = `Pontos: ${Math.floor(score)}`;

    // Atualiza o recorde
    if (score > localStorage.getItem('highscore')) {
        localStorage.setItem('highscore', Math.floor(score)); // Armazena o recorde no localStorage
    }
    document.getElementById('record').innerText = `Recorde: ${localStorage.getItem('highscore')}`;

    // Aplica a gravidade ao jogador
    player.y += player.velocityY;
    player.velocityY += player.gravity;

    // Limitar o jogador ao chão
    if (player.y >= canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.isJumping = false;
    }

    // Atualizar obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed; // Move os obstáculos para a esquerda

        // Verifica se o jogador coletou um livro
        if (obstacles[i].image === bookImage) {
            if (
                player.x < obstacles[i].x + obstacles[i].width &&
                player.x + player.width > obstacles[i].x &&
                player.y < obstacles[i].y + obstacles[i].height &&
                player.y + player.height > obstacles[i].y
            ) {
                obstacles.splice(i, 1); // Remove o livro coletado
                score += 1; // Incrementa a pontuação ao coletar um livro
            }
        }

        // Verifica colisão com o fogo
        if (obstacles[i].image === fireImage) {
            if (
                player.x < obstacles[i].x + obstacles[i].width &&
                player.x + player.width > obstacles[i].x &&
                player.y < obstacles[i].y + obstacles[i].height &&
                player.y + player.height > obstacles[i].y
            ) {
                endGame(); // Fim do jogo em caso de colisão com o fogo
            }
        }

        // Remove obstáculos fora da tela
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

// Exibe a tela de fim de jogo
function endGame() {
    gameOver = true; // Define que o jogo terminou
    document.getElementById("gameOverScreen").style.display = "block"; // Exibe a tela de Game Over
    document.getElementById("finalScore").innerText = `Livros coletados: ${Math.floor(score)}`; // Exibe a quantidade de livros coletados
}

// Desenhar fundo
function drawBackground() {
    if (backgroundClass === 'city') {
        const cityImage = new Image();
        cityImage.src = 'city_background.png'; // Certifique-se de que a imagem do fundo da cidade esteja na pasta correta
        ctx.drawImage(cityImage, 0, 0, canvas.width, canvas.height);
    } else {
        const forestImage = new Image();
        forestImage.src = 'forest_background.png'; // Certifique-se de que a imagem do fundo da floresta esteja na pasta correta
        ctx.drawImage(forestImage, 0, 0, canvas.width, canvas.height);
    }
}

// Renderizar jogo
function draw() {
    drawBackground(); // Desenha o fundo
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    // Desenha os obstáculos
    for (let i = 0; i < obstacles.length; i++) {
        ctx.drawImage(obstacles[i].image, obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
    }
}

// Limitar a taxa de atualização do game loop
function gameLoop() {
    const frameRate = 60; // 60 quadros por segundo
    const interval = 1000 / frameRate;
    let lastTime = 0;

    function loop(currentTime) {
        if (currentTime - lastTime >= interval) {
            update();
            draw();
            lastTime = currentTime;
        }
        if (!gameOver) requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

gameLoop(); // Inicia o loop do jogo
