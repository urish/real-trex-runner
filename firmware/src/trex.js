/**
 * Real Life Lonely T-Rex Game Firmware
 * 
 * Copyright (C) 2017, 2018, 2019 Uri Shaked
 */

SOUND_JUMP = 1;
SOUND_LEVELUP = 2;
SOUND_GAMEOVER = 3;

const assets = require('./assets');
const button = require('./button');
const clock = require('./clock');
const display = require('./display');
const highscore = require('./highscore');
const motors = require('./motors');
const sensor = require('./sensor');
const sound = require('./sound');
const status = require('./status');

let playing = false;
let startTime = null;
let jumping = false;
let goingDown = false;
let pendingJump = false;
let buttonConnected = false;
let gameOverTimer = null;
let score = 0;
let gameIndex = 0;
let gameDuration = 0;

function updateStatus() {
  if (playing) {
    status.setStatus(status.Status.on);
    return;
  }
  if (buttonConnected) {
    status.setStatus(status.Status.blinkFast);
  } else {
    status.setStatus(status.Status.blinkSlow);    
  }
}

function displayString(s, x, y, charWidth, charHeight, spacing, prefix) {
  s.split('').forEach((c, i) =>
    display.writeChar(assets[(prefix || '') + c], charWidth, charHeight, y - i * (charHeight + spacing), x));
}

function displayScore() {
  displayString(score.toString(), 24, 220, 48, 38, 10);
  renderHighScore();
  return display.displayFrame();
}

function renderHighScore() {
  displayString('HI', 88, 240, 24, 21, 9);
  displayString(highscore.get().toString(), 88, 150, 24, 21, 9, 's');
}

function displayGameOver() {
  display.fillMemory(0xff);
  displayString(score.toString(), 24, 220, 48, 38, 10);
  displayString('GAME', 88, 252, 24, 21, 9);
  displayString('OVER', 88, 116, 24, 21, 9);
  return display.displayFrame();
}

function displayGameLogo() {
  display.fillMemory(0xff);
  display.writeChar(assets.trex, 40, 35, 100, 32);
  display.writeChar(assets.trex, 40, 35, 40, 64);
  renderHighScore();
  return display.displayFrame().then(() => {
    setTimeout(() => {
      if (!playing) {
        clock.start();
      }
    }, 4000);
  });
}

function doJump() {
  if (jumping) {
    if (goingDown) {
      pendingJump = true;
    }
    return;
  }
  sound.playSound(SOUND_JUMP, 30);
  jumping = true;
  motors.trexUp();
  setTimeout(() => {
    goingDown = true;
    motors.trexDown().then(() => {
      jumping = false;
      goingDown = false;
      if (pendingJump) {
        setTimeout(doJump, 10);
        pendingJump = false;
      }
    });
  }, 1500);
}

function startGame() {
  clock.stop();
  motors.trexDown()
  motors.startRails();
  if (gameOverTimer) {
    clearInterval(gameOverTimer);
    gameOverTimer = null;
  }
  display.registerUpdate(() => {
    display.clsw().then(() => {
      display.registerUpdate(displayScore);
    });  
  });
  score = 0;
  playing = true;
  jumping = false;
  goingDown = false;
  pendingJump = false;
  startTime = new Date().getTime();
  lastCactusTime = 0;
  gameIndex++;
  updateStatus();
}

function endGame() {
  playing = false;
  gameDuration = new Date().getTime() - startTime;
  motors.stopRails();
  updateStatus();
  clock.start();
}

function onClick() {
  if (playing) {
    doJump();
  } else {
    startGame();
  }
}

function onButtonConnectionChange(value) {
  buttonConnected = value;
  updateStatus();
}

let lastCactusTime = 0;
function onCactus(e) {
  if (startTime && (e.time - startTime) < 0.1) {
    return;
  }
  if (jumping) {
    if (e.time - lastCactusTime > 0.1) {
      score++;
      if (score % 10 === 0) {
        sound.playSound(SOUND_LEVELUP);
      }
      highscore.update(score);
      display.registerUpdate(displayScore);
      lastCactusTime = e.time;
    }
  } else if (playing) {
    endGame();
    sound.playSound(SOUND_GAMEOVER, 30);
    display.registerUpdate(displayGameOver);
    gameOverTimer = setTimeout(() => {
      motors.trexUp();
      display.registerUpdate(displayGameLogo);
      gameOverTimer = null;
    }, 3000);
  }
}

async function initGame() {
  gameIndex = 0;

  setTimeout(() => sound.playSound(SOUND_LEVELUP, 16), 2000);

  await motors.init();
  await sensor.init(onCactus);
  button.init(onClick, onButtonConnectionChange);
  highscore.init();

  // Display
  display.start();
  await display.initModule(display.LUT_PARTIAL_UPDATE);
  await display.clsw();
  await displayGameLogo();
}

module.exports = {
  initGame
};

if (typeof require !== 'undefined' && require.main === module) {
  initGame().catch(console.error);
}
