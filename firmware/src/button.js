const INDICATION_PIN = D7;
let onClick = null;

function connectButton() {
  NRF.requestDevice({ filters: [{ name: 't-rex-btn' }] })
    .then(device => device.gatt.connect())
    .then(gatt => gatt.getPrimaryService('feff'))
    .then(service => service.getCharacteristic('fe01'))
    .then(char => {
      char.startNotifications();
      digitalWrite(INDICATION_PIN, 0);
      // TODO implement reconnect
      char.on('characteristicvaluechanged', e => {
        const state = e.target.value.buffer[0];
        if (state === 1 && onClick) {
          onClick();
        }
      });
    });
}

function init(clickHandler) {
  onClick = clickHandler;
  digitalWrite(INDICATION_PIN, 1);
  setTimeout(connectButton, 1000);
}

module.exports = {
  init: init
};