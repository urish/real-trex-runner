// RTC: DS3231
const I2C_ADDR = 0x68;

function getRtcDate(i2c) {
  i2c.writeTo(I2C_ADDR, 0); // 0 = seconds register
  const bcd2dec = val => (val >> 4) * 10 + (val & 0xf);
  const buffer = i2c.readFrom(I2C_ADDR, 7).map(bcd2dec);
  var seconds = buffer[0];
  var minutes = buffer[1];
  var hours = buffer[2];
  var date = buffer[4];
  var month = buffer[5];
  var year = 2000 + buffer[6];
  return new Date(year, month, date, hours, minutes, seconds);
}

function updateSystemClock(i2c) {
  const currentDate = getRtcDate(i2c);
  setTime(currentDate.getTime() / 1000);
}

module.exports = {
  getRtcDate,
  updateSystemClock
};
