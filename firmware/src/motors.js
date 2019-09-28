const { gpio, ready } = require('./pigpio');

const MOTOR_SPEED_HZ = 600;
const MOTOR_DELAY = Math.round(1e6 / 2 / MOTOR_SPEED_HZ);

const JUMP_UP = 0;
const JUMP_DOWN = 1;

const JUMP_UP_STEPS = 500;
const JUMP_DOWN_STEPS = 480;

const rails = {
  enable: null,
  direction: null,
  step: null,
  stepHigh: null,
  stepLow: null
};

const jump = {
  enable: null,
  direction: null,
  step: null,
  stepHigh: null,
  stepLow: null
};

let railsDelayWave = null;

/**
 * Sends step pulses to the motors. We always send these pulses to the rails motors, even if
 * it is disabled (thus will the step pulses will be ignored), in order to simplify the code.
 *
 * @param {number} jumpSteps Amount of steps to move the jump motor
 */
async function sendMotorWaves(jumpSteps = null) {
  const sequence = [];
  if (jumpSteps) {
    sequence.push(
      ...[
        { loop: true },
        { waves: [rails.stepHigh, jump.stepHigh] },
        { delay: MOTOR_DELAY },
        { waves: [rails.stepLow, jump.stepLow] },
        { delay: MOTOR_DELAY },
        { repeat: jumpSteps }
      ]
    );
  }

  sequence.push(
    ...[
      { loop: true },
      { waves: [rails.stepHigh, railsDelayWave, rails.stepLow, railsDelayWave] },
      { repeat: true }
    ]
  );
  await rails.step.waveChainTx(sequence);
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJump() {
  while ((await jump.step.waveTxAt()) !== railsDelayWave) {
    await wait(1);
  }
}

async function trexUp() {
  await jump.direction.write(JUMP_UP);
  await jump.enable.write(1);
  await sendMotorWaves(JUMP_UP_STEPS);
  await waitForJump();
  await jump.enable.write(0);
}

async function trexDown() {
  await jump.direction.write(JUMP_DOWN);
  await jump.enable.write(1);
  await sendMotorWaves(JUMP_DOWN_STEPS);
  await waitForJump();
  await jump.enable.write(0);
}

async function stopRails() {
  railsRunning = false;
  await rails.enable.write(0);
}

async function startRails() {
  railsRunning = true;
  await rails.direction.write(0);
  await rails.enable.write(1);
  await sendMotorWaves();
}

async function init() {
  await ready;

  rails.enable = gpio(27);
  rails.direction = gpio(22);
  rails.step = gpio(23);
  jump.enable = gpio(6);
  jump.direction = gpio(5);
  jump.step = gpio(12);

  await rails.step.waveClear();

  for (let motor of [rails, jump]) {
    await motor.enable.modeSet('output');
    await motor.step.modeSet('output');
    await motor.direction.modeSet('output');

    // Create waveforms
    await motor.step.waveAddPulse([[1, 0, 0]]);
    motor.stepHigh = await motor.step.waveCreate();
    await motor.step.waveAddPulse([[0, 1, 0]]);
    motor.stepLow = await motor.step.waveCreate();
  }

  await jump.enable.write(0);
  await rails.enable.waveAddPulse([[0, 0, MOTOR_DELAY]]);
  railsDelayWave = await rails.enable.waveCreate();

  await stopRails();
}

module.exports = {
  init,
  startRails,
  stopRails,
  trexUp,
  trexDown
};
