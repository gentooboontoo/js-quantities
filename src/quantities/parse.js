import { isString } from "./utils.js";
import QtyError from "./error.js";
import { PREFIX_MAP, UNIT_MAP } from "./definitions.js";

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
// Allow unit powers representing scalar, length, area, volume; 4 is for some
// special case representations in SI base units.
var SAFE_POWER = "[01234]";
var TOP_REGEX = new RegExp ("([^ \\*\\d]+?)(?:" + POWER_OP + ")?(-?" + SAFE_POWER + "(?![a-zA-Z]))");
var BOTTOM_REGEX = new RegExp("([^ \\*\\d]+?)(?:" + POWER_OP + ")?(" + SAFE_POWER + "(?![a-zA-Z]))");

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
export default function parse(val) {
  if (!isString(val)) {
    val = val.toString();
  }
  val = val.trim();

  var result = QTY_STRING_REGEX.exec(val);
  if (!result) {
    throw new QtyError(val + ": Quantity not recognized");
  }

  var scalarMatch = result[1];
  if (scalarMatch) {
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
  while ((result = TOP_REGEX.exec(top))) {
    n = parseFloat(result[2]);
    if (isNaN(n)) {
      // Prevents infinite loops
      throw new QtyError("Unit exponent is not a number");
    }
    // Disallow unrecognized unit even if exponent is 0
    if (n === 0 && !UNIT_TEST_REGEX.test(result[1])) {
      throw new QtyError("Unit not recognized");
    }
    x = result[1] + " ";
    nx = "";
    for (var i = 0; i < Math.abs(n) ; i++) {
      nx += x;
    }
    if (n >= 0) {
      top = top.replace(result[0], nx);
    }
    else {
      bottom = bottom ? bottom + nx : nx;
      top = top.replace(result[0], "");
    }
  }

  while ((result = BOTTOM_REGEX.exec(bottom))) {
    n = parseFloat(result[2]);
    if (isNaN(n)) {
      // Prevents infinite loops
      throw new QtyError("Unit exponent is not a number");
    }
    // Disallow unrecognized unit even if exponent is 0
    if (n === 0 && !UNIT_TEST_REGEX.test(result[1])) {
      throw new QtyError("Unit not recognized");
    }
    x = result[1] + " ";
    nx = "";
    for (var j = 0; j < n ; j++) {
      nx += x;
    }

    bottom = bottom.replace(result[0], nx);
  }

  if (top) {
    this.numerator = parseUnits(top.trim());
  }
  if (bottom) {
    this.denominator = parseUnits(bottom.trim());
  }
}

var PREFIX_REGEX = Object.keys(PREFIX_MAP).sort(function(a, b) {
  return b.length - a.length;
}).join("|");
var UNIT_REGEX = Object.keys(UNIT_MAP).sort(function(a, b) {
  return b.length - a.length;
}).join("|");
/*
 * Minimal boundary regex to support units with Unicode characters
 * \b only works for ASCII
 */
var BOUNDARY_REGEX = "\\b|$";
var UNIT_MATCH = "(" + PREFIX_REGEX + ")??(" +
                 UNIT_REGEX +
                 ")(?:" + BOUNDARY_REGEX + ")";
var UNIT_TEST_REGEX = new RegExp("^\\s*(" + UNIT_MATCH + "[\\s\\*]*)+$");
var UNIT_MATCH_REGEX = new RegExp(UNIT_MATCH, "g"); // g flag for multiple occurences
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
  if (cached) {
    return cached;
  }

  var unitMatch, normalizedUnits = [];

  // Scan
  if (!UNIT_TEST_REGEX.test(units)) {
    throw new QtyError("Unit not recognized");
  }

  while ((unitMatch = UNIT_MATCH_REGEX.exec(units))) {
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

/**
 * Parses a string as a quantity
 * @param {string} value - quantity as text
 * @throws if value is not a string
 * @returns {Qty|null} Parsed quantity or null if unrecognized
 */
export function globalParse(value) {
  if (!isString(value)) {
    throw new QtyError("Argument should be a string");
  }

  try {
    return this(value);
  }
  catch (e) {
    return null;
  }
}
