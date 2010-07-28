
describe 'js-quantities'
  describe 'initialization'
  
    it 'should create unitless'
      qty = new Qty('1')
      qty.to_f().should.be 1
      qty.numerator.should.eql ['<1>']
      qty.denominator.should.eql ['<1>']
      qty = new Qty('1.5')
      qty.to_f().should.be 1.5
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

  end
end
