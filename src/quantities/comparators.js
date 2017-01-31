import Qty from "./constructor.js";
import { assign, isString } from "./utils.js";
import { throwIncompatibleUnits } from "./error.js";

assign(Qty.prototype, {
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
    if (isString(other)) {
      return this.compareTo(Qty(other));
    }
    if (!this.isCompatible(other)) {
      throwIncompatibleUnits(this.units(), other.units());
    }
    if (this.baseScalar < other.baseScalar) {
      return -1;
    }
    else if (this.baseScalar === other.baseScalar) {
      return 0;
    }
    else if (this.baseScalar > other.baseScalar) {
      return 1;
    }
  },

  // Return true if quantities and units match
  // Unit("100 cm").same(Unit("100 cm"))  # => true
  // Unit("100 cm").same(Unit("1 m"))     # => false
  same: function(other) {
    return (this.scalar === other.scalar) && (this.units() === other.units());
  }
});
