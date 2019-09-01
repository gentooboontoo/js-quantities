import Qty from "./constructor.js";
import { PREFIX_VALUES, UNIT_VALUES } from "./definitions.js";
import {toDegrees, toTemp, toTempK } from "./temperature.js";
import {
  assign,
  divSafe,
  identity,
  isNumber,
  isString,
  mulSafe
} from "./utils.js";
import QtyError, { throwIncompatibleUnits } from "./error.js";

assign(Qty.prototype, {
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

    if (other === undefined || other === null) {
      return this;
    }

    if (!isString(other)) {
      return this.to(other.units());
    }

    cached = this._conversionCache[other];
    if (cached) {
      return cached;
    }

    // Instantiating target to normalize units
    target = Qty(other);
    if (target.units() === this.units()) {
      return this;
    }

    if (!this.isCompatible(target)) {
      if (this.isInverse(target)) {
        target = this.inverse().to(other);
      }
      else {
        throwIncompatibleUnits(this.units(), target.units());
      }
    }
    else {
      if (target.isTemperature()) {
        target = toTemp(this,target);
      }
      else if (target.isDegrees()) {
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

  // convert to base SI units
  // results of the conversion are cached so subsequent calls to this will be fast
  toBase: function() {
    if (this.isBase()) {
      return this;
    }

    if (this.isTemperature()) {
      return toTempK(this);
    }

    var cached = baseUnitCache[this.units()];
    if (!cached) {
      cached = toBaseUnits(this.numerator,this.denominator);
      baseUnitCache[this.units()] = cached;
    }
    return cached.mul(this.scalar);
  },

  // Converts the unit back to a float if it is unitless.  Otherwise raises an exception
  toFloat: function() {
    if (this.isUnitless()) {
      return this.scalar;
    }
    throw new QtyError("Can't convert to Float unless unitless.  Use Unit#scalar");
  },

  /**
   * Returns the nearest multiple of quantity passed as
   * precision
   *
   * @param {(Qty|string|number)} precQuantity - Quantity, string formated
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
    if (isString(precQuantity)) {
      precQuantity = Qty(precQuantity);
    }
    if (isNumber(precQuantity)) {
      precQuantity = Qty(precQuantity + " " + this.units());
    }

    if (!this.isUnitless()) {
      precQuantity = precQuantity.to(this.units());
    }
    else if (!precQuantity.isUnitless()) {
      throwIncompatibleUnits(this.units(), precQuantity.units());
    }

    if (precQuantity.scalar === 0) {
      throw new QtyError("Divide by zero");
    }

    var precRoundedResult = mulSafe(
      Math.round(this.scalar / precQuantity.scalar),
      precQuantity.scalar
    );

    return Qty(precRoundedResult + this.units());
  }
});

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
export function swiftConverter(srcUnits, dstUnits) {
  var srcQty = Qty(srcUnits);
  var dstQty = Qty(dstUnits);

  if (srcQty.eq(dstQty)) {
    return identity;
  }

  var convert;
  if (!srcQty.isTemperature()) {
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
    var i, length, result;
    if (!Array.isArray(value)) {
      return convert(value);
    }
    else {
      length = value.length;
      result = [];
      for (i = 0; i < length; i++) {
        result.push(convert(value[i]));
      }
      return result;
    }
  };
}

var baseUnitCache = {};

function toBaseUnits(numerator,denominator) {
  var num = [];
  var den = [];
  var q = 1;
  var unit;
  for (var i = 0; i < numerator.length; i++) {
    unit = numerator[i];
    if (PREFIX_VALUES[unit]) {
      // workaround to fix
      // 0.1 * 0.1 => 0.010000000000000002
      q = mulSafe(q, PREFIX_VALUES[unit]);
    }
    else {
      if (UNIT_VALUES[unit]) {
        q *= UNIT_VALUES[unit].scalar;

        if (UNIT_VALUES[unit].numerator) {
          num.push(UNIT_VALUES[unit].numerator);
        }
        if (UNIT_VALUES[unit].denominator) {
          den.push(UNIT_VALUES[unit].denominator);
        }
      }
    }
  }
  for (var j = 0; j < denominator.length; j++) {
    unit = denominator[j];
    if (PREFIX_VALUES[unit]) {
      q /= PREFIX_VALUES[unit];
    }
    else {
      if (UNIT_VALUES[unit]) {
        q /= UNIT_VALUES[unit].scalar;

        if (UNIT_VALUES[unit].numerator) {
          den.push(UNIT_VALUES[unit].numerator);
        }
        if (UNIT_VALUES[unit].denominator) {
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
