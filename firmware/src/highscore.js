const fs = require('fs');
const filename = 'high.txt';

let value;

function init() {
  const data = fs.readFileSync(filename);
  value = data ? parseInt(data) : 0;
}

function get() {
  return value;
}

function set(newValue) {
  value = newValue;
  fs.writeFileSync(filename, value.toString());
}

function update(score) {
  if (score > get()) {
    set(score);
  }
}

module.exports = {
  init,
  get,
  set,
  update
};
