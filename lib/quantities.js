var Qty = (function() {

  UNITS = { 
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
    "<1>"     :  [["1"],1,"prefix"],

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

  UNITY = '<1>';
  UNITY_ARRAY= [UNITY];
  SCI_NUMBER = "([+-]?\\d*[.]?\\d+(?:[Ee][+-]?)?\\d*)";
  SCI_NUMBER_REGEX = new RegExp(SCI_NUMBER);
  NUMBER_REGEX = new RegExp(SCI_NUMBER + "*\\s*(.+)?");
  UNIT_STRING_REGEX = new RegExp(SCI_NUMBER + "*\\s*([^\/]*)\/*(.+)*");
  TOP_REGEX = new RegExp("([^ \\*]+)(?:\\^|\\*\\*)([\\d-]+)");
  BOTTOM_REGEX = new RegExp("([^ \\*]+)(?:\\^|\\*\\*)(\\d+)");

  var constructor = function(qty_string) {
    this.scalar = null;
    this.base_scalar = null;
    this.unit_name = null;
    this.signature = null;
    this.output = null;
    this.numerator = UNITY_ARRAY;
    this.denominator = UNITY_ARRAY;

    this.init_value = qty_string;
    parse.call(this, qty_string);
  };

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
    //console.log(result);
    if(!result) {
      throw val + ": Quantity not recognized";
    }

    this.scalar = result[1] ? parseFloat(result[1]) : 1.0;
    var top = result[2];
    //console.log("topmatch:");
    //console.log(top);
    var bottom = result[3];
    //console.log("bottommatch:");
    //console.log(bottom);

    while((result = TOP_REGEX.exec(top))) {
      //console.log("TOP_REGEX:");
      //console.log(result);
      var n = parseFloat(result[2]);
      var x = result[1] + " ";
      var nx = x;
      for(var i = 0; i < (n - 1); i++) {
        nx += x;
      }

      top = top.replace(new RegExp(result[1] + "(\\^|\\*\\*)" + n), nx);
    }

    result = BOTTOM_REGEX.exec(bottom);
    if(result) {
      //console.log("BOTTOM_REGEX:");
      //console.log(result);
      var n = parseFloat(result[2]);
      var x = result[1] + " ";
      var nx = x;
      for(var i = 0; i < (n - 1); i++) {
        nx += x;
      }

      bottom = bottom.replace(BOTTOM_REGEX, nx, "g");
    }


    var unit_match;
    // Scan
    if(top) {
      this.numerator = [];
      while((unit_match = UNIT_MATCH_REGEX.exec(top))) {
        //console.log("topunitmatch:");
        //console.log(unit_match);
        this.numerator.push(unit_match.slice(1));
      }
    }
    if(bottom) {
      this.denominator = [];
      while((unit_match = UNIT_MATCH_REGEX.exec(bottom))) {
        //console.log("bottomunitmatch:");
        //console.log(unit_match);
        this.denominator.push(unit_match.slice(1));
      }
    }
    
    this.numerator = (function() {
      var numerator = this.numerator.map(function(item) {
        return PREFIX_MAP[item[0]] ? [PREFIX_MAP[item[0]], UNIT_MAP[item[1]]] : [UNIT_MAP[item[1]]];
      });
      return numerator;
    }).call(this);
  
    // Flatten and remove null elements
    this.numerator = this.numerator.reduce(function(a,b) {
      return a.concat(b);
    }, []);
    this.numerator = this.numerator.filter(function(item) {
      return item;
    });

    this.denominator = (function() {
      var denominator = this.denominator.map(function(item) {
        return PREFIX_MAP[item[0]] ? [PREFIX_MAP[item[0]], UNIT_MAP[item[1]]] : [UNIT_MAP[item[1]]];
      });
      return denominator;
    }).call(this);

    // Flatten and remove null elements
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

  constructor.prototype = {
    // Converts the unit back to a float if it is unitless.  Otherwise raises an exception
    to_f: function() {
      if(this.isUnitless()) {
        return this.scalar;
      }
      throw "Can't convert to Float unless unitless.  Use Unit#scalar";
    },

    // returns true if no associated units
    // false, even if the units are "unitless" like 'radians, each, etc'
    isUnitless: function() {
      return this.numerator === UNITY_ARRAY && this.denominator === UNITY_ARRAY;
    }
  };

  function objectKeys(obj) {
    var keys = [];
    for(var key in obj) {
      if(obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }

  // Setup
  PREFIX_VALUES = {};
  PREFIX_MAP = {};
  UNIT_VALUES = {};
  UNIT_MAP = {};
  OUTPUT_MAP = {};
  for(var unit_def in UNITS) {
    if(!UNITS.hasOwnProperty(unit_def)) {
      continue;
    }

    var definition = UNITS[unit_def];
    if(definition[2] === "prefix") {
      PREFIX_VALUES[unit_def] = definition[1];
      for(var i in definition[0]) {
        PREFIX_MAP[definition[0][i]] = unit_def;
      }
    }
    else {
      UNIT_VALUES[unit_def] = {
        scalar: definition[1],
        numerator: definition[3],
        denominator: definition[4]
      };
      for(var i in definition[0]) {
        UNIT_MAP[definition[0][i]] = unit_def;
      }
    }
    OUTPUT_MAP[unit_def] = definition[0][0];
  }
  var PREFIX_REGEX = objectKeys(PREFIX_MAP).sort(function(a, b) {
    return b.length - a.length;    
  }).join('|');
  var UNIT_REGEX = objectKeys(UNIT_MAP).sort(function(a, b) {
    return b.length - a.length;    
  }).join('|');
  UNIT_MATCH_REGEX = new RegExp("(" + PREFIX_REGEX + ")*?(" + UNIT_REGEX + ")\\b", "g"); // g flag for multiple occurences

  return constructor;
})();

