/*jshint eqeqeq:true, immed:true, undef:true */
/*global module:false, define:false */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        root.Qty = factory();
    }
}(this, function() {
  var UNITS = {
    /* prefixes */
    "<googol>" : [["googol"], 1e100, "prefix"],
    "<kibi>"  :  [["Ki","Kibi","kibi"], Math.pow(2,10), "prefix"],
    "<mebi>"  :  [["Mi","Mebi","mebi"], Math.pow(2,20), "prefix"],
    "<gibi>"  :  [["Gi","Gibi","gibi"], Math.pow(2,30), "prefix"],
    "<tebi>"  :  [["Ti","Tebi","tebi"], Math.pow(2,40), "prefix"],
    "<pebi>"  :  [["Pi","Pebi","pebi"], Math.pow(2,50), "prefix"],
    "<exi>"   :  [["Ei","Exi","exi"], Math.pow(2,60), "prefix"],
    "<zebi>"  :  [["Zi","Zebi","zebi"], Math.pow(2,70), "prefix"],
    "<yebi>"  :  [["Yi","Yebi","yebi"], Math.pow(2,80), "prefix"],
    "<yotta>" :  [["Y","Yotta","yotta"], 1e24, "prefix"],
    "<zetta>" :  [["Z","Zetta","zetta"], 1e21, "prefix"],
    "<exa>"   :  [["E","Exa","exa"], 1e18, "prefix"],
    "<peta>"  :  [["P","Peta","peta"], 1e15, "prefix"],
    "<tera>"  :  [["T","Tera","tera"], 1e12, "prefix"],
    "<giga>"  :  [["G","Giga","giga"], 1e9, "prefix"],
    "<mega>"  :  [["M","Mega","mega"], 1e6, "prefix"],
    "<kilo>"  :  [["k","kilo"], 1e3, "prefix"],
    "<hecto>" :  [["h","Hecto","hecto"], 1e2, "prefix"],
    "<deca>"  :  [["da","Deca","deca","deka"], 1e1, "prefix"],
    "<deci>"  :  [["d","Deci","deci"], 1e-1, "prefix"],
    "<centi>"  : [["c","Centi","centi"], 1e-2, "prefix"],
    "<milli>" :  [["m","Milli","milli"], 1e-3, "prefix"],
    "<micro>"  : [["u","Micro","micro"], 1e-6, "prefix"],
    "<nano>"  :  [["n","Nano","nano"], 1e-9, "prefix"],
    "<pico>"  :  [["p","Pico","pico"], 1e-12, "prefix"],
    "<femto>" :  [["f","Femto","femto"], 1e-15, "prefix"],
    "<atto>"  :  [["a","Atto","atto"], 1e-18, "prefix"],
    "<zepto>" :  [["z","Zepto","zepto"], 1e-21, "prefix"],
    "<yocto>" :  [["y","Yocto","yocto"], 1e-24, "prefix"],

    "<1>"     :  [["1", "<1>"],1,""],
    /* length units */
    "<meter>" :  [["m","meter","meters","metre","metres"], 1.0, "length", ["<meter>"] ],
    "<inch>"  :  [["in","inch","inches","\""], 0.0254, "length", ["<meter>"]],
    "<foot>"  :  [["ft","foot","feet","'"], 0.3048, "length", ["<meter>"]],
    "<yard>"  :  [["yd","yard","yards"], 0.9144, "length", ["<meter>"]],
    "<mile>"  :  [["mi","mile","miles"], 1609.344, "length", ["<meter>"]],
    "<naut-mile>" : [["nmi"], 1852, "length", ["<meter>"]],
    "<league>":  [["league","leagues"], 4828, "length", ["<meter>"]],
    "<furlong>": [["furlong","furlongs"], 201.2, "length", ["<meter>"]],
    "<rod>"   :  [["rd","rod","rods"], 5.029, "length", ["<meter>"]],
    "<mil>"   :  [["mil","mils"], 0.0000254, "length", ["<meter>"]],
    "<angstrom>"  :[["ang","angstrom","angstroms"], 1e-10, "length", ["<meter>"]],
    "<fathom>" : [["fathom","fathoms"], 1.829, "length", ["<meter>"]],
    "<pica>"  : [["pica","picas"], 0.004217, "length", ["<meter>"]],
    "<point>" : [["pt","point","points"], 0.0003514, "length", ["<meter>"]],
    "<redshift>" : [["z","red-shift"], 1.302773e26, "length", ["<meter>"]],
    "<AU>"    : [["AU","astronomical-unit"], 149597900000, "length", ["<meter>"]],
    "<light-second>":[["ls","light-second"], 299792500, "length", ["<meter>"]],
    "<light-minute>":[["lmin","light-minute"], 17987550000, "length", ["<meter>"]],
    "<light-year>" : [["ly","light-year"], 9460528000000000, "length", ["<meter>"]],
    "<parsec>"  : [["pc","parsec","parsecs"], 30856780000000000, "length", ["<meter>"]],

    /* mass */
    "<kilogram>" : [["kg","kilogram","kilograms"], 1.0, "mass", ["<kilogram>"]],
    "<AMU>" : [["u","AMU","amu"], 6.0221415e26, "mass", ["<kilogram>"]],
    "<dalton>" : [["Da","Dalton","Daltons","dalton","daltons"], 6.0221415e26, "mass", ["<kilogram>"]],
    "<slug>" : [["slug","slugs"], 14.5939029, "mass", ["<kilogram>"]],
    "<short-ton>" : [["tn","ton"], 907.18474, "mass", ["<kilogram>"]],
    "<metric-ton>":[["tonne"], 1000, "mass", ["<kilogram>"]],
    "<carat>" : [["ct","carat","carats"], 0.0002, "mass", ["<kilogram>"]],
    "<pound>" : [["lbs","lb","pound","pounds","#"], 0.45359237, "mass", ["<kilogram>"]],
    "<ounce>" : [["oz","ounce","ounces"], 0.0283495231, "mass", ["<kilogram>"]],
    "<gram>"    :  [["g","gram","grams","gramme","grammes"],1e-3,"mass", ["<kilogram>"]],

    /* area */
    "<hectare>":[["hectare"], 10000, "area", ["<meter>","<meter>"]],
    "<acre>":[["acre","acres"], 4046.85642, "area", ["<meter>","<meter>"]],
    "<sqft>":[["sqft"], 1, "area", ["<feet>","<feet>"]],

    /* volume */
    "<liter>" : [["l","L","liter","liters","litre","litres"], 0.001, "volume", ["<meter>","<meter>","<meter>"]],
    "<gallon>":  [["gal","gallon","gallons"], 0.0037854118, "volume", ["<meter>","<meter>","<meter>"]],
    "<quart>":  [["qt","quart","quarts"], 0.00094635295, "volume", ["<meter>","<meter>","<meter>"]],
    "<pint>":  [["pt","pint","pints"], 0.000473176475, "volume", ["<meter>","<meter>","<meter>"]],
    "<cup>":  [["cu","cup","cups"], 0.000236588238, "volume", ["<meter>","<meter>","<meter>"]],
    "<fluid-ounce>":  [["floz","fluid-ounce"], 2.95735297e-5, "volume", ["<meter>","<meter>","<meter>"]],
    "<tablespoon>":  [["tbs","tablespoon","tablespoons"], 1.47867648e-5, "volume", ["<meter>","<meter>","<meter>"]],
    "<teaspoon>":  [["tsp","teaspoon","teaspoons"], 4.92892161e-6, "volume", ["<meter>","<meter>","<meter>"]],

    /* speed */
    "<kph>" : [["kph"], 0.277777778, "speed", ["<meter>"], ["<second>"]],
    "<mph>" : [["mph"], 0.44704, "speed", ["<meter>"], ["<second>"]],
    "<knot>" : [["kt","kn","kts","knot","knots"], 0.514444444, "speed", ["<meter>"], ["<second>"]],
    "<fps>"  : [["fps"], 0.3048, "speed", ["<meter>"], ["<second>"]],

    /* acceleration */
    "<gee>" : [["gee"], 9.80655, "acceleration", ["<meter>"], ["<second>","<second>"]],

    /* temperature_difference */
    "<kelvin>" : [["degK","kelvin"], 1.0, "temperature", ["<kelvin>"]],
    "<celsius>" : [["degC","celsius","celsius","centigrade"], 1.0, "temperature", ["<kelvin>"]],
    "<fahrenheit>" : [["degF","fahrenheit"], 1/1.8, "temperature", ["<kelvin>"]],
    "<rankine>" : [["degR","rankine"], 1/1.8, "temperature", ["<kelvin>"]],
    "<temp-K>"  : [["tempK"], 1.0, "temperature", ["<temp-K>"]],
    "<temp-C>"  : [["tempC"], 1.0, "temperature", ["<temp-K>"]],
    "<temp-F>"  : [["tempF"], 1/1.8, "temperature", ["<temp-K>"]],
    "<temp-R>"  : [["tempR"], 1/1.8, "temperature", ["<temp-K>"]],

    /* time */
    "<second>":  [["s","sec","second","seconds"], 1.0, "time", ["<second>"]],
    "<minute>":  [["min","minute","minutes"], 60.0, "time", ["<second>"]],
    "<hour>":  [["h","hr","hrs","hour","hours"], 3600.0, "time", ["<second>"]],
    "<day>":  [["d","day","days"], 3600*24, "time", ["<second>"]],
    "<week>":  [["wk","week","weeks"], 7*3600*24, "time", ["<second>"]],
    "<fortnight>": [["fortnight","fortnights"], 1209600, "time", ["<second>"]],
    "<year>":  [["y","yr","year","years","annum"], 31556926, "time", ["<second>"]],
    "<decade>":[["decade","decades"], 315569260, "time", ["<second>"]],
    "<century>":[["century","centuries"], 3155692600, "time", ["<second>"]],

    /* pressure */
    "<pascal>" : [["Pa","pascal","Pascal"], 1.0, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
    "<bar>" : [["bar","bars"], 100000, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
    "<mmHg>" : [["mmHg"], 133.322368,"pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
    "<inHg>" : [["inHg"], 3386.3881472,"pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
    "<torr>" : [["torr"], 133.322368,"pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
    "<atm>" : [["atm","ATM","atmosphere","atmospheres"], 101325,"pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
    "<psi>" : [["psi"], 6894.76,"pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
    "<cmh2o>" : [["cmH2O"], 98.0638,"pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
    "<inh2o>" : [["inH2O"], 249.082052,"pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],

    /* viscosity */
    "<poise>"  : [["P","poise"], 0.1, "viscosity", ["<kilogram>"],["<meter>","<second>"] ],
    "<stokes>" : [["St","stokes"], 1e-4, "viscosity", ["<meter>","<meter>"], ["<second>"]],

    /* substance */
    "<mole>"  :  [["mol","mole"], 1.0, "substance", ["<mole>"]],

    /* concentration */
    "<molar>" : [["M","molar"], 1000, "concentration", ["<mole>"], ["<meter>","<meter>","<meter>"]],
    "<wtpercent>"  : [["wt%","wtpercent"], 10, "concentration", ["<kilogram>"], ["<meter>","<meter>","<meter>"]],

    /* activity */
    "<katal>" :  [["kat","katal","Katal"], 1.0, "activity", ["<mole>"], ["<second>"]],
    "<unit>"  :  [["U","enzUnit"], 16.667e-16, "activity", ["<mole>"], ["<second>"]],

    /* capacitance */
    "<farad>" :  [["F","farad","Farad"], 1.0, "capacitance", ["<farad>"]],

    /* charge */
    "<coulomb>" :  [["C","coulomb","Coulomb"], 1.0, "charge", ["<ampere>","<second>"]],

    /* current */
    "<ampere>"  :  [["A","Ampere","ampere","amp","amps"], 1.0, "current", ["<ampere>"]],

    /* conductance */
    "<siemens>" : [["S","Siemens","siemens"], 1.0, "resistance", ["<second>","<second>","<second>","<ampere>","<ampere>"], ["<kilogram>","<meter>","<meter>"]],

    /* inductance */
    "<henry>" :  [["H","Henry","henry"], 1.0, "inductance", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>","<ampere>","<ampere>"]],

    /* potential */
    "<volt>"  :  [["V","Volt","volt","volts"], 1.0, "potential", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>","<second>","<ampere>"]],

    /* resistance */
    "<ohm>" :  [["Ohm","ohm"], 1.0, "resistance", ["<meter>","<meter>","<kilogram>"],["<second>","<second>","<second>","<ampere>","<ampere>"]],

    /* magnetism */
    "<weber>" : [["Wb","weber","webers"], 1.0, "magnetism", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>","<ampere>"]],
    "<tesla>"  : [["T","tesla","teslas"], 1.0, "magnetism", ["<kilogram>"], ["<second>","<second>","<ampere>"]],
    "<gauss>" : [["G","gauss"], 1e-4, "magnetism",  ["<kilogram>"], ["<second>","<second>","<ampere>"]],
    "<maxwell>" : [["Mx","maxwell","maxwells"], 1e-8, "magnetism", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>","<ampere>"]],
    "<oersted>"  : [["Oe","oersted","oersteds"], 250.0/Math.PI, "magnetism", ["<ampere>"], ["<meter>"]],

    /* energy */
    "<joule>" :  [["J","joule","Joule","joules"], 1.0, "energy", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
    "<erg>"   :  [["erg","ergs"], 1e-7, "energy", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
    "<btu>"   :  [["BTU","btu","BTUs"], 1055.056, "energy", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
    "<calorie>" :  [["cal","calorie","calories"], 4.18400, "energy",["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
    "<Calorie>" :  [["Cal","Calorie","Calories"], 4184.00, "energy",["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
    "<therm-US>" : [["th","therm","therms","Therm"], 105480400, "energy",["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],

    /* force */
    "<newton>"  : [["N","Newton","newton"], 1.0, "force", ["<kilogram>","<meter>"], ["<second>","<second>"]],
    "<dyne>"  : [["dyn","dyne"], 1e-5, "force", ["<kilogram>","<meter>"], ["<second>","<second>"]],
    "<pound-force>"  : [["lbf","pound-force"], 4.448222, "force", ["<kilogram>","<meter>"], ["<second>","<second>"]],

    /* frequency */
    "<hertz>" : [["Hz","hertz","Hertz"], 1.0, "frequency", ["<1>"], ["<second>"]],

    /* angle */
    "<radian>" :[["rad","radian","radian"], 1.0, "angle", ["<radian>"]],
    "<degree>" :[["deg","degree","degrees"], Math.PI / 180.0, "angle", ["<radian>"]],
    "<grad>"   :[["grad","gradian","grads"], Math.PI / 200.0, "angle", ["<radian>"]],
    "<steradian>"  : [["sr","steradian","steradians"], 1.0, "solid_angle", ["<steradian>"]],

    /* rotation */
    "<rotation>" : [["rotation"], 2.0*Math.PI, "angle", ["<radian>"]],
    "<rpm>"   :[["rpm"], 2.0*Math.PI / 60.0, "angular_velocity", ["<radian>"], ["<second>"]],

    /* memory */
    "<byte>"  :[["B","byte"], 1.0, "memory", ["<byte>"]],
    "<bit>"  :[["b","bit"], 0.125, "memory", ["<byte>"]],

    /* currency */
    "<dollar>":[["USD","dollar"], 1.0, "currency", ["<dollar>"]],
    "<cents>" :[["cents"], 0.01, "currency", ["<dollar>"]],

    /* luminosity */
    "<candela>" : [["cd","candela"], 1.0, "luminosity", ["<candela>"]],
    "<lumen>" : [["lm","lumen"], 1.0, "luminous_power", ["<candela>","<steradian>"]],
    "<lux>" :[["lux"], 1.0, "illuminance", ["<candela>","<steradian>"], ["<meter>","<meter>"]],

    /* power */
    "<watt>"  : [["W","watt","watts"], 1.0, "power", ["<kilogram>","<meter>","<meter>"], ["<second>","<second>","<second>"]],
    "<horsepower>"  :  [["hp","horsepower"], 745.699872, "power", ["<kilogram>","<meter>","<meter>"], ["<second>","<second>","<second>"]],

    /* radiation */
    "<gray>" : [["Gy","gray","grays"], 1.0, "radiation", ["<meter>","<meter>"], ["<second>","<second>"]],
    "<roentgen>" : [["R","roentgen"], 0.009330, "radiation", ["<meter>","<meter>"], ["<second>","<second>"]],
    "<sievert>" : [["Sv","sievert","sieverts"], 1.0, "radiation", ["<meter>","<meter>"], ["<second>","<second>"]],
    "<becquerel>" : [["Bq","bequerel","bequerels"], 1.0, "radiation", ["<1>"],["<second>"]],
    "<curie>" : [["Ci","curie","curies"], 3.7e10, "radiation", ["<1>"],["<second>"]],

    /* rate */
    "<cpm>" : [["cpm"], 1.0/60.0, "rate", ["<count>"],["<second>"]],
    "<dpm>" : [["dpm"], 1.0/60.0, "rate", ["<count>"],["<second>"]],
    "<bpm>" : [["bpm"], 1.0/60.0, "rate", ["<count>"],["<second>"]],

    /* resolution / typography */
    "<dot>" : [["dot","dots"], 1, "resolution", ["<each>"]],
    "<pixel>" : [["pixel","px"], 1, "resolution", ["<each>"]],
    "<ppi>" : [["ppi"], 1, "resolution", ["<pixel>"], ["<inch>"]],
    "<dpi>" : [["dpi"], 1, "typography", ["<dot>"], ["<inch>"]],

    /* other */
    "<cell>" : [["cells","cell"], 1, "counting", ["<each>"]],
    "<each>" : [["each"], 1.0, "counting", ["<each>"]],
    "<count>" : [["count"], 1.0, "counting", ["<each>"]],
    "<base-pair>"  : [["bp"], 1.0, "counting", ["<each>"]],
    "<nucleotide>" : [["nt"], 1.0, "counting", ["<each>"]],
    "<molecule>" : [["molecule","molecules"], 1.0, "counting", ["<1>"]],
    "<dozen>" :  [["doz","dz","dozen"],12.0,"prefix_only", ["<each>"]],
    "<percent>": [["%","percent"], 0.01, "prefix_only", ["<1>"]],
    "<ppm>" :  [["ppm"],1e-6,"prefix_only", ["<1>"]],
    "<ppt>" :  [["ppt"],1e-9,"prefix_only", ["<1>"]],
    "<gross>" :  [["gr","gross"],144.0, "prefix_only", ["<dozen>","<dozen>"]],
    "<decibel>"  : [["dB","decibel","decibels"], 1.0, "logarithmic", ["<decibel>"]]

  };



  var BASE_UNITS = ['<meter>','<kilogram>','<second>','<mole>', '<farad>', '<ampere>','<radian>','<kelvin>','<temp-K>','<byte>','<dollar>','<candela>','<each>','<steradian>','<decibel>'];
  var UNITY = '<1>';
  var UNITY_ARRAY= [UNITY];
  var SCI_NUMBER = "([+-]?\\d*[.]?\\d+(?:[Ee][+-]?)?\\d*)";
  var SCI_NUMBER_REGEX = new RegExp(SCI_NUMBER);
  var NUMBER_REGEX = new RegExp(SCI_NUMBER + "*\\s*(.+)?");
  var UNIT_STRING_REGEX = new RegExp(SCI_NUMBER + "*\\s*([^\/]*)\/*(.+)*");
  var POWER_OP = "(?:\\^|\\*\\*)?";
  var TOP_REGEX = new RegExp("([^ \\*]+?)" + POWER_OP + "([\\d-]+)");
  var BOTTOM_REGEX = new RegExp("([^ \\*]+?)" + POWER_OP + "(\\d+)");

  var SIGNATURE_VECTOR = ["length", "time", "temperature", "mass", "current", "substance", "luminosity", "currency", "memory", "angle", "capacitance"];
  var KINDS = {
    "-312058": "resistance",
    "-312038": "inductance",
    "-152040": "magnetism",
    "-152038": "magnetism",
    "-152058": "potential",
    "-39": "acceleration",
    "-38": "radiation",
    "-20": "frequency",
    "-19": "speed",
    "-18": "viscosity",
    "0": "unitless",
    "1": "length",
    "2": "area",
    "3": "volume",
    "20": "time",
    "400": "temperature",
    "7942": "power",
    "7959": "pressure",
    "7962": "energy",
    "7979": "viscosity",
    "7981": "force",
    "7997": "mass_concentration",
    "8000": "mass",
    "159999": "magnetism",
    "160000": "current",
    "160020": "charge",
    "312058": "resistance",
    "3199980": "activity",
    "3199997": "molar_concentration",
    "3200000": "substance",
    "63999998": "illuminance",
    "64000000": "luminous_power",
    "1280000000": "currency",
    "25600000000": "memory",
    "511999999980": "angular_velocity",
    "512000000000": "angle",
    "10240000000000": "capacitance"
  };

  var base_unit_cache = {};

  function Qty(init_value) {
    this.scalar = null;
    this.base_scalar = null;
    this.signature = null;
    this.output = {};
    this.numerator = UNITY_ARRAY;
    this.denominator = UNITY_ARRAY;

    // units caching property
    this._units = null;

    this.init_value = init_value;
    if(init_value.constructor === String) {
      parse.call(this, init_value);
    }
    else {
      this.scalar = init_value.scalar;
      this.numerator = (init_value.numerator && init_value.numerator.length !== 0)? init_value.numerator : UNITY_ARRAY;
      this.denominator = (init_value.denominator && init_value.denominator.length !== 0)? init_value.denominator : UNITY_ARRAY;
    }
    updateBaseScalar.call(this);
  }

  function updateBaseScalar() {
    if(this.base_scalar) {
      return this.base_scalar;
    }
    if(this.isBase()) {
      this.base_scalar = this.scalar;
      this.signature = unitSignature.call(this);
    }
    else {
      var base = this.toBase();
      this.base_scalar = base.scalar;
      this.signature = base.signature;
    }
  }

  /*
  calculates the unit signature id for use in comparing compatible units and simplification
  the signature is based on a simple classification of units and is based on the following publication

  Novak, G.S., Jr. "Conversion of units of measurement", IEEE Transactions on Software Engineering,
  21(8), Aug 1995, pp.651-661
  doi://10.1109/32.403789
  http://ieeexplore.ieee.org/Xplore/login.jsp?url=/iel1/32/9079/00403789.pdf?isnumber=9079&prod=JNL&arnumber=403789&arSt=651&ared=661&arAuthor=Novak%2C+G.S.%2C+Jr.
  */
  function unitSignature() {
    if(this.signature) {
      return this.signature;
    }
    var vector = unitSignatureVector.call(this);
    for(var i = 0; i < vector.length; i++) {
      vector[i] *= Math.pow(20, i);
    }

    return vector.reduce(function(previous, current, index, array) {return previous + current;}, 0);
  }

  // calculates the unit signature vector used by unit_signature
  function unitSignatureVector() {
    if(!this.isBase()) {
      return unitSignatureVector.call(this.toBase());
    }

    var vector = new Array(SIGNATURE_VECTOR.length);
    for(var i = 0; i < vector.length; i++) {
      vector[i] = 0;
    }
    var r, n;
    for(var j = 0; j < this.numerator.length; j++) {
      if((r = UNITS[this.numerator[j]])) {
        n = SIGNATURE_VECTOR.indexOf(r[2]);
        if(n >= 0) {
          vector[n] = vector[n] + 1;
        }
      }
    }

    for(var k = 0; k < this.denominator.length; k++) {
      if((r = UNITS[this.denominator[k]])) {
        n = SIGNATURE_VECTOR.indexOf(r[2]);
        if(n >= 0) {
          vector[n] = vector[n] - 1;
        }
      }
    }
    return vector;
  }

  /* parse a string into a unit object.
   * Typical formats like :
   * "5.6 kg*m/s^2"
   * "5.6 kg*m*s^-2"
   * "5.6 kilogram*meter*second^-2"
   * "2.2 kPa"
   * "37 degC"
   * "1"  -- creates a unitless constant with value 1
   * "GPa"  -- creates a unit with scalar 1 with units 'GPa'
   * 6'4"  -- recognized as 6 feet + 4 inches
   * 8 lbs 8 oz -- recognized as 8 lbs + 8 ounces
   */
  function parse(val) {
    var result = UNIT_STRING_REGEX.exec(val);
    if(!result) {
      throw val + ": Quantity not recognized";
    }

    if(val.trim() === '') {
      throw "Unit not recognized";
    }

    this.scalar = result[1] ? parseFloat(result[1]) : 1.0;
    var top = result[2];
    var bottom = result[3];

    var n, x, nx;
    while((result = TOP_REGEX.exec(top))) {
      n = parseFloat(result[2]);
      x = result[1] + " ";
      nx = "";
      for(var i = 0; i < Math.abs(n) ; i++) {
        nx += x;
      }
      if(n >= 0) {
        top = top.replace(new RegExp(result[1] + POWER_OP + n), nx);
      }
      else {
        bottom = bottom ? bottom + nx : nx;
        top = top.replace(new RegExp(result[1] + POWER_OP + n), "");
      }
    }

    while((result = BOTTOM_REGEX.exec(bottom))) {
      n = parseFloat(result[2]);
      x = result[1] + " ";
      nx = "";
      for(var j = 0; j < n ; j++) {
        nx += x;
      }

      bottom = bottom.replace(BOTTOM_REGEX, nx, "g");
    }

    var unit_match;
    // Scan
    if(top) {
      if(!UNIT_TEST_REGEX.test(top)) {
        throw "Unit not recognized";
      }
      this.numerator = [];
      while((unit_match = UNIT_MATCH_REGEX.exec(top))) {
        this.numerator.push(unit_match.slice(1));
      }
    }
    if(bottom) {
      if(!UNIT_TEST_REGEX.test(bottom)) {
        throw "Unit not recognized";
      }
      this.denominator = [];
      while((unit_match = UNIT_MATCH_REGEX.exec(bottom))) {
        this.denominator.push(unit_match.slice(1));
      }
    }

    this.numerator = function() {
      var numerator = this.numerator.map(function(item) {
        return PREFIX_MAP[item[0]] ? [PREFIX_MAP[item[0]], UNIT_MAP[item[1]]] : [UNIT_MAP[item[1]]];
      });
      return numerator;
    }.call(this);

    // Flatten and remove null elements
    this.numerator = this.numerator.reduce(function(a,b) {
      return a.concat(b);
    }, []);
    this.numerator = this.numerator.filter(function(item) {
      return item;
    });

    this.denominator = function() {
      var denominator = this.denominator.map(function(item) {
        return PREFIX_MAP[item[0]] ? [PREFIX_MAP[item[0]], UNIT_MAP[item[1]]] : [UNIT_MAP[item[1]]];
      });
      return denominator;
    }.call(this);

    // Flatten
    this.denominator = this.denominator.reduce(function(a,b) {
      return a.concat(b);
    }, []);
    this.denominator = this.denominator.filter(function(item) {
      return item;
    });

    if(this.numerator.length === 0) {
      this.numerator = UNITY_ARRAY;
    }
    if(this.denominator.length === 0) {
      this.denominator = UNITY_ARRAY;
    }
  }

  Qty.prototype = {
    // Converts the unit back to a float if it is unitless.  Otherwise raises an exception
    toFloat: function() {
      if(this.isUnitless()) {
        return this.scalar;
      }
      throw "Can't convert to Float unless unitless.  Use Unit#scalar";
    },

    // returns true if no associated units
    // false, even if the units are "unitless" like 'radians, each, etc'
    isUnitless: function() {
      return compareArray(this.numerator, UNITY_ARRAY) && compareArray(this.denominator, UNITY_ARRAY);
    },

    /*
    check to see if units are compatible, but not the scalar part
    this check is done by comparing signatures for performance reasons
    if passed a string, it will create a unit object with the string and then do the comparison
    this permits a syntax like:
    unit =~ "mm"
    if you want to do a regexp on the unit string do this ...
    unit.units =~ /regexp/
    */
    isCompatible: function(other) {
      if(other && other.constructor === String) {
        return this.isCompatible(new Qty(other));
      }

      if(!(other instanceof Qty)) {
        return false;
      }

      if(other.signature !== undefined) {
        return this.signature === other.signature;
      }
      else {
        return false;
      }
    },

    kind: function() {
      return KINDS[this.signature.toString()];
    },

    // Returns 'true' if the Unit is represented in base units
    isBase: function() {
      if(this.is_base !== undefined) {
        return this.is_base;
      }
      if(this.signature === 400 && this.numerator.length === 1 && compareArray(this.denominator, UNITY_ARRAY) && this.units.match(/(deg|temp)K/)) {
        this.is_base = true;
        return this.is_base;
      }

      this.numerator.concat(this.denominator).forEach(function(item) {
        if(item !== UNITY && !BASE_UNITS.some(function(base) {
            return base === item;
          })) {
          this.is_base = false;
        }
      }, this);
      if(this.is_base === false) {
        return this.is_base;
      }
      this.is_base = true;
      return this.is_base;
    },

    // convert to base SI units
    // results of the conversion are cached so subsequent calls to this will be fast
    toBase: function() {
      if(this.isBase()) {
        return this;
      }

      var cached = base_unit_cache[this.units()];
      if(cached) {
        return cached.mul(this.scalar);
      }

      var num = [];
      var den = [];
      var q = 1;
      var unit;
      for(var i = 0; i < this.numerator.length; i++) {
        unit = this.numerator[i];
        if(PREFIX_VALUES[unit]) {
          // workaround to fix
          // 0.1 * 0.1 => 0.010000000000000002
          q = mul_safe(q, PREFIX_VALUES[unit]);
        }
        else {
          if(UNIT_VALUES[unit]) {
            q *= UNIT_VALUES[unit].scalar;

            if(UNIT_VALUES[unit].numerator) {
              num.push(UNIT_VALUES[unit].numerator);
            }
            if(UNIT_VALUES[unit].denominator) {
              den.push(UNIT_VALUES[unit].denominator);
            }
          }
        }
      }
      for(var j = 0; j < this.denominator.length; j++) {
        unit = this.denominator[j];
        if(PREFIX_VALUES[unit]) {
          q /= PREFIX_VALUES[unit];
        }
        else {
          if(UNIT_VALUES[unit]) {
            q /= UNIT_VALUES[unit].scalar;

            if(UNIT_VALUES[unit].numerator) {
              den.push(UNIT_VALUES[unit].numerator);
            }
            if(UNIT_VALUES[unit].denominator) {
              num.push(UNIT_VALUES[unit].denominator);
            }
          }
        }
      }

      // Flatten
      num = num.reduce(function(a,b) {
        return a.concat(b);
      }, []);
      den = den.reduce(function(a,b) {
        return a.concat(b);
      }, []);

      var base = new Qty({"scalar": q, "numerator": num, "denominator": den});
      // Caching for later use
      base_unit_cache[this.units()] = base;

      return base.mul(this.scalar);
    },

    // returns the 'unit' part of the Unit object without the scalar
    units: function() {
      if(compareArray(this.numerator, UNITY_ARRAY) && compareArray(this.denominator, UNITY_ARRAY)) {
        return "";
      }
      if(this._units) {
        return this._units;
      }

      var output_n = [];
      var output_d =[];

      var token, token_next;
      if(compareArray(this.numerator, UNITY_ARRAY)) {
        output_n = ['1'];
      }
      else {
        for(var i = 0; i < this.numerator.length; i++) {
          token = this.numerator[i];
          token_next = this.numerator[i+1];
          if(PREFIX_VALUES[token]) {
            output_n.push(OUTPUT_MAP[token] + OUTPUT_MAP[token_next]);
            i++;
          }
          else
          {
            output_n.push(OUTPUT_MAP[token]);
          }
        }
      }

      if(compareArray(this.denominator, UNITY_ARRAY)) {
        output_d = UNITY_ARRAY;
      }
      else {
        for(var j = 0; j < this.denominator.length; j++) {
          token = this.denominator[j];
          token_next = this.denominator[j+1];
          if(PREFIX_VALUES[token]) {
            output_d.push(OUTPUT_MAP[token] + OUTPUT_MAP[token_next]);
            j++;
          }
          else
          {
            output_d.push(OUTPUT_MAP[token]);
          }
        }
      }

      var on = unique(output_n.map(function(x) {return [x, output_n.filter(function(z) {return z === x;}).length];})).map(function(x) {return x[0] + (x[1] > 1 ? x[1] : "");});
      var od = unique(output_d.map(function(x) {return [x, output_d.filter(function(z) {return z === x;}).length];})).map(function(x) {return x[0] + (x[1] > 1 ? x[1] : "");});
      this._units = on.join("*") + ((compareArray(output_d, UNITY_ARRAY)) ? '':'/' + od.join("*"));
      return this._units;
    },

    eq: function(other) {
      return this.compareTo(other) === 0;
    },
    lt: function(other) {
      return this.compareTo(other) === -1;
    },
    lte: function(other) {
      return this.eq(other) || this.lt(other);
    },
    gt: function(other) {
      return this.compareTo(other) === 1;
    },
    gte: function(other) {
      return this.eq(other) || this.gt(other);
    },

    // return a new quantity with same units rounded
    // at the nearest value according to quantity passed
    // as precision
    toPrec: function(prec_quantity) {
      if(prec_quantity && prec_quantity.constructor === String) {
        prec_quantity = new Qty(prec_quantity);
      }

      prec_quantity = prec_quantity.to(this.units());

      var prec_rounded_result = Math.round(this.scalar/prec_quantity.scalar)*prec_quantity.scalar;

      // Remove potential floating error based on prec_quantity exponent
      var prec_exponent = exponent_of(prec_quantity.scalar);
      prec_rounded_result = round(prec_rounded_result, -prec_exponent);

      return new Qty(prec_rounded_result + this.units());
    },

    // Generate human readable output.
    // If the name of a unit is passed, the unit will first be converted to the target unit before output.
    // output is cached so subsequent calls for the same format will be fast
    toString: function(target_units_or_max_decimals_or_prec, max_decimals) {
      var target_units;
      if(typeof target_units_or_max_decimals_or_prec === "number") {
        max_decimals = target_units_or_max_decimals_or_prec;
      }
      else if(typeof target_units_or_max_decimals_or_prec === "string") {
        target_units = target_units_or_max_decimals_or_prec;
      }
      else if(target_units_or_max_decimals_or_prec instanceof Qty) {
        return this.toPrec(target_units_or_max_decimals_or_prec).toString(max_decimals);
      }

      var out;
      if(!max_decimals && this.output[target_units]) {
        out = this.output[target_units];
      }
      else if(target_units) {
        out = this.to(target_units);
        // Caching simple unit conversion
        this.output[target_units] = out;
      }
      else {
        out = this;
      }
      var out_scalar = max_decimals !== undefined ? round(out.scalar, max_decimals) : out.scalar;
      out = (out_scalar + " " + out.units()).trim();
      return out;
    },

    // Compare two Qty objects. Throws an exception if they are not of compatible types.
    // Comparisons are done based on the value of the quantity in base SI units.
    compareTo: function(other) {
      if(other && other.constructor === String) {
        return this.compareTo(new Qty(other));
      }
      if(!this.isCompatible(other)) {
        throw "Incompatible quantities";
      }
      if(this.base_scalar < other.base_scalar) {
        return -1;
      }
      else if(this.base_scalar === other.base_scalar) {
        return 0;
      }
      else if(this.base_scalar > other.base_scalar) {
        return 1;
      }
    },

    // Return true if quantities and units match
    // Unit("100 cm").same(Unit("100 cm"))  # => true
    // Unit("100 cm").same(Unit("1 m"))     # => false
    same: function(other) {
      return (this.scalar === other.scalar) && (this.units() === other.units());
    },

    // convert to a specified unit string or to the same units as another Qty
    // qty.to("kg")  will convert to kilograms
    // qty1.to(qty2) converts to same units as qty2 object
    //
    // Throws an exception if the requested target units are incompatible with current Unit.
    to: function(other) {
      if(other && other.constructor !== String) {
        return this.to(other.units());
      }

      // Instantiating target to normalize units
      var target = new Qty(other);

      if(target.units() === this.units()) {
        return this;
      }

      if(!this.isCompatible(target)) {
        throw "Incompatible Units";
      }

      var q = div_safe(this.base_scalar, target.base_scalar);

      return new Qty({"scalar": q, "numerator": target.numerator, "denominator": target.denominator});
    },

    // Quantity operators
    // Returns new instance with this units
    add: function(other) {
      if(other && other.constructor === String) {
        other = new Qty(other);
      }

      if(!this.isCompatible(other)) {
        throw "Incompatible Units";
      }

      return new Qty({"scalar": this.scalar + other.to(this).scalar, "numerator": this.numerator, "denominator": this.denominator});
    },

    sub: function(other) {
      if(other && other.constructor === String) {
        other = new Qty(other);
      }

      if(!this.isCompatible(other)) {
        throw "Incompatible Units";
      }

      return new Qty({"scalar": this.scalar - other.to(this).scalar, "numerator": this.numerator, "denominator": this.denominator});
    },

    mul: function(other) {
      if(typeof other === "number") {
        return new Qty({"scalar": mul_safe(this.scalar, other), "numerator": this.numerator, "denominator": this.denominator});
      }
      else if(other && other.constructor === String) {
        other = new Qty(other);
      }

      // Quantities should be multiplied with same units if compatible, with base units else
      var op1 = this;
      var op2 = other;

      if(op1.isCompatible(op2)) {
        op2 = op2.to(op1);
      }
      else {
        if(!op1.isBase()) {
          op1 = op1.toBase();
        }
        if(!op2.isBase()) {
          op2 = op2.toBase();
        }
      }

      var numden = cleanTerms(op1.numerator.concat(op2.numerator), op1.denominator.concat(op2.denominator));

      return new Qty({"scalar": mul_safe(op1.scalar, op2.scalar) , "numerator": numden[0], "denominator": numden[1]});
    },

    div: function(other) {
      if(typeof other === "number") {
        if(other === 0) {
          throw "Divide by zero";
        }
        return new Qty({"scalar": this.scalar / other, "numerator": this.numerator, "denominator": this.denominator});
      }
      else if(other && other.constructor === String) {
        other = new Qty(other);
      }
      if(other.scalar === 0) {
        throw "Divide by zero";
      }

      // Quantities should be multiplied with same units if compatible, with base units else
      var op1 = this;
      var op2 = other;

      if(op1.isCompatible(op2)) {
        op2 = op2.to(op1);
      }
      else {
        if(!op1.isBase()) {
          op1 = op1.toBase();
        }
        if(!op2.isBase()) {
          op2 = op2.toBase();
        }
      }
      var numden = cleanTerms(op1.numerator.concat(op2.denominator), op1.denominator.concat(op2.numerator));

      return new Qty({"scalar": op1.scalar / op2.scalar, "numerator": numden[0], "denominator": numden[1]});
    }

  };

  // Utility functions
  // return object keys
  function objectKeys(obj) {
    var keys = [];
    for(var key in obj) {
      if(obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }

  // Return a new array without duplicate elements
  function unique(duplicates) {
    // Fix weird bug when third party libraries are used
    if(duplicates.length === 1) {
      return duplicates;
    }
    return duplicates.reduce(function(previous, current, index, array) {
      if(!previous.some(function(item) {return compareArray(item, current);})) {
        previous.push(current);
      }
      return previous;
    }, []);
  }

  function compareArray(array1, array2) {
    if (array2.length !== array1.length) {
      return false;
    }
    for (var i = 0; i < array1.length; i++) {
      if (array2[i].compareArray) {
        if (!array2[i].compareArray(array1[i])) {
          return false;
        }
      }
      if (array2[i] !== array1[i]) {
        return false;
      }
    }
    return true;
  }

  function round(val, decimals) {
    return Math.round(val*Math.pow(10, decimals))/Math.pow(10, decimals);
  }

  // significand x 10 ^ exponent
  function exponent_of(val) {
    return Math.floor(Math.log(Math.abs(val)) / Math.LN10);
  }

  var num_regex = /^-?(\d+)(?:\.(\d+))?$/;
  var exp_regex = /^-?(\d+)e-?(\d+)$/;

  // Multiply numbers avoiding floating errors
  // workaround to fix
  // 0.1 * 0.1 => 0.010000000000000002
  // mul_safe(0.1, 0.1) => 0.01
  function mul_safe() {
    var decimals;
    var fractional;
    var result = 1;
    for(var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];

      var match;
      fractional = undefined; // unset fractional
      if((match = num_regex.exec(arg)) && match[2]) {
        fractional = match[2].length;
      }
      else if((match = exp_regex.exec(arg))) {
        fractional = parseInt(match[2], 10);
      }
      // arg could be Infinities
      if(fractional) {
        decimals = (decimals || 0) + fractional;
      }

      result *= arg;
    }

    return decimals ? round(result, decimals) : result;
  }

  function div_safe(a, b) {
    return mul_safe(a, 1/b);
  }

  Qty.mul_safe = mul_safe;
  Qty.div_safe = div_safe;

  function cleanTerms(num, den) {
    num = num.filter(function(val) {return val !== UNITY;});
    den = den.filter(function(val) {return val !== UNITY;});

    var combined = {};

    var k;
    for(var i = 0; i < num.length; i++) {
      if(PREFIX_VALUES[num[i]]) {
        k = [num[i], num[i+1]];
        i++;
      }
      else {
        k = num[i];
      }
      if(k && k !== UNITY) {
        if(combined[k]) {
          combined[k][0]++;
        }
        else {
          combined[k] = [1, k];
        }
      }
    }

    for(var j = 0; j < den.length; j++) {
      if(PREFIX_VALUES[den[j]]) {
        k = [den[j], den[j+1]];
        j++;
      }
      else {
        k = den[j];
      }
      if(k && k !== UNITY) {
        if(combined[k]) {
          combined[k][0]--;
        }
        else {
          combined[k] = [-1, k];
        }
      }
    }

    num = [];
    den = [];

    for(var prop in combined) {
      if(combined.hasOwnProperty(prop)) {
        var item = combined[prop];
        var n;
        if(item[0] > 0) {
          for(n = 0; n < item[0]; n++) {
            num.push(item[1]);
          }
        }
        else if(item[0] < 0) {
          for(n = 0; n < -item[0]; n++) {
            den.push(item[1]);
          }
        }
      }
    }

    if(num.length === 0) {
      num = UNITY_ARRAY;
    }
    if(den.length === 0) {
      den = UNITY_ARRAY;
    }

    // Flatten
    num = num.reduce(function(a,b) {
      return a.concat(b);
    }, []);
    den = den.reduce(function(a,b) {
      return a.concat(b);
    }, []);

    return [num, den];
  }

  // Setup
  var PREFIX_VALUES = {};
  var PREFIX_MAP = {};
  var UNIT_VALUES = {};
  var UNIT_MAP = {};
  var OUTPUT_MAP = {};
  for(var unit_def in UNITS) {
    if(UNITS.hasOwnProperty(unit_def)) {
      var definition = UNITS[unit_def];
      if(definition[2] === "prefix") {
        PREFIX_VALUES[unit_def] = definition[1];
        for(var i = 0; i < definition[0].length; i++) {
          PREFIX_MAP[definition[0][i]] = unit_def;
        }
      }
      else {
        UNIT_VALUES[unit_def] = {
          scalar: definition[1],
          numerator: definition[3],
          denominator: definition[4]
        };
        for(var j = 0; j < definition[0].length; j++) {
          UNIT_MAP[definition[0][j]] = unit_def;
        }
      }
      OUTPUT_MAP[unit_def] = definition[0][0];
    }
  }
  var PREFIX_REGEX = objectKeys(PREFIX_MAP).sort(function(a, b) {
    return b.length - a.length;
  }).join('|');
  var UNIT_REGEX = objectKeys(UNIT_MAP).sort(function(a, b) {
    return b.length - a.length;
  }).join('|');
  var UNIT_MATCH_REGEX = new RegExp("(" + PREFIX_REGEX + ")*?(" + UNIT_REGEX + ")\\b", "g"); // g flag for multiple occurences
  var UNIT_TEST_REGEX = new RegExp("^\\s*((" + PREFIX_REGEX + ")*?(" + UNIT_REGEX + ")\\s*\\*?\\s*)+$");

  return Qty;
}));

