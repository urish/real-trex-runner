/**
 * Real Life Lonely T-Rex Game Firmware
 * 
 * Copyright (C) 2017, Uri Shaked
 */

SERVO_PIN = D12;
MOTOR_DIR = D0;
MOTOR_STEP = D1;
MOTOR_ENA = D2;
BUTTON_PIN = D11;
HALL_SENSOR_PIN = D23;
DFPLAYER_PIN = D30;

SOUND_JUMP = 1;
SOUND_LEVELUP = 2;
SOUND_GAMEOVER = 3;

DEFAULT_SPEED = 8000;

DEVICE_NAME = 't-rex';

const servo = require('servo').connect(SERVO_PIN);
const assets = require('./assets');
const display = require('./display');
const sound = require('./sound');

let playing = false;
let jumping = false;
let score = 0;

let currentSpeed = 0;
function stopMotors() {
  currentSpeed = 0;
  digitalWrite(MOTOR_ENA, 0);
  digitalWrite(MOTOR_STEP, 0);
}

function startMotors() {
  currentSpeed = 0;
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
    analogWrite(MOTOR_STEP, 0.5, { freq: currentSpeed });
    if (currentSpeed === speed) {
      removeTimer();
    }
  }, 10);
}

function displayScore() {
  let ypos = 0;
  let num = score;
  if (num === 0) {
    display.writeChar(assets.digits[0], 24, 19, 0);    
  }
  while (num > 0) {
    const digit = num % 10;
    num = Math.floor(num / 10);
    display.writeChar(assets.digits[digit], 24, 19, ypos);
    ypos += 24;
  }
  return display.displayFrame();
}

function displayGameOver() {
  let ypos = 240;
  let str = 'GAME';
  for (let i = 0; i < str.length; i++) {
    display.writeChar(assets.letters[str[i]], 24, 21, ypos - i * 30, 24);
  }

  str = 'OVER';
  for (let i = 0; i < str.length; i++) {
    display.writeChar(assets.letters[str[i]], 24, 21, ypos - i * 30, 64);
  }
  return display.displayFrame();
}

function jump() {
  sound.playSound(SOUND_JUMP, 30);
  jumping = true;
  servo.move(0.55, 1700);
  setTimeout(() => jumping = false, 1700);
}

function startGame() {
  startMotors();
  display.fillMemory(0xff);
  display.displayFrame().then(() => {
    display.fillMemory(0xff);
    return displayScore();
  });
  score = 0;
  playing = true;
  jumping = false;
}

function endGame() {
  playing = false;
  stopMotors();
}

function onClick() {
  if (playing) {
    jump();
  } else {
    startGame();
  }
}

function onCactus(e) {
  if (jumping) {
    score++;
    displayScore();
  } else if (playing) {
    sound.playSound(SOUND_GAMEOVER, 30);
    endGame();
    displayGameOver();
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

  // Servo
  servo.move(0.55, 300);

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
  setWatch(onCactus, HALL_SENSOR_PIN, { repeat: true, edge: 'rising' });
}

global.onInit = onInit;
