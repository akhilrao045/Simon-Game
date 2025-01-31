
var buttonColours = ["red", "blue", "green", "yellow"];

var gamePattern = [];
var userClickedPattern = [];

var started = false;
var level = 0;

$(document).keypress(function() {
  if (!started) {
    $("#level-title").text("Level " + level);
    nextSequence();
    started = true;
  }
});

$(".btn").click(function() {

  var userChosenColour = $(this).attr("id");
  userClickedPattern.push(userChosenColour);

  playSound(userChosenColour);
  animatePress(userChosenColour);

  checkAnswer(userClickedPattern.length-1);
});

function checkAnswer(currentLevel) {

    if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
      if (userClickedPattern.length === gamePattern.length){
        setTimeout(function () {
          nextSequence();
        }, 1000);
      }
    } else {
      playSound("wrong");
      $("body").addClass("game-over");
      $("#level-title").text("Game Over, Press Any Key to Restart");

      setTimeout(function () {
        $("body").removeClass("game-over");
      }, 200);

      startOver();
    }
}


function nextSequence() {
  userClickedPattern = [];
  level++;
  $("#level-title").text("Level " + level);
  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  $("#" + randomChosenColour).fadeIn(100).fadeOut(100).fadeIn(100);
  playSound(randomChosenColour);
}

function animatePress(currentColor) {
  $("#" + currentColor).addClass("pressed");
  setTimeout(function () {
    $("#" + currentColor).removeClass("pressed");
  }, 100);
}

function playSound(name) {
  var audio = new Audio("sounds/" + name + ".mp3");
  audio.play();
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
}
// Modify the gameOver function
function gameOver() {
  playErrorSound();
  $('#final-score').text(level - 1);
  $('#game-over').removeClass('hidden');
  $('#restart-btn').removeClass('hidden');
  $('#start-btn').addClass('hidden');
  $('.container').addClass('blur');
  resetGame();
}

// Update restart button handler
$('#restart-btn').click(function() {
  $('#game-over').addClass('hidden');
  $('.container').removeClass('blur');
  $('#restart-btn').addClass('hidden');
  $('#start-btn').removeClass('hidden');
  resetGame();
  nextSequence();
});

// Update start button handler
$('#start-btn').click(function() {
  if (gamePattern.length === 0) {
    $('#start-btn').addClass('hidden');
    $('#restart-btn').removeClass('hidden');
    nextSequence();
  }
});

// Add these unique features
const SPECIAL_FEATURES = {
  chaosMode: false,
  timeAttack: false,
  mirrorMode: false,
  activePowerups: [],
  
  toggleChaosMode() {
    this.chaosMode = !this.chaosMode;
    $('body').toggleClass('chaos', this.chaosMode);
    $('#chaos-mode').toggleClass('active', this.chaosMode);
  },
  
  activatePowerup(type) {
    this.activePowerups.push(type);
    $(`#${type}`).fadeTo(200, 1);
    setTimeout(() => this.deactivatePowerup(type), 10000);
  },
  
  deactivatePowerup(type) {
    this.activePowerups = this.activePowerups.filter(t => t !== type);
    $(`#${type}`).fadeTo(200, 0.3);
  }
};

// Add to checkAnswer()
if(Math.random() < 0.2) { // 20% chance for powerup
  const powerup = Math.random() < 0.5 ? 'freeze' : 'double-points';
  SPECIAL_FEATURES.activatePowerup(powerup);
}

// New game modes
$('#chaos-mode').click(() => SPECIAL_FEATURES.toggleChaosMode());
$('#mirror-mode').click(() => SPECIAL_FEATURES.mirrorMode = !SPECIAL_FEATURES.mirrorMode);

// Modified nextSequence()
if(SPECIAL_FEATURES.chaosMode) {
  gamePattern.push(...Array(3).fill().map(() => colors[Math.floor(Math.random() * 4)]));
}

if(SPECIAL_FEATURES.mirrorMode) {
  gamePattern = gamePattern.reverse();
}

// Time Attack implementation
let timeLeft = 30;
const timer = setInterval(() => {
  if(SPECIAL_FEATURES.timeAttack) {
    timeLeft--;
    $('#timer').text(timeLeft);
    if(timeLeft <= 0) gameOver();
  }
}, 1000);

// Update JavaScript
let currentPlayer = 1;
let playerScores = {1: 0, 2: 0};
let playerLives = {1: 3, 2: 3};
const WIN_SCORE = 5;

function updateScores() {
  $(`#player1 .score`).text(playerScores[1]);
  $(`#player2 .score`).text(playerScores[2]);
  $(`#player1 .lives`).html('❤️'.repeat(playerLives[1]));
  $(`#player2 .lives`).html('❤️'.repeat(playerLives[2]));
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  $('.player-box').removeClass('active');
  $(`#player${currentPlayer}`).addClass('active');
}

function checkWin() {
  if(playerScores[1] >= WIN_SCORE) {
    showWinner(1);
    return true;
  }
  if(playerScores[2] >= WIN_SCORE) {
    showWinner(2);
    return true;
  }
  return false;
}

function showWinner(playerNumber) {
  $('#winner-message').text(`Player ${playerNumber} Wins! 🎉`).fadeIn();
  setTimeout(resetGame, 3000);
}

function handleWrongAnswer() {
  playerLives[currentPlayer]--;
  updateScores();
  
  if(playerLives[currentPlayer] <= 0) {
    $(`#player${currentPlayer} .lives`).html('💀');
    if(checkWin()) return;
    setTimeout(() => {
      playerLives[currentPlayer] = 3;
      switchPlayer();
      nextSequence();
    }, 2000);
  } else {
    animateSequence(0);
  }
}

// Modify checkAnswer function
function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      playerScores[currentPlayer]++;
      updateScores();
      if(checkWin()) return;
      disableButtons();
      setTimeout(() => {
        switchPlayer();
        nextSequence();
      }, 1000);
    }
  } else {
    handleWrongAnswer();
  }
}

// Add reset function
function resetGame() {
  gamePattern = [];
  level = 0;
  playerScores = {1: 0, 2: 0};
  playerLives = {1: 3, 2: 3};
  currentPlayer = 1;
  $('#winner-message').fadeOut();
  $('.player-box').removeClass('active');
  $('#player1').addClass('active');
  updateScores();
}
