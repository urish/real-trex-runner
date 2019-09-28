const noble = require('@abandonware/noble');

const buttonService = 'feff';
const buttonCharacteristic = 'fe01';
const ledCharacteristic = 'fe02';
const buttonName = 't-rex-btn';

function init(clickListener, connectionListener = () => 0) {
  noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
      console.log('Scanning...');
      noble.startScanning([buttonService]);
    } else {
      noble.stopScanning();
    }
  });

  noble.on('discover', (peripheral) => {
    if (peripheral.advertisement.localName === buttonName) {
      peripheral.connect(error => {
        if (error) {
          console.error(error);
          return;
        }

        console.log('Connected to', peripheral.id);

        peripheral.discoverSomeServicesAndCharacteristics(
          [buttonService],
          [buttonCharacteristic, ledCharacteristic],
          onServicesAndCharacteristicsDiscovered
        );
      });

      function onServicesAndCharacteristicsDiscovered(error, services, [buttonNotifications, ledState]) {
        if (error) {
          console.error(error);
          peripheral.disconnect();
          return;
        }

        connectionListener(true);

        ledState.write(Buffer.from([1]));
        setTimeout(() => {
          ledState.write(Buffer.from([0]));
        }, 500);

        // data callback receives notifications
        buttonNotifications.on('data', (buf) => {
          const pressed = buf[0] === 1;
          if (pressed) {
            clickListener(pressed);
          }
        });

        // subscribe to be notified whenever the peripheral update the characteristic
        buttonNotifications.subscribe(error => {
          if (error) {
            console.error('Error subscribing to echoCharacteristic');
            peripheral.disconnect();
          } else {
            console.log('Subscribed for echoCharacteristic notifications');
          }
        });
      }

      peripheral.once('disconnect', () => {
        console.log('disconnected');
        connectionListener(false);
        noble.startScanning([buttonService]);
      });
    }
  });
}

module.exports = {
  init
};