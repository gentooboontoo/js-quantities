import Qty from "./constructor.js";
import QtyError, { throwIncompatibleUnits } from "./error.js";
import { PREFIX_VALUES, UNITY, UNITY_ARRAY } from "./definitions.js";
import { assign, isNumber, isString, mulSafe } from "./utils.js";
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

    if ((this.isTemperature()||other.isTemperature()) && !(this.isUnitless()||other.isUnitless())) {
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
    var numden = cleanTerms(op1.numerator.concat(op2.numerator), op1.denominator.concat(op2.denominator));

    return Qty({"scalar": mulSafe(op1.scalar, op2.scalar), "numerator": numden[0], "denominator": numden[1]});
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
    var numden = cleanTerms(op1.numerator.concat(op2.denominator), op1.denominator.concat(op2.numerator));

    return Qty({"scalar": op1.scalar / op2.scalar, "numerator": numden[0], "denominator": numden[1]});
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

function cleanTerms(num, den) {
  num = num.filter(function(val) {
    return val !== UNITY;
  });
  den = den.filter(function(val) {
    return val !== UNITY;
  });

  var combined = {};

  var k;
  for (var i = 0; i < num.length; i++) {
    if (PREFIX_VALUES[num[i]]) {
      k = [num[i], num[i + 1]];
      i++;
    }
    else {
      k = num[i];
    }
    if (k && k !== UNITY) {
      if (combined[k]) {
        combined[k][0]++;
      }
      else {
        combined[k] = [1, k];
      }
    }
  }

  for (var j = 0; j < den.length; j++) {
    if (PREFIX_VALUES[den[j]]) {
      k = [den[j], den[j + 1]];
      j++;
    }
    else {
      k = den[j];
    }
    if (k && k !== UNITY) {
      if (combined[k]) {
        combined[k][0]--;
      }
      else {
        combined[k] = [-1, k];
      }
    }
  }

  num = [];
  den = [];

  for (var prop in combined) {
    if (combined.hasOwnProperty(prop)) {
      var item = combined[prop];
      var n;
      if (item[0] > 0) {
        for (n = 0; n < item[0]; n++) {
          num.push(item[1]);
        }
      }
      else if (item[0] < 0) {
        for (n = 0; n < -item[0]; n++) {
          den.push(item[1]);
        }
      }
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

  return [num, den];
}
