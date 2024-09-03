// script.js

// Seleciona o canvas e o contexto
const canvas = document.getElementById('gameCanvas');
canvas.width = 600;
canvas.height = 400;
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');

// Carrega as imagens dos sprites
const sprites = {
    down: new Image(),
    downWalk: new Image(),
    left: new Image(),
    leftWalk: new Image(),
    right: new Image(),
    rightWalk: new Image(),
    up: new Image(),
    upWalk: new Image()
};

sprites.down.src = 'assets/Playerspritedown.png';
sprites.downWalk.src = 'assets/Playerspritedownwalk.png';
sprites.left.src = 'assets/Playerspriteleft.png';
sprites.leftWalk.src = 'assets/Playerspriteleftwalk.png';
sprites.right.src = 'assets/Playerspriteright.png';
sprites.rightWalk.src = 'assets/Playerspriterightwalk.png';
sprites.up.src = 'assets/Playerspriteup.png';
sprites.upWalk.src = 'assets/Playerspriteupwalk.png';

// Configurações do jogo
const player = {
    x: canvas.width / 2 - 35, // Centraliza horizontalmente
    y: canvas.height / 2 - 35, // Centraliza verticalmente
    width: 70, // Aumenta a largura do player
    height: 70, // Aumenta a altura do player
    speed: 3,
    direction: 'down',
    isWalking: false,
    walkFrame: 0, // Atributo para alternar entre os sprites de caminhada
    collisionPoints: [
        { x: 36, y: 62 },
        { x: 36, y: 57 },
        { x: 35, y: 51 },
        { x: 35, y: 44 },
        { x: 35, y: 37 }
    ]
};

const bullets = [];
const diamonds = [];
let gameOver = false;
let walkInterval;
let score = 0; // Intervalo para alternar sprites de caminhada
const maxScore = 1000000;


function formatScore(score) {
    return score.toString().padStart(6, '0'); // Garante que a pontuação seja exibida com 6 dígitos
}
// Estado das teclas pressionadas
const keysPressed = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// Função para desenhar o player
function drawPlayer() {
    let sprite;
    switch (player.direction) {
        case 'down':
            sprite = player.isWalking && player.walkFrame ? sprites.downWalk : sprites.down;
            break;
        case 'left':
            sprite = player.isWalking && player.walkFrame ? sprites.leftWalk : sprites.left;
            break;
        case 'right':
            sprite = player.isWalking && player.walkFrame ? sprites.rightWalk : sprites.right;
            break;
        case 'up':
            sprite = player.isWalking && player.walkFrame ? sprites.upWalk : sprites.up;
            break;
    }
    ctx.drawImage(sprite, player.x, player.y, player.width, player.height);
}

// Função para desenhar projéteis
function drawBullets() {
    ctx.fillStyle = 'white';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Função para mover projéteis
function moveBullets() {
    bullets.forEach((bullet, index) => {
        switch (bullet.direction) {
            case 'left':
                bullet.x -= bullet.speed;
                break;
            case 'right':
                bullet.x += bullet.speed;
                break;
            case 'up':
                bullet.y -= bullet.speed;
                break;
            case 'down':
                bullet.y += bullet.speed;
                break;
        }
        // Remove projéteis fora do canvas
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });
}
//bordas...

const marginRight = 25;
const marginLeft = 25;


// Função para mover o player


function movePlayer() {
    if (keysPressed['ArrowLeft'] && player.x > -marginLeft) {
        player.x = Math.max(player.x - player.speed, -marginLeft);
        player.direction = 'left';
    } else if (keysPressed['ArrowRight'] && player.x + player.width < canvas.width + marginRight) {
        player.x = Math.min(player.x + player.speed, canvas.width - player.width + marginRight);
        player.direction = 'right';    
    } else if (keysPressed['ArrowUp'] && player.y > -player.height / 2) {
        player.y = Math.max(player.y - player.speed, -player.height / 2); // Permite um pequeno espaço acima
        player.direction = 'up';
    } else if (keysPressed['ArrowDown'] && player.y + player.height < canvas.height) {
        player.y = Math.min(player.y + player.speed, canvas.height - player.height); // Garante que player.y não ultrapasse a borda inferior
        player.direction = 'down';
    }
}

// Função para desenhar diamantes
function drawDiamonds() {
    ctx.fillStyle = '#2DFDCB';
    diamonds.forEach(diamond => {
        ctx.beginPath();
        ctx.moveTo(diamond.x + diamond.size / 2, diamond.y);
        ctx.lineTo(diamond.x + diamond.size, diamond.y + diamond.size / 2);
        ctx.lineTo(diamond.x + diamond.size / 2, diamond.y + diamond.size);
        ctx.lineTo(diamond.x, diamond.y + diamond.size / 2);
        ctx.closePath();
        ctx.fill();
    });
}

// Função para mover diamantes
function moveDiamonds() {
    diamonds.forEach((diamond, index) => {
        switch (diamond.direction) {
            case 'left':
                diamond.x -= diamond.speed;
                break;
            case 'right':
                diamond.x += diamond.speed;
                break;
            case 'up':
                diamond.y -= diamond.speed;
                break;
            case 'down':
                diamond.y += diamond.speed;
                break;
        }
        // Remove diamantes fora do canvas
        if (diamond.x < 0 || diamond.x > canvas.width || diamond.y < 0 || diamond.y > canvas.height) {
            diamonds.splice(index, 1);
        }
    });
}

// Função para gerar diamantes aleatoriamente
function generateDiamonds() {
    const size = 20;
    const speed = Math.random() * 4 + 2;
    let x, y, direction;

    switch (Math.floor(Math.random() * 4)) {
        case 0: // Vem da esquerda
            x = 0;
            y = Math.random() * canvas.height;
            direction = 'right';
            break;
        case 1: // Vem da direita
            x = canvas.width;
            y = Math.random() * canvas.height;
            direction = 'left';
            break;
        case 2: // Vem de cima
            x = Math.random() * canvas.width;
            y = 0;
            direction = 'down';
            break;
        case 3: // Vem de baixo
            x = Math.random() * canvas.width;
            y = canvas.height;
            direction = 'up';
            break;
    }

    diamonds.push({ x, y, size, speed, direction });
}
// Atualiza a exibição inicial da pontuação
scoreElement.textContent = `${formatScore(score)}`;

// Função para detectar colisões
function detectCollisions() {
    // Colisão entre projéteis e diamantes
    bullets.forEach((bullet, bulletIndex) => {
        diamonds.forEach((diamond, diamondIndex) => {
            if (bullet.x < diamond.x + diamond.size &&
                bullet.x + bullet.width > diamond.x &&
                bullet.y < diamond.y + diamond.size &&
                bullet.y + bullet.height > diamond.y) {
                bullets.splice(bulletIndex, 1); // Remove o projétil
                diamonds.splice(diamondIndex, 1); // Remove o diamante
                score = score + Math.floor(Math.random() * 100) + 10; // Incrementa a pontuação
                 // Atualiza a exibição da pontuação
                scoreElement.textContent = `${formatScore(Math.min(score, maxScore))}`;
                // Verifica se o jogador atingiu a pontuação máxima
            if (score >= maxScore) {
                alert("Você Ganhou! :D");
                score = 0; 
                scoreElement.textContent = `${formatScore(score)}`; // Atualiza a exibição da pontuação
                location.reload();
                }
            }
        });
    });

    // Colisão entre diamantes e o player
    const playerCollisionPoints = player.collisionPoints.map(point => ({
        x: player.x + point.x,
        y: player.y + point.y
    }));

    diamonds.forEach((diamond) => {
        playerCollisionPoints.forEach(point => {
            if (point.x >= diamond.x &&
                point.x <= diamond.x + diamond.size &&
                point.y >= diamond.y &&
                point.y <= diamond.y + diamond.size) {
                gameOver = true; // Fim de jogo
                alert("Game Over!"); // Exibe mensagem de fim de jogo
                // Reinicia o jogo
                location.reload();
        }
     });
    });
}

// Função para atualizar o jogo
function updateGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (player.isWalking) {
        movePlayer();
    }

    moveBullets();
    moveDiamonds();
    detectCollisions();

    drawPlayer();
    drawBullets();
    drawDiamonds();
    requestAnimationFrame(updateGame);
}

// Evento de teclado para mover o player
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keysPressed[e.key] = true;
        player.isWalking = true;
        if (!walkInterval) {
            walkInterval = setInterval(() => {
                player.walkFrame = !player.walkFrame; // Alterna entre 0 e 1
            }, 200); // Alterna a cada 200ms
        }
    } else if (e.key === ' ') { // Tecla de espaço para atirar
        bullets.push({
            x: player.x + player.width / 2 - 2.5,
            y: player.y + player.height / 2 - 2.5,
            width: 5,
            height: 5,
            speed: 6,
            direction: player.direction
        });
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keysPressed[e.key] = false;
        if (!Object.values(keysPressed).includes(true)) {
            player.isWalking = false;
            player.walkFrame = 0; // Reseta o frame de caminhada
            clearInterval(walkInterval);
            walkInterval = null;
        }
    }
});

// Gera diamantes a cada segundo
setInterval(generateDiamonds, 420);

// Inicia o jogo
updateGame();

