import Qty from "./constructor.js";
import { UNITY_ARRAY } from "./definitions.js";
import QtyError from "./error.js";
import { assign, compareArray } from "./utils.js";

assign(Qty.prototype, {
  isDegrees: function() {
    // signature may not have been calculated yet
    return (this.signature === null || this.signature === 400) &&
      this.numerator.length === 1 &&
      compareArray(this.denominator, UNITY_ARRAY) &&
      (this.numerator[0].match(/<temp-[CFRK]>/) || this.numerator[0].match(/<(kelvin|celsius|rankine|fahrenheit)>/));
  },

  isTemperature: function() {
    return this.isDegrees() && this.numerator[0].match(/<temp-[CFRK]>/);
  }
});

export function subtractTemperatures(lhs,rhs) {
  var lhsUnits = lhs.units();
  var rhsConverted = rhs.to(lhsUnits);
  var dstDegrees = Qty(getDegreeUnits(lhsUnits));
  return Qty({"scalar": lhs.scalar - rhsConverted.scalar, "numerator": dstDegrees.numerator, "denominator": dstDegrees.denominator});
}

export function subtractTempDegrees(temp,deg) {
  var tempDegrees = deg.to(getDegreeUnits(temp.units()));
  return Qty({"scalar": temp.scalar - tempDegrees.scalar, "numerator": temp.numerator, "denominator": temp.denominator});
}

export function addTempDegrees(temp,deg) {
  var tempDegrees = deg.to(getDegreeUnits(temp.units()));
  return Qty({"scalar": temp.scalar + tempDegrees.scalar, "numerator": temp.numerator, "denominator": temp.denominator});
}

function getDegreeUnits(units) {
  if (units === "tempK") {
    return "degK";
  }
  else if (units === "tempC") {
    return "degC";
  }
  else if (units === "tempF") {
    return "degF";
  }
  else if (units === "tempR") {
    return "degR";
  }
  else {
    throw new QtyError("Unknown type for temp conversion from: " + units);
  }
}

export function toDegrees(src,dst) {
  var srcDegK = toDegK(src);
  var dstUnits = dst.units();
  var dstScalar;

  if (dstUnits === "degK") {
    dstScalar = srcDegK.scalar;
  }
  else if (dstUnits === "degC") {
    dstScalar = srcDegK.scalar ;
  }
  else if (dstUnits === "degF") {
    dstScalar = srcDegK.scalar * 9 / 5;
  }
  else if (dstUnits === "degR") {
    dstScalar = srcDegK.scalar * 9 / 5;
  }
  else {
    throw new QtyError("Unknown type for degree conversion to: " + dstUnits);
  }

  return Qty({"scalar": dstScalar, "numerator": dst.numerator, "denominator": dst.denominator});
}

function toDegK(qty) {
  var units = qty.units();
  var q;
  if (units.match(/(deg)[CFRK]/)) {
    q = qty.baseScalar;
  }
  else if (units === "tempK") {
    q = qty.scalar;
  }
  else if (units === "tempC") {
    q = qty.scalar;
  }
  else if (units === "tempF") {
    q = qty.scalar * 5 / 9;
  }
  else if (units === "tempR") {
    q = qty.scalar * 5 / 9;
  }
  else {
    throw new QtyError("Unknown type for temp conversion from: " + units);
  }

  return Qty({"scalar": q, "numerator": ["<kelvin>"], "denominator": UNITY_ARRAY});
}

export function toTemp(src,dst) {
  var dstUnits = dst.units();
  var dstScalar;

  if (dstUnits === "tempK") {
    dstScalar = src.baseScalar;
  }
  else if (dstUnits === "tempC") {
    dstScalar = src.baseScalar - 273.15;
  }
  else if (dstUnits === "tempF") {
    dstScalar = (src.baseScalar * 9 / 5) - 459.67;
  }
  else if (dstUnits === "tempR") {
    dstScalar = src.baseScalar * 9 / 5;
  }
  else {
    throw new QtyError("Unknown type for temp conversion to: " + dstUnits);
  }

  return Qty({"scalar": dstScalar, "numerator": dst.numerator, "denominator": dst.denominator});
}

export function toTempK(qty) {
  var units = qty.units();
  var q;
  if (units.match(/(deg)[CFRK]/)) {
    q = qty.baseScalar;
  }
  else if (units === "tempK") {
    q = qty.scalar;
  }
  else if (units === "tempC") {
    q = qty.scalar + 273.15;
  }
  else if (units === "tempF") {
    q = (qty.scalar + 459.67) * 5 / 9;
  }
  else if (units === "tempR") {
    q = qty.scalar * 5 / 9;
  }
  else {
    throw new QtyError("Unknown type for temp conversion from: " + units);
  }

  return Qty({"scalar": q, "numerator": ["<temp-K>"], "denominator": UNITY_ARRAY});
}
