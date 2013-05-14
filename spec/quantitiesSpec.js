
describe('js-quantities', function() {
  describe('initialization', function() {

    it('should create unit only', function() {
      qty = new Qty('m');
      expect(qty.numerator).toEqual(['<meter>']);
      expect(qty.scalar).toBe(1);
    });

    it('should create unitless', function() {
      qty = new Qty('1');
      expect(qty.toFloat()).toBe(1);
      expect(qty.numerator).toEqual(['<1>']);
      expect(qty.denominator).toEqual(['<1>']);
      qty = new Qty('1.5');
      expect(qty.toFloat()).toBe(1.5);
      expect(qty.numerator).toEqual(['<1>']);
      expect(qty.denominator).toEqual(['<1>']);
    });

    it('should create simple', function() {
      qty = new Qty('1m');
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<meter>']);
      expect(qty.denominator).toEqual(['<1>']);
    });

    it('should create negative', function() {
      qty = new Qty('-1m');
      expect(qty.scalar).toBe(-1);
      expect(qty.numerator).toEqual(['<meter>']);
      expect(qty.denominator).toEqual(['<1>']);
    });

    it('should create compound', function() {
      qty = new Qty('1 N*m');
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<newton>', '<meter>']);
      expect(qty.denominator).toEqual(['<1>']);
    });

    it('should create with denominator', function() {
      qty = new Qty("1 m/s");
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<meter>']);
      expect(qty.denominator).toEqual(['<second>']);
    });

    it('should create with denominator only', function() {
      qty = new Qty("1 /s");
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<1>']);
      expect(qty.denominator).toEqual(['<second>']);

      qty = new Qty("1 1/s");
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<1>']);
      expect(qty.denominator).toEqual(['<second>']);

      qty = new Qty("1 s^-1");
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<1>']);
      expect(qty.denominator).toEqual(['<second>']);
    });

    it('should create with powers', function() {
      qty = new Qty("1 m^2/s^2");
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<meter>','<meter>']);
      expect(qty.denominator).toEqual(['<second>','<second>']);
      qty = new Qty("1 m^2 kg^2 J^2/s^2");
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<meter>','<meter>','<kilogram>','<kilogram>','<joule>','<joule>']);
      expect(qty.denominator).toEqual(['<second>','<second>']);
      qty = new Qty("1 m^2/s^2*J^3");
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<meter>','<meter>']);
      expect(qty.denominator).toEqual(['<second>','<second>','<joule>','<joule>','<joule>']);
    });

    it('should create with zero power', function() {
      qty = new Qty("1 m^0");
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<1>']);
      expect(qty.denominator).toEqual(['<1>']);
    });

    it('should create with negative powers', function() {
      qty = new Qty("1 m^2 s^-2");
      expect(qty.scalar).toBe(1);
      expect(qty.numerator).toEqual(['<meter>','<meter>']);
      expect(qty.denominator).toEqual(['<second>','<second>']);
      expect(qty.same(new Qty("1 m^2/s^2"))).toBe(true);
    });

    it('should accept powers without ^ syntax (simple)', function() {
      qty1 = new Qty("1 m2");
      qty2 = new Qty("1 m^2");
      expect(qty1.eq(qty2)).toBe(true);
    });

    it('should accept powers without ^ syntax (negative power)', function() {
      qty1 = new Qty("1 m-2");
      qty2 = new Qty("1 m^-2");
      expect(qty1.eq(qty2)).toBe(true);
    });

    it('should accept powers without ^ syntax (compound)', function() {
      qty1 = new Qty("1 m^2 kg^2 J^2/s^2");
      qty2 = new Qty("1 m2 kg2 J2/s2");
      expect(qty1.eq(qty2)).toBe(true);
    });

    it('should accept powers without ^ syntax (compound and negative power)', function() {
      qty1 = new Qty("1 m^2 kg^2 J^2 s^-2");
      qty2 = new Qty("1 m2 kg2 J2 s-2");
      expect(qty1.eq(qty2)).toBe(true);
    });

    it('should throw "Unit not recognized" error when initializing with an invalid unit', function() {
      expect(function() { new Qty("aa") }).toThrow('Unit not recognized');
      expect(function() { new Qty("m/aa") }).toThrow('Unit not recognized');
      expect(function() { new Qty(" ") }).toThrow('Unit not recognized');
      expect(function() { new Qty("m-") }).toThrow('Unit not recognized');
      expect(function() { new Qty("N*m") }).not.toThrow
    });

    it('should throw "Unit not recognized" error when initializing with an invalid unit and a 0 exponent', function() {
      expect(function() { new Qty("3p0") }).toThrow();
      expect(function() { new Qty("3p-0") }).toThrow();
    });

    it('should set base_scalar', function() {
      qty = new Qty("0.018 MPa");
      expect(qty.base_scalar).toBe(18000);

      qty = new Qty("66 cm3");
      expect(qty.base_scalar).toBe(0.000066);
    });

    it('should trim init value', function() {
      qty = new Qty("  66 cm3  ");

      expect(qty.init_value).toEqual("66 cm3");
    });

    it('should allow whitespace-wrapped value', function() {
      expect(function() { new Qty("  2 MPa  ") }).not.toThrow();
    });
  });

  describe('isCompatible', function() {
    it('should return true with compatible quantities', function() {
      qty1 = new Qty("1 m*kg/s");
      qty2 = new Qty("1 in*pound/min");
      expect(qty1.isCompatible(qty2)).toBe(true);
      qty2 = new Qty("1 in/min");
      expect(qty1.isCompatible(qty2)).toBe(false);
    });

    it('should return true with dimensionless quantities', function() {
      qty1 = new Qty("1");
      qty2 = new Qty("2");
      expect(qty1.isCompatible(qty2)).toBe(true);
    });

    it('should return false with null or undefined', function() {
      qty1 = new Qty("1 m*kg/s");

      expect(qty1.isCompatible(undefined)).toBe(false);
      expect(qty1.isCompatible(null)).toBe(false);
    });

    it('should return false with non quantities', function() {
      qty1 = new Qty("1 m*kg/s");

      expect(qty1.isCompatible({})).toBe(false);
    });
  });

  describe('conversion', function() {
    it('should convert to base units', function() {
      qty = new Qty("100 cm");
      expect(qty.toBase().scalar).toBe(1);
      expect(qty.toBase().units()).toBe("m");
      qty = new Qty("10 cm");
      expect(qty.toBase().scalar).toBe(0.1);
      expect(qty.toBase().units()).toBe("m");
      qty = new Qty("0.3 mm^2 ms^-2");
      expect(qty.toBase().scalar).toBe(0.3);
      expect(qty.toBase().units()).toBe("m2/s2");
    });

    it('should convert to compatible units', function() {
      qty = new Qty("10 cm");
      expect(qty.to("ft").scalar).toBe(Qty.div_safe(0.1, 0.3048));
      qty = new Qty("2m^3");
      expect(qty.to("l").scalar).toBe(2000);

      qty = new Qty("10 cm");
      expect(qty.to(new Qty("m")).scalar).toBe(0.1);
      expect(qty.to(new Qty("20m")).scalar).toBe(0.1);

      qty = new Qty('1 m3');
      expect(qty.to("cm3").scalar).toBe(1000000);

      qty = new Qty('550 cm3');
      expect(qty.to("cm^3").scalar).toBe(550);

      qty = new Qty('0.000773 m3');
      expect(qty.to("cm^3").scalar).toBe(773);
    });

    it('should return itself if target units are the same', function() {
      qty = new Qty("123 cm3");

      expect(qty.to('cm3')).toBe(qty);
      expect(qty.to('cm^3')).toBe(qty);
    });
  });

  describe('comparison', function() {
    it('should return true when comparing equal quantities', function() {
      qty1 = new Qty("1cm");
      qty2 = new Qty("10mm");
      expect(qty1.eq(qty2)).toBe(true);
    });

    it('should compare compatible quantities', function() {
      qty1 = new Qty("1cm");
      qty2 = new Qty("1mm");
      qty3 = new Qty("10mm");
      qty4 = new Qty("28A");
      expect(qty1.compareTo(qty2)).toBe(1);
      expect(qty2.compareTo(qty1)).toBe(-1);
      expect(qty1.compareTo(qty3)).toBe(0);
      expect(function() { qty1.compareTo(qty4) }).toThrow("Incompatible quantities");

      expect(qty1.lt(qty2)).toBe(false);
      expect(qty1.lt(qty3)).toBe(false);
      expect(qty1.lte(qty3)).toBe(true);
      expect(qty1.gte(qty3)).toBe(true);
      expect(qty1.gt(qty2)).toBe(true);
      expect(qty2.gt(qty1)).toBe(false);
    });

    it('should compare identical quantities', function() {
      qty1 = new Qty("1cm");
      qty2 = new Qty("1cm");
      qty3 = new Qty("10mm");
      expect(qty1.same(qty2)).toBe(true);
      expect(qty1.same(qty3)).toBe(false);
    });

    it('should accept strings as parameter', function() {
      qty = new Qty("1 cm");
      expect(qty.lt("0.5 cm")).toBe(false);
      expect(qty.lte("1 cm")).toBe(true);
      expect(qty.gte("3 mm")).toBe(true);
      expect(qty.gt("5 m")).toBe(false);
    });

  });

  describe('math', function() {

    it('should add quantities', function() {
      qty1 = new Qty("2.5m");
      qty2 = new Qty("3m");
      expect(qty1.add(qty2).scalar).toBe(5.5);

      expect(qty1.add("3m").scalar).toBe(5.5);

      qty2 = new Qty("3cm");
      result = qty1.add(qty2);
      expect(result.scalar).toBe(2.53);
      expect(result.units()).toBe("m");

      result = qty2.add(qty1);
      expect(result.scalar).toBe(253);
      expect(result.units()).toBe("cm");
    });

    it('should substract quantities', function() {
      qty1 = new Qty("2.5m");
      qty2 = new Qty("3m");
      expect(qty1.sub(qty2).scalar).toBe(-0.5);

      expect(qty1.sub("2m").scalar).toBe(0.5);
      expect(qty1.sub("-2m").scalar).toBe(4.5);

      qty2 = new Qty("3cm");
      result = qty1.sub(qty2);
      expect(result.scalar).toBe(2.47);
      expect(result.units()).toBe("m");

      result = qty2.sub(qty1);
      expect(result.scalar).toBe(-247);
      expect(result.units()).toBe("cm");
    });

    it('should multiply quantities', function() {
      qty1 = new Qty("2.5m");
      qty2 = new Qty("3m");
      result = qty1.mul(qty2);
      expect(result.scalar).toBe(7.5);
      expect(result.units()).toBe("m2");
      expect(result.kind()).toBe("area");

      qty2 = new Qty("3cm");
      result = qty1.mul(qty2);
      expect(result.scalar).toBe(0.075);
      expect(result.units()).toBe("m2");

      result = qty2.mul(qty1);
      expect(result.scalar).toBe(750);
      expect(result.units()).toBe("cm2");

      result = qty1.mul(3.5);
      expect(result.scalar).toBe(8.75);
      expect(result.units()).toBe("m");

      result = qty1.mul(0);
      expect(result.scalar).toBe(0);
      expect(result.units()).toBe("m");

      result = qty1.mul(new Qty("0m"));
      expect(result.scalar).toBe(0);
      expect(result.units()).toBe("m2");

      qty2 = new Qty("1.458 m");
      result = qty1.mul(qty2);
      expect(result.scalar).toBe(3.645);
      expect(result.units()).toBe("m2");
    });

    it('should multiply unlike quantities', function() {
      qty1 = new Qty("2.5 m");
      qty2 = new Qty("3 N");

      result = qty1.mul(qty2);
      expect(result.scalar).toBe(7.5);

      qty1 = new Qty("2.5 m^2");
      qty2 = new Qty("3 kg/m^2");

      result = qty1.mul(qty2);
      expect(result.scalar).toBe(7.5);
      expect(result.units()).toBe("kg");
    });

    it('should divide unlike quantities', function() {
      qty1 = new Qty("7.5kg");
      qty2 = new Qty("2.5m^2");

      result = qty1.div(qty2);
      expect(result.scalar).toBe(3);
      expect(result.units()).toBe("kg/m2");
    });

    it('should divide quantities', function() {
      qty1 = new Qty("2.5m");
      qty2 = new Qty("3m");
      qty3 = new Qty("0m");

      expect(function() { qty1.div(qty3) }).toThrow("Divide by zero");
      expect(function() { qty1.div(0) }).toThrow("Divide by zero");
      expect(qty3.div(qty1).scalar).toBe(0);

      result = qty1.div(qty2);
      expect(result.scalar).toBe(2.5/3);
      expect(result.units()).toBe("");
      expect(result.kind()).toBe("unitless");

      qty4 = new Qty("3cm");
      result = qty1.div(qty4);
      expect(result.scalar).toBe(2.5/0.03);
      expect(result.units()).toBe("");

      result = qty4.div(qty1);
      expect(result.scalar).toBe(0.012);
      expect(result.units()).toBe("");

      result = qty1.div(3.5);
      expect(result.scalar).toBe(2.5/3.5);
      expect(result.units()).toBe("m");
    });

  });

  describe('utility methods', function() {

    it('should accept string as parameter for compatibility tests', function() {
      qty = new Qty("1 mm");

      expect(qty.isCompatible("2 mm")).toBe(true);
      expect(qty.isCompatible("2 mm^3")).toBe(false);
    });

    it('should return kind', function() {
      qty = new Qty("1 mm");
      expect(qty.kind()).toBe('length');
    });

    it('should know if a quantity is in base units', function() {
      qty = new Qty("100 cm");
      expect(qty.isBase()).toBe(false);

      qty = new Qty("1m");
      expect(qty.isBase()).toBe(true);
    });

    it('should return unit part of quantities', function() {
      qty = new Qty("1");
      expect(qty.units()).toBe("");
      qty = new Qty("1 /s");
      expect(qty.units()).toBe("1/s");
      qty = new Qty("100 cm");
      expect(qty.units()).toBe("cm");
      qty = new Qty("100 cm/s");
      expect(qty.units()).toBe("cm/s");
      qty = new Qty("1 cm^2");
      expect(qty.units()).toBe("cm2");
      qty = new Qty("1 cm^2/s^2");
      expect(qty.units()).toBe("cm2/s2");
      qty = new Qty("1 cm^2*J^3/s^2*A^2");
      expect(qty.units()).toBe("cm2*J3/s2*A2");
    });

  });

  describe('toString', function() {
    it('should generate readable human output', function() {
      qty = new Qty("2m");
      expect(qty.toString()).toBe("2 m");
      expect(qty.toString("cm")).toBe("200 cm");
      expect(qty.toString("km")).toBe("0.002 km");
      expect(function() { qty.toString("A") }).toThrow("Incompatible Units");

      qty = new Qty("24.5m/s");
      expect(qty.toString()).toBe("24.5 m/s");
      expect(function() { qty.toString("m") }).toThrow("Incompatible Units");
      // TODO uncomment and fix
      // Problem due to div_safe use in Qty#to
      //expect(qty.toString("km/h")).toBe("88.2 km/h");

      qty = new Qty("254kg/m^2");
      expect(qty.toString()).toBe("254 kg/m2");

      qty = new Qty("2");
      expect(qty.toString()).toBe("2");
    });

    it('should round readable human output when max decimals is specified', function() {
      qty = (new Qty("2m")).div(3);
      expect(qty.toString("cm", 2)).toBe("66.67 cm");

      qty = new Qty("2.8m");
      expect(qty.toString("m", 0)).toBe("3 m");
      expect(qty.toString("cm", 0)).toBe("280 cm");
      qty = new Qty("2.818m");
      expect(qty.toString("cm", 0)).toBe("282 cm");
    });

    it('should round to max decimals', function() {
      qty = (new Qty("2.987654321 m"));

      expect(qty.toString(3)).toBe("2.988 m");
      expect(qty.toString(0)).toBe("3 m");
    });

    it('should round according to precision passed as quantity', function() {
      qty = new Qty('5.17 ft');

      expect(qty.toString(new Qty('ft'))).toBe("5 ft");
      expect(qty.toString(new Qty('2 ft'))).toBe("6 ft");
      expect(qty.toString(new Qty('0.5 ft'))).toBe("5 ft");
      expect(qty.toString(new Qty('0.1 ft'))).toBe("5.2 ft");
      expect(qty.toString(new Qty('0.05 ft'))).toBe("5.15 ft");
      expect(qty.toString(new Qty('0.01 ft'))).toBe("5.17 ft");
      expect(qty.toString(new Qty('0.0001 ft'))).toBe("5.17 ft");
    });

    it('should return same output with successive calls', function() {
      qty = new Qty("123 cm3");
      expect(qty.toString("cm3", 0)).toBe("123 cm3");
      expect(qty.toString("cm3", 0)).toBe("123 cm3");
    });

    it('should be the same when called with no parameters or same units', function() {
      qty = new Qty("123 cm3");
      expect(qty.toString()).toBe(qty.toString('cm3'));
    });

  });

  describe('precision rounding', function() {
    it('should round according to precision passed as quantity with same units', function() {
      qty = new Qty('5.17 ft');

      expect(qty.toPrec(new Qty('ft')).toString()).toBe("5 ft");
      expect(qty.toPrec(new Qty('2 ft')).toString()).toBe("6 ft");
      expect(qty.toPrec(new Qty('10 ft')).toString()).toBe("10 ft");
      expect(qty.toPrec(new Qty('0.5 ft')).toString()).toBe("5 ft");
      expect(qty.toPrec(new Qty('0.1 ft')).toString()).toBe("5.2 ft");
      expect(qty.toPrec(new Qty('0.05 ft')).toString()).toBe("5.15 ft");
      expect(qty.toPrec(new Qty('0.01 ft')).toString()).toBe("5.17 ft");
      expect(qty.toPrec(new Qty('0.0001 ft')).toString()).toBe("5.17 ft");
    });

    it('should allow string as precision parameter', function() {
      qty = new Qty('5.17 ft');

      expect(qty.toPrec('ft').toString()).toBe("5 ft");
      expect(qty.toPrec('0.5 ft').toString()).toBe("5 ft");
      expect(qty.toPrec('0.05 ft').toString()).toBe("5.15 ft");
    });

    it('should round according to precision passed as quantity with different prefixes', function() {
      qty = new Qty('6.3782 m');

      expect(qty.toPrec(new Qty('dm')).toString()).toBe("6.4 m");
      expect(qty.toPrec(new Qty('cm')).toString()).toBe("6.38 m");
      expect(qty.toPrec(new Qty('mm')).toString()).toBe("6.378 m");

      expect(qty.toPrec(new Qty('5 cm')).toString()).toBe("6.4 m");
    });

    it('should round according to precision passed as quantity with different compatible units', function() {
      qty = new Qty('1.146 MPa');
      expect(qty.toPrec(new Qty('0.1 bar')).toString()).toBe("1.15 MPa");
      expect(qty.toPrec(new Qty('0.01 MPa')).toString()).toBe("1.15 MPa");
      expect(qty.toPrec(new Qty('dbar')).toString()).toBe("1.15 MPa");

      qty = new Qty('5.171234568 ft');
      expect(qty.toPrec(new Qty('m')).toString()).toBe("7 ft");
      expect(qty.toPrec(new Qty('dm')).toString()).toBe("5.2 ft");
      expect(qty.toPrec(new Qty('cm')).toString()).toBe("5.18 ft");
      expect(qty.toPrec(new Qty('mm')).toString()).toBe("5.171 ft");
    });
  });

  describe('mul_safe', function() {
    it('should multiply while trying to avoid numerical errors', function() {
      expect(Qty.mul_safe(0.1, 0.1)).toBe(0.01);
      expect(Qty.mul_safe(1e-11, 123.456789)).toBe(1.23456789e-9);
      expect(Qty.mul_safe(6e-12, 100000)).toBe(6e-7);
    });
  });

  describe('div_safe', function() {
    it('should divide while trying to avoid numerical errors', function() {
      expect(Qty.div_safe(0.000773, 0.000001)).toBe(773);
      // TODO uncomment and fix
      //expect(Qty.div_safe(24.5, 0.2777777777777778)).toBe(88.2);
    });
  });

  describe('Qty.parse', function() {
    it('should throw if parsed argument is not a string', function() {
      expect(function() { Qty.parse(5) }).toThrow("Argument should be a string");
    });

    it('should not throw if parsed argument is a string', function() {
      expect(function() { Qty.parse('foo') }).not.toThrow("Argument should be a string");
    });

    it('should return parsed quantity when passing a valid quantity', function() {
      expect((Qty.parse('2.5 m') instanceof Qty)).toBe(true);
    });

    it('should return null when passing an invalid quantity', function() {
      expect(Qty.parse('aa')).toBeNull();
    });
  });

});
