
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

  end

  describe 'match'
    it 'should return true with compatible quantities'
      qty1 = new Qty("1 m*kg/s")
      qty2 = new Qty("1 in*pound/min")
      qty1.isCompatible(qty2).should.be_true
      qty2 = new Qty("1 in/min")
      qty1.isCompatible(qty2).should.be_false
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
      qty.toBase().units().should.be "m^2/s^2"
    end

    it 'should convert to compatible units'
      qty = new Qty("10 cm")
      qty.to("ft").scalar.should.be 0.1/0.3048
      qty = new Qty("2m^3")
      qty.to("l").scalar.should.be 2000

      qty = new Qty("10 cm")
      qty.to(new Qty("m")).scalar.should.be 0.1
      qty.to(new Qty("20m")).scalar.should.be 0.1
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
      result.units().should.be "m^2"
      result.kind().should.be "area"

      qty2 = new Qty("3cm")
      result = qty1.mul(qty2)
      result.scalar.should.be 0.075
      result.units().should.be "m^2"

      result = qty2.mul(qty1)
      result.scalar.should.be 750
      result.units().should.be "cm^2"

      result = qty1.mul(3.5);
      result.scalar.should.be 8.75
      result.units().should.be "m"

      result = qty1.mul(0);
      result.scalar.should.be 0
      result.units().should.be "m"

      result = qty1.mul(new Qty("0m"));
      result.scalar.should.be 0
      result.units().should.be "m^2"
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
      qty = new Qty("100 cm")
      qty.units().should.be "cm"
      qty = new Qty("100 cm/s")
      qty.units().should.be "cm/s"
      qty = new Qty("1 cm^2")
      qty.units().should.be "cm^2"
      qty = new Qty("1 cm^2/s^2")
      qty.units().should.be "cm^2/s^2"
      qty = new Qty("1 cm^2*J^3/s^2*A^2")
      qty.units().should.be "cm^2*J^3/s^2*A^2"
    end
  end
end
