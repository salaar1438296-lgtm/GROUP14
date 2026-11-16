// Number Master Game - medium level JavaScript

const loginScreen = document.getElementById("loginScreen");
const gameScreen = document.getElementById("gameScreen");

const playerNameInput = document.getElementById("playerName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");

const welcomeText = document.getElementById("welcomeText");
const levelText = document.getElementById("level");
const rangeText = document.getElementById("range");
const scoreText = document.getElementById("score");
const bestScoreText = document.getElementById("bestScore");
const attemptText = document.getElementById("attemptText");
const progressBar = document.getElementById("progressBar");
const evenOddText = document.getElementById("evenOdd");
const guessInput = document.getElementById("guessInput");
const gameMessage = document.getElementById("gameMessage");
const guessBtn = document.getElementById("guessBtn");
const nextBtn = document.getElementById("nextBtn");
const musicBtn = document.getElementById("musicBtn");

let player = null;
let level = 1;
let secretNumber = 0;
let attemptsLeft = 10;
let score = 0;
let bestScore = 0;
let musicOn = false;
let audioContext = null;

// Create a new secret number for the current level.
function startLevel() {
  const maximum = level * 50;
  secretNumber = Math.floor(Math.random() * maximum) + 1;
  attemptsLeft = 10;

  levelText.textContent = level;
  rangeText.textContent = `1 - ${maximum}`;
  evenOddText.textContent = secretNumber % 2 === 0 ? "EVEN" : "ODD";
  guessInput.max = maximum;
  guessInput.value = "";
  guessInput.disabled = false;
  guessBtn.disabled = false;
  nextBtn.classList.add("hidden");
  gameMessage.textContent = "You have 10 attempts. Good luck!";
  updateDisplay();
}

// Update score, attempts and progress bar.
function updateDisplay() {
  scoreText.textContent = score;
  bestScoreText.textContent = bestScore;
  attemptText.textContent = `${attemptsLeft} / 10`;
  progressBar.style.width = `${attemptsLeft * 10}%`;
}

// Check the player's guess.
async function checkGuess() {
  const guess = Number(guessInput.value);
  const maximum = level * 50;

  if (!guessInput.value || guess < 1 || guess > maximum) {
    gameMessage.textContent = `Enter a number from 1 to ${maximum}.`;
    return;
  }

  attemptsLeft--;

  if (guess === secretNumber) {
    const points = (attemptsLeft + 1) * 10;
    score += points;

    if (score > bestScore) {
      bestScore = score;
      saveBestScore();
    }

    gameMessage.textContent = `🎉 Correct! You earned ${points} points.`;
    guessInput.disabled = true;
    guessBtn.disabled = true;
    nextBtn.classList.remove("hidden");
    playWinSound();
    await saveLevelScore(points);
  } else if (attemptsLeft === 0) {
    gameMessage.textContent = `Game over! The number was ${secretNumber}. Restart this level to try again.`;
    guessInput.disabled = true;
    guessBtn.disabled = true;
  } else if (guess < secretNumber) {
    gameMessage.textContent = "Too low! Try a bigger number.";
  } else {
    gameMessage.textContent = "Too high! Try a smaller number.";
  }

  updateDisplay();
  guessInput.value = "";
  guessInput.focus();
}

// Supabase stores the player's best score.
async function saveBestScore() {
  if (!supabaseClient || !player) return;

  const { error } = await supabaseClient
    .from("players")
    .upsert({
      id: player.id,
      player_name: player.name,
      best_score: bestScore
    });

  if (error) console.log("Best score was not saved:", error.message);
}

// Save each completed level score.
async function saveLevelScore(points) {
  if (!supabaseClient || !player) return;

  const { error } = await supabaseClient
    .from("game_scores")
    .insert({
      player_id: player.id,
      level_number: level,
      points: points
    });

  if (error) console.log("Score was not saved:", error.message);
}

// Load saved best score after login.
async function loadPlayerData() {
  if (!supabaseClient || !player) return;

  const { data, error } = await supabaseClient
    .from("players")
    .select("best_score")
    .eq("id", player.id)
    .maybeSingle();

  if (!error && data) {
    bestScore = data.best_score || 0;
    updateDisplay();
  }
}

// Create account using Supabase Authentication.
async function register() {
  if (!supabaseClient) {
    loginMessage.textContent = "Add your Supabase URL and key in supabase-config.js first.";
    return;
  }

  const name = playerNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!name || !email || password.length < 6) {
    loginMessage.textContent = "Enter your name, valid email and password (minimum 6 characters).";
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: { data: { player_name: name } }
  });

  if (error) {
    loginMessage.textContent = error.message;
    return;
  }

  if (data.session) {
    await openGame(data.user, name);
  } else {
    loginMessage.textContent = "Account created. Check your email to confirm, then log in.";
  }
}

// Log in an existing player.
async function login() {
  if (!supabaseClient) {
    loginMessage.textContent = "Add your Supabase URL and key in supabase-config.js first.";
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    loginMessage.textContent = error.message;
    return;
  }

  const name = data.user.user_metadata.player_name ||
               playerNameInput.value.trim() || "Player";
  await openGame(data.user, name);
}

// Show the game after successful login.
async function openGame(user, name) {
  player = { id: user.id, name: name };
  welcomeText.textContent = `Welcome, ${name}!`;
  loginScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  await loadPlayerData();
  startLevel();
}

// Log out the current player.
async function logout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  player = null;
  gameScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  loginMessage.textContent = "You have logged out.";
}

// Simple background music using the browser's Web Audio API.
function toggleMusic() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? "Music: ON" : "Music: OFF";

  if (musicOn) {
    playTone(330, 0.25);
    musicTimer = setInterval(() => playTone(440, 0.25), 700);
  } else {
    clearInterval(musicTimer);
  }
}

let musicTimer = null;

function playTone(frequency, duration) {
  if (!audioContext || !musicOn) return;

  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();

  oscillator.frequency.value = frequency;
  oscillator.connect(volume);
  volume.connect(audioContext.destination);
  volume.gain.setValueAtTime(0.04, audioContext.currentTime);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function playWinSound() {
  if (!audioContext) return;
  const wasMusicOn = musicOn;
  musicOn = true;
  playTone(660, 0.15);
  setTimeout(() => playTone(880, 0.2), 180);
  musicOn = wasMusicOn;
}

// Button events.
document.getElementById("registerBtn").addEventListener("click", register);
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("logoutBtn").addEventListener("click", logout);
guessBtn.addEventListener("click", checkGuess);
document.getElementById("restartBtn").addEventListener("click", startLevel);
nextBtn.addEventListener("click", () => {
  level++;
  startLevel();
});
musicBtn.addEventListener("click", toggleMusic);

// Press Enter to submit a guess.
guessInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") checkGuess();
});
