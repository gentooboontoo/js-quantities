JS-quantities
=============

JS-quantities is a JavaScript port of Kevin Olbrich's library Ruby Units (http://ruby-units.rubyforge.org/ruby-units). As described by its author, the library aims to simplify the handling of units for scientific calculations involving quantities.

Usage examples
-----
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
Qty#toPrec(precision) with precision as string or quantity standing for the minimum significative quantity.
Returns a new quantity.

    var qty = new Qty('5.17 ft');
    qty.toPrec('ft'); // => 5 ft
    qty.toPrec('0.5 ft'); // => 5 ft
    qty.toPrec('0.1 ft'); // => 5.2 ft
    qty.toPrec('0.05 ft'); // => 5.15 ft
    qty.toPrec('0.01 ft'); // => 5.17 ft
    qty.toPrec('0.00001 ft'); // => 5.17 ft
    qty.toPrec('2 ft'); // => 6 ft

    var qty = new Qty('6.3782 m');
    qty.toPrec('dm'); // => 6.4 m
    qty.toPrec('cm'); // => 6.38 m
    qty.toPrec('mm'); // => 6.378 m
    qty.toPrec('5 cm'); // => 6.4 m
    qty.toPrec('10 m'); // => 10 m

### Text output
    // if target_units string passed, the unit will first be converted to target_units before output.
    // Output can be rounded to max_decimals when explicit target_units are specified.
    qty.toString();
    qty.toString(target_units);
    qty.toString(max_decimals);
    qty.toString(target_units, max_decimals);
    qty.units(); // returns the unit parts of the quantity without the scalar
    qty.toString(quantity); // Helper using toPrec to round to nearest significative quantity

Tests
-----
Tests are implemented with jspec (http://visionmedia.github.com/jspec/). Just open spec/dom.html to execute them.

Contribute
----------
This project is missing some features of its parent project and is not completely bug free so fork it if you wish to bring your contribution.
