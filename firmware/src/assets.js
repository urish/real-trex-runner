function decodeBase64(val) {
  return E.toUint8Array(atob(val));
}

// 24x19
exports.digits = [
  decodeBase64('/wB//wB/+AAP+AAP+AAPx/+Bx/+Bx/+Bx//xx//xwP/xwP/xwAAB+AAP+AAP/wB//wB//wB/////'),
  decodeBase64('///////////x///x///x///x///xwAABwAABwAABwAABwAABwAAB+P/x+P/x///x///x///x////'),
  decodeBase64('////+B/x+B/x+B/xwAPxwAPxwABxxwBxxwBxx+Bxx+Bxx+ABx+ABx+ABwPwBwPwBwPwB+P+B+P+B'),
  decodeBase64('////x/wPx/wPx/wPwOABwOABwAABwAPxwAPxxwPxxwPxxwPxx+Pxx+Pxx/+Bx/+Bx/+B//+P//+P'),
  decodeBase64('//////x///x///x/wAABwAABwAABwAABwAABwPx/wPx/wBx/+Bx/+Bx//wB//wB//wB//+B//+B/'),
  decodeBase64('/////+AP/+AP/+APxwABxwABxwABxx/xxx/xxx/xxx/xxx/xxx/xxx/xwB+BwB+BwB+BwB+PwB+P'),
  decodeBase64('//////wP//wP//wPx+ABx+ABx+ABx+Pxx+Pxx+Pxx+PxwOPxwOPxwOPx+AAB+AAB+AAB/wAP/wAP'),
  decodeBase64('////wP//wP//wP//wB//wB//wAP/xwP/xwP/x+ABx+ABx+ABx/wBx/wBwP//wP//wP//wP//wP//'),
  decodeBase64('//////wP//wP//wP+BwB+BwBwAABx+Bxx+Bxx+Bxx+BxxwBxxwPxxwPxwAPxwAPxwAAB+BwP+BwP'),
  decodeBase64('////+AB/+AB/+AB/wAAPwAAPwAABx+OBx+OBx+Pxx+Pxx+Pxx+Pxx+PxwAPxwAPxwAPx+B//+B//'),
];

// 24x21
exports.letters = {
  A: decodeBase64('/AAH/AAH/AAH4AAH4AAH4AAHA/H/A/H/A/H/H/H/H/H/H/H/A/H/A/H/A/H/4AAH4AAH4AAH/AAH/AAH/AAH'),
  E: decodeBase64('H//HH//HH//HH4/HH4/HH4/HH4/HH4/HH4/HH4/HH4/HH4/HH4/HH4/HH4/HAAAHAAAHAAAHAAAHAAAHAAAH'),
  G: decodeBase64('H4AHH4AHH4AHH4AHH4AHH4AHH4/HH4/HH4/HH//HH//HH//HA/4HA/4HA/4H4AA/4AA/4AA//AH//AH//AH/'),
  H: decodeBase64('////////wAABwAABwAABwAABwAAB/+P//+P//+P//+P//+P//+P//+P//+P/wAABwAABwAABwAABwAAB////'),
  I: decodeBase64('////////x//xx//xx//xx//xx//xwAABwAABwAABwAABwAABwAABx//xx//xx//xx//xx//x////////////'),
  M: decodeBase64('AAAHAAAHAAAHAAAHAAAHAAAH4A//4A//4A///AH//AH//AH/4A//4A//4A//AAAHAAAHAAAHAAAHAAAHAAAH'),
  O: decodeBase64('4AA/4AA/4AA/AAAHAAAHAAAHH//HH//HH//HH//HH//HH//HH//HH//HH//HAAAHAAAHAAAH4AA/4AA/4AA/'),
  R: decodeBase64('4A/H4A/H4A/HAA4HAA4HAA4HH4AHH4AHH4AHH/A/H/A/H/A/H/H/H/H/H/H/AAAHAAAHAAAHAAAHAAAHAAAH'),
  V: decodeBase64('AA//AA//AA//AAH/AAH/AAH//4A//4A//4A///AH//AH//AH/4A//4A//4A/AAH/AAH/AAH/AA//AA//AA//'),
}

// 40x35
exports.trex = decodeBase64('//wA/////4D/////wD/////gP////+AP////+AP////4A/////gB////+AH////gAAP//+AAG///wAAb///AAH///wAAf///AAH///8AAf///AAAf//8AAB/wAAAAAPAAAAD+4AAAAP7mAAAD/+YAAAP/4AAAH//gAAAf/+AA9///4Az3///gDPH//+AM////4Az////gDP///+AM////4A/////wD/////AP////w');
