import Qty, { isQty } from "./constructor.js";
import {
  PREFIX_VALUES,
  OUTPUT_MAP,
  UNITY_ARRAY
} from "./definitions.js";
import {
  assign,
  compareArray,
  isNumber,
  isString,
  round
} from "./utils.js";
import NestedMap from "./nested-map.js";

/**
 * Default formatter
 *
 * @param {number} scalar - scalar value
 * @param {string} units - units as string
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

assign(Qty.prototype, {

  // returns the 'unit' part of the Unit object without the scalar
  units: function() {
    if (this._units !== undefined) {
      return this._units;
    }

    var numIsUnity = compareArray(this.numerator, UNITY_ARRAY);
    var denIsUnity = compareArray(this.denominator, UNITY_ARRAY);
    if (numIsUnity && denIsUnity) {
      this._units = "";
      return this._units;
    }

    var numUnits = stringifyUnits(this.numerator);
    var denUnits = stringifyUnits(this.denominator);
    this._units = numUnits + (denIsUnity ? "" : ("/" + denUnits));
    return this._units;
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
    if (isNumber(targetUnitsOrMaxDecimalsOrPrec)) {
      targetUnits = this.units();
      maxDecimals = targetUnitsOrMaxDecimalsOrPrec;
    }
    else if (isString(targetUnitsOrMaxDecimalsOrPrec)) {
      targetUnits = targetUnitsOrMaxDecimalsOrPrec;
    }
    else if (isQty(targetUnitsOrMaxDecimalsOrPrec)) {
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
    if (arguments.length === 1) {
      if (typeof targetUnits === "function") {
        formatter = targetUnits;
        targetUnits = undefined;
      }
    }

    formatter = formatter || Qty.formatter;
    var targetQty = this.to(targetUnits);
    return formatter.call(this, targetQty.scalar, targetQty.units());
  }
});

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
  if (stringified) {
    return stringified;
  }

  var isUnity = compareArray(units, UNITY_ARRAY);
  if (isUnity) {
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
  for (var i = 0; i < units.length; i++) {
    token = units[i];
    tokenNext = units[i + 1];
    if (PREFIX_VALUES[token]) {
      unitNames.push(OUTPUT_MAP[token] + OUTPUT_MAP[tokenNext]);
      i++;
    }
    else {
      unitNames.push(OUTPUT_MAP[token]);
    }
  }
  return unitNames;
}

function simplify(units) {
  // this turns ['s','m','s'] into ['s2','m']

  var unitCounts = units.reduce(function(acc, unit) {
    var unitCounter = acc[unit];
    if (!unitCounter) {
      acc.push(unitCounter = acc[unit] = [unit, 0]);
    }

    unitCounter[1]++;

    return acc;
  }, []);

  return unitCounts.map(function(unitCount) {
    return unitCount[0] + (unitCount[1] > 1 ? unitCount[1] : "");
  });
}
