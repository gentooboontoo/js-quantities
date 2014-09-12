/*!
Copyright © 2006-2007 Kevin C. Olbrich
Copyright © 2010-2013 LIM SAS (http://lim.eu) - Julien Sanchez

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/*jshint eqeqeq:true, immed:true, undef:true */
/*global module:false, define:false */

import { UNITS, BASE_UNITS, KINDS, SIGNATURE_VECTOR } from "definitions";
import NestedMap from "nested-map";
import QtyError from "error";

var UNITY = "<1>";
var UNITY_ARRAY= [UNITY];
var SIGN = "[+-]";
var INTEGER = "\\d+";
var SIGNED_INTEGER = SIGN + "?" + INTEGER;
var FRACTION = "\\." + INTEGER;
var FLOAT = "(?:" + INTEGER + "(?:" + FRACTION + ")?" + ")" +
            "|" +
            "(?:" + FRACTION + ")";
var EXPONENT = "[Ee]" + SIGNED_INTEGER;
var SCI_NUMBER = "(?:" + FLOAT + ")(?:" + EXPONENT + ")?";
var SIGNED_NUMBER = SIGN + "?\\s*" + SCI_NUMBER;
var QTY_STRING = "(" + SIGNED_NUMBER + ")?" + "\\s*([^/]*)(?:\/(.+))?";
var QTY_STRING_REGEX = new RegExp("^" + QTY_STRING + "$");
var POWER_OP = "\\^|\\*{2}";
var TOP_REGEX = new RegExp ("([^ \\*]+?)(?:" + POWER_OP + ")?(-?\\d+)");
var BOTTOM_REGEX = new RegExp("([^ \\*]+?)(?:" + POWER_OP + ")?(\\d+)");

var baseUnitCache = {};

function Qty(initValue) {
  if(!(this instanceof Qty)) {
    return new Qty(initValue);
  }

  this.scalar = null;
  this.baseScalar = null;
  this.signature = null;
  this._conversionCache = {};
  this.numerator = UNITY_ARRAY;
  this.denominator = UNITY_ARRAY;

  if(isString(initValue)) {
    initValue = initValue.trim();
    parse.call(this, initValue);
  }
  else {
    this.scalar = initValue.scalar;
    this.numerator = (initValue.numerator && initValue.numerator.length !== 0)? initValue.numerator : UNITY_ARRAY;
    this.denominator = (initValue.denominator && initValue.denominator.length !== 0)? initValue.denominator : UNITY_ARRAY;
  }

  // math with temperatures is very limited
  if(this.denominator.join("*").indexOf("temp") >= 0) {
    throw new QtyError("Cannot divide with temperatures");
  }
  if(this.numerator.join("*").indexOf("temp") >= 0) {
    if(this.numerator.length > 1) {
      throw new QtyError("Cannot multiply by temperatures");
    }
    if(!compareArray(this.denominator, UNITY_ARRAY)) {
      throw new QtyError("Cannot divide with temperatures");
    }
  }

  this.initValue = initValue;
  updateBaseScalar.call(this);

  if(this.isTemperature() && this.baseScalar < 0) {
    throw new QtyError("Temperatures must not be less than absolute zero");
  }
}

/**
 * Parses a string as a quantity
 * @param {string} value - quantity as text
 * @throws if value is not a string
 * @returns {Qty|null} Parsed quantity or null if unrecognized
 */
Qty.parse = function parse(value) {
  if(!isString(value)) {
    throw new QtyError("Argument should be a string");
  }

  try {
    return Qty(value);
  }
  catch(e) {
    return null;
  }
};

/**
 * Configures and returns a fast function to convert
 * Number values from units to others.
 * Useful to efficiently convert large array of values
 * with same units into others with iterative methods.
 * Does not take care of rounding issues.
 *
 * @param {string} srcUnits Units of values to convert
 * @param {string} dstUnits Units to convert to
 *
 * @returns {Function} Converting function accepting Number value
 *   and returning converted value
 *
 * @throws "Incompatible units" if units are incompatible
 *
 * @example
 * // Converting large array of numbers with the same units
 * // into other units
 * var converter = Qty.swiftConverter("m/h", "ft/s");
 * var convertedSerie = largeSerie.map(converter);
 *
 */
Qty.swiftConverter = function swiftConverter(srcUnits, dstUnits) {
  var srcQty = Qty(srcUnits);
  var dstQty = Qty(dstUnits);

  if(srcQty.eq(dstQty)) {
    return identity;
  }

  var convert;
  if(!srcQty.isTemperature()) {
    convert = function(value) {
      return value * srcQty.baseScalar / dstQty.baseScalar;
    };
  }
  else {
    convert = function(value) {
      // TODO Not optimized
      return srcQty.mul(value).to(dstQty).scalar;
    };
  }

  return function converter(value) {
    var i,
        length,
        result;
    if(!Array.isArray(value)) {
      return convert(value);
    }
    else {
      length = value.length;
      result = [];
      for(i = 0; i < length; i++) {
        result.push(convert(value[i]));
      }
      return result;
    }
  };
};

/**
 * Default formatter
 *
 * @param {number} scalar
 * @param {string} units
 *
 * @returns {string} formatted result
 */
function defaultFormatter(scalar, units) {
  return (scalar + " " + units).trim();
}

/**
 *
 * Configurable Qty default formatter
 *
 * @type {function}
 *
 * @param {number} scalar
 * @param {string} units
 *
 * @returns {string} formatted result
 */
Qty.formatter = defaultFormatter;

var updateBaseScalar = function () {
  if(this.baseScalar) {
    return this.baseScalar;
  }
  if(this.isBase()) {
    this.baseScalar = this.scalar;
    this.signature = unitSignature.call(this);
  }
  else {
    var base = this.toBase();
    this.baseScalar = base.scalar;
    this.signature = base.signature;
  }
};

/*
calculates the unit signature id for use in comparing compatible units and simplification
the signature is based on a simple classification of units and is based on the following publication

Novak, G.S., Jr. "Conversion of units of measurement", IEEE Transactions on Software Engineering,
21(8), Aug 1995, pp.651-661
doi://10.1109/32.403789
http://ieeexplore.ieee.org/Xplore/login.jsp?url=/iel1/32/9079/00403789.pdf?isnumber=9079&prod=JNL&arnumber=403789&arSt=651&ared=661&arAuthor=Novak%2C+G.S.%2C+Jr.
*/
var unitSignature = function () {
  if(this.signature) {
    return this.signature;
  }
  var vector = unitSignatureVector.call(this);
  for(var i = 0; i < vector.length; i++) {
    vector[i] *= Math.pow(20, i);
  }

  return vector.reduce(function(previous, current) {return previous + current;}, 0);
};

// calculates the unit signature vector used by unit_signature
var unitSignatureVector = function () {
  if(!this.isBase()) {
    return unitSignatureVector.call(this.toBase());
  }

  var vector = new Array(SIGNATURE_VECTOR.length);
  for(var i = 0; i < vector.length; i++) {
    vector[i] = 0;
  }
  var r, n;
  for(var j = 0; j < this.numerator.length; j++) {
    if((r = UNITS[this.numerator[j]])) {
      n = SIGNATURE_VECTOR.indexOf(r[2]);
      if(n >= 0) {
        vector[n] = vector[n] + 1;
      }
    }
  }

  for(var k = 0; k < this.denominator.length; k++) {
    if((r = UNITS[this.denominator[k]])) {
      n = SIGNATURE_VECTOR.indexOf(r[2]);
      if(n >= 0) {
        vector[n] = vector[n] - 1;
      }
    }
  }
  return vector;
};

/* parse a string into a unit object.
 * Typical formats like :
 * "5.6 kg*m/s^2"
 * "5.6 kg*m*s^-2"
 * "5.6 kilogram*meter*second^-2"
 * "2.2 kPa"
 * "37 degC"
 * "1"  -- creates a unitless constant with value 1
 * "GPa"  -- creates a unit with scalar 1 with units 'GPa'
 * 6'4"  -- recognized as 6 feet + 4 inches
 * 8 lbs 8 oz -- recognized as 8 lbs + 8 ounces
 */
var parse = function (val) {
  var result = QTY_STRING_REGEX.exec(val);
  if(!result) {
    throw new QtyError(val + ": Quantity not recognized");
  }

  var scalarMatch = result[1];
  if(scalarMatch) {
    // Allow whitespaces between sign and scalar for loose parsing
    scalarMatch = scalarMatch.replace(/\s/g, "");
    this.scalar = parseFloat(scalarMatch);
  }
  else {
    this.scalar = 1;
  }
  var top = result[2];
  var bottom = result[3];

  var n, x, nx;
  // TODO DRY me
  while((result = TOP_REGEX.exec(top))) {
    n = parseFloat(result[2]);
    if(isNaN(n)) {
      // Prevents infinite loops
      throw new QtyError("Unit exponent is not a number");
    }
    // Disallow unrecognized unit even if exponent is 0
    if(n === 0 && !UNIT_TEST_REGEX.test(result[1])) {
      throw new QtyError("Unit not recognized");
    }
    x = result[1] + " ";
    nx = "";
    for(var i = 0; i < Math.abs(n) ; i++) {
      nx += x;
    }
    if(n >= 0) {
      top = top.replace(result[0], nx);
    }
    else {
      bottom = bottom ? bottom + nx : nx;
      top = top.replace(result[0], "");
    }
  }

  while((result = BOTTOM_REGEX.exec(bottom))) {
    n = parseFloat(result[2]);
    if(isNaN(n)) {
      // Prevents infinite loops
      throw new QtyError("Unit exponent is not a number");
    }
    // Disallow unrecognized unit even if exponent is 0
    if(n === 0 && !UNIT_TEST_REGEX.test(result[1])) {
      throw new QtyError("Unit not recognized");
    }
    x = result[1] + " ";
    nx = "";
    for(var j = 0; j < n ; j++) {
      nx += x;
    }

    bottom = bottom.replace(result[0], nx, "g");
  }

  if(top) {
    this.numerator = parseUnits(top.trim());
  }
  if(bottom) {
    this.denominator = parseUnits(bottom.trim());
  }

};

/*
 * Throws incompatible units error
 *
 * @throws "Incompatible units" error
 */
function throwIncompatibleUnits() {
  throw new QtyError("Incompatible units");
}

Qty.prototype = {

  // Properly set up constructor
  constructor: Qty,

  // Converts the unit back to a float if it is unitless.  Otherwise raises an exception
  toFloat: function() {
    if(this.isUnitless()) {
      return this.scalar;
    }
    throw new QtyError("Can't convert to Float unless unitless.  Use Unit#scalar");
  },

  // returns true if no associated units
  // false, even if the units are "unitless" like 'radians, each, etc'
  isUnitless: function() {
    return compareArray(this.numerator, UNITY_ARRAY) && compareArray(this.denominator, UNITY_ARRAY);
  },

  /*
  check to see if units are compatible, but not the scalar part
  this check is done by comparing signatures for performance reasons
  if passed a string, it will create a unit object with the string and then do the comparison
  this permits a syntax like:
  unit =~ "mm"
  if you want to do a regexp on the unit string do this ...
  unit.units =~ /regexp/
  */
  isCompatible: function(other) {
    if(isString(other)) {
      return this.isCompatible(Qty(other));
    }

    if(!(other instanceof Qty)) {
      return false;
    }

    if(other.signature !== undefined) {
      return this.signature === other.signature;
    }
    else {
      return false;
    }
  },

  /*
  check to see if units are inverse of each other, but not the scalar part
  this check is done by comparing signatures for performance reasons
  if passed a string, it will create a unit object with the string and then do the comparison
  this permits a syntax like:
  unit =~ "mm"
  if you want to do a regexp on the unit string do this ...
  unit.units =~ /regexp/
  */
  isInverse: function(other) {
    return this.inverse().isCompatible(other);
  },

  kind: function() {
    return KINDS[this.signature.toString()];
  },

  // Returns 'true' if the Unit is represented in base units
  isBase: function() {
    if(this._isBase !== undefined) {
      return this._isBase;
    }
    if(this.isDegrees() && this.numerator[0].match(/<(kelvin|temp-K)>/)) {
      this._isBase = true;
      return this._isBase;
    }

    this.numerator.concat(this.denominator).forEach(function(item) {
      if(item !== UNITY && BASE_UNITS.indexOf(item) === -1 ) {
        this._isBase = false;
      }
    }, this);
    if(this._isBase === false) {
      return this._isBase;
    }
    this._isBase = true;
    return this._isBase;
  },

  // convert to base SI units
  // results of the conversion are cached so subsequent calls to this will be fast
  toBase: function() {
    if(this.isBase()) {
      return this;
    }

    if(this.isTemperature()) {
      return toTempK(this);
    }

    var cached = baseUnitCache[this.units()];
    if(!cached) {
      cached = toBaseUnits(this.numerator,this.denominator);
      baseUnitCache[this.units()] = cached;
    }
    return cached.mul(this.scalar);
  },

  // returns the 'unit' part of the Unit object without the scalar
  units: function() {
    if(this._units !== undefined) {
      return this._units;
    }

    var numIsUnity = compareArray(this.numerator, UNITY_ARRAY),
        denIsUnity = compareArray(this.denominator, UNITY_ARRAY);
    if(numIsUnity && denIsUnity) {
      this._units = "";
      return this._units;
    }

    var numUnits = stringifyUnits(this.numerator),
        denUnits = stringifyUnits(this.denominator);
    this._units = numUnits + (denIsUnity ? "":("/" + denUnits));
    return this._units;
  },

  eq: function(other) {
    return this.compareTo(other) === 0;
  },
  lt: function(other) {
    return this.compareTo(other) === -1;
  },
  lte: function(other) {
    return this.eq(other) || this.lt(other);
  },
  gt: function(other) {
    return this.compareTo(other) === 1;
  },
  gte: function(other) {
    return this.eq(other) || this.gt(other);
  },

  /**
   * Returns the nearest multiple of quantity passed as
   * precision
   *
   * @param {(Qty|string|number)} prec-quantity - Quantity, string formated
   *   quantity or number as expected precision
   *
   * @returns {Qty} Nearest multiple of precQuantity
   *
   * @example
   * Qty('5.5 ft').toPrec('2 ft'); // returns 6 ft
   * Qty('0.8 cu').toPrec('0.25 cu'); // returns 0.75 cu
   * Qty('6.3782 m').toPrec('cm'); // returns 6.38 m
   * Qty('1.146 MPa').toPrec('0.1 bar'); // returns 1.15 MPa
   *
   */
  toPrec: function(precQuantity) {
    if(isString(precQuantity)) {
      precQuantity = Qty(precQuantity);
    }
    if(typeof precQuantity === "number") {
      precQuantity = Qty(precQuantity + " " + this.units());
    }

    if(!this.isUnitless()) {
      precQuantity = precQuantity.to(this.units());
    }
    else if(!precQuantity.isUnitless()) {
      throwIncompatibleUnits();
    }

    if(precQuantity.scalar === 0) {
      throw new QtyError("Divide by zero");
    }

    var precRoundedResult = mulSafe(Math.round(this.scalar/precQuantity.scalar),
                                       precQuantity.scalar);

    return Qty(precRoundedResult + this.units());
  },

  /**
   * Stringifies the quantity
   * Deprecation notice: only units parameter is supported.
   *
   * @param {(number|string|Qty)} targetUnitsOrMaxDecimalsOrPrec -
   *                              target units if string,
   *                              max number of decimals if number,
   *                              passed to #toPrec before converting if Qty
   *
   * @param {number=} maxDecimals - Maximum number of decimals of
   *                                formatted output
   *
   * @returns {string} reparseable quantity as string
   */
  toString: function(targetUnitsOrMaxDecimalsOrPrec, maxDecimals) {
    var targetUnits;
    if(typeof targetUnitsOrMaxDecimalsOrPrec === "number") {
      targetUnits = this.units();
      maxDecimals = targetUnitsOrMaxDecimalsOrPrec;
    }
    else if(isString(targetUnitsOrMaxDecimalsOrPrec)) {
      targetUnits = targetUnitsOrMaxDecimalsOrPrec;
    }
    else if(targetUnitsOrMaxDecimalsOrPrec instanceof Qty) {
      return this.toPrec(targetUnitsOrMaxDecimalsOrPrec).toString(maxDecimals);
    }

    var out = this.to(targetUnits);

    var outScalar = maxDecimals !== undefined ? round(out.scalar, maxDecimals) : out.scalar;
    out = (outScalar + " " + out.units()).trim();
    return out;
  },

  /**
   * Format the quantity according to optional passed target units
   * and formatter
   *
   * @param {string} [targetUnits=current units] -
   *                 optional units to convert to before formatting
   *
   * @param {function} [formatter=Qty.formatter] -
   *                   delegates formatting to formatter callback.
   *                   formatter is called back with two parameters (scalar, units)
   *                   and should return formatted result.
   *                   If unspecified, formatting is delegated to default formatter
   *                   set to Qty.formatter
   *
   * @example
   * var roundingAndLocalizingFormatter = function(scalar, units) {
   *   // localize or limit scalar to n max decimals for instance
   *   // return formatted result
   * };
   * var qty = Qty('1.1234 m');
   * qty.format(); // same units, default formatter => "1.234 m"
   * qty.format("cm"); // converted to "cm", default formatter => "123.45 cm"
   * qty.format(roundingAndLocalizingFormatter); // same units, custom formatter => "1,2 m"
   * qty.format("cm", roundingAndLocalizingFormatter); // convert to "cm", custom formatter => "123,4 cm"
   *
   * @returns {string} quantity as string
   */
  format: function(targetUnits, formatter) {
    if(arguments.length === 1) {
      if(typeof targetUnits === "function") {
        formatter = targetUnits;
        targetUnits = undefined;
      }
    }

    formatter = formatter || Qty.formatter;
    var targetQty = this.to(targetUnits);
    return formatter.call(this, targetQty.scalar, targetQty.units());
  },

  // Compare two Qty objects. Throws an exception if they are not of compatible types.
  // Comparisons are done based on the value of the quantity in base SI units.
  //
  // NOTE: We cannot compare inverses as that breaks the general compareTo contract:
  //   if a.compareTo(b) < 0 then b.compareTo(a) > 0
  //   if a.compareTo(b) == 0 then b.compareTo(a) == 0
  //
  //   Since "10S" == ".1ohm" (10 > .1) and "10ohm" == ".1S" (10 > .1)
  //     Qty("10S").inverse().compareTo("10ohm") == -1
  //     Qty("10ohm").inverse().compareTo("10S") == -1
  //
  //   If including inverses in the sort is needed, I suggest writing: Qty.sort(qtyArray,units)
  compareTo: function(other) {
    if(isString(other)) {
      return this.compareTo(Qty(other));
    }
    if(!this.isCompatible(other)) {
      throwIncompatibleUnits();
    }
    if(this.baseScalar < other.baseScalar) {
      return -1;
    }
    else if(this.baseScalar === other.baseScalar) {
      return 0;
    }
    else if(this.baseScalar > other.baseScalar) {
      return 1;
    }
  },

  // Return true if quantities and units match
  // Unit("100 cm").same(Unit("100 cm"))  # => true
  // Unit("100 cm").same(Unit("1 m"))     # => false
  same: function(other) {
    return (this.scalar === other.scalar) && (this.units() === other.units());
  },

  // Returns a Qty that is the inverse of this Qty,
  inverse: function() {
    if(this.isTemperature()) {
      throw new QtyError("Cannot divide with temperatures");
    }
    if(this.scalar === 0) {
      throw new QtyError("Divide by zero");
    }
    return Qty({"scalar": 1/this.scalar, "numerator": this.denominator, "denominator": this.numerator});
  },

  isDegrees: function() {
    // signature may not have been calculated yet
    return (this.signature === null || this.signature === 400) &&
      this.numerator.length === 1 &&
      compareArray(this.denominator, UNITY_ARRAY) &&
      (this.numerator[0].match(/<temp-[CFRK]>/) || this.numerator[0].match(/<(kelvin|celsius|rankine|fahrenheit)>/));
  },

  isTemperature: function() {
    return this.isDegrees() && this.numerator[0].match(/<temp-[CFRK]>/);
  },

  /**
   * Converts to other compatible units.
   * Instance's converted quantities are cached for faster subsequent calls.
   *
   * @param {(string|Qty)} other - Target units as string or retrieved from
   *                               other Qty instance (scalar is ignored)
   *
   * @returns {Qty} New converted Qty instance with target units
   *
   * @throws {QtyError} if target units are incompatible
   *
   * @example
   * var weight = Qty("25 kg");
   * weight.to("lb"); // => Qty("55.11556554621939 lbs");
   * weight.to(Qty("3 g")); // => Qty("25000 g"); // scalar of passed Qty is ignored
   */
  to: function(other) {
    var cached, target;

    if(!other) {
      return this;
    }

    if(!isString(other)) {
      return this.to(other.units());
    }

    cached = this._conversionCache[other];
    if(cached) {
      return cached;
    }

    // Instantiating target to normalize units
    target = Qty(other);
    if(target.units() === this.units()) {
      return this;
    }

    if(!this.isCompatible(target)) {
      if(this.isInverse(target)) {
        target = this.inverse().to(other);
      }
      else {
        throwIncompatibleUnits();
      }
    }
    else {
      if(target.isTemperature()) {
        target = toTemp(this,target);
      }
      else if(target.isDegrees()) {
        target = toDegrees(this,target);
      }
      else {
        var q = divSafe(this.baseScalar, target.baseScalar);
        target = Qty({"scalar": q, "numerator": target.numerator, "denominator": target.denominator});
      }
    }

    this._conversionCache[other] = target;
    return target;
  },

  // Quantity operators
  // Returns new instance with this units
  add: function(other) {
    if(isString(other)) {
      other = Qty(other);
    }

    if(!this.isCompatible(other)) {
      throwIncompatibleUnits();
    }

    if(this.isTemperature() && other.isTemperature()) {
      throw new QtyError("Cannot add two temperatures");
    }
    else if(this.isTemperature()) {
      return addTempDegrees(this,other);
    }
    else if(other.isTemperature()) {
      return addTempDegrees(other,this);
    }

    return Qty({"scalar": this.scalar + other.to(this).scalar, "numerator": this.numerator, "denominator": this.denominator});
  },

  sub: function(other) {
    if(isString(other)) {
      other = Qty(other);
    }

    if(!this.isCompatible(other)) {
      throwIncompatibleUnits();
    }

    if(this.isTemperature() && other.isTemperature()) {
      return subtractTemperatures(this,other);
    }
    else if(this.isTemperature()) {
      return subtractTempDegrees(this,other);
    }
    else if(other.isTemperature()) {
      throw new QtyError("Cannot subtract a temperature from a differential degree unit");
    }

    return Qty({"scalar": this.scalar - other.to(this).scalar, "numerator": this.numerator, "denominator": this.denominator});
  },

  mul: function(other) {
    if(typeof other === "number") {
      return Qty({"scalar": mulSafe(this.scalar, other), "numerator": this.numerator, "denominator": this.denominator});
    }
    else if(isString(other)) {
      other = Qty(other);
    }

    if((this.isTemperature()||other.isTemperature()) && !(this.isUnitless()||other.isUnitless())) {
      throw new QtyError("Cannot multiply by temperatures");
    }

    // Quantities should be multiplied with same units if compatible, with base units else
    var op1 = this;
    var op2 = other;

    // so as not to confuse results, multiplication and division between temperature degrees will maintain original unit info in num/den
    // multiplication and division between deg[CFRK] can never factor each other out, only themselves: "degK*degC/degC^2" == "degK/degC"
    if(op1.isCompatible(op2) && op1.signature !== 400) {
      op2 = op2.to(op1);
    }
    var numden = cleanTerms(op1.numerator.concat(op2.numerator), op1.denominator.concat(op2.denominator));

    return Qty({"scalar": mulSafe(op1.scalar, op2.scalar) , "numerator": numden[0], "denominator": numden[1]});
  },

  div: function(other) {
    if(typeof other === "number") {
      if(other === 0) {
        throw new QtyError("Divide by zero");
      }
      return Qty({"scalar": this.scalar / other, "numerator": this.numerator, "denominator": this.denominator});
    }
    else if(isString(other)) {
      other = Qty(other);
    }

    if(other.scalar === 0) {
      throw new QtyError("Divide by zero");
    }

    if(other.isTemperature()) {
      throw new QtyError("Cannot divide with temperatures");
    }
    else if(this.isTemperature() && !other.isUnitless()) {
      throw new QtyError("Cannot divide with temperatures");
    }

    // Quantities should be multiplied with same units if compatible, with base units else
    var op1 = this;
    var op2 = other;

    // so as not to confuse results, multiplication and division between temperature degrees will maintain original unit info in num/den
    // multiplication and division between deg[CFRK] can never factor each other out, only themselves: "degK*degC/degC^2" == "degK/degC"
    if(op1.isCompatible(op2) && op1.signature !== 400) {
      op2 = op2.to(op1);
    }
    var numden = cleanTerms(op1.numerator.concat(op2.denominator), op1.denominator.concat(op2.numerator));

    return Qty({"scalar": op1.scalar / op2.scalar, "numerator": numden[0], "denominator": numden[1]});
  }

};

function toBaseUnits (numerator,denominator) {
  var num = [];
  var den = [];
  var q = 1;
  var unit;
  for(var i = 0; i < numerator.length; i++) {
    unit = numerator[i];
    if(PREFIX_VALUES[unit]) {
      // workaround to fix
      // 0.1 * 0.1 => 0.010000000000000002
      q = mulSafe(q, PREFIX_VALUES[unit]);
    }
    else {
      if(UNIT_VALUES[unit]) {
        q *= UNIT_VALUES[unit].scalar;

        if(UNIT_VALUES[unit].numerator) {
          num.push(UNIT_VALUES[unit].numerator);
        }
        if(UNIT_VALUES[unit].denominator) {
          den.push(UNIT_VALUES[unit].denominator);
        }
      }
    }
  }
  for(var j = 0; j < denominator.length; j++) {
    unit = denominator[j];
    if(PREFIX_VALUES[unit]) {
      q /= PREFIX_VALUES[unit];
    }
    else {
      if(UNIT_VALUES[unit]) {
        q /= UNIT_VALUES[unit].scalar;

        if(UNIT_VALUES[unit].numerator) {
          den.push(UNIT_VALUES[unit].numerator);
        }
        if(UNIT_VALUES[unit].denominator) {
          num.push(UNIT_VALUES[unit].denominator);
        }
      }
    }
  }

  // Flatten
  num = num.reduce(function(a,b) {
    return a.concat(b);
  }, []);
  den = den.reduce(function(a,b) {
    return a.concat(b);
  }, []);

  return Qty({"scalar": q, "numerator": num, "denominator": den});
}

var parsedUnitsCache = {};
/**
 * Parses and converts units string to normalized unit array.
 * Result is cached to speed up next calls.
 *
 * @param {string} units Units string
 * @returns {string[]} Array of normalized units
 *
 * @example
 * // Returns ["<second>", "<meter>", "<second>"]
 * parseUnits("s m s");
 *
 */
function parseUnits(units) {
  var cached = parsedUnitsCache[units];
  if(cached) {
    return cached;
  }

  var unitMatch, normalizedUnits = [];
  // Scan
  if(!UNIT_TEST_REGEX.test(units)) {
    throw new QtyError("Unit not recognized");
  }

  while((unitMatch = UNIT_MATCH_REGEX.exec(units))) {
    normalizedUnits.push(unitMatch.slice(1));
  }

  normalizedUnits = normalizedUnits.map(function(item) {
    return PREFIX_MAP[item[0]] ? [PREFIX_MAP[item[0]], UNIT_MAP[item[1]]] : [UNIT_MAP[item[1]]];
  });

  // Flatten and remove null elements
  normalizedUnits = normalizedUnits.reduce(function(a,b) {
    return a.concat(b);
  }, []);
  normalizedUnits = normalizedUnits.filter(function(item) {
    return item;
  });

  parsedUnitsCache[units] = normalizedUnits;

  return normalizedUnits;
}

var stringifiedUnitsCache = new NestedMap();
/**
 * Returns a string representing a normalized unit array
 *
 * @param {string[]} units Normalized unit array
 * @returns {string} String representing passed normalized unit array and
 *   suitable for output
 *
 */
function stringifyUnits(units) {

  var stringified = stringifiedUnitsCache.get(units);
  if(stringified) {
    return stringified;
  }

  var isUnity = compareArray(units, UNITY_ARRAY);
  if(isUnity) {
    stringified = "1";
  }
  else {
    stringified = simplify(getOutputNames(units)).join("*");
  }

  // Cache result
  stringifiedUnitsCache.set(units, stringified);

  return stringified;
}

function getOutputNames(units) {
  var unitNames = [], token, tokenNext;
  for(var i = 0; i < units.length; i++) {
    token = units[i];
    tokenNext = units[i+1];
    if(PREFIX_VALUES[token]) {
      unitNames.push(OUTPUT_MAP[token] + OUTPUT_MAP[tokenNext]);
      i++;
    }
    else {
      unitNames.push(OUTPUT_MAP[token]);
    }
  }
  return unitNames;
}

function simplify (units) {
  // this turns ['s','m','s'] into ['s2','m']

  var unitCounts = units.reduce(function(acc, unit) {
    var unitCounter = acc[unit];
    if(!unitCounter) {
      acc.push(unitCounter = acc[unit] = [unit, 0]);
    }

    unitCounter[1]++;

    return acc;
  }, []);

  return unitCounts.map(function(unitCount) {
    return unitCount[0] + (unitCount[1] > 1 ? unitCount[1] : "");
  });
}

function compareArray(array1, array2) {
  if (array2.length !== array1.length) {
    return false;
  }
  for (var i = 0; i < array1.length; i++) {
    if (array2[i].compareArray) {
      if (!array2[i].compareArray(array1[i])) {
        return false;
      }
    }
    if (array2[i] !== array1[i]) {
      return false;
    }
  }
  return true;
}

function round(val, decimals) {
  return Math.round(val*Math.pow(10, decimals))/Math.pow(10, decimals);
}

function subtractTemperatures(lhs,rhs) {
  var lhsUnits = lhs.units();
  var rhsConverted = rhs.to(lhsUnits);
  var dstDegrees = Qty(getDegreeUnits(lhsUnits));
  return Qty({"scalar": lhs.scalar - rhsConverted.scalar, "numerator": dstDegrees.numerator, "denominator": dstDegrees.denominator});
}

function subtractTempDegrees(temp,deg) {
  var tempDegrees = deg.to(getDegreeUnits(temp.units()));
  return Qty({"scalar": temp.scalar - tempDegrees.scalar, "numerator": temp.numerator, "denominator": temp.denominator});
}

function addTempDegrees(temp,deg) {
  var tempDegrees = deg.to(getDegreeUnits(temp.units()));
  return Qty({"scalar": temp.scalar + tempDegrees.scalar, "numerator": temp.numerator, "denominator": temp.denominator});
}

function getDegreeUnits(units) {
  if(units === "tempK") {
    return "degK";
  }
  else if(units === "tempC") {
    return "degC";
  }
  else if(units === "tempF") {
    return "degF";
  }
  else if(units === "tempR") {
    return "degR";
  }
  else {
    throw new QtyError("Unknown type for temp conversion from: " + units);
  }
}

function toDegrees(src,dst) {
  var srcDegK = toDegK(src);
  var dstUnits = dst.units();
  var dstScalar;

  if(dstUnits === "degK") {
    dstScalar = srcDegK.scalar;
  }
  else if(dstUnits === "degC") {
    dstScalar = srcDegK.scalar ;
  }
  else if(dstUnits === "degF") {
    dstScalar = srcDegK.scalar * 9/5;
  }
  else if(dstUnits === "degR") {
    dstScalar = srcDegK.scalar * 9/5;
  }
  else {
    throw new QtyError("Unknown type for degree conversion to: " + dstUnits);
  }

  return Qty({"scalar": dstScalar, "numerator": dst.numerator, "denominator": dst.denominator});
}

function toDegK(qty) {
  var units = qty.units();
  var q;
  if(units.match(/(deg)[CFRK]/)) {
    q = qty.baseScalar;
  }
  else if(units === "tempK") {
    q = qty.scalar;
  }
  else if(units === "tempC") {
    q = qty.scalar;
  }
  else if(units === "tempF") {
    q = qty.scalar * 5/9;
  }
  else if(units === "tempR") {
    q = qty.scalar * 5/9;
  }
  else {
    throw new QtyError("Unknown type for temp conversion from: " + units);
  }

  return Qty({"scalar": q, "numerator": ["<kelvin>"], "denominator": UNITY_ARRAY});
}

function toTemp(src,dst) {
  var dstUnits = dst.units();
  var dstScalar;

  if(dstUnits === "tempK") {
    dstScalar = src.baseScalar;
  }
  else if(dstUnits === "tempC") {
    dstScalar = src.baseScalar - 273.15;
  }
  else if(dstUnits === "tempF") {
    dstScalar = (src.baseScalar * 9/5) - 459.67;
  }
  else if(dstUnits === "tempR") {
    dstScalar = src.baseScalar * 9/5;
  }
  else {
    throw new QtyError("Unknown type for temp conversion to: " + dstUnits);
  }

  return Qty({"scalar": dstScalar, "numerator": dst.numerator, "denominator": dst.denominator});
}

function toTempK(qty) {
  var units = qty.units();
  var q;
  if(units.match(/(deg)[CFRK]/)) {
    q = qty.baseScalar;
  }
  else if(units === "tempK") {
    q = qty.scalar;
  }
  else if(units === "tempC") {
    q = qty.scalar + 273.15;
  }
  else if(units === "tempF") {
    q = (qty.scalar + 459.67) * 5/9;
  }
  else if(units === "tempR") {
    q = qty.scalar * 5/9;
  }
  else {
    throw new QtyError("Unknown type for temp conversion from: " + units);
  }

  return Qty({"scalar": q, "numerator": ["<temp-K>"], "denominator": UNITY_ARRAY});
}

/**
 * Safely multiplies numbers while avoiding floating errors
 * like 0.1 * 0.1 => 0.010000000000000002
 *
 * @returns {number} result
 * @param {...number} number
 */
function mulSafe() {
  var result = 1, decimals = 0;
  for(var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    decimals = decimals + getFractional(arg);
    result *= arg;
  }

  return decimals !== 0 ? round(result, decimals) : result;
}

/**
 * Safely divides two numbers while avoiding floating errors
 * like 0.3 / 0.05 => 5.999999999999999
 *
 * @returns {number} result
 * @param {number} num Numerator
 * @param {number} den Denominator
 */
function divSafe(num, den) {
  if(den === 0) {
    throw new QtyError("Divide by zero");
  }

  var factor = Math.pow(10, getFractional(den));
  var invDen = factor/(factor*den);

  return mulSafe(num, invDen);
}

function getFractional(num) {
  // Check for NaNs or Infinities
  if(!isFinite(num)) {
    return 0;
  }

  // Faster than parsing strings
  // http://jsperf.com/count-decimals/2
  var count = 0;
  while(num % 1 !== 0) {
    num *= 10;
    count++;
  }
  return count;
}

Qty.mulSafe = mulSafe;
Qty.divSafe = divSafe;

function cleanTerms(num, den) {
  num = num.filter(function(val) {return val !== UNITY;});
  den = den.filter(function(val) {return val !== UNITY;});

  var combined = {};

  var k;
  for(var i = 0; i < num.length; i++) {
    if(PREFIX_VALUES[num[i]]) {
      k = [num[i], num[i+1]];
      i++;
    }
    else {
      k = num[i];
    }
    if(k && k !== UNITY) {
      if(combined[k]) {
        combined[k][0]++;
      }
      else {
        combined[k] = [1, k];
      }
    }
  }

  for(var j = 0; j < den.length; j++) {
    if(PREFIX_VALUES[den[j]]) {
      k = [den[j], den[j+1]];
      j++;
    }
    else {
      k = den[j];
    }
    if(k && k !== UNITY) {
      if(combined[k]) {
        combined[k][0]--;
      }
      else {
        combined[k] = [-1, k];
      }
    }
  }

  num = [];
  den = [];

  for(var prop in combined) {
    if(combined.hasOwnProperty(prop)) {
      var item = combined[prop];
      var n;
      if(item[0] > 0) {
        for(n = 0; n < item[0]; n++) {
          num.push(item[1]);
        }
      }
      else if(item[0] < 0) {
        for(n = 0; n < -item[0]; n++) {
          den.push(item[1]);
        }
      }
    }
  }

  if(num.length === 0) {
    num = UNITY_ARRAY;
  }
  if(den.length === 0) {
    den = UNITY_ARRAY;
  }

  // Flatten
  num = num.reduce(function(a,b) {
    return a.concat(b);
  }, []);
  den = den.reduce(function(a,b) {
    return a.concat(b);
  }, []);

  return [num, den];
}

/*
 * Identity function
 */
function identity(value) {
  return value;
}

/**
 * Tests if a value is a string
 *
 * @param value - Value to test
 *
 * @returns {boolean} true if value is a string, false otherwise
 */
function isString(value) {
  return typeof value === "string" || value instanceof String;
}

// Setup
var PREFIX_VALUES = {};
var PREFIX_MAP = {};
var UNIT_VALUES = {};
var UNIT_MAP = {};
var OUTPUT_MAP = {};
for(var unitDef in UNITS) {
  if(UNITS.hasOwnProperty(unitDef)) {
    var definition = UNITS[unitDef];
    if(definition[2] === "prefix") {
      PREFIX_VALUES[unitDef] = definition[1];
      for(var i = 0; i < definition[0].length; i++) {
        PREFIX_MAP[definition[0][i]] = unitDef;
      }
    }
    else {
      UNIT_VALUES[unitDef] = {
        scalar: definition[1],
        numerator: definition[3],
        denominator: definition[4]
      };
      for(var j = 0; j < definition[0].length; j++) {
        UNIT_MAP[definition[0][j]] = unitDef;
      }
    }
    OUTPUT_MAP[unitDef] = definition[0][0];
  }
}
var PREFIX_REGEX = Object.keys(PREFIX_MAP).sort(function(a, b) {
  return b.length - a.length;
}).join("|");
var UNIT_REGEX = Object.keys(UNIT_MAP).sort(function(a, b) {
  return b.length - a.length;
}).join("|");
var UNIT_MATCH = "(" + PREFIX_REGEX + ")??(" + UNIT_REGEX + ")\\b";
var UNIT_MATCH_REGEX = new RegExp(UNIT_MATCH, "g"); // g flag for multiple occurences
var UNIT_TEST_REGEX = new RegExp("^\\s*(" + UNIT_MATCH + "\\s*\\*?\\s*)+$");

Qty.Error = QtyError;

export default Qty;
