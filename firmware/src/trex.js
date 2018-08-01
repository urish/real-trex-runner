/**
 * Real Life Lonely T-Rex Game Firmware
 * 
 * Copyright (C) 2017, Uri Shaked
 */

MOTOR_DIR = D0;
MOTOR_STEP = D1;
MOTOR_ENA = D2;
POT_VCC_PIN = D3;
POT_PIN = D4;
POT_GND_PIN = D5;
BUTTON_PIN = D11;
HALL_SENSOR_PIN = D23;
DFPLAYER_PIN = D30;
I2C_SCL = D24;
I2C_SDA = D25;

SOUND_JUMP = 1;
SOUND_LEVELUP = 2;
SOUND_GAMEOVER = 3;

MIN_SPEED = 2000;
MAX_SPEED = 28000;
DEFAULT_SPEED = 14000;

DEVICE_NAME = 't-rex';

const assets = require('./assets');
const button = require('./button');
const clock = require('./clock');
const display = require('./display');
const highscore = require('./highscore');
const jump = require('./jump');
const rtcDate = require('./rtcDate');
const sound = require('./sound');

let playing = false;
let startTime = null;
let jumping = false;
let gameOverTimer = null;
let score = 0;
let gameIndex = 0;
let gameDuration = 0;

let currentSpeed = 0;
function stopMotors() {
  currentSpeed = 0;
  digitalWrite(MOTOR_ENA, 0);
  digitalWrite(MOTOR_STEP, 0);
}

function startMotors() {
  currentSpeed = 2000;
  setSpeed(DEFAULT_SPEED);
  digitalWrite(MOTOR_ENA, 1);
}

let speedTimer = null;
function setSpeed(speed) {
  const delta = 50;
  function removeTimer() {
    try {
      clearInterval(speedTimer);      
    } catch (e) {
    }
    speedTimer = null;
  }
  if (speedTimer) {
    removeTimer();
  }
  speedTimer = setInterval(() => {
    if (currentSpeed > speed) {
      currentSpeed = Math.max(speed, currentSpeed - delta);
    } else {
      currentSpeed = Math.min(speed, currentSpeed + delta);
    }
    analogWrite(MOTOR_STEP, 0.5, { freq: currentSpeed, soft: true });
    if (currentSpeed === speed) {
      removeTimer();
    }
  }, 10);
}

let sensorWatcher = null;
function startSensor() {
  if (sensorWatcher == null) {
    sensorWatcher = setWatch(onCactus, HALL_SENSOR_PIN, { edge: 'rising', repeat: true });
  }
}

function stopSensor() {
  if (sensorWatcher != null) {
    clearWatch(sensorWatcher);
    sensorWatcher = null;
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
    // TODO support long jump?
    return;
  }
  sound.playSound(SOUND_JUMP, 30);
  jumping = true;
  jump.jump();
  setTimeout(() => {
    jump.goDown()
    jumping = false;
  }, 1500);
}

function startGame() {
  clock.stop();
  jump.goDown()
  startMotors();
  if (gameOverTimer) {
    clearInterval(gameOverTimer);
    gameOverTimer = null;
  }
  display.registerUpdate(() => {
    display.clsw().then(() => {
      display.registerUpdate(displayScore);
      startSensor();
    });  
  });
  score = 0;
  playing = true;
  jumping = false;
  startTime = getTime();
  lastCactusTime = 0;
  gameIndex++;
}

function endGame() {
  playing = false;
  gameDuration = getTime() - startTime;
  stopSensor();
  stopMotors();
  advertise();
  clock.start();
}

function onClick() {
  if (playing) {
    doJump();
  } else {
    startGame();
  }
}

let lastCactusTime = getTime();
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
      jump.jump();
      display.registerUpdate(displayGameLogo);
      gameOverTimer = null;
    }, 3000);
  }
}

function advertise() {
  let advDataArray = new Uint8Array(12);
  let advData = new DataView(advDataArray.buffer);
  advData.setUint16(0, 0xfefe); // Service id
  advData.setUint16(2, highscore.get());
  advData.setUint16(4, gameIndex);
  advData.setFloat32(6, gameDuration);
  advData.setUint16(10, score);

  const eirEntry = (type, data) => [data.length + 1, type].concat(data);
  NRF.setAdvertising([].concat(
    eirEntry(0x3, [0xfe, 0xfe]),
    eirEntry(0x9, DEVICE_NAME),
    eirEntry(0x16, Array.apply(null, advDataArray))
  ), { name: DEVICE_NAME });
}

function onInit() {
  gameIndex = 0;
  advertise();

  // Read current time from RTC
  try {
    I2C1.setup({ scl: D24, sda: D25 });
    rtcDate.updateSystemClock(I2C1);
  } catch (e) {
    // We may get here if no RTC module is connected; continue anyway
  }

  // Serial for DFPlayer Mini
  sound.init(DFPLAYER_PIN);
  setTimeout(() => sound.playSound(SOUND_LEVELUP, 16), 2000);

  // Set up motor
  stopMotors();
  setSpeed(DEFAULT_SPEED);
  digitalWrite(MOTOR_DIR, 1);

  // Button
  pinMode(BUTTON_PIN, 'input_pullup');
  setWatch(onClick, BUTTON_PIN, { edge: 'falling', repeat: true, debounce: 10 });
  button.init(onClick);
  jump.init();

  highscore.init();

  // Display
  display.start();
  display.initModule(display.LUT_PARTIAL_UPDATE)
    .then(() => display.clsw())
    .then(displayGameLogo);

  // Potentiometer
  digitalWrite(POT_VCC_PIN, 1);
  digitalWrite(POT_GND_PIN, 0);
  pinMode(POT_PIN, 'analog');
  /*setInterval(() => {
    const newSpeed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * analogRead(POT_PIN);
    if (Math.abs(newSpeed - currentSpeed) > 100) {
      setSpeed(newSpeed);
    }
  }, 100);*/
}

global.onInit = onInit;
