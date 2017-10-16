/**
 * Real Life Lonely T-Rex Game - Pushbutton Firmware
 * 
 * Copyright (C) 2017, Uri Shaked
 */

const BUTTON_PIN = D2;
const LED_PIN = D11;
DEVICE_NAME = 't-rex-btn';

function onClick(e) {
  const value = e.state ? 0 : 1;
  digitalWrite(LED_PIN, value);
  NRF.updateServices({
    0xfeff: {
      0xfe01: {
        value: [value],
        notify: true
      },
    },
  });
}

function onInit() {
  const eirEntry = (type, data) => [data.length + 1, type].concat(data);
  NRF.setAdvertising([].concat(
    eirEntry(0x3, [0xff, 0xfe]),
    eirEntry(0x9, DEVICE_NAME)
  ), { name: DEVICE_NAME });

  // LED
  digitalWrite(LED_PIN, true);
  setTimeout(() => digitalWrite(LED_PIN, false), 500);
  
  // Button
  pinMode(BUTTON_PIN, 'input_pullup');
  setWatch(onClick, BUTTON_PIN, { edge: 'both', repeat: true, debounce: 10 });

  // Bluetooth
  NRF.setServices({
    0xfeff: {
      0xfe01: {
        readable: true, notify: true, value: [0]
      },
    }
  });
}
