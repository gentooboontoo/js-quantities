1.6.3 / 2016-09-22
------------------

* Add missing kinds
* Fix conversion from percentage to unitless quantity
* Fix capacitance definition
* Exclude `farad` from base units
* Rename `mass concentration` to `density`

1.6.2 / 2016-04-13
------------------

* Accept blank string as initialization value

1.6.1 / 2016-03-27
------------------

* Fix definition of square foot
* Add tablespoon `tbsp` alias
* Add `Qty.version` property

1.6.0 / 2015-12-26
------------------

* Add `Qty.getUnits` to return available units of a well-known kind
* Add `Qty.getAliases` to return every alias of a specific unit
* Allow to initialize a quantity with scalar and units as separate arguments
* Rename `memory` kind to `information`
* Add `information_rate` kind
* Accept Wh and Ah as units
* Fix hang when using water height pressure units
* Add plural for fluid ounce
* Fix `amu` and `dalton` definitions
* Add `tb` as tablespoon alias
* Add plural for `information` units
* Minor fixes or improvements

1.5.0 / 2014-12-08
------------------

* Add `Qty.getKinds` returning known kinds of units
* Add µ symbol as micro prefix alias
* Add Ω symbol as ohm unit alias
* Minor internal improvements and fixes

1.4.2 / 2014-09-09
------------------

* Fix plural for radian and add missing ones for time units
* Add "gon" international standard symbol as gradian alias
* Fix units of force
* Allow whitespaces between sign and scalar and do not accept sign
  without scalar

1.4.1 / 2014-05-14
------------------

* Use a little more robust to test string type and factorize it

1.4.0 / 2014-04-10
------------------

* Directly convert array of values when using swiftConverter
* Add support for bushel units

1.3.0 / 2014-03-05
------------------

* Add Qty#format and accept custom formatters
* Allow to call Qty() without new to create Qty instances (Qty could be used
  both as a constructor or as a factory)
* Qty#toString only supports to be passed output units as single parameter.
  Former parameters are now deprecated but still supported to not introduce
  a breaking change
* Add mc as alternate definition for prefix "micro"
* Throw error with mmm as unit
* Add rounding optimization

1.2.0 / 2013-12-17
------------------

* Throw QtyError instead of plain string
* Cache conversion results from Qty#to instead of Qty#toString
* Fix point and pica unit definitions
* Fix error when initializing a quantity with an empty string

1.1.2 / 2013-11-04
------------------

* Fix rounding issue when converting 1 cm3 to mm3
* Do some code cleaning (it should not break public API)

1.1.1 / 2013-10-01
------------------

* Fix Qty#toPrec() returning wrong result with some precision

1.1.0 / 2013-09-20
------------------

* Add array converting method
* Major speedup by means of some optimizations and refactoring

1.0.0 / 2013-07-30
------------------

* First stable version
