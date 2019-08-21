const INDICATION_PIN = D7;
let onClick = null;
let connected = false;

function onDisconnect() {
  connected = false;
  digitalWrite(INDICATION_PIN, 1);
}

function connectButton() {
  if (connected) {
    return;
  }

  connected = true;
  NRF.requestDevice({ filters: [{ name: 't-rex-btn' }] })
    .then(device => {
      device.on('gattserverdisconnected', onDisconnect);
      return device.gatt.connect();
    })
    .then(gatt => gatt.getPrimaryService('feff'))
    .then(service => service.getCharacteristic('fe01'))
    .then(char => {
      char.startNotifications();
      digitalWrite(INDICATION_PIN, 0);
      char.on('characteristicvaluechanged', e => {
        const state = e.target.value && e.target.value.buffer[0];
        if (state === 1 && onClick) {
          onClick();
        }
      });
    })
    .catch(onDisconnect);
}

function init(clickHandler) {
  onClick = clickHandler;
  digitalWrite(INDICATION_PIN, 1);
  setInterval(connectButton, 1000);
}

module.exports = {
  init
};