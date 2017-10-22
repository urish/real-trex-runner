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

SOUND_JUMP = 1;
SOUND_LEVELUP = 2;
SOUND_GAMEOVER = 3;

MIN_SPEED = 2000;
MAX_SPEED = 28000;
DEFAULT_SPEED = 8000;

DEVICE_NAME = 't-rex';

const assets = require('./assets');
const button = require('./button');
const display = require('./display');
const highscore = require('./highscore');
const jump = require('./jump');
const sound = require('./sound');

let playing = false;
let startTime = null;
let jumping = false;
let score = 0;
let high = 0;

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
    clearInterval(speedTimer);
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

function displayScore() {
  const digitWidth = 48;

  let ypos = 48;
  let num = score;
  if (num === 0) {
    display.writeChar(assets[0], digitWidth, 19, ypos, 32);
  }
  while (num > 0) {
    const digit = num % 10;
    num = Math.floor(num / 10);
    display.writeChar(assets[digit], digitWidth, 19, ypos, 32);
    ypos += digitWidth;
  }
  return display.displayFrame();
}

function displayGameOver() {
  let ypos = 240;
  let str = 'GAME';
  for (let i = 0; i < str.length; i++) {
    display.writeChar(assets[str[i]], 24, 21, ypos - i * 30, 24);
  }

  str = 'OVER';
  for (let i = 0; i < str.length; i++) {
    display.writeChar(assets[str[i]], 24, 21, ypos - i * 30, 64);
  }
  return display.displayFrame();
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
  startMotors();
  display.fillMemory(0xff);
  display.displayFrame().then(() => {
    display.fillMemory(0xff);
    display.registerUpdate(displayScore);
  });
  score = 0;
  playing = true;
  jumping = false;
  startTime = getTime();
  lastCactusTime = 0;
}

function endGame() {
  playing = false;
  stopMotors();
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
  setTimeout(() =>
    setWatch(onCactus, HALL_SENSOR_PIN, { edge: 'rising' }), 1);
  if (startTime && (e.time - startTime) < 0.1) {
    return;
  }
  if (jumping) {
    if (e.time - lastCactusTime > 0.1) {
      score++;
      if (score % 10 === 0) {
        playSound(SOUND_LEVELUP);
      }
      highscore.update(score);
      display.registerUpdate(displayScore);
      lastCactusTime = e.time;
    }
  } else if (playing) {
    sound.playSound(SOUND_GAMEOVER, 30);
    endGame();
    display.registerUpdate(displayGameOver);
  }
}

function onInit() {
  const eirEntry = (type, data) => [data.length + 1, type].concat(data);
  NRF.setAdvertising([].concat(
    eirEntry(0x3, [0xfe, 0xfe]),
    eirEntry(0x9, DEVICE_NAME)
  ), { name: DEVICE_NAME });

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

  // Bluetooth
  NRF.setServices({
    0xfefe: {
      0xfe01: {
        writable: true,
        maxLen: 1,
        onWrite: evt => evt.data[0] ? startGame() : endGame(),
      },
      0xfe02: {
        maxLen: 1,
        writable: true,
        onWrite: jump
      },
      0xfe03: {
        maxLen: 2,
        writable: true,
        onWrite: evt => setSpeed(evt.data[0] | (evt.data[1] << 8))
      }
    }
  });

  highscore.init();

  // Display
  display.start();
  display.initModule(display.LUT_PARTIAL_UPDATE).then(() => {
    display.clsw().then(() => {
      display.writeChar(assets.trex, 40, 35, 100, 32);
      display.writeChar(assets.trex, 40, 35, 160, 64);
      display.displayFrame();
    });
  });

  // Magnetic Sensor
  setWatch(onCactus, HALL_SENSOR_PIN, { edge: 'rising' });

  // Potentiometer
  digitalWrite(POT_VCC_PIN, 1);
  digitalWrite(POT_GND_PIN, 0);
  pinMode(POT_PIN, 'analog');
  setInterval(() => {
    const newSpeed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * analogRead(POT_PIN);
    if (Math.abs(newSpeed - currentSpeed) > 100) {
      setSpeed(newSpeed);
    }
  }, 100);
}

global.onInit = onInit;
