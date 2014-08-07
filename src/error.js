/**
 * Custom error type definition
 * @constructor
 */
function QtyError() {
  var err;
  if(!this) { // Allows to instantiate QtyError without new()
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

export default QtyError;
