function zeroPad(s, count) {
  s = s.toString();
  while (s.length < count) {
    s = '0' + s;
  }
  return s;
}

function pack(arr) {
  return btoa(Array.from(arr).map(x => String.fromCharCode(x)).join('')).replace(/=/g, '');
}

function unpack(val) {
  return atob(val).split('').map(x=>x.charCodeAt(0));
}

function draw(im, w) {
  let line = '';
  let y = 0;
  for (let i = 0; i < im.length; i++) {
    if (i % Math.round(w / 8) === 0) {
      line && console.log(zeroPad(y++, 4), line);
      line = '';
    }
    let b = im[i];
    for (bit = 0; bit < 8; bit++) {
      line += (b & (1 << (7-bit))) ? '  ' : '##';
    }
  }
  line && console.log(zeroPad(y++, 4), line);
}

function expand(n) {
  let shift = (n & 0x1) | ((n & 0x2) << 1) | ((n & 0x4) << 2) | ((n & 0x8) << 3);
  return shift | (shift << 1);
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

function flip(str, width) {
  let result = '';
  const bWidth = Math.round(width / 8);
  for (let i = 0; i < str.length; i += bWidth) {
      result = str.slice(i, i + bWidth) + result;
  }
  return result;
}
