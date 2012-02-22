
describe 'js-quantities'
  describe 'initialization'

    it 'should create unit only'
      qty = new Qty('m')
      qty.numerator.should.eql ['<meter>']
      qty.scalar.should.be 1
    end

    it 'should create unitless'
      qty = new Qty('1')
      qty.toFloat().should.be 1
      qty.numerator.should.eql ['<1>']
      qty.denominator.should.eql ['<1>']
      qty = new Qty('1.5')
      qty.toFloat().should.be 1.5
      qty.numerator.should.eql ['<1>']
      qty.denominator.should.eql ['<1>']
    end

    it 'should create simple'
      qty = new Qty('1m')
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<meter>']
      qty.denominator.should.eql ['<1>']
    end

    it 'should create negative'
      qty = new Qty('-1m')
      qty.scalar.should.be -1
      qty.numerator.should.eql ['<meter>']
      qty.denominator.should.eql ['<1>']
    end

    it 'should create compound'
      qty = new Qty('1 N*m')
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<newton>', '<meter>']
      qty.denominator.should.eql ['<1>']
    end

    it 'should create with denominator'
      qty = new Qty("1 m/s")
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<meter>']
      qty.denominator.should.eql ['<second>']
    end

    it 'should create with denominator only'
      qty = new Qty("1 /s")
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<1>']
      qty.denominator.should.eql ['<second>']

      qty = new Qty("1 1/s")
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<1>']
      qty.denominator.should.eql ['<second>']

      qty = new Qty("1 s^-1")
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<1>']
      qty.denominator.should.eql ['<second>']
    end

    it 'should create with powers'
      qty = new Qty("1 m^2/s^2")
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<meter>','<meter>']
      qty.denominator.should.eql ['<second>','<second>']
      qty = new Qty("1 m^2 kg^2 J^2/s^2")
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<meter>','<meter>','<kilogram>','<kilogram>','<joule>','<joule>']
      qty.denominator.should.eql ['<second>','<second>']
      qty = new Qty("1 m^2/s^2*J^3")
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<meter>','<meter>']
      qty.denominator.should.eql ['<second>','<second>','<joule>','<joule>','<joule>']
    end

    it 'should create with zero power'
      qty = new Qty("1 m^0")
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<1>']
      qty.denominator.should.eql ['<1>']
    end

    it 'should create with negative powers'
      qty = new Qty("1 m^2 s^-2")
      qty.scalar.should.be 1
      qty.numerator.should.eql ['<meter>','<meter>']
      qty.denominator.should.eql ['<second>','<second>']
      qty.same(new Qty("1 m^2/s^2")).should.be_true
    end

    it 'should accept powers without ^ syntax (simple)'
      qty1 = new Qty("1 m2")
      qty2 = new Qty("1 m^2")
      qty1.eq(qty2).should.be_true
    end

    it 'should accept powers without ^ syntax (negative power)'
      qty1 = new Qty("1 m-2")
      qty2 = new Qty("1 m^-2")
      qty1.eq(qty2).should.be_true
    end

    it 'should accept powers without ^ syntax (compound)'
      qty1 = new Qty("1 m^2 kg^2 J^2/s^2")
      qty2 = new Qty("1 m2 kg2 J2/s2")
      qty1.eq(qty2).should.be_true
    end

    it 'should accept powers without ^ syntax (compound and negative power)'
      qty1 = new Qty("1 m^2 kg^2 J^2 s^-2")
      qty2 = new Qty("1 m2 kg2 J2 s-2")
      qty1.eq(qty2).should.be_true
    end

    it 'should throw "Unit not recognized" error when initializing with an invalid unit'
      -{ new Qty("aa") }.should.throw_error 'Unit not recognized'
      -{ new Qty("m/aa") }.should.throw_error 'Unit not recognized'
      -{ new Qty(" ") }.should.throw_error 'Unit not recognized'
      -{ new Qty("N*m") }.should_not.throw_error
    end

    it 'should set base_scalar'
      qty = new Qty("0.018 MPa")
      qty.base_scalar.should.be 18000

      qty = new Qty("66 cm3")
      qty.base_scalar.should.be 0.000066
    end
  end

  describe 'isCompatible'
    it 'should return true with compatible quantities'
      qty1 = new Qty("1 m*kg/s")
      qty2 = new Qty("1 in*pound/min")
      qty1.isCompatible(qty2).should.be_true
      qty2 = new Qty("1 in/min")
      qty1.isCompatible(qty2).should.be_false
    end

    it 'should return true with dimensionless quantities'
      qty1 = new Qty("1")
      qty2 = new Qty("2")
      qty1.isCompatible(qty2).should.be_true
    end

    it 'should return false with null or undefined'
      qty1 = new Qty("1 m*kg/s")

      qty1.isCompatible(undefined).should.be_false
      qty1.isCompatible(null).should.be_false
    end

    it 'should return false with non quantities'
      qty1 = new Qty("1 m*kg/s")

      qty1.isCompatible({}).should.be_false
    end
  end

  describe 'conversion'
    it 'should convert to base units'
      qty = new Qty("100 cm")
      qty.toBase().scalar.should.be 1
      qty.toBase().units().should.be "m"
      qty = new Qty("10 cm")
      qty.toBase().scalar.should.be 0.1
      qty.toBase().units().should.be "m"
      qty = new Qty("0.3 mm^2 ms^-2")
      qty.toBase().scalar.should.be 0.3
      qty.toBase().units().should.be "m2/s2"
    end

    it 'should convert to compatible units'
      qty = new Qty("10 cm")
      qty.to("ft").scalar.should.be 0.1/0.3048
      qty = new Qty("2m^3")
      qty.to("l").scalar.should.be 2000

      qty = new Qty("10 cm")
      qty.to(new Qty("m")).scalar.should.be 0.1
      qty.to(new Qty("20m")).scalar.should.be 0.1

      qty = new Qty('1 m3')
      qty.to("cm3").scalar.should.be 1000000
    end

    it 'should return itself if target units are the same'
      qty = new Qty("123 cm3")

      qty.to('cm3').should.be qty
    end
  end

  describe 'comparison'
    it 'should return true when comparing equal quantities'
      qty1 = new Qty("1cm")
      qty2 = new Qty("10mm")
      qty1.eq(qty2).should.be_true
    end

    it 'should compare compatible quantities'
      qty1 = new Qty("1cm")
      qty2 = new Qty("1mm")
      qty3 = new Qty("10mm")
      qty4 = new Qty("28A")
      qty1.compareTo(qty2).should.be 1
      qty2.compareTo(qty1).should.be -1
      qty1.compareTo(qty3).should.be 0
      -{ qty1.compareTo(qty4) }.should.throw_error "Incompatible quantities"

      qty1.lt(qty2).should.be_false
      qty1.lt(qty3).should.be_false
      qty1.lte(qty3).should.be_true
      qty1.gte(qty3).should.be_true
      qty1.gt(qty2).should.be_true
      qty2.gt(qty1).should.be_false
    end

    it 'should compare identical quantities'
      qty1 = new Qty("1cm")
      qty2 = new Qty("1cm")
      qty3 = new Qty("10mm")
      qty1.same(qty2).should.be_true
      qty1.same(qty3).should.be_false
    end

    it 'should accept strings as parameter'
      qty = new Qty("1 cm")
      qty.lt("0.5 cm").should.be_false
      qty.lte("1 cm").should.be_true
      qty.gte("3 mm").should.be_true
      qty.gt("5 m").should.be_false
    end

  end

  describe 'math'

    it 'should add quantities'
      qty1 = new Qty("2.5m")
      qty2 = new Qty("3m")
      qty1.add(qty2).scalar.should.be 5.5

      qty1.add("3m").scalar.should.be 5.5

      qty2 = new Qty("3cm")
      result = qty1.add(qty2)
      result.scalar.should.be 2.53
      result.units().should.be "m"

      result = qty2.add(qty1)
      result.scalar.should.be 253
      result.units().should.be "cm"
    end

    it 'should substract quantities'
      qty1 = new Qty("2.5m")
      qty2 = new Qty("3m")
      qty1.sub(qty2).scalar.should.be -0.5

      qty1.sub("2m").scalar.should.be 0.5
      qty1.sub("-2m").scalar.should.be 4.5

      qty2 = new Qty("3cm")
      result = qty1.sub(qty2)
      result.scalar.should.be 2.47
      result.units().should.be "m"

      result = qty2.sub(qty1)
      result.scalar.should.be -247
      result.units().should.be "cm"
    end

    it 'should multiply quantities'
      qty1 = new Qty("2.5m")
      qty2 = new Qty("3m")
      result = qty1.mul(qty2)
      result.scalar.should.be 7.5
      result.units().should.be "m2"
      result.kind().should.be "area"

      qty2 = new Qty("3cm")
      result = qty1.mul(qty2)
      result.scalar.should.be 0.075
      result.units().should.be "m2"

      result = qty2.mul(qty1)
      result.scalar.should.be 750
      result.units().should.be "cm2"

      result = qty1.mul(3.5);
      result.scalar.should.be 8.75
      result.units().should.be "m"

      result = qty1.mul(0);
      result.scalar.should.be 0
      result.units().should.be "m"

      result = qty1.mul(new Qty("0m"));
      result.scalar.should.be 0
      result.units().should.be "m2"

      qty2 = new Qty("1.458 m")
      result = qty1.mul(qty2)
      result.scalar.should.be 3.645
      result.units().should.be "m2"
    end

    it 'should multiply unlike quantities'
      qty1 = new Qty("2.5 m")
      qty2 = new Qty("3 N")

      result = qty1.mul(qty2)
      result.scalar.should.be 7.5

      qty1 = new Qty("2.5 m^2")
      qty2 = new Qty("3 kg/m^2")

      result = qty1.mul(qty2)
      result.scalar.should.be 7.5
      result.units().should.be "kg"
    end

    it 'should divide unlike quantities'
      qty1 = new Qty("7.5kg")
      qty2 = new Qty("2.5m^2")

      result = qty1.div(qty2)
      result.scalar.should.be 3
      result.units().should.be "kg/m2"
    end

    it 'should divide quantities'
      qty1 = new Qty("2.5m")
      qty2 = new Qty("3m")
      qty3 = new Qty("0m")

      -{qty1.div(qty3)}.should.throw_error "Divide by zero"
      -{qty1.div(0)}.should.throw_error "Divide by zero"
      qty3.div(qty1).scalar.should.be 0

      result = qty1.div(qty2)
      result.scalar.should.be 2.5/3
      result.units().should.be ""
      result.kind().should.be "unitless"

      qty4 = new Qty("3cm")
      result = qty1.div(qty4)
      result.scalar.should.be 2.5/0.03
      result.units().should.be ""

      result = qty4.div(qty1)
      result.scalar.should.be 0.012
      result.units().should.be ""

      result = qty1.div(3.5);
      result.scalar.should.be 2.5/3.5
      result.units().should.be "m"
    end

  end

  describe 'utility methods'

    it 'should accept string as parameter for compatibility tests'
      qty = new Qty("1 mm")

      qty.isCompatible("2 mm").should.be_true
      qty.isCompatible("2 mm^3").should.be_false
    end

    it 'should return kind'
      qty = new Qty("1 mm")
      qty.kind().should.be 'length'
    end

    it 'should know if a quantity is in base units'
      qty = new Qty("100 cm")
      qty.isBase().should.be_false

      qty = new Qty("1m")
      qty.isBase().should.be_true
    end

    it 'should return unit part of quantities'
      qty = new Qty("1")
      qty.units().should.be ""
      qty = new Qty("1 /s")
      qty.units().should.be "1/s"
      qty = new Qty("100 cm")
      qty.units().should.be "cm"
      qty = new Qty("100 cm/s")
      qty.units().should.be "cm/s"
      qty = new Qty("1 cm^2")
      qty.units().should.be "cm2"
      qty = new Qty("1 cm^2/s^2")
      qty.units().should.be "cm2/s2"
      qty = new Qty("1 cm^2*J^3/s^2*A^2")
      qty.units().should.be "cm2*J3/s2*A2"
    end

  end

  describe 'toString'
    it 'should generate readable human output'
      qty = new Qty("2m")
      qty.toString().should.be "2 m"
      qty.toString("cm").should.be "200 cm"
      qty.toString("km").should.be "0.002 km"
      -{ qty.toString("A") }.should.throw_error "Incompatible Units"

      qty = new Qty("24.5m/s")
      qty.toString().should.be "24.5 m/s"
      -{ qty.toString("m") }.should.throw_error "Incompatible Units"
      qty.toString("km/h").should.be "88.2 km/h"

      qty = new Qty("254kg/m^2")
      qty.toString().should.be "254 kg/m2"

      qty = new Qty("2")
      qty.toString().should.be "2"
    end

    it 'should round readable human output when max decimals is specified'
      qty = (new Qty("2m")).div(3)
      qty.toString("cm", 2).should.be "66.67 cm"

      qty = new Qty("2.8m")
      qty.toString("m", 0).should.be "3 m"
      qty.toString("cm", 0).should.be "280 cm"
      qty = new Qty("2.818m")
      qty.toString("cm", 0).should.be "282 cm"
    end

    it 'should round to max decimals'
      qty = (new Qty("2.987654321 m"))

      qty.toString(3).should.be "2.988 m"
      qty.toString(0).should.be "3 m"
    end

    it 'should round according to precision passed as quantity'
      qty = new Qty('5.17 ft')

      qty.toString(new Qty('ft')).should.be "5 ft"
      qty.toString(new Qty('2 ft')).should.be "6 ft"
      qty.toString(new Qty('0.5 ft')).should.be "5 ft"
      qty.toString(new Qty('0.1 ft')).should.be "5.2 ft"
      qty.toString(new Qty('0.05 ft')).should.be "5.15 ft"
      qty.toString(new Qty('0.01 ft')).should.be "5.17 ft"
      qty.toString(new Qty('0.0001 ft')).should.be "5.17 ft"
    end

    it 'should return same output with successive calls'
      qty = new Qty("123 cm3")
      qty.toString("cm3", 0).should.be "123 cm3"
      qty.toString("cm3", 0).should.be "123 cm3"
    end

    it 'should be the same when called with no parameters or same units'
      qty = new Qty("123 cm3")
      qty.toString().should.be qty.toString('cm3')
    end

  end

  describe 'precision rounding'
    it 'should round according to precision passed as quantity with same units'
      qty = new Qty('5.17 ft')

      qty.toPrec(new Qty('ft')).toString().should.be "5 ft"
      qty.toPrec(new Qty('2 ft')).toString().should.be "6 ft"
      qty.toPrec(new Qty('10 ft')).toString().should.be "10 ft"
      qty.toPrec(new Qty('0.5 ft')).toString().should.be "5 ft"
      qty.toPrec(new Qty('0.1 ft')).toString().should.be "5.2 ft"
      qty.toPrec(new Qty('0.05 ft')).toString().should.be "5.15 ft"
      qty.toPrec(new Qty('0.01 ft')).toString().should.be "5.17 ft"
      qty.toPrec(new Qty('0.0001 ft')).toString().should.be "5.17 ft"
    end

    it 'should allow string as precision parameter'
      qty = new Qty('5.17 ft')

      qty.toPrec('ft').toString().should.be "5 ft"
      qty.toPrec('0.5 ft').toString().should.be "5 ft"
      qty.toPrec('0.05 ft').toString().should.be "5.15 ft"
    end

    it 'should round according to precision passed as quantity with different prefixes'
      qty = new Qty('6.3782 m')

      qty.toPrec(new Qty('dm')).toString().should.be "6.4 m"
      qty.toPrec(new Qty('cm')).toString().should.be "6.38 m"
      qty.toPrec(new Qty('mm')).toString().should.be "6.378 m"

      qty.toPrec(new Qty('5 cm')).toString().should.be "6.4 m"
    end

    it 'should round according to precision passed as quantity with different compatible units'
      qty = new Qty('1.146 MPa')
      qty.toPrec(new Qty('0.1 bar')).toString().should.be "1.15 MPa"
      qty.toPrec(new Qty('0.01 MPa')).toString().should.be "1.15 MPa"
      qty.toPrec(new Qty('dbar')).toString().should.be "1.15 MPa"

      qty = new Qty('5.171234568 ft')
      qty.toPrec(new Qty('m')).toString().should.be "7 ft"
      qty.toPrec(new Qty('dm')).toString().should.be "5.2 ft"
      qty.toPrec(new Qty('cm')).toString().should.be "5.18 ft"
      qty.toPrec(new Qty('mm')).toString().should.be "5.171 ft"
    end
  end

  describe 'mul_safe'
    it 'should multiply while trying to avoid numerical errors'
      Qty.mul_safe(0.1, 0.1).should.be 0.01
      Qty.mul_safe(1e-11, 123.456789).should.be 1.23456789e-9
    end
  end

end
