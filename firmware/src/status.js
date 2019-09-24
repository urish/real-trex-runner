const { Gpio } = require('onoff');

const ledPin = new Gpio(4, 'out');

// LED is low-active
const ON = 0;
const OFF = 1;

const Status = {
  off: 0,
  on: 1,
  blinkSlow: 2,
  blinkFast: 3,
}

let timer = null;

let lastValue = OFF;
function toggleLed() {
  lastValue = 1 - lastValue;
  ledPin.writeSync(lastValue);
}

function setStatus(value) {
  if (timer != null) {
    clearTimeout(timer);
    timer = null;
  }
  lastValue = OFF;

  switch (value) {
    case Status.off: 
      ledPin.writeSync(OFF);
      break;

    case Status.on: 
      ledPin.writeSync(ON);
      break;

    case Status.blinkFast:
      toggleLed();
      timer = setInterval(toggleLed, 100);
      break;

    case Status.blinkSlow:
      toggleLed();
      timer = setInterval(toggleLed, 500);
      break;
  }
}

module.exports = {
  Status,
  setStatus,
}
