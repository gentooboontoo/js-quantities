export default function NestedMap() {}

NestedMap.prototype.get = function(keys) {

  // Allows to pass key1, key2, ... instead of [key1, key2, ...]
  if (arguments.length > 1) {
    // Slower with Firefox but faster with Chrome than
    // Array.prototype.slice.call(arguments)
    // See http://jsperf.com/array-apply-versus-array-prototype-slice-call
    keys = Array.apply(null, arguments);
  }

  return keys.reduce(function(map, key, index) {
    if (map) {

      var childMap = map[key];

      if (index === keys.length - 1) {
        return childMap ? childMap.data : undefined;
      }
      else {
        return childMap;
      }
    }
  },
  this);
};

NestedMap.prototype.set = function(keys, value) {

  if (arguments.length > 2) {
    keys = Array.prototype.slice.call(arguments, 0, -1);
    value = arguments[arguments.length - 1];
  }

  return keys.reduce(function(map, key, index) {

    var childMap = map[key];
    if (childMap === undefined) {
      childMap = map[key] = {};
    }

    if (index === keys.length - 1) {
      childMap.data = value;
      return value;
    }
    else {
      return childMap;
    }
  }, this);
};
