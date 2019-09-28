const { ready, gpio } = require('./pigpio');

async function init(onSense) {
  await ready;
  const magSense = gpio(7);
  await magSense.modeSet('input');
  magSense.notify((level, tick) => {
    if (level) {
      onSense({ time: tick });
    }
  });
}

module.exports = {
  init
};
