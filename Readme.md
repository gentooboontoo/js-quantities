JS-quantities
=============

JS-quantities is a dumb, incomplete but nearly functional javascript port of Kevin Olbrich's library Ruby Units. As described by its author, the library aims to simplify the handling of units for scientific calculations involving quantities.

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
    
    qty = new Qty("1 m^2 kg^2 J^2/s^2 A");

    qty = new Qty('1.5'); // unitless quantity

### Quantity compatibility, kind and various queries
    qty1.isCompatible(qty2); // => true or false

    qty.kind(); // => "length", "area", etc...

    qty.isUnitless(); // => true or false
    qty.isBase(); // => true if quantity is represented with base units

### Conversion
    qty.toBase(); // converts to SI units (10 cm => 0.1 m) (new instance)

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

### Text output
    qty.units(); // returns the unit parts of the quantity without the scalar
