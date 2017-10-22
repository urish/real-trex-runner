const flash = require('Flash');
const base = flash.getFree()[0].addr;

let index = 0;
let value;

function init() {
  let flashData = E.memoryArea(base, 256);
  for (index = 0; flashData[index] != '\xff' && index < flashData.length; index += 2);
  if (!index) {
    value = 0;
  } else {
    value = (flashData.charCodeAt(index-2) << 8) | flashData.charCodeAt(index - 1);
  }
}

function get() {
  return value;
}

function set(newValue) {
  if (index === 256) {
    flash.erasePage(base);
    index = 0;
  }
  let target = base + (index & ~0x3);
  let buf = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
  newValue &= 0x7fff;
  buf[(index & 0x2)] = newValue >> 8;
  buf[(index & 0x2) + 1] = newValue & 0xff;
  flash.write(buf, target);
  index += 2;
  value = newValue;
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
