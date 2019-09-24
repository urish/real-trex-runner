const fs = require('fs');
const path = require('path');
const { toBitmap } = require('./bitmap');

function loadAsset(name) {
  const assetFile = path.join(__dirname, '../assets', name + '.txt')
  const bitmapData = fs.readFileSync(assetFile).toString();
  return new Uint8Array(toBitmap(bitmapData).bitmap);
}

module.exports = {
  0: loadAsset('0'),
  1: loadAsset('1'),
  2: loadAsset('2'),
  3: loadAsset('3'),
  4: loadAsset('4'),
  5: loadAsset('5'),
  6: loadAsset('6'),
  7: loadAsset('7'),
  8: loadAsset('8'),
  9: loadAsset('9'),
  A: loadAsset('A'),
  colon: loadAsset('colon'),
  E: loadAsset('E'),
  G: loadAsset('G'),
  H: loadAsset('H'),
  I: loadAsset('I'),
  M: loadAsset('M'),
  O: loadAsset('O'),
  R: loadAsset('R'),
  trex: loadAsset('trex'),
  V: loadAsset('V'),
  s0: loadAsset('small/0'),
  s1: loadAsset('small/1'),
  s2: loadAsset('small/2'),
  s3: loadAsset('small/3'),
  s4: loadAsset('small/4'),
  s5: loadAsset('small/5'),
  s6: loadAsset('small/6'),
  s7: loadAsset('small/7'),
  s8: loadAsset('small/8'),
  s9: loadAsset('small/9')
};
