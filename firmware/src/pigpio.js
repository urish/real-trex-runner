const hostname = 'localhost';

const pigpio = require('pigpio-client').pigpio({ host: hostname });
const promisify = require('util').promisify;

const ready = new Promise((resolve, reject) => {
  pigpio.once('connected', resolve);
  pigpio.once('error', reject);
  pigpio.on('disconnected', () => {
    setTimeout(() => pigpio.connect({ host: hostname }), 1000);
  });
});

function promisifyAll(obj) {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'function') {
      obj[key] = promisify(obj[key]).bind(obj);
    }
  }
  return obj;
}

function gpio(pin) {
  return promisifyAll(pigpio.gpio(pin));
}

module.exports = {
  ready, gpio
};