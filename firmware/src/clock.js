/**
 * Real Life Lonely T-Rex Game Firmware
 *
 * Copyright (C) 2017, 2018, Uri Shaked
 */

const assets = require('./assets');
const display = require('./display');

let updateTimer = null;

function displayString(s, x, y, charWidth, charHeight, spacing, prefix) {
  s.split('').forEach((c, i) => {
    if (c !== ' ') {
      display.writeChar(
        assets[(prefix || '') + c],
        charWidth,
        charHeight,
        y - i * (charHeight + spacing),
        x
      );
    }
  });
}

function zeroPad(val) {
  return (val < 10 ? '0' : '') + val.toString();
}

function displayTime(time) {
  return display.cls().then(() => {
    const top = 40;
    let hrs = zeroPad(time.getHours());
    let mins = zeroPad(time.getMinutes());
    display.fillMemory(0xff);
    displayString(hrs, top, 220, 48, 38, 10);
    display.writeChar(assets.colon, 48, 11, 220 - 74, top);
    displayString(mins, top, 220 - 130, 48, 38, 10);
    return display.displayFrame();
  });
}

function clockTask() {
  const date = new Date();
  const timeToUpdate =
    60000 - (date.getSeconds() * 1000 + date.getMilliseconds()) + 10;
  display.registerUpdate(() => displayTime(date));
  updateTimer = setTimeout(clockTask, timeToUpdate);
}

function stop() {
  if (updateTimer) {
    clearTimeout(updateTimer);
    updateTimer = null;
  }
}

function start() {
  stop();
  clockTask();
}

module.exports = {
  displayTime,
  start,
  stop
};
