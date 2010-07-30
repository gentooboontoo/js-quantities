
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
    end

  end

  describe 'match'
    it 'should return true with compatible quantities'
      qty1 = new Qty("1 m*kg/s")
      qty2 = new Qty("1 in*pound/min")
      qty1.isCompatible(qty2).should.be_true
    end
  end

  describe 'conversion'
    it 'should convert to base units'
      qty1 = new Qty("100 cm");
      qty1.toBase().scalar.should.be 1
      qty2 = new Qty("1 mm^2 ms^-2");
      qty2.toBase().scalar.should.be 1
    end

    it 'should convert to compatible units'
    end
  end

  describe 'utility methods'
    it 'should return kind'
      qty = new Qty("1 mm")
      qty.kind().should.be 'length'
    end

    it 'should know if a quantity is in base units'
      qty = new Qty("100 cm")
      qty.isBase().should.be false

      qty = new Qty("1m")
      qty.isBase().should.be true
    end

    it 'should return unit part of quantities'
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
