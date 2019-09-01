import Qty from "./constructor.js";
import QtyError, { throwIncompatibleUnits } from "./error.js";
import { PREFIX_VALUES, UNITY, UNITY_ARRAY } from "./definitions.js";
import { assign, isNumber, isString, mulSafe, divSafe } from "./utils.js";
import {
  addTempDegrees,
  subtractTempDegrees,
  subtractTemperatures
} from "./temperature.js";

assign(Qty.prototype, {
  // Returns new instance with units of this
  add: function(other) {
    if (isString(other)) {
      other = Qty(other);
    }

    if (!this.isCompatible(other)) {
      throwIncompatibleUnits(this.units(), other.units());
    }

    if (this.isTemperature() && other.isTemperature()) {
      throw new QtyError("Cannot add two temperatures");
    }
    else if (this.isTemperature()) {
      return addTempDegrees(this, other);
    }
    else if (other.isTemperature()) {
      return addTempDegrees(other, this);
    }

    return Qty({"scalar": this.scalar + other.to(this).scalar, "numerator": this.numerator, "denominator": this.denominator});
  },

  sub: function(other) {
    if (isString(other)) {
      other = Qty(other);
    }

    if (!this.isCompatible(other)) {
      throwIncompatibleUnits(this.units(), other.units());
    }

    if (this.isTemperature() && other.isTemperature()) {
      return subtractTemperatures(this,other);
    }
    else if (this.isTemperature()) {
      return subtractTempDegrees(this,other);
    }
    else if (other.isTemperature()) {
      throw new QtyError("Cannot subtract a temperature from a differential degree unit");
    }

    return Qty({"scalar": this.scalar - other.to(this).scalar, "numerator": this.numerator, "denominator": this.denominator});
  },

  mul: function(other) {
    if (isNumber(other)) {
      return Qty({"scalar": mulSafe(this.scalar, other), "numerator": this.numerator, "denominator": this.denominator});
    }
    else if (isString(other)) {
      other = Qty(other);
    }

    if ((this.isTemperature() || other.isTemperature()) && !(this.isUnitless() || other.isUnitless())) {
      throw new QtyError("Cannot multiply by temperatures");
    }

    // Quantities should be multiplied with same units if compatible, with base units else
    var op1 = this;
    var op2 = other;

    // so as not to confuse results, multiplication and division between temperature degrees will maintain original unit info in num/den
    // multiplication and division between deg[CFRK] can never factor each other out, only themselves: "degK*degC/degC^2" == "degK/degC"
    if (op1.isCompatible(op2) && op1.signature !== 400) {
      op2 = op2.to(op1);
    }
    var numdenscale = cleanTerms(op1.numerator, op1.denominator, op2.numerator, op2.denominator);

    return Qty({"scalar": mulSafe(op1.scalar, op2.scalar, numdenscale[2]), "numerator": numdenscale[0], "denominator": numdenscale[1]});
  },

  div: function(other) {
    if (isNumber(other)) {
      if (other === 0) {
        throw new QtyError("Divide by zero");
      }
      return Qty({"scalar": this.scalar / other, "numerator": this.numerator, "denominator": this.denominator});
    }
    else if (isString(other)) {
      other = Qty(other);
    }

    if (other.scalar === 0) {
      throw new QtyError("Divide by zero");
    }

    if (other.isTemperature()) {
      throw new QtyError("Cannot divide with temperatures");
    }
    else if (this.isTemperature() && !other.isUnitless()) {
      throw new QtyError("Cannot divide with temperatures");
    }

    // Quantities should be multiplied with same units if compatible, with base units else
    var op1 = this;
    var op2 = other;

    // so as not to confuse results, multiplication and division between temperature degrees will maintain original unit info in num/den
    // multiplication and division between deg[CFRK] can never factor each other out, only themselves: "degK*degC/degC^2" == "degK/degC"
    if (op1.isCompatible(op2) && op1.signature !== 400) {
      op2 = op2.to(op1);
    }
    var numdenscale = cleanTerms(op1.numerator, op1.denominator, op2.denominator, op2.numerator);

    return Qty({"scalar": mulSafe(op1.scalar, numdenscale[2]) / op2.scalar, "numerator": numdenscale[0], "denominator": numdenscale[1]});
  },

  // Returns a Qty that is the inverse of this Qty,
  inverse: function() {
    if (this.isTemperature()) {
      throw new QtyError("Cannot divide with temperatures");
    }
    if (this.scalar === 0) {
      throw new QtyError("Divide by zero");
    }
    return Qty({"scalar": 1 / this.scalar, "numerator": this.denominator, "denominator": this.numerator});
  }
});

function cleanTerms(num1, den1, num2, den2) {
  function notUnity(val) {
    return val !== UNITY;
  }

  num1 = num1.filter(notUnity);
  num2 = num2.filter(notUnity);
  den1 = den1.filter(notUnity);
  den2 = den2.filter(notUnity);

  var combined = {};

  function combineTerms(terms, direction) {
    var k;
    var prefix;
    var prefixValue;
    for (var i = 0; i < terms.length; i++) {
      if (PREFIX_VALUES[terms[i]]) {
        k = terms[i + 1];
        prefix = terms[i];
        prefixValue = PREFIX_VALUES[prefix];
        i++;
      }
      else {
        k = terms[i];
        prefix = null;
        prefixValue = 1;
      }
      if (k && k !== UNITY) {
        if (combined[k]) {
          combined[k][0] += direction;
          var combinedPrefixValue = combined[k][2] ? PREFIX_VALUES[combined[k][2]] : 1;
          combined[k][direction === 1 ? 3 : 4] *= divSafe(prefixValue, combinedPrefixValue);
        }
        else {
          combined[k] = [direction, k, prefix, 1, 1];
        }
      }
    }
  }

  combineTerms(num1, 1);
  combineTerms(den1, -1);
  combineTerms(num2, 1);
  combineTerms(den2, -1);

  var num = [];
  var den = [];
  var scale = 1;

  for (var prop in combined) {
    if (combined.hasOwnProperty(prop)) {
      var item = combined[prop];
      var n;
      if (item[0] > 0) {
        for (n = 0; n < item[0]; n++) {
          num.push(item[2] === null ? item[1] : [item[2], item[1]]);
        }
      }
      else if (item[0] < 0) {
        for (n = 0; n < -item[0]; n++) {
          den.push(item[2] === null ? item[1] : [item[2], item[1]]);
        }
      }
      scale *= divSafe(item[3], item[4]);
    }
  }

  if (num.length === 0) {
    num = UNITY_ARRAY;
  }
  if (den.length === 0) {
    den = UNITY_ARRAY;
  }

  // Flatten
  num = num.reduce(function(a,b) {
    return a.concat(b);
  }, []);
  den = den.reduce(function(a,b) {
    return a.concat(b);
  }, []);

  return [num, den, scale];
}
