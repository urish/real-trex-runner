/**
 * Real Life Lonely T-Rex Game Firmware
 * 
 * Copyright (C) 2017, Uri Shaked
 */

SERVO_PIN = D12;
BUTTON_PIN = D4;
MOTOR_DIR = D0;
MOTOR_STEP = D1;
MOTOR_ENA = D2;
DFPLAYER_PIN = D30;

SOUND_JUMP = 1;
SOUND_LEVELUP = 2;
DEFAULT_SPEED = 8000;

let servo = require("servo").connect(SERVO_PIN);
let playing = false;

function setName(name) {
  const eirEntry = (type, data) => [data.length + 1, type].concat(data);
  NRF.setScanResponse([
    eirEntry(0x9, name),
    eirEntry(0x6, [0x9e, 0xca, 0xdc, 0x24, 0x0e, 0xe5, 0xa9, 0xe0, 0x93, 0xf3, 0xa3, 0xb5, 0x01, 0x00, 0x40, 0x6e])
  ]);
}

function playerCommand(cmd, arg1, arg2) {
  const data = [0x7e, 0xff, 0x6, cmd, 0, arg1, arg2, 0, 0, 0xef];
  const checksum = 0 - data[1] - data[2] - data[3] - data[4] - data[5] - data[6];
  data[7] = (checksum >> 8) & 0xff;
  data[8] = checksum & 0xff;
  Serial1.write(data);
}

function playSound(id, volume) {
  if (typeof volume !== 'undefined') {
    playerCommand(0x6, 0, volume);
  }
  setTimeout(() => playerCommand(0x12, 0, id), 20);
}

let currentSpeed = 0;
function stopMotors() {
  currentSpeed = 0;
  digitalWrite(MOTOR_ENA, 0);
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

function jump() {
  playSound(SOUND_JUMP, 30);
  servo.move(0.55, 4000);
}

function startGame() {
  startMotors();
  playing = true;
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

function onInit() {
  NRF.setAdvertising([0x03, 0x03, 0xFE, 0xFE], { name: "t-rex" });

  // Serial for DFPlayer Mini
  Serial1.setup(9600, { tx: DFPLAYER_PIN, rx: D29 });
  setTimeout(() => playSound(SOUND_LEVELUP, 16), 2000);

  // Set up motor
  stopMotors();
  setSpeed(DEFAULT_SPEED);
  digitalWrite(MOTOR_DIR, 1);

  // Button
  pinMode(BUTTON_PIN, 'input_pullup');
  setWatch(onClick, BUTTON_PIN, { edge: 'falling', repeat: true, debounce: 200 });

  // Servo
  servo.move(0.95, 300);

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
}
