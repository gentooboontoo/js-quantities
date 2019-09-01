import { UNITY_ARRAY } from "./definitions.js";
import { unitSignature } from "./signature.js";
import parse from "./parse.js";
import QtyError from "./error.js";
import {
  compareArray,
  isNumber,
  isString
} from "./utils.js";

/**
 * Tests if a value is a Qty instance
 *
 * @param {*} value - Value to test
 *
 * @returns {boolean} true if value is a Qty instance, false otherwise
 */
export function isQty(value) {
  return value instanceof Qty;
}

export default function Qty(initValue, initUnits) {
  assertValidConstructorArgs.apply(null, arguments);

  if (!(isQty(this))) {
    return new Qty(initValue, initUnits);
  }

  this.scalar = null;
  this.baseScalar = null;
  this.signature = null;
  this._conversionCache = {};
  this.numerator = UNITY_ARRAY;
  this.denominator = UNITY_ARRAY;

  if (isDefinitionObject(initValue)) {
    this.scalar = initValue.scalar;
    this.numerator = (initValue.numerator && initValue.numerator.length !== 0) ? initValue.numerator : UNITY_ARRAY;
    this.denominator = (initValue.denominator && initValue.denominator.length !== 0) ? initValue.denominator : UNITY_ARRAY;
  }
  else if (initUnits) {
    parse.call(this, initUnits);
    this.scalar = initValue;
  }
  else {
    parse.call(this, initValue);
  }

  // math with temperatures is very limited
  if (this.denominator.join("*").indexOf("temp") >= 0) {
    throw new QtyError("Cannot divide with temperatures");
  }
  if (this.numerator.join("*").indexOf("temp") >= 0) {
    if (this.numerator.length > 1) {
      throw new QtyError("Cannot multiply by temperatures");
    }
    if (!compareArray(this.denominator, UNITY_ARRAY)) {
      throw new QtyError("Cannot divide with temperatures");
    }
  }

  this.initValue = initValue;
  updateBaseScalar.call(this);

  if (this.isTemperature() && this.baseScalar < 0) {
    throw new QtyError("Temperatures must not be less than absolute zero");
  }
}

Qty.prototype = {
  // Properly set up constructor
  constructor: Qty,
};

/**
 * Asserts constructor arguments are valid
 *
 * @param {*} value - Value to test
 * @param {string} [units] - Optional units when value is passed as a number
 *
 * @returns {void}
 * @throws {QtyError} if constructor arguments are invalid
 */
function assertValidConstructorArgs(value, units) {
  if (units) {
    if (!(isNumber(value) && isString(units))) {
      throw new QtyError("Only number accepted as initialization value " +
                         "when units are explicitly provided");
    }
  }
  else {
    if (!(isString(value) ||
          isNumber(value) ||
          isQty(value)    ||
          isDefinitionObject(value))) {
      throw new QtyError("Only string, number or quantity accepted as " +
                         "single initialization value");
    }
  }
}

/**
 * Tests if a value is a Qty definition object
 *
 * @param {*} value - Value to test
 *
 * @returns {boolean} true if value is a definition object, false otherwise
 */
function isDefinitionObject(value) {
  return value && typeof value === "object" && value.hasOwnProperty("scalar");
}

function updateBaseScalar() {
  if (this.baseScalar) {
    return this.baseScalar;
  }
  if (this.isBase()) {
    this.baseScalar = this.scalar;
    this.signature = unitSignature.call(this);
  }
  else {
    var base = this.toBase();
    this.baseScalar = base.scalar;
    this.signature = base.signature;
  }
}
