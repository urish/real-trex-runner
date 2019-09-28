const noble = require('@abandonware/noble');

const buttonService = 'feff';
const buttonCharacteristic = 'fe01';
const ledCharacteristic = 'fe02';
const buttonName = 't-rex-btn';

function scanButton() {
  console.log('Scanning...');
  noble.startScanning([buttonService], true);
}

function init(clickListener, connectionListener = () => 0) {
  noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
      scanButton();
    } else {
      noble.stopScanning();
    }
  });

  noble.on('discover', (peripheral) => {
    if (peripheral.advertisement.localName === buttonName) {
      noble.stopScanning();
      peripheral.connect((error) => {
        if (error) {
          connectionListener(false);
          scanButton();
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

      function onServicesAndCharacteristicsDiscovered(
        error,
        services,
        [buttonNotifications, ledState]
      ) {
        if (error) {
          console.error(error);
          peripheral.disconnect();
          return;
        }

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
        buttonNotifications.subscribe((error) => {
          if (error) {
            console.error('Error subscribing to echoCharacteristic');
            peripheral.disconnect();
          } else {
            connectionListener(true);
            console.log('Subscribed for echoCharacteristic notifications');
          }
        });
      }

      peripheral.once('disconnect', () => {
        console.log('disconnected');
        // Clean noble's peripheral cache
        noble._peripherals = {};
        connectionListener(false);
        scanButton();
      });
    }
  });
}

module.exports = {
  init
};
