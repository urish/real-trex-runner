function decodeBase64(val) {
  return E.toUint8Array(atob(val));
}

// 24x19
exports.digits = [
  decodeBase64("/wB//wB/+AAP+AAP+AAPx/+Bx/+Bx/+Bx//xx//xwP/xwP/xwAAB+AAP+AAP/wB//wB//wB/////"),
  decodeBase64("///////////x///x///x///x///xwAABwAABwAABwAABwAABwAAB+P/x+P/x///x///x///x////"),
  decodeBase64("////+B/x+B/x+B/xwAPxwAPxwABxxwBxxwBxx+Bxx+Bxx+ABx+ABx+ABwPwBwPwBwPwB+P+B+P+B"),
  decodeBase64("////x/wPx/wPx/wPwOABwOABwAABwAPxwAPxxwPxxwPxxwPxx+Pxx+Pxx/+Bx/+Bx/+B//+P//+P"),
  decodeBase64("//////x///x///x/wAABwAABwAABwAABwAABwPx/wPx/wBx/+Bx/+Bx//wB//wB//wB//+B//+B/"),
  decodeBase64("/////+AP/+AP/+APxwABxwABxwABxx/xxx/xxx/xxx/xxx/xxx/xxx/xwB+BwB+BwB+BwB+PwB+P"),
  decodeBase64("//////wP//wP//wPx+ABx+ABx+ABx+Pxx+Pxx+Pxx+PxwOPxwOPxwOPx+AAB+AAB+AAB/wAP/wAP"),
  decodeBase64("////wP//wP//wP//wB//wB//wAP/xwP/xwP/x+ABx+ABx+ABx/wBx/wBwP//wP//wP//wP//wP//"),
  decodeBase64("//////wP//wP//wP+BwB+BwBwAABx+Bxx+Bxx+Bxx+BxxwBxxwPxxwPxwAPxwAPxwAAB+BwP+BwP"),
  decodeBase64("////+AB/+AB/+AB/wAAPwAAPwAABx+OBx+OBx+Pxx+Pxx+Pxx+Pxx+PxwAPxwAPxwAPx+B//+B//"),
];

// 40x35
exports.trex = decodeBase64("//wA/////4D/////wD/////gP////+AP////+AP////4A/////gB////+AH////gAAP//+AAG///wAAb///AAH///wAAf///AAH///8AAf///AAAf//8AAB/wAAAAAPAAAAD+4AAAAP7mAAAD/+YAAAP/4AAAH//gAAAf/+AA9///4Az3///gDPH//+AM////4Az////gDP///+AM////4A/////wD/////AP////w==");
