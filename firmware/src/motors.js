const { gpio, ready } = require('./pigpio');

const motorEnable = gpio(27);
const motorDirection = gpio(22);
const motorStep = gpio(23);

const DEFAULT_SPEED = 1200;

async function frequencyWaveform(pin, freq) {
  const delay = Math.round(1e6 / 2 / freq);
  await pin.waveClear();
  await pin.waveAddPulse([[1, 0, delay], [0, 1, delay]]);
  const wave = await motorStep.waveCreate();
  await pin.waveChainTx([{ loop: true }, { waves: [wave] }, { repeat: true }]);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let speedTimer = null;
async function setSpeed(speed) {
  const delta = 20;
  if (speedTimer) {
    clearInterval(speedTimer);
    speedTimer = null;
  }
  while (currentSpeed !== speed) {
    if (currentSpeed > speed) {
      currentSpeed = Math.max(speed, currentSpeed - delta);
    } else {
      currentSpeed = Math.min(speed, currentSpeed + delta);
    }
    await frequencyWaveform(motorStep, currentSpeed);
    await delay(10);
  }
}

async function stop() {
  currentSpeed = 0;
  await motorEnable.write(0);
  await motorStep.write(0);
}

async function start() {
  currentSpeed = 200;
  await setSpeed(DEFAULT_SPEED);
  await motorEnable.write(1);
}

async function init() {
  await ready;
  await motorDirection.modeSet('output');
  await motorStep.modeSet('output');
  await motorEnable.modeSet('output')
  await motorDirection.write(1);
  await stop();
}

module.exports = {
  init,
  start,
  stop,
  setSpeed
};
