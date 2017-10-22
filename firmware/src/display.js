// Copyright (C) 2017, Uri Shaked
// Loosely based on code samples provided by waveshare
// License: MIT

const DIN_PIN = 22;
const CLK_PIN = 20;
const CS_PIN = 19;
const DC_PIN = 18;
const RST_PIN = 17;
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

let pendingUpdate = null;

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

function isBusy() {
  return digitalRead(BUSY_PIN);
}

function waitReady() {
  return new Promise(resolve => {
    if (!isBusy()) {
      resolve();
    };
    setWatch(resolve, BUSY_PIN);
  });
}

function displayFrame() {
  sendCommand(DISPLAY_UPDATE_CONTROL_2);
  sendData(0xC4);
  sendCommand(MASTER_ACTIVATION);
  sendCommand(TERMINATE_FRAME_READ_WRITE);
  return waitReady().then(() => {
    if (pendingUpdate) {
      const updateCallback = pendingUpdate;
      pendingUpdate = null;
      return updateCallback();
    }
  });
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
  let buf = new Uint8Array(EPD_WIDTH / 8 * EPD_HEIGHT / 32);
  buf.fill(value, 0, buf.length);
  for (let i = 0; i < 32; i++) {
    sendData(buf);    
  }
}

function cls() {
  fillMemory(0);
  return displayFrame()
    .then(() => {
      fillMemory(0xff);
      return displayFrame();
    });
}

function clsw() {
  fillMemory(0);
  return displayFrame()
    .then(() => {
      fillMemory(0xff);
      return displayFrame();
    })
    .then(() => {
      fillMemory(0xff);
      return displayFrame();    
    });
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

function registerUpdate(updateCallback) {
  if (isBusy()) {
    pendingUpdate = updateCallback;
  } else {
    updateCallback();
  }
}

module.exports = {
  start: start,
  initModule: initModule,
  LUT_PARTIAL_UPDATE: LUT_PARTIAL_UPDATE,
  WIDTH: EPD_WIDTH,
  HEIGHT: EPD_HEIGHT,
  isBusy: isBusy,
  fillMemory,
  cls: cls,
  clsw: clsw,
  writeChar: writeChar,
  displayFrame: displayFrame,
  registerUpdate: registerUpdate,
};
