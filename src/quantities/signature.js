import { UNITS } from "./definitions.js";

var SIGNATURE_VECTOR = ["length", "time", "temperature", "mass", "current", "substance", "luminosity", "currency", "information", "angle"];

/*
calculates the unit signature id for use in comparing compatible units and simplification
the signature is based on a simple classification of units and is based on the following publication

Novak, G.S., Jr. "Conversion of units of measurement", IEEE Transactions on Software Engineering,
21(8), Aug 1995, pp.651-661
doi://10.1109/32.403789
http://ieeexplore.ieee.org/Xplore/login.jsp?url=/iel1/32/9079/00403789.pdf?isnumber=9079&prod=JNL&arnumber=403789&arSt=651&ared=661&arAuthor=Novak%2C+G.S.%2C+Jr.
*/
export function unitSignature() {
  if (this.signature) {
    return this.signature;
  }
  var vector = unitSignatureVector.call(this);
  for (var i = 0; i < vector.length; i++) {
    vector[i] *= Math.pow(20, i);
  }

  return vector.reduce(
    function(previous, current) {
      return previous + current;
    },
    0
  );
}

// calculates the unit signature vector used by unit_signature
function unitSignatureVector() {
  if (!this.isBase()) {
    return unitSignatureVector.call(this.toBase());
  }

  var vector = new Array(SIGNATURE_VECTOR.length);
  for (var i = 0; i < vector.length; i++) {
    vector[i] = 0;
  }
  var r, n;
  for (var j = 0; j < this.numerator.length; j++) {
    if ((r = UNITS[this.numerator[j]])) {
      n = SIGNATURE_VECTOR.indexOf(r[2]);
      if (n >= 0) {
        vector[n] = vector[n] + 1;
      }
    }
  }

  for (var k = 0; k < this.denominator.length; k++) {
    if ((r = UNITS[this.denominator[k]])) {
      n = SIGNATURE_VECTOR.indexOf(r[2]);
      if (n >= 0) {
        vector[n] = vector[n] - 1;
      }
    }
  }
  return vector;
}
