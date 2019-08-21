const Storage = require("Storage");
const filename = "high.txt";

let value;

function init() {
  const data = Storage.read(filename);
  value = data ? parseInt(data) : 0;
}

function get() {
  return value;
}

function set(newValue) {
  value = newValue;
  Storage.write(filename, value.toString());
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
