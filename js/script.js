// ========== GLOBAL VARIABLES ==========
let darkMode = true;
let musicPlaying = false;
let audioCtx = null;
let musicOscillator = null;

// ========== LOADING SCREEN ==========
window.addEventListener('load', function() {
  setTimeout(function() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }, 2000); // Loading 2 detik
});

// ========== DARK MODE TOGGLE ==========
document.addEventListener('DOMContentLoaded', function() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
      darkMode = !darkMode;
      document.body.classList.toggle('light-mode', !darkMode);
      updateDarkModeButton();
    });
  }

  // Set initial state
  updateDarkModeButton();

  // ========== BACKGROUND MUSIC ==========
  initBackgroundMusic();
  const musicToggle = document.getElementById('musicToggle');
  if (musicToggle) {
    musicToggle.addEventListener('click', toggleMusic);
  }

  // ========== PROFILE PAGE: TYPING ANIMATION ==========
  initTypingAnimation();

  // ========== PROFILE PAGE: PROGRESS BAR ANIMATION ==========
  animateProgressBars();

  // ========== GAME PAGE LOGIC ==========
  initGame();

  // ========== UPDATE HIGH SCORE DISPLAYS ==========
  updateAllHighScoreDisplays();
});

function updateDarkModeButton() {
  const btn = document.getElementById('darkModeToggle');
  if (btn) {
    if (darkMode) {
      btn.innerHTML = '☀️ Light Mode';
      btn.classList.add('btn-outline-warning');
      btn.classList.remove('btn-outline-dark');
    } else {
      btn.innerHTML = '🌙 Dark Mode';
      btn.classList.add('btn-outline-dark');
      btn.classList.remove('btn-outline-warning');
    }
  }
}

// ========== BACKGROUND MUSIC (Simple oscillator) ==========
function initBackgroundMusic() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.log('Web Audio API tidak didukung');
  }
}

function toggleMusic() {
  const btn = document.getElementById('musicToggle');
  if (!audioCtx) return;
  
  if (musicPlaying) {
    if (musicOscillator) {
      musicOscillator.stop();
      musicOscillator = null;
    }
    musicPlaying = false;
    if (btn) btn.innerHTML = '🔇';
  } else {
    // Buat simple arcade tone
    musicOscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    musicOscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    musicOscillator.type = 'square';
    musicOscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    
    musicOscillator.start();
    musicPlaying = true;
    if (btn) btn.innerHTML = '🔊';
  }
}

// ========== TYPING ANIMATION (Profile Page) ==========
function initTypingAnimation() {
  const typingElement = document.getElementById('typing-text');
  if (!typingElement) return;

  const text = "Hi, I'm Sobat — Future Game Developer";
  let index = 0;
  typingElement.textContent = '';

  function typeWriter() {
    if (index < text.length) {
      typingElement.textContent += text.charAt(index);
      index++;
      setTimeout(typeWriter, 50);
    } else {
      // Setelah selesai, tambahkan kursor berkedip
      typingElement.style.borderRight = '2px solid var(--neon-blue)';
      typingElement.style.animation = 'blink 0.7s infinite';
    }
  }

  typeWriter();
}

// ========== PROGRESS BAR ANIMATION ==========
function animateProgressBars() {
  const bars = document.querySelectorAll('.skill-bar');
  if (bars.length === 0) return;

  bars.forEach(bar => {
    const target = bar.getAttribute('data-progress');
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = target + '%';
    }, 200);
  });
}

// ========== GAME LOGIC (Tebak Angka) ==========
let secretNumber = 0;
let score = 0;
let lives = 3;
let gameOver = false;
let highScore = parseInt(localStorage.getItem('neonArcadeHighScore')) || 0;

function initGame() {
  const guessInput = document.getElementById('guessInput');
  const submitBtn = document.getElementById('submitGuess');
  const restartBtn = document.getElementById('restartBtn');
  const quickNums = document.querySelectorAll('.quick-num');

  if (!guessInput || !submitBtn) return; // Bukan halaman game

  // Generate angka random 1-10
  secretNumber = Math.floor(Math.random() * 10) + 1;
  score = 0;
  lives = 3;
  gameOver = false;
  updateUI();

  // Event listener submit
  submitBtn.addEventListener('click', handleGuess);
  guessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleGuess();
    }
  });

  // Quick number buttons
  quickNums.forEach(btn => {
    btn.addEventListener('click', function() {
      if (gameOver) return;
      guessInput.value = this.getAttribute('data-num');
      handleGuess();
    });
  });

  // Restart button
  restartBtn.addEventListener('click', restartGame);
}

function handleGuess() {
  if (gameOver) return;

  const guessInput = document.getElementById('guessInput');
  const guess = parseInt(guessInput.value);
  const resultAlert = document.getElementById('resultAlert');
  const gameOverMessage = document.getElementById('gameOverMessage');

  // Validasi input
  if (isNaN(guess) || guess < 1 || guess > 10) {
    showAlert('Masukkan angka antara 1 dan 10!', 'warning');
    guessInput.value = '';
    return;
  }

  if (guess === secretNumber) {
    // Benar!
    score += 10;
    document.getElementById('scoreDisplay').textContent = score;
    showAlert('🎉 BENAR! Angka rahasia adalah ' + secretNumber, 'success');
    
    // Cek high score
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('neonArcadeHighScore', highScore);
      document.getElementById('highScoreDisplay').textContent = highScore;
      updateAllHighScoreDisplays();
    }

    // Confetti saat menang!
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
    }

    // Game won, tapi bisa lanjut? Di sini kita reset dengan angka baru, lives tetap? 
    // Untuk gameplay lebih seru: reset lives tetap, angka baru.
    document.getElementById('gameOverCard').querySelector('#gameOverTitle').textContent = '🏆 KAMU MENANG!';
    document.getElementById('gameOverCard').querySelector('#gameOverText').textContent = 
      'Skor: ' + score + ' | High Score: ' + highScore;
    gameOverMessage.classList.remove('d-none');
    document.getElementById('restartBtn').classList.remove('d-none');
    gameOver = true;
    guessInput.disabled = true;
    document.getElementById('submitGuess').disabled = true;
    
  } else {
    // Salah
    lives--;
    updateLivesDisplay();
    
    if (lives <= 0) {
      // Game over
      showAlert('💔 GAME OVER! Angka rahasia adalah ' + secretNumber, 'danger');
      gameOverMessage.querySelector('#gameOverTitle').textContent = '💔 GAME OVER';
      gameOverMessage.querySelector('#gameOverText').textContent = 
        'Angka rahasia: ' + secretNumber + ' | Skor akhir: ' + score;
      gameOverMessage.classList.remove('d-none');
      document.getElementById('restartBtn').classList.remove('d-none');
      gameOver = true;
      guessInput.disabled = true;
      document.getElementById('submitGuess').disabled = true;
      
      // Update high score jika perlu
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('neonArcadeHighScore', highScore);
        updateAllHighScoreDisplays();
      }
    } else {
      // Beri petunjuk
      if (guess < secretNumber) {
        showAlert('📈 Terlalu kecil! Coba angka lebih besar.', 'info');
      } else {
        showAlert('📉 Terlalu besar! Coba angka lebih kecil.', 'info');
      }
    }
  }

  guessInput.value = '';
  guessInput.focus();
}

function showAlert(message, type) {
  const alertEl = document.getElementById('resultAlert');
  alertEl.className = 'alert alert-' + type + ' mt-3';
  alertEl.textContent = message;
  alertEl.classList.remove('d-none');
}

function updateUI() {
  document.getElementById('scoreDisplay').textContent = score;
  updateLivesDisplay();
  document.getElementById('highScoreDisplay').textContent = highScore;
  
  const guessInput = document.getElementById('guessInput');
  const submitBtn = document.getElementById('submitGuess');
  if (guessInput && submitBtn) {
    guessInput.disabled = false;
    submitBtn.disabled = false;
  }
  
  document.getElementById('gameOverMessage').classList.add('d-none');
  document.getElementById('restartBtn').classList.add('d-none');
  document.getElementById('resultAlert').classList.add('d-none');
}

function updateLivesDisplay() {
  const livesDisplay = document.getElementById('livesDisplay');
  if (!livesDisplay) return;
  let hearts = '';
  for (let i = 0; i < lives; i++) {
    hearts += '❤️';
  }
  livesDisplay.textContent = hearts || '💀';
}

function restartGame() {
  secretNumber = Math.floor(Math.random() * 10) + 1;
  score = 0;
  lives = 3;
  gameOver = false;
  updateUI();
  
  const guessInput = document.getElementById('guessInput');
  if (guessInput) {
    guessInput.value = '';
    guessInput.focus();
  }
}

function updateAllHighScoreDisplays() {
  const highScoreElements = [
    document.getElementById('homeHighScore'),
    document.getElementById('profileHighScore'),
    document.getElementById('highScoreDisplay')
  ];
  highScoreElements.forEach(el => {
    if (el) el.textContent = highScore;
  });
  
  // Update games played count jika ada
  const gamesPlayedEl = document.getElementById('gamesPlayed');
  if (gamesPlayedEl) {
    let played = parseInt(localStorage.getItem('neonArcadeGamesPlayed') || '0');
    // Increment hanya saat game selesai? Kita simpan saat game over
    // Untuk sementara kita biarkan saja tampil jumlah dari storage
    gamesPlayedEl.textContent = played;
  }
}

// ========== TRACK GAMES PLAYED ==========
// Panggil ini saat game selesai (menang atau kalah) di handleGuess
// Kita perlu modifikasi handleGuess untuk increment gamesPlayed
// Override fungsi handleGuess asli untuk menambahkan tracking
(function() {
  const originalHandleGuess = handleGuess;
  handleGuess = function() {
    // Cek apakah game berakhir setelah fungsi asli
    const wasGameOver = gameOver;
    originalHandleGuess();
    if (!wasGameOver && gameOver) {
      // Tambah games played
      let played = parseInt(localStorage.getItem('neonArcadeGamesPlayed') || '0');
      played++;
      localStorage.setItem('neonArcadeGamesPlayed', played);
      const gamesPlayedEl = document.getElementById('gamesPlayed');
      if (gamesPlayedEl) gamesPlayedEl.textContent = played;
    }
  };
})();

function startCountdown() {

  // Contoh: rilis 25 Desember 2025 jam 00:00
  const countdownDate = new Date('December 25, 2026 00:00:00').getTime();

  const timer = setInterval(function() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance < 0) {
      clearInterval(timer);
      document.getElementById('countdown').innerHTML = "<div class='col-12'><h3 class='text-info'>GAME SUDAH RILIS!</h3></div>";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('countdownDays').textContent = String(days).padStart(2, '0');
    document.getElementById('countdownHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countdownMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('countdownSeconds').textContent = String(seconds).padStart(2, '0');
  }, 1000);
}

// Panggil saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('countdown')) startCountdown();
});

  function handleContactSubmit(event) {
    event.preventDefault(); // Mencegah submit default

    // Ambil nilai input
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    // Buat mailto link
    const subject = encodeURIComponent('Pesan dari ' + name + ' - Neo Arcade');
    const body = encodeURIComponent(
      'Nama: ' + name + '\n' +
      'Email: ' + email + '\n\n' +
      'Pesan:\n' + message
    );

    const mailtoLink = 'mailto:sobatdev@neoarcade.id' +
      '?subject=' + subject +
      '&body=' + body;

    // Arahkan ke mailto link (akan membuka email client, bukan tab baru)
    window.location.href = mailtoLink;

    return false;
  }