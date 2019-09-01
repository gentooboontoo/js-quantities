/**
 * Tests if a value is a string
 *
 * @param {*} value - Value to test
 *
 * @returns {boolean} true if value is a string, false otherwise
 */
export function isString(value) {
  return typeof value === "string" || value instanceof String;
}

/*
 * Prefer stricter Number.isFinite if currently supported.
 * To be dropped when ES6 is finalized. Obsolete browsers will
 * have to use ES6 polyfills.
 */
var isFiniteImpl = Number.isFinite || window.isFinite;
/**
 * Tests if a value is a number
 *
 * @param {*} value - Value to test
 *
 * @returns {boolean} true if value is a number, false otherwise
 */
export function isNumber(value) {
  // Number.isFinite allows not to consider NaN or '1' as numbers
  return isFiniteImpl(value);
}

/*
 * Identity function
 */
export function identity(value) {
  return value;
}

/**
 * Returns unique strings from list
 *
 * @param {string[]} strings - array of strings
 *
 *
 * @returns {string[]} a new array of strings without duplicates
 */
export function uniq(strings) {
  var seen = {};
  return strings.filter(function(item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

export function compareArray(array1, array2) {
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

export function assign(target, properties) {
  Object.keys(properties).forEach(function(key) {
    target[key] = properties[key];
  });
}

/**
 * Safely multiplies numbers while avoiding floating errors
 * like 0.1 * 0.1 => 0.010000000000000002
 *
 * @param {...number} numbers - numbers to multiply
 *
 * @returns {number} result
 */
export function mulSafe() {
  var result = 1, decimals = 0;
  for (var i = 0; i < arguments.length; i++) {
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
export function divSafe(num, den) {
  if (den === 0) {
    throw new Error("Divide by zero");
  }

  var factor = Math.pow(10, getFractional(den));
  var invDen = factor / (factor * den);

  return mulSafe(num, invDen);
}

/**
 * Rounds value at the specified number of decimals
 *
 * @param {number} val - value to round
 * @param {number} decimals - number of decimals
 *
 * @returns {number} rounded number
 */
export function round(val, decimals) {
  return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function getFractional(num) {
  // Check for NaNs or Infinities
  if (!isFinite(num)) {
    return 0;
  }

  // Faster than parsing strings
  // http://jsperf.com/count-decimals/2
  var count = 0;
  while (num % 1 !== 0) {
    num *= 10;
    count++;
  }
  return count;
}
