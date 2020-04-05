# JS-quantities

[![Build Status](https://travis-ci.org/gentooboontoo/js-quantities.png)](https://travis-ci.org/gentooboontoo/js-quantities)

JS-quantities is originally a JavaScript port of Kevin Olbrich's library Ruby
Units (http://github.com/olbrich/ruby-units).

The library aims to simplify the handling of units for scientific calculations
involving quantities.

JS-quantities is defined as an UMD module and can be used with AMD, Node
and within browsers.

## Installing JS-quantities

### Browser

Download [latest release v1.7.5](https://raw.github.com/gentooboontoo/js-quantities/v1.7.5/build/quantities.js)
or install it with Bower:

    bower install js-quantities

Then include it:

```html
<script src='quantities.js'></script>
```

When using [Require.JS](http://requirejs.org/):

```javascript
define(['quantities'], function(Qty) {
  ...
});
```

### Node

```
$ npm install js-quantities
$ node
> var Qty = require('js-quantities');
```

## Synopsis

### Creation

Instances of quantities are made by means of `Qty()` method. `Qty` can both be
used as a constructor (with new) or as a factory (without new):

```javascript
qty = new Qty('23 ft'); // constructor
qty = Qty('23 ft'); // factory
```

`Qty` constructor accepts strings, numbers and `Qty` instances as
initializing values.

If scalars and their respective units are available programmatically, the
two argument signature may be useful:

```javascript
qty = new Qty(124, 'cm'); // => 1.24 meter
qty = Qty(124, 'cm'); // => 1.24 meter
```

For the sake of simplicity, one will use the factory way below but using
`new Qty()` is equivalent.

```javascript
qty = Qty('1m'); // => 1 meter
qty = Qty('m'); // =>  1 meter (scalar defaults to 1)

qty = Qty('1 N*m');
qty = Qty('1 N m'); // * is optional

qty = Qty('1 m/s');

qty = Qty('1 m^2/s^2');
qty = Qty('1 m^2 s^-2'); // negative powers
qty = Qty('1 m2 s-2'); // ^ is optional

qty = Qty('1 m^2 kg^2 J^2/s^2 A');

qty = Qty('1.5'); // unitless quantity
qty = Qty(1.5); // number as initializing value

qty = Qty('1 attoparsec/microfortnight');

qtyCopy = Qty(qty); // quantity could be copied when used as
                    // initializing value
```

`Qty.parse` utility method is also provided to parse and create
quantities from strings. Unlike the constructor, it will return `null`
instead of throwing an error when parsing an invalid quantity.

```javascript
Qty.parse('1 m'); // => 1 meter
Qty.parse('foo') // => null
```

### Available well-known kinds

```javascript
Qty.getKinds(); // => Array of names of every well-known kind of units
```

### Available units of a particular kind

```javascript
Qty.getUnits('currency'); // => [ 'dollar', 'cents' ]
// Or all alphabetically sorted
Qty.getUnits(); // => [ 'acre','Ah','ampere','AMU','angstrom']
```

### Alternative names of a unit

```javascript
Qty.getAliases('m'); // => [ 'm', 'meter', 'meters', 'metre', 'metres' ]
```

### Quantity compatibility, kind and various queries

```javascript
qty1.isCompatible(qty2); // => true or false

qty.kind(); // => 'length', 'area', etc...

qty.isUnitless(); // => true or false
qty.isBase(); // => true if quantity is represented with base units
```

### Conversion

```javascript
qty.toBase(); // converts to SI units (10 cm => 0.1 m) (new instance)

qty.toFloat(); // returns scalar of unitless quantity
               // (otherwise throws error)

qty.to('m'); // converts quantity to meter if compatible
             // or throws an error (new instance)
qty1.to(qty2); // converts quantity to same unit of qty2 if compatible
               // or throws an error (new instance)

qty.inverse(); // converts quantity to its inverse
               // ('100 m/s' => '.01 s/m')
// Inverses can be used, but there is no special checking to
// rename the units
Qty('10ohm').inverse() // '.1/ohm'
                       // (not '.1S', although they are equivalent)
// however, the 'to' command will convert between inverses also
Qty('10ohm').to('S') // '.1S'
```

`Qty.swiftConverter()` is a fast way to efficiently convert large array of
Number values. It configures a function accepting a value or an array of Number
values to convert.

```javascript
var convert = Qty.swiftConverter('m/h', 'ft/s'); // Configures converter

// Converting single value
var converted = convert(2500); // => 2.278..

// Converting large array of values
var convertedSerie = convert([2500, 5000, ...]); // => [2.278.., 4.556.., ...]
```

The main drawback of this conversion method is that it does not take care of
rounding issues.

### Comparison

```javascript
qty1.eq(qty2); // => true if both quantities are equal (1m == 100cm => true)
qty1.same(qty2); // => true if both quantities are same (1m == 100cm => false)
qty1.lt(qty2); // => true if qty1 is stricty less than qty2
qty1.lte(qty2); // => true if qty1 is less than or equal to qty2
qty1.gt(qty2); // => true if qty1 is stricty greater than qty2
qty1.gte(qty2); // => true if qty1 is greater than or equal to qty2

qty1.compareTo(qty2); // => -1 if qty1 < qty2,
                      // => 0 if qty1 == qty2,
                      // => 1 if qty1 > qty2
```

### Operators

* add(other): Add. other can be string or quantity. other should be unit compatible.
* sub(other): Substract. other can be string or quantity. other should be unit compatible.
* mul(other): Multiply. other can be string, number or quantity.
* div(other): Divide. other can be string, number or quantity.

### Rounding

`Qty#toPrec(precision)` : returns the nearest multiple of quantity passed as
precision.

```javascript
var qty = Qty('5.17 ft');
qty.toPrec('ft'); // => 5 ft
qty.toPrec('0.5 ft'); // => 5 ft
qty.toPrec('0.25 ft'); // => 5.25 ft
qty.toPrec('0.1 ft'); // => 5.2 ft
qty.toPrec('0.05 ft'); // => 5.15 ft
qty.toPrec('0.01 ft'); // => 5.17 ft
qty.toPrec('0.00001 ft'); // => 5.17 ft
qty.toPrec('2 ft'); // => 6 ft
qty.toPrec('2'); // => 6 ft

var qty = Qty('6.3782 m');
qty.toPrec('dm'); // => 6.4 m
qty.toPrec('cm'); // => 6.38 m
qty.toPrec('mm'); // => 6.378 m
qty.toPrec('5 cm'); // => 6.4 m
qty.toPrec('10 m'); // => 10 m
qty.toPrec(0.1); // => 6.3 m

var qty = Qty('1.146 MPa');
qty.toPrec('0.1 bar'); // => 1.15 MPa
```

### Formatting quantities

`Qty#toString` returns a string using the canonical form of the quantity (that
is it could be seamlessly reparsed by `Qty`).

```javascript
var qty = Qty('1.146 MPa');
qty.toString(); // => '1.146 MPa'
```

As a shorthand, units could be passed to `Qty#toString` and is equivalent to
successively call `Qty#to` then `Qty#toString`.

```javascript
var qty = Qty('1.146 MPa');
qty.toString('bar'); // => '11.46 bar'
qty.to('bar').toString(); // => '11.46 bar'
```

`Qty#toString` could also be used with any method from `Qty` to make some sort
of formatting. For instance, one could use `Qty#toPrec` to fix the maximum
number of decimals:

```javascript
var qty = Qty('1.146 MPa');
qty.toPrec(0.1).toString(); // => '1.1 MPa'
qty.to('bar').toPrec(0.1).toString(); // => '11.5 bar'
```

For advanced formatting needs as localization, specific rounding or any other
custom customization, quantities can be transformed into strings through
`Qty#format` according to optional target units and formatter. If target units
are specified, the quantity is converted into them before formatting.

Such a string is not intended to be reparsed to construct a new instance of
`Qty` (unlike output of `Qty#toString`).

If no formatter is specified, quantities are formatted according to default
js-quantities' formatter and is equivalent to `Qty#toString`.

```javascript
var qty = Qty('1.1234 m');
qty.format(); // same units, default formatter => '1.234 m'
qty.format('cm'); // converted to 'cm', default formatter => '123.45 cm'
```

`Qty#format` could delegates formatting to a custom formatter if required. A
formatter is a callback function accepting scalar and units as parameters and
returning a formatted string representing the quantity.

```javascript
var configurableRoundingFormatter = function(maxDecimals) {
  return function(scalar, units) {
    var pow = Math.pow(10, maxDecimals);
    var rounded = Math.round(scalar * pow) / pow;

    return rounded + ' ' + units;
  };
};

var qty = Qty('1.1234 m');

// same units, custom formatter => '1.12 m'
qty.format(configurableRoundingFormatter(2));

// convert to 'cm', custom formatter => '123.4 cm'
qty.format('cm', configurableRoundingFormatter(1));
```

Custom formatter can be configured globally by setting `Qty.formatter`.

```javascript
Qty.formatter = configurableRoundingFormatter(2);
var qty = Qty('1.1234 m');
qty.format(); // same units, current default formatter => '1.12 m'
```

### Temperatures

Like ruby-units, JS-quantities makes a distinction between a temperature (which
technically is a property) and degrees of temperature (which temperatures are
measured in).

Temperature units (i.e., 'tempK') can be converted back and forth, and will take
into account the differences in the zero points of the various scales.
Differential temperature (e.g., '100 degC') units behave like most other units.

```javascript
Qty('37 tempC').to('tempF') // => 98.6 tempF
```

JS-quantities will throw an error if you attempt to create a temperature unit
that would fall below absolute zero.

Unit math on temperatures is fairly limited.

```javascript
Qty('100 tempC').add('10 degC')  // 110 tempC
Qty('100 tempC').sub('10 degC')  // 90 tempC
Qty('100 tempC').add('50 tempC') // throws error
Qty('100 tempC').sub('50 tempC') // 50 degC
Qty('50 tempC').sub('100 tempC') // -50 degC
Qty('100 tempC').mul(scalar)     // 100*scalar tempC
Qty('100 tempC').div(scalar)     // 100/scalar tempC
Qty('100 tempC').mul(qty)        // throws error
Qty('100 tempC').div(qty)        // throws error
Qty('100 tempC*unit')            // throws error
Qty('100 tempC/unit')            // throws error
Qty('100 unit/tempC')            // throws error
Qty('100 tempC').inverse()       // throws error
```

```javascript
Qty('100 tempC').to('degC') // => 100 degC
```

This conversion references the 0 point on the scale of the temperature unit

```javascript
Qty('100 degC').to('tempC') // => -173.15 tempC
```

These conversions are always interpreted as being relative to absolute zero.
Conversions are probably better done like this...

```javascript
Qty('0 tempC').add('100 degC') // => 100 tempC
```

### Errors

Every error thrown by JS-quantities is an instance of `Qty.Error`.

```javascript
try {
  // code triggering an error inside JS-quantities
}
catch(e) {
  if(e instanceof Qty.Error) {
    // ...
  }
  else {
    // ...
  }
}
```

## Tests

Tests are implemented with Jasmine (https://github.com/pivotal/jasmine).
You could use both HTML and jasmine-node runners.

To execute specs through HTML runner, just open `SpecRunner.html` file in a
browser to execute them.

To execute specs through `jasmine-node`, launch:

    make test

### Performance regression test

There is a small benchmarking HTML page to spot performance regression between
currently checked-out quantities.js and any committed version.
Just execute:

    make bench

then open http://0.0.0.0:3000/bench

Checked-out version is benchmarked against HEAD by default but it could be changed by passing
any commit SHA on the command line. Port (default 3000) is also configurable.

    make bench COMMIT=e0c7fc468 PORT=5000

## TypeScript type declarations

A TypeScript declaration file is published on
[DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/js-quantities).

It could be installed with `npm install @types/js-quantities`.

## Contribute

Feedback and contributions are welcomed.

Pull requests must pass tests and linting. Please make sure that `make test`
and `make lint` return no errors before submitting.
