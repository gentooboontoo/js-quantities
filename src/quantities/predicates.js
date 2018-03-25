import Qty, { isQty } from "./constructor.js";
import { BASE_UNITS, UNITY, UNITY_ARRAY } from "./definitions.js";
import { assign, compareArray, isString } from "./utils.js";

assign(Qty.prototype, {
  // returns true if no associated units
  // false, even if the units are "unitless" like 'radians, each, etc'
  isUnitless: function() {
    return [this.numerator, this.denominator].every(function(item) {
      return compareArray(item, UNITY_ARRAY);
    });
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
    if (isString(other)) {
      return this.isCompatible(Qty(other));
    }

    if (!(isQty(other))) {
      return false;
    }

    if (other.signature !== undefined) {
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

  // Returns 'true' if the Unit is represented in base units
  isBase: function() {
    if (this._isBase !== undefined) {
      return this._isBase;
    }
    if (this.isDegrees() && this.numerator[0].match(/<(kelvin|temp-K)>/)) {
      this._isBase = true;
      return this._isBase;
    }

    this.numerator.concat(this.denominator).forEach(function(item) {
      if (item !== UNITY && BASE_UNITS.indexOf(item) === -1 ) {
        this._isBase = false;
      }
    }, this);
    if (this._isBase === false) {
      return this._isBase;
    }
    this._isBase = true;
    return this._isBase;
  }
});
