const SerialPort = require('serialport');
const port = new SerialPort('/dev/serial0', { baudRate: 9600 });

async function playerCommand(cmd, arg1, arg2) {
  const data = [0x7e, 0xff, 0x6, cmd, 0, arg1, arg2, 0, 0, 0xef];
  const checksum = 0 - data[1] - data[2] - data[3] - data[4] - data[5] - data[6];
  data[7] = (checksum >> 8) & 0xff;
  data[8] = checksum & 0xff;
  port.write(data);
  return new Promise((resolve) => port.drain(resolve));
}

async function playSound(id, volume) {
  if (typeof volume !== 'undefined') {
    await playerCommand(0x6, 0, volume);
  }
  await playerCommand(0x12, 0, id);
}

module.exports = { playerCommand, playSound };
