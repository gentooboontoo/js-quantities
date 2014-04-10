/* global requirejs, JSLitmus */
requirejs.config({
  baseUrl: "../lib",
  paths: {
    "src": "../src"
  }
});

require([
  "src/.committed-quantities",
  "src/quantities"
], function(previousQty, currentQty) {
  "use strict";

  function bench(name, func) {
    JSLitmus.test(name, func);
  }

  function benchCurrent(name, func) {
    bench(name + " (current)", func(currentQty));
  }

  function benchPrevious(name, func) {
    bench(name + " (GIT)", func(previousQty));
  }

  function compare(name, func) {
    benchPrevious(name, func);
    benchCurrent(name, func);
  }

  compare("Unit conversion", function(Qty) {
    return function() {
      new Qty("2500 m/h").to("ft/s");
    };
  });

  compare("Array conversion", function(Qty) {
    var convert = Qty.swiftConverter("m/h", "ft/s");
    var values = [];
    for(var i = 0; i < 1000; i++) {
      values.push(i);
    }

    return function() {
      return convert(values);
    };
  });
});

