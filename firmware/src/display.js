// Copyright (C) 2017, Uri Shaked
// Loosely based on code samples provided by waveshare
// License: MIT

const DIN_PIN = 11;
const CLK_PIN = 12;
const CS_PIN = 13;
const DC_PIN = 14;
const RST_PIN = 15;
const BUSY_PIN = 16;

const EPD_WIDTH = 128;
const EPD_HEIGHT = 296;

const DRIVER_OUTPUT_CONTROL = 0x01;
const BOOSTER_SOFT_START_CONTROL = 0x0C;
const GATE_SCAN_START_POSITION = 0x0F;
const DEEP_SLEEP_MODE = 0x10;
const DATA_ENTRY_MODE_SETTING = 0x11;
const SW_RESET = 0x12;
const TEMPERATURE_SENSOR_CONTROL = 0x1A;
const MASTER_ACTIVATION = 0x20;
const DISPLAY_UPDATE_CONTROL_1 = 0x21;
const DISPLAY_UPDATE_CONTROL_2 = 0x22;
const WRITE_RAM = 0x24;
const WRITE_VCOM_REGISTER = 0x2C;
const WRITE_LUT_REGISTER = 0x32;
const SET_DUMMY_LINE_PERIOD = 0x3A;
const SET_GATE_TIME = 0x3B;
const BORDER_WAVEFORM_CONTROL = 0x3C;
const SET_RAM_X_ADDRESS_START_END_POSITION = 0x44;
const SET_RAM_Y_ADDRESS_START_END_POSITION = 0x45;
const SET_RAM_X_ADDRESS_COUNTER = 0x4E;
const SET_RAM_Y_ADDRESS_COUNTER = 0x4F;
const TERMINATE_FRAME_READ_WRITE = 0xFF;

const LUT_FULL_UPDATE = [
  0x02, 0x02, 0x01, 0x11, 0x12, 0x12, 0x22, 0x22,
  0x66, 0x69, 0x69, 0x59, 0x58, 0x99, 0x99, 0x88,
  0x00, 0x00, 0x00, 0x00, 0xF8, 0xB4, 0x13, 0x51,
  0x35, 0x51, 0x51, 0x19, 0x01, 0x00
];
const LUT_PARTIAL_UPDATE = [
  0x10, 0x18, 0x18, 0x08, 0x18, 0x18, 0x08, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x13, 0x14, 0x44, 0x12,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00
];

function start() {
  SPI1.setup({ mosi: DIN_PIN, sck: CLK_PIN, baud: 2000000 });
  pinMode(BUSY_PIN, 'input');
}

function sendCommand(cmd) {
  digitalWrite(DC_PIN, LOW);
  SPI1.send(cmd, CS_PIN);
}

function sendData(data) {
  digitalWrite(DC_PIN, HIGH);
  SPI1.send(data, CS_PIN);
}

function resetModule() {
  return new Promise(resolve => {
    digitalWrite(RST_PIN, LOW);
    setTimeout(() => {
      digitalWrite(RST_PIN, HIGH);
      setTimeout(resolve, 200);
    }, 200);
  });
}

function sendLut(lut) {
  sendCommand(WRITE_LUT_REGISTER);
  for (let i = 0; i < lut.length; i++) {
    sendData(lut[i]);
  }
}

function initModule(lut) {
  return resetModule().then(() => {
    sendCommand(DRIVER_OUTPUT_CONTROL);
    sendData((EPD_HEIGHT - 1) & 0xFF);
    sendData(((EPD_HEIGHT - 1) >> 8) & 0xFF);
    sendData(0x00);                     // GD = 0 SM = 0 TB = 0
    sendCommand(BOOSTER_SOFT_START_CONTROL);
    sendData(0xD7);
    sendData(0xD6);
    sendData(0x9D);
    sendCommand(WRITE_VCOM_REGISTER);
    sendData(0xA8);                     // VCOM 7C
    sendCommand(SET_DUMMY_LINE_PERIOD);
    sendData(0x1A);                     // 4 dummy lines per gate
    sendCommand(SET_GATE_TIME);
    sendData(0x08);                     // 2us per line
    sendCommand(DATA_ENTRY_MODE_SETTING);
    sendData(0x03);                     // X increment Y increment
    sendLut(lut);
  });
}

function waitReady() {
  while (digitalRead(BUSY_PIN));
}

function displayFrame() {
  sendCommand(DISPLAY_UPDATE_CONTROL_2);
  sendData(0xC4);
  sendCommand(MASTER_ACTIVATION);
  sendCommand(TERMINATE_FRAME_READ_WRITE);
  waitReady();
}

function setMemoryArea(x, y, xEnd, yEnd) {
  sendCommand(SET_RAM_X_ADDRESS_START_END_POSITION);
  sendData((x >> 3) & 0xFF);
  sendData((xEnd >> 3) & 0xFF);
  sendCommand(SET_RAM_Y_ADDRESS_START_END_POSITION);
  sendData(y & 0xFF);
  sendData((y >> 8) & 0xFF);
  sendData(yEnd & 0xFF);
  sendData((yEnd >> 8) & 0xFF);
}

function setMemoryPointer(x, y) {
  sendCommand(SET_RAM_X_ADDRESS_COUNTER);
  sendData((x >> 3) & 0xFF);
  sendCommand(SET_RAM_Y_ADDRESS_COUNTER);
  sendData(y & 0xFF);
  sendData((y >> 8) & 0xFF);
}

function fillMemory(value) {
  value = value || 0;
  setMemoryArea(0, 0, EPD_WIDTH - 1, EPD_HEIGHT - 1);
  setMemoryPointer(0, 0);
  sendCommand(WRITE_RAM);
  let buf = new Uint8Array(EPD_WIDTH / 8 * EPD_HEIGHT);
  buf.fill(value, 0, buf.length);
  sendData(buf);
}

function cls() {
  fillMemory(0);
  displayFrame();
  fillMemory(0xff);
  displayFrame();
}

function clsw() {
  fillMemory(0xff);
  displayFrame();
  fillMemory(0xff);
  displayFrame();
}

function writeChar(buf, w, h, offs, x) {
  if (offs < 106 && offs + h > 106) {
    const cutHeight = 106 - offs;
    writeChar(buf.slice(0, cutHeight * (w >> 3)), w, cutHeight, offs, x);
    writeChar(buf.slice(cutHeight * (w >> 3)), w, h - cutHeight, 106, x);
    return;
  }
  setMemoryArea(x || 0, offs || 0, (w + x - 8) || 16, h || 16);
  setMemoryPointer(x || 0, offs || 0);
  sendCommand(WRITE_RAM);
  sendData(buf);
}

// 24x19
const zero = new Uint8Array([255, 0, 127, 255, 0, 127, 248, 0, 15, 248, 0, 15, 248, 0, 15, 199, 255, 129, 199, 255, 129, 199, 255, 129, 199, 255, 241, 199, 255, 241, 192, 255, 241, 192, 255, 241, 192, 0, 1, 248, 0, 15, 248, 0, 15, 255, 0, 127, 255, 0, 127, 255, 0, 127, 255, 255, 255]);
const one = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 241, 255, 255, 241, 255, 255, 241, 255, 255, 241, 255, 255, 241, 192, 0, 1, 192, 0, 1, 192, 0, 1, 192, 0, 1, 192, 0, 1, 192, 0, 1, 248, 255, 241, 248, 255, 241, 255, 255, 241, 255, 255, 241, 255, 255, 241, 255, 255, 255]);
const two = new Uint8Array([255, 255, 255, 248, 31, 241, 248, 31, 241, 248, 31, 241, 192, 3, 241, 192, 3, 241, 192, 0, 113, 199, 0, 113, 199, 0, 113, 199, 224, 113, 199, 224, 113, 199, 224, 1, 199, 224, 1, 199, 224, 1, 192, 252, 1, 192, 252, 1, 192, 252, 1, 248, 255, 129, 248, 255, 129]);
const three = new Uint8Array([255, 255, 255, 199, 252, 15, 199, 252, 15, 199, 252, 15, 192, 224, 1, 192, 224, 1, 192, 0, 1, 192, 3, 241, 192, 3, 241, 199, 3, 241, 199, 3, 241, 199, 3, 241, 199, 227, 241, 199, 227, 241, 199, 255, 129, 199, 255, 129, 199, 255, 129, 255, 255, 143, 255, 255, 143]);
const four = new Uint8Array([255, 255, 255, 255, 252, 127, 255, 252, 127, 255, 252, 127, 192, 0, 1, 192, 0, 1, 192, 0, 1, 192, 0, 1, 192, 0, 1, 192, 252, 127, 192, 252, 127, 192, 28, 127, 248, 28, 127, 248, 28, 127, 255, 0, 127, 255, 0, 127, 255, 0, 127, 255, 224, 127, 255, 224, 127]);
const five = new Uint8Array([255, 255, 255, 255, 224, 15, 255, 224, 15, 255, 224, 15, 199, 0, 1, 199, 0, 1, 199, 0, 1, 199, 31, 241, 199, 31, 241, 199, 31, 241, 199, 31, 241, 199, 31, 241, 199, 31, 241, 199, 31, 241, 192, 31, 129, 192, 31, 129, 192, 31, 129, 192, 31, 143, 192, 31, 143]);
const six = new Uint8Array([255, 255, 255, 255, 252, 15, 255, 252, 15, 255, 252, 15, 199, 224, 1, 199, 224, 1, 199, 224, 1, 199, 227, 241, 199, 227, 241, 199, 227, 241, 199, 227, 241, 192, 227, 241, 192, 227, 241, 192, 227, 241, 248, 0, 1, 248, 0, 1, 248, 0, 1, 255, 0, 15, 255, 0, 15]);
const seven = new Uint8Array([255, 255, 255, 192, 255, 255, 192, 255, 255, 192, 255, 255, 192, 31, 255, 192, 31, 255, 192, 3, 255, 199, 3, 255, 199, 3, 255, 199, 224, 1, 199, 224, 1, 199, 224, 1, 199, 252, 1, 199, 252, 1, 192, 255, 255, 192, 255, 255, 192, 255, 255, 192, 255, 255, 192, 255, 255]);
const eight = new Uint8Array([255, 255, 255, 255, 252, 15, 255, 252, 15, 255, 252, 15, 248, 28, 1, 248, 28, 1, 192, 0, 1, 199, 224, 113, 199, 224, 113, 199, 224, 113, 199, 224, 113, 199, 0, 113, 199, 3, 241, 199, 3, 241, 192, 3, 241, 192, 3, 241, 192, 0, 1, 248, 28, 15, 248, 28, 15]);
const nine = new Uint8Array([255, 255, 255, 248, 0, 127, 248, 0, 127, 248, 0, 127, 192, 0, 15, 192, 0, 15, 192, 0, 1, 199, 227, 129, 199, 227, 129, 199, 227, 241, 199, 227, 241, 199, 227, 241, 199, 227, 241, 199, 227, 241, 192, 3, 241, 192, 3, 241, 192, 3, 241, 248, 31, 255, 248, 31, 255]);
const digits = [zero, one, two, three, four, five, six, seven, eight, nine];

// 40x35
const trex = new Uint8Array([255, 252, 0, 255, 255, 255, 255, 128, 255, 255, 255, 255, 192, 63, 255, 255, 255, 224, 63, 255, 255, 255, 224, 15, 255, 255, 255, 248, 3, 255, 255, 255, 248, 3, 255, 255, 255, 248, 1, 255, 255, 255, 248, 1, 255, 255, 255, 224, 0, 3, 255, 255, 224, 0, 27, 255, 255, 192, 0, 27, 255, 255, 192, 0, 127, 255, 255, 0, 0, 127, 255, 255, 0, 1, 255, 255, 255, 0, 1, 255, 255, 252, 0, 0, 127, 255, 252, 0, 0, 127, 192, 0, 0, 0, 3, 192, 0, 0, 3, 251, 128, 0, 0, 3, 251, 152, 0, 0, 15, 255, 152, 0, 0, 15, 255, 128, 0, 0, 127, 255, 128, 0, 0, 127, 255, 128, 3, 223, 255, 255, 128, 51, 223, 255, 255, 128, 51, 199, 255, 255, 128, 51, 255, 255, 255, 128, 51, 255, 255, 255, 128, 51, 255, 255, 255, 128, 51, 255, 255, 255, 128, 63, 255, 255, 255, 192, 63, 255, 255, 255, 192, 63, 255, 255, 255]);

start();
initModule(LUT_PARTIAL_UPDATE).then(() => {
  console.log('module ready!');
  clsw();
  writeChar(trex, 40, 35, 100, 32);
  writeChar(trex, 40, 35, 160, 64);
  displayFrame();
});

module.exports = {
  digits: digits,
  trex: trex,
  writeChar: writeChar,
  displayFrame: displayFrame,
};
