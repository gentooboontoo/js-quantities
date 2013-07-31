requirejs.config({
  baseUrl: "../lib",
  paths: {
    "src": "../src"
  }
});

(function() {
  function unitConversion(Qty) {
    return function() {
      new Qty("2500 m/h").to("ft/s");
    };
  }

  require(["src/quantities"], function(Qty) {
    var convert = unitConversion(Qty);
    JSLitmus.test('Unit conversion (current)', convert);
  });

  require(["src/.committed-quantities"], function(Qty) {
    var convert = unitConversion(Qty);
    JSLitmus.test('Unit conversion (GIT)', convert);
  });
}());

