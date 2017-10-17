JUMP_DIR = D8;
JUMP_ENA = D12;
JUMP_STEP = D13;

UP = 1;
DOWN = 0;

function jump() {
  digitalWrite(JUMP_DIR, UP);
  digitalWrite(JUMP_ENA, 1);
  for (i = 0; i < 20; i++) {
    setTimeout(((i) => () => analogWrite(JUMP_STEP, 0.5, { freq: 5000 + i * 1000 }))(i), i * 5);
  }
  setTimeout(() => digitalWrite(JUMP_ENA, 0), 180);
}

function goDown() {
  analogWrite(JUMP_STEP, 0.5, { freq: 5000 });
  digitalWrite(JUMP_DIR, DOWN);
  digitalWrite(JUMP_ENA, 1);
  setTimeout(() => digitalWrite(JUMP_ENA, 0), 180);
}

function init() {
  digitalWrite(JUMP_ENA, 0);
  digitalWrite(JUMP_STEP, 0);
  digitalWrite(JUMP_DIR, 0);
}

module.exports = {
  jump: jump,
  goDown: goDown,
  init: init
};
