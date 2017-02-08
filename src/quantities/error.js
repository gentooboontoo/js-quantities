/**
 * Custom error type definition
 * @constructor
 */
export default function QtyError() {
  var err;
  if (!this) { // Allows to instantiate QtyError without new()
    err = Object.create(QtyError.prototype);
    QtyError.apply(err, arguments);
    return err;
  }
  err = Error.apply(this, arguments);
  this.name = "QtyError";
  this.message = err.message;
  this.stack = err.stack;
}
QtyError.prototype = Object.create(Error.prototype, {constructor: { value: QtyError }});

/*
 * Throws incompatible units error
 * @param {string} left - units
 * @param {string} right - units incompatible with first argument
 * @throws "Incompatible units" error
 */
export function throwIncompatibleUnits(left, right) {
  throw new QtyError("Incompatible units: " + left + " and " + right);
}
