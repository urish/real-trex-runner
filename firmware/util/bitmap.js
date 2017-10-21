module.exports = {
  toBitmap,
  toText,
  encode,
  decode,
  double,
};

function toBitmap(str) {
  const lines = str.split('\n');
  let bitmap = [];
  const firstLine = lines[0].replace(/[\r\n]*$/g, '');
  let width = Math.round(firstLine.length / 8);
  let idx = 0;
  for (let line of lines) {
    for (let i = 0; i < width; i++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        if (line[i * 8 + bit] === ' ') {
          byte |= 1 << (7 - bit);
        }
      }
      bitmap[idx++] = byte;
    }
  }
  return {
    bitmap,
    width: firstLine.length,
    height: lines.length,
  };
}

function toText(bitmap, width, zero = '#', one = ' ') {
  let result = '';
  let y = 0;
  for (let i = 0; i < bitmap.length; i++) {
    if (result && (i % Math.round(width / 8) === 0)) {
      result += '\n';
    }
    let b = bitmap[i];
    for (bit = 0; bit < 8; bit++) {
      result += (b & (1 << (7-bit))) ? one : zero;
    }
  }
  return result;
}

function expand(n) {
  let shift = (n & 0x1) | ((n & 0x2) << 1) | ((n & 0x4) << 2) | ((n & 0x8) << 3);
  return shift | (shift << 1);
}

function encode(bitmap) {
  return new Buffer(new Uint8Array(bitmap)).toString('base64').replace(/=+$/, '');
}

function decode(val) {
  return atob(val).split('').map(x=>x.charCodeAt(0));
}

function double(bitmap, width) {
  let result = new Uint8Array(bitmap.length * 4);
  const bWidth = Math.round(width / 8);
  let resultPtr = 0;
  
  function row(y) {
    for (let i = 0; i < bWidth; i++) {
      const val = bitmap[y * bWidth + i];
      result[resultPtr++] = expand(val >> 4);  
      result[resultPtr++] = expand(val & 0xf);
    }
  }

  for (let y = 0; y < bitmap.length / bWidth; y++) {
    row(y);
    row(y);
  }

  return result;
}
