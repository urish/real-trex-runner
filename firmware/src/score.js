const eeprom = new (require("FlashEEPROM"))();

// Use only 1024 bytes for journal
eeprom.endAddr = eepRom.addr + 1024;

function load() {
  let value = eeprom.read(0);
  if (value && value.length == 4) {
    return new Uint32Array(value.buffer)[0];
  }
  return eeprom.read(0);
}

function save(value) {
  eeprom.write(0, new Uint32Array([value]).buffer);
}

module.exports = {
  load, 
  save
};
