// ROV Game with fixed movement
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');

// Game variables
let gameRunning = false;
let score = 0;
let timeLeft = 60;
let gameInterval;
let timer;

// ROV properties
const rov = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 60,
  height: 40,
  speed: 5,
  color: '#00c6ff'
};

// Samples
const samples = [];

// Obstacles
const obstacles = [];

// Create samples
function createSamples() {
  for (let i = 0; i < 8; i++) {
    samples.push({
      x: Math.random() * (canvas.width - 20),
      y: Math.random() * (canvas.height - 20),
      width: 20,
      height: 20,
      collected: false
    });
  }
}

// Create obstacles
function createObstacles() {
  for (let i = 0; i < 5; i++) {
    obstacles.push({
      x: Math.random() * (canvas.width - 30),
      y: Math.random() * (canvas.height - 30),
      width: 30,
      height: 30
    });
  }
}

// Draw ROV
function drawROV() {
  // ROV body
  ctx.fillStyle = rov.color;
  ctx.fillRect(rov.x - rov.width/2, rov.y - rov.height/2, rov.width, rov.height);
  
  // ROV details
  ctx.fillStyle = '#0072ff';
  ctx.fillRect(rov.x - rov.width/2 + 5, rov.y - rov.height/2 + 5, 10, 10);
  ctx.fillRect(rov.x + rov.width/2 - 15, rov.y - rov.height/2 + 5, 10, 10);
  
  // Propellers
  ctx.fillStyle = '#333';
  ctx.fillRect(rov.x - rov.width/2 - 10, rov.y - 5, 10, 10);
  ctx.fillRect(rov.x + rov.width/2, rov.y - 5, 10, 10);
}

// Draw samples
function drawSamples() {
  samples.forEach(sample => {
    if (!sample.collected) {
      ctx.fillStyle = '#00ff9d';
      ctx.beginPath();
      ctx.arc(sample.x, sample.y, sample.width/2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// Draw obstacles
function drawObstacles() {
  obstacles.forEach(obstacle => {
    ctx.fillStyle = '#ff3e3e';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
}

// Check collisions
function checkCollisions() {
  // Check sample collection
  samples.forEach(sample => {
    if (!sample.collected) {
      const dx = rov.x - sample.x;
      const dy = rov.y - sample.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < (rov.width/2 + sample.width/2)) {
        sample.collected = true;
        score++;
        scoreEl.textContent = score;
      }
    }
  });
  
  // Check obstacle collisions
  obstacles.forEach(obstacle => {
    if (
      rov.x < obstacle.x + obstacle.width &&
      rov.x + rov.width/2 > obstacle.x &&
      rov.y < obstacle.y + obstacle.height &&
      rov.y + rov.height/2 > obstacle.y
    ) {
      // Collision detected - flash the screen
      document.querySelector('.game-container').style.boxShadow = '0 0 30px rgba(255, 50, 50, 0.8)';
      setTimeout(() => {
        document.querySelector('.game-container').style.boxShadow = '0 0 30px rgba(0, 198, 255, 0.3)';
      }, 200);
      
      // Deduct points
      if (score > 0) {
        score = Math.max(0, score - 1);
        scoreEl.textContent = score;
      }
    }
  });
}

// Draw game
function drawGame() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background
  ctx.fillStyle = '#0a1a3a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  ctx.strokeStyle = 'rgba(0, 198, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // Draw game elements
  drawSamples();
  drawObstacles();
  drawROV();
  
  // Draw score
  ctx.fillStyle = 'white';
  ctx.font = '16px Poppins';
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Time: ${timeLeft}s`, canvas.width - 100, 30);
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;
  
  drawGame();
  checkCollisions();
  
  // Check if all samples collected
  const allCollected = samples.every(sample => sample.collected);
  if (allCollected) {
    createSamples();
  }
}

// Start game
function startGame() {
  if (gameRunning) return;
  
  gameRunning = true;
  score = 0;
  timeLeft = 60;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  
  samples.length = 0;
  obstacles.length = 0;
  
  createSamples();
  createObstacles();
  
  // Start timer
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      gameRunning = false;
      clearInterval(gameInterval);
      alert(`Game Over! Your score: ${score}`);
    }
  }, 1000);
  
  // Start game loop
  gameInterval = setInterval(gameLoop, 1000/60);
}

// Reset game
function resetGame() {
  gameRunning = false;
  clearInterval(gameInterval);
  clearInterval(timer);
  
  rov.x = canvas.width / 2;
  rov.y = canvas.height / 2;
  
  samples.length = 0;
  obstacles.length = 0;
  
  score = 0;
  timeLeft = 60;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  
  drawGame();
}

// Keyboard controls - fixed to prevent page scrolling
document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  
  // Prevent default behavior for arrow keys to stop page scrolling
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
  
  switch(e.key) {
    case 'ArrowUp':
      rov.y = Math.max(rov.y - rov.speed, rov.height/2);
      break;
    case 'ArrowDown':
      rov.y = Math.min(rov.y + rov.speed, canvas.height - rov.height/2);
      break;
    case 'ArrowLeft':
      rov.x = Math.max(rov.x - rov.speed, rov.width/2);
      break;
    case 'ArrowRight':
      rov.x = Math.min(rov.x + rov.speed, canvas.width - rov.width/2);
      break;
  }
});

// Initialize game
resetGame();

// Event listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// Back to top button functionality
window.addEventListener('scroll', () => {
  const backToTopButton = document.querySelector('.back-to-top');
  if (window.pageYOffset > 300) {
    backToTopButton.classList.add('active');
  } else {
    backToTopButton.classList.remove('active');
  }
  
  // Header effect
  const header = document.getElementById('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

document.querySelector('.back-to-top').addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
  });
});

// Smooth scrolling for all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});