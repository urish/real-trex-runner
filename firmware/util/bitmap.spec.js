const fs = require('fs');
const bitmap = require('./bitmap');

const zero = fs.readFileSync('./util/fixtures/zero.txt').toString().replace(/\r/g, '');
const zeroDouble = fs.readFileSync('./util/fixtures/zero-double.txt').toString().replace(/\r/g, '');

const zeroBitmap = [
  255, 0, 127,    255, 0, 127,    248, 0, 15,     248, 0, 15,
  248, 0, 15,     199, 255, 129,  199, 255, 129,  199, 255, 129, 
  199, 255, 241,  199, 255, 241,  192, 255, 241,  192, 255, 241, 
  192, 0, 1,      248, 0, 15,     248, 0, 15,     255, 0, 127, 
  255, 0, 127,    255, 0, 127,    255, 255, 255,
];

describe('bitmap utils', () => {
  describe('toBitmap()', () => {
    it('should convert the given text to 1-bpp bitmap represented by integer array', () => {
      expect(bitmap.toBitmap(zero)).toEqual({
        width: 24,
        height: 19,
        bitmap: zeroBitmap,
      });
    });
  });

  describe('toText', () => {
    it('should convert the given bitmap to text representation', () => {
      expect(bitmap.toText(zeroBitmap, 24)).toEqual(zero);
    });
  });

  describe('encode', () => {
    it('should convert the given bitmap into base64 representation', () => {
      expect(bitmap.encode(zeroBitmap)).toBe('/wB//wB/+AAP+AAP+AAPx/+Bx/+Bx/+Bx//xx//xwP/xwP/xwAAB+AAP+AAP/wB//wB//wB/////');
    });

    it('should not pad the encoded string with = characters', () => {
      expect(bitmap.encode([127, 53])).toEqual('fzU');
    });
  });

  describe('decode', () => {
    it('should decode the given base64-encoded bitmap', () => {
      expect(bitmap.decode('/wB//wB/+AAP+AAP+AAPx/+Bx/+Bx/+Bx//xx//xwP/xwP/xwAAB+AAP+AAP/wB//wB//wB/////'))
        .toEqual(zeroBitmap);
    });
  });

  describe('double', () => {
    it('should scale the given bitmap to twice the original size', () => {
      expect(bitmap.toText(bitmap.double(bitmap.toBitmap(zero).bitmap, 24), 48))
        .toEqual(zeroDouble);
    });
  });
});
