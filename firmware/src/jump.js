const AccurateStepper = require('./stepper');

JUMP_DIR = D8;
JUMP_ENA = D11;
JUMP_STEP = D13;

UP = 1;
DOWN = 0;

const stepper = new AccurateStepper(JUMP_STEP);

function jump() {
  digitalWrite(JUMP_DIR, UP);
  digitalWrite(JUMP_ENA, 1);
  stepper.start(8000, 4100);
  setTimeout(() => digitalWrite(JUMP_ENA, 0), 550);
}

function goDown() {
  digitalWrite(JUMP_DIR, DOWN);
  digitalWrite(JUMP_ENA, 1);
  stepper.start(10000, 3900);
  setTimeout(() => digitalWrite(JUMP_ENA, 0), 500);
}

function init() {
  digitalWrite(JUMP_ENA, 0);
  digitalWrite(JUMP_STEP, 0);
  digitalWrite(JUMP_DIR, 0);
}

module.exports = {
  jump,
  goDown,
  init
};
