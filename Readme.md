#JS-quantities

[![Build Status](https://travis-ci.org/gentooboontoo/js-quantities.png)](https://travis-ci.org/gentooboontoo/js-quantities)

JS-quantities is a JavaScript port of Kevin Olbrich's library Ruby Units
(http://ruby-units.rubyforge.org/ruby-units).

As described by its author, the library aims to simplify the handling of
units for scientific calculations involving quantities.

JS-quantities is defined as an UMD module and can be used with AMD, Node
and within browsers.

## Usage examples

### Creation

    qty = new Qty("1m");
    qty = new Qty('m'); // => 1 meter

    qty = new Qty('1 N*m');
    qty = new Qty('1 N m'); // * is optional

    qty = new Qty("1 m/s");

    qty = new Qty("1 m^2/s^2");
    qty = new Qty("1 m^2 s^-2"); // negative powers
    qty = new Qty("1 m2 s-2"); // ^ is optional

    qty = new Qty("1 m^2 kg^2 J^2/s^2 A");

    qty = new Qty('1.5'); // unitless quantity

    qty = new Qty("1 attoparsec/microfortnight");

### Quantity compatibility, kind and various queries

    qty1.isCompatible(qty2); // => true or false

    qty.kind(); // => "length", "area", etc...

    qty.isUnitless(); // => true or false
    qty.isBase(); // => true if quantity is represented with base units

### Conversion

    qty.toBase(); // converts to SI units (10 cm => 0.1 m) (new instance)

    qty.toFloat(): // returns scalar of unitless quantity (otherwise throws error)

    qty.to("m"); // converts quantity to meter if compatible or throws an error (new instance)
    qty1.to(qty2); // converts quantity to same unit of qty2 if compatible or throws an error (new instance)

    qty.inverse(); // converts quantity to its inverse ('100 m/s' => '.01 s/m')
    // inverses can be used, but there is no special checking to rename the units
    new Qty('10ohm').inverse() // '.1/ohm' (not '.1S', although they are equivalent)
    // however, the 'to' command will convert between inverses also
    new Qty('10ohm').to('S') // '.1S'

### Comparison

    qty1.eq(qty2); // => true if both quantities are equal (1m == 100cm => true)
    qty1.same(qty2); // => true if both quantities are same (1m == 100cm => false)
    qty1.lt(qty2); // => true if qty1 is stricty less than qty2
    qty1.lte(qty2); // => true if qty1 is less than or equal to qty2
    qty1.gt(qty2); // => true if qty1 is stricty greater than qty2
    qty1.gte(qty2); // => true if qty1 is greater than or equal to qty2

    qty1.compareTo(qty2); // => -1 if qty1 < qty2, 0 if qty1 == qty2; 1 if qty1 > qty2

### Operators

* add(other): Add. other can be string or quantity. other should be unit compatible.
* sub(other): Substract. other can be string or quantity. other should be unit compatible.
* mul(other): Multiply. other can be string, number or quantity.
* div(other): Divide. other can be string, number or quantity.

### Rounding

Qty#toPrec(precision) with precision as number, string or quantity standing for the minimum significative quantity.
Returns a new quantity.

    var qty = new Qty('5.17 ft');
    qty.toPrec('ft'); // => 5 ft
    qty.toPrec('0.5 ft'); // => 5 ft
    qty.toPrec('0.1 ft'); // => 5.2 ft
    qty.toPrec('0.05 ft'); // => 5.15 ft
    qty.toPrec('0.01 ft'); // => 5.17 ft
    qty.toPrec('0.00001 ft'); // => 5.17 ft
    qty.toPrec('2 ft'); // => 6 ft
    qty.toPrec('2'); // => 6 ft

    var qty = new Qty('6.3782 m');
    qty.toPrec('dm'); // => 6.4 m
    qty.toPrec('cm'); // => 6.38 m
    qty.toPrec('mm'); // => 6.378 m
    qty.toPrec('5 cm'); // => 6.4 m
    qty.toPrec('10 m'); // => 10 m
    qty.toPrec(0.1); // => 6.3 m

### Text output

    // if target_units string passed, the unit will first be converted to target_units before output.
    // Output can be rounded to max_decimals when explicit target_units are specified.
    qty.toString();
    qty.toString(target_units);
    qty.toString(max_decimals);
    qty.toString(target_units, max_decimals);
    qty.units(); // returns the unit parts of the quantity without the scalar
    qty.toString(quantity); // Helper using toPrec to round to nearest significative quantity

### Temperatures

Like ruby-units, js-quantities makes a distinction between a temperature (which technically is a property) and degrees of temperature (which temperatures are measured in).

Temperature units (i.e., 'tempK') can be converted back and forth, and will take into account the differences in the zero points of the various scales. Differential temperature (e.g., '100 degC') units behave like most other units.

    new Qty('37 tempC').to('tempF')      #=> 98.6 tempF

Js-quantities will throw an exception if you attempt to create a temperature unit that would fall below absolute zero.

Unit math on temperatures is fairly limited.

    new Qty('100 tempC').add('10 degC')  # 110 tempC
    new Qty('100 tempC').sub('10 degC')  # 90 tempC
    new Qty('100 tempC').add('50 tempC') # exception
    new Qty('100 tempC').sub('50 tempC') # 50 degC
    new Qty('50 tempC').sub('100 tempC') # -50 degC
    new Qty('100 tempC').mul(scalar)     # 100*scalar tempC
    new Qty('100 tempC').div(scalar)     # 100/scalar tempC
    new Qty('100 tempC').mul(qty)        # exception
    new Qty('100 tempC').div(qty)        # exception
    new Qty('100 tempC*unit')            # exception
    new Qty('100 tempC/unit')            # exception
    new Qty('100 unit/tempC')            # exception
    new Qty('100 tempC').inverse()       # exception

    new Qty('100 tempC').to('degC') #=> 100 degC
This conversion references the 0 point on the scale of the temperature unit

    new Qty('100 degC').to('tempC') #=> -173.15 tempC
These conversions are always interpreted as being relative to absolute zero.
Conversions are probably better done like this...

    new Qty('0 tempC').add('100 degC') #=> 100 tempC


## Tests

Tests are implemented with Jasmine (https://github.com/pivotal/jasmine).
You could use both HTML and jasmine-node runners.

To execute specs through HTML runner, just open SpecRunner.html file in a
browser to execute them.

To execute specs through node-jasmine, launch:

    jasmine-node spec/

### Performance regression test

There is a small benchmarking HTML page to spot performance regression between
currently checked-out quantities.js and any committed version.
Just execute:

    bundle exec rake bench

then open http://0.0.0.0:3000/bench

Checked-out version is benchmarked against HEAD by default but it could be changed by passing
any commit SHA on the command line. Port (default 3000) is also configurable.

    bundle exec rake bench COMMIT=e0c7fc468 PORT=5000

## Contribute

Feedback and contribution are welcomed.
