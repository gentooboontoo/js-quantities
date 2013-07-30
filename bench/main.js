requirejs.config({
  baseUrl: "../lib",
  paths: {
    "src": "../src"
  },
  shim: {
    "JSLitmus": {
      exports: "JSLitmus"
    }
  }
});

require(["JSLitmus"], function(JSLitmus) {

  function unitConversion(Qty) {
    return function() {
      new Qty("2500 m/h").to("ft/s");
    };
  }

  require(["src/quantities"], function(Qty) {
    JSLitmus.test('Unit conversion (current)', unitConversion(Qty));
  });

  require(["src/.committed-quantities"], function(Qty) {
    JSLitmus.test('Unit conversion (GIT)', unitConversion(Qty));
  });
});

