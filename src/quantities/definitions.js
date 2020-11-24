import { isNumber } from "./utils.js";
import QtyError from "./error.js";

export var UNITS = {
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
  "<micro>"  : [
    ["u","\u03BC"/*µ as greek letter*/,"\u00B5"/*µ as micro sign*/,"Micro","mc","micro"],
    1e-6,
    "prefix"
  ],
  "<nano>"  :  [["n","Nano","nano"], 1e-9, "prefix"],
  "<pico>"  :  [["p","Pico","pico"], 1e-12, "prefix"],
  "<femto>" :  [["f","Femto","femto"], 1e-15, "prefix"],
  "<atto>"  :  [["a","Atto","atto"], 1e-18, "prefix"],
  "<zepto>" :  [["z","Zepto","zepto"], 1e-21, "prefix"],
  "<yocto>" :  [["y","Yocto","yocto"], 1e-24, "prefix"],

  "<1>"     :  [["1", "<1>"], 1, ""],
  /* length units */
  "<meter>" :  [["m","meter","meters","metre","metres"], 1.0, "length", ["<meter>"] ],
  "<inch>"  :  [["in","inch","inches","\""], 0.0254, "length", ["<meter>"]],
  "<foot>"  :  [["ft","foot","feet","'"], 0.3048, "length", ["<meter>"]],
  "<yard>"  :  [["yd","yard","yards"], 0.9144, "length", ["<meter>"]],
  "<mile>"  :  [["mi","mile","miles"], 1609.344, "length", ["<meter>"]],
  "<naut-mile>" : [["nmi","naut-mile"], 1852, "length", ["<meter>"]],
  "<league>":  [["league","leagues"], 4828, "length", ["<meter>"]],
  "<furlong>": [["furlong","furlongs"], 201.2, "length", ["<meter>"]],
  "<rod>"   :  [["rd","rod","rods"], 5.029, "length", ["<meter>"]],
  "<mil>"   :  [["mil","mils"], 0.0000254, "length", ["<meter>"]],
  "<angstrom>"  :[["ang","angstrom","angstroms"], 1e-10, "length", ["<meter>"]],
  "<fathom>" : [["fathom","fathoms"], 1.829, "length", ["<meter>"]],
  "<pica>"  : [["pica","picas"], 0.00423333333, "length", ["<meter>"]],
  "<point>" : [["pt","point","points"], 0.000352777778, "length", ["<meter>"]],
  "<redshift>" : [["z","red-shift", "redshift"], 1.302773e26, "length", ["<meter>"]],
  "<AU>"    : [["AU","astronomical-unit"], 149597900000, "length", ["<meter>"]],
  "<light-second>":[["ls","light-second"], 299792500, "length", ["<meter>"]],
  "<light-minute>":[["lmin","light-minute"], 17987550000, "length", ["<meter>"]],
  "<light-year>" : [["ly","light-year"], 9460528000000000, "length", ["<meter>"]],
  "<parsec>"  : [["pc","parsec","parsecs"], 30856780000000000, "length", ["<meter>"]],
  "<datamile>"  :  [["DM","datamile"], 1828.8, "length", ["<meter>"]],

  /* mass */
  "<kilogram>" : [["kg","kilogram","kilograms"], 1.0, "mass", ["<kilogram>"]],
  "<AMU>" : [["u","AMU","amu"], 1.660538921e-27, "mass", ["<kilogram>"]],
  "<dalton>" : [["Da","Dalton","Daltons","dalton","daltons"], 1.660538921e-27, "mass", ["<kilogram>"]],
  "<slug>" : [["slug","slugs"], 14.5939029, "mass", ["<kilogram>"]],
  "<short-ton>" : [["tn","ton","short-ton"], 907.18474, "mass", ["<kilogram>"]],
  "<metric-ton>":[["tonne","metric-ton"], 1000, "mass", ["<kilogram>"]],
  "<carat>" : [["ct","carat","carats"], 0.0002, "mass", ["<kilogram>"]],
  "<pound>" : [["lbs","lb","pound","pounds","#"], 0.45359237, "mass", ["<kilogram>"]],
  "<ounce>" : [["oz","ounce","ounces"], 0.0283495231, "mass", ["<kilogram>"]],
  "<gram>"    :  [["g","gram","grams","gramme","grammes"], 1e-3, "mass", ["<kilogram>"]],
  "<grain>" : [["grain","grains","gr"], 6.479891e-5, "mass", ["<kilogram>"]],
  "<dram>"  : [["dram","drams","dr"], 0.0017718452, "mass",["<kilogram>"]],
  "<stone>" : [["stone","stones","st"],6.35029318, "mass",["<kilogram>"]],

  /* area */
  "<hectare>":[["hectare"], 10000, "area", ["<meter>","<meter>"]],
  "<acre>":[["acre","acres"], 4046.85642, "area", ["<meter>","<meter>"]],
  "<sqft>":[["sqft"], 1, "area", ["<foot>","<foot>"]],

  /* volume */
  "<liter>" : [["l","L","liter","liters","litre","litres"], 0.001, "volume", ["<meter>","<meter>","<meter>"]],
  "<gallon>":  [["gal","gallon","gallons"], 0.0037854118, "volume", ["<meter>","<meter>","<meter>"]],
  "<gallon-imp>":  [["galimp","gallon-imp","gallons-imp"], 0.0045460900, "volume", ["<meter>","<meter>","<meter>"]],
  "<quart>":  [["qt","quart","quarts"], 0.00094635295, "volume", ["<meter>","<meter>","<meter>"]],
  "<pint>":  [["pt","pint","pints"], 0.000473176475, "volume", ["<meter>","<meter>","<meter>"]],
  "<pint-imp>":  [["ptimp","pint-imp","pints-imp"], 5.6826125e-4, "volume", ["<meter>","<meter>","<meter>"]],
  "<cup>":  [["cu","cup","cups"], 0.000236588238, "volume", ["<meter>","<meter>","<meter>"]],
  "<fluid-ounce>":  [["floz","fluid-ounce","fluid-ounces"], 2.95735297e-5, "volume", ["<meter>","<meter>","<meter>"]],
  "<fluid-ounce-imp>":  [["flozimp", "floz-imp","fluid-ounce-imp","fluid-ounces-imp"], 2.84130625e-5, "volume", ["<meter>","<meter>","<meter>"]],
  "<tablespoon>":  [["tb","tbsp","tbs","tablespoon","tablespoons"], 1.47867648e-5, "volume", ["<meter>","<meter>","<meter>"]],
  "<teaspoon>":  [["tsp","teaspoon","teaspoons"], 4.92892161e-6, "volume", ["<meter>","<meter>","<meter>"]],
  "<bushel>":  [["bu","bsh","bushel","bushels"], 0.035239072, "volume", ["<meter>","<meter>","<meter>"]],
  "<oilbarrel>":  [["bbl","oilbarrel", "oilbarrels", "oil-barrel","oil-barrels"], 0.158987294928, "volume", ["<meter>","<meter>","<meter>"]],
  "<beerbarrel>":  [["bl","bl-us","beerbarrel", "beerbarrels", "beer-barrel","beer-barrels"], 0.1173477658, "volume", ["<meter>","<meter>","<meter>"]],
  "<beerbarrel-imp>":  [["blimp","bl-imp","beerbarrel-imp", "beerbarrels-imp", "beer-barrel-imp","beer-barrels-imp"], 0.16365924, "volume", ["<meter>","<meter>","<meter>"]],

  /* speed */
  "<kph>" : [["kph"], 0.277777778, "speed", ["<meter>"], ["<second>"]],
  "<mph>" : [["mph"], 0.44704, "speed", ["<meter>"], ["<second>"]],
  "<knot>" : [["kt","kn","kts","knot","knots"], 0.514444444, "speed", ["<meter>"], ["<second>"]],
  "<fps>"  : [["fps"], 0.3048, "speed", ["<meter>"], ["<second>"]],

  /* acceleration */
  "<gee>" : [["gee"], 9.80665, "acceleration", ["<meter>"], ["<second>","<second>"]],
  "<Gal>" : [["Gal"], 1e-2, "acceleration", ["<meter>"], ["<second>","<second>"]],

  /* temperature_difference */
  "<kelvin>" : [["degK","kelvin"], 1.0, "temperature", ["<kelvin>"]],
  "<celsius>" : [["degC","celsius","celsius","centigrade"], 1.0, "temperature", ["<kelvin>"]],
  "<fahrenheit>" : [["degF","fahrenheit"], 5 / 9, "temperature", ["<kelvin>"]],
  "<rankine>" : [["degR","rankine"], 5 / 9, "temperature", ["<kelvin>"]],
  "<temp-K>"  : [["tempK","temp-K"], 1.0, "temperature", ["<temp-K>"]],
  "<temp-C>"  : [["tempC","temp-C"], 1.0, "temperature", ["<temp-K>"]],
  "<temp-F>"  : [["tempF","temp-F"], 5 / 9, "temperature", ["<temp-K>"]],
  "<temp-R>"  : [["tempR","temp-R"], 5 / 9, "temperature", ["<temp-K>"]],

  /* time */
  "<second>":  [["s","sec","secs","second","seconds"], 1.0, "time", ["<second>"]],
  "<minute>":  [["min","mins","minute","minutes"], 60.0, "time", ["<second>"]],
  "<hour>":  [["h","hr","hrs","hour","hours"], 3600.0, "time", ["<second>"]],
  "<day>":  [["d","day","days"], 3600 * 24, "time", ["<second>"]],
  "<week>":  [["wk","week","weeks"], 7 * 3600 * 24, "time", ["<second>"]],
  "<fortnight>": [["fortnight","fortnights"], 1209600, "time", ["<second>"]],
  "<year>":  [["y","yr","year","years","annum"], 31556926, "time", ["<second>"]],
  "<decade>":[["decade","decades"], 315569260, "time", ["<second>"]],
  "<century>":[["century","centuries"], 3155692600, "time", ["<second>"]],

  /* pressure */
  "<pascal>" : [["Pa","pascal","Pascal"], 1.0, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
  "<bar>" : [["bar","bars"], 100000, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
  "<mmHg>" : [["mmHg"], 133.322368, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
  "<inHg>" : [["inHg"], 3386.3881472, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
  "<torr>" : [["torr"], 133.322368, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
  "<atm>" : [["atm","ATM","atmosphere","atmospheres"], 101325, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
  "<psi>" : [["psi"], 6894.76, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
  "<cmh2o>" : [["cmH2O","cmh2o"], 98.0638, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],
  "<inh2o>" : [["inH2O","inh2o"], 249.082052, "pressure", ["<kilogram>"],["<meter>","<second>","<second>"]],

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
  "<unit>"  :  [["U","enzUnit","unit"], 16.667e-16, "activity", ["<mole>"], ["<second>"]],

  /* capacitance */
  "<farad>" :  [["F","farad","Farad"], 1.0, "capacitance", ["<second>","<second>","<second>","<second>","<ampere>","<ampere>"], ["<meter>", "<meter>", "<kilogram>"]],

  /* charge */
  "<coulomb>" :  [["C","coulomb","Coulomb"], 1.0, "charge", ["<ampere>","<second>"]],
  "<Ah>" :  [["Ah"], 3600, "charge", ["<ampere>","<second>"]],

  /* current */
  "<ampere>"  :  [["A","Ampere","ampere","amp","amps"], 1.0, "current", ["<ampere>"]],

  /* conductance */
  "<siemens>" : [["S","Siemens","siemens"], 1.0, "conductance", ["<second>","<second>","<second>","<ampere>","<ampere>"], ["<kilogram>","<meter>","<meter>"]],

  /* inductance */
  "<henry>" :  [["H","Henry","henry"], 1.0, "inductance", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>","<ampere>","<ampere>"]],

  /* potential */
  "<volt>"  :  [["V","Volt","volt","volts"], 1.0, "potential", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>","<second>","<ampere>"]],

  /* resistance */
  "<ohm>" :  [
    ["Ohm","ohm","\u03A9"/*Ω as greek letter*/,"\u2126"/*Ω as ohm sign*/],
    1.0,
    "resistance",
    ["<meter>","<meter>","<kilogram>"],["<second>","<second>","<second>","<ampere>","<ampere>"]
  ],
  /* magnetism */
  "<weber>" : [["Wb","weber","webers"], 1.0, "magnetism", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>","<ampere>"]],
  "<tesla>"  : [["T","tesla","teslas"], 1.0, "magnetism", ["<kilogram>"], ["<second>","<second>","<ampere>"]],
  "<gauss>" : [["G","gauss"], 1e-4, "magnetism",  ["<kilogram>"], ["<second>","<second>","<ampere>"]],
  "<maxwell>" : [["Mx","maxwell","maxwells"], 1e-8, "magnetism", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>","<ampere>"]],
  "<oersted>"  : [["Oe","oersted","oersteds"], 250.0 / Math.PI, "magnetism", ["<ampere>"], ["<meter>"]],

  /* energy */
  "<joule>" :  [["J","joule","Joule","joules"], 1.0, "energy", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
  "<erg>"   :  [["erg","ergs"], 1e-7, "energy", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
  "<btu>"   :  [["BTU","btu","BTUs"], 1055.056, "energy", ["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
  "<calorie>" :  [["cal","calorie","calories"], 4.18400, "energy",["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
  "<Calorie>" :  [["Cal","Calorie","Calories"], 4184.00, "energy",["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
  "<therm-US>" : [["th","therm","therms","Therm","therm-US"], 105480400, "energy",["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],
  "<Wh>" : [["Wh"], 3600, "energy",["<meter>","<meter>","<kilogram>"], ["<second>","<second>"]],

  /* force */
  "<newton>"  : [["N","Newton","newton"], 1.0, "force", ["<kilogram>","<meter>"], ["<second>","<second>"]],
  "<dyne>"  : [["dyn","dyne"], 1e-5, "force", ["<kilogram>","<meter>"], ["<second>","<second>"]],
  "<pound-force>"  : [["lbf","pound-force"], 4.448222, "force", ["<kilogram>","<meter>"], ["<second>","<second>"]],

  /* frequency */
  "<hertz>" : [["Hz","hertz","Hertz"], 1.0, "frequency", ["<1>"], ["<second>"]],

  /* angle */
  "<radian>" :[["rad","radian","radians"], 1.0, "angle", ["<radian>"]],
  "<degree>" :[["deg","degree","degrees"], Math.PI / 180.0, "angle", ["<radian>"]],
  "<gradian>"   :[["gon","grad","gradian","grads"], Math.PI / 200.0, "angle", ["<radian>"]],
  "<steradian>"  : [["sr","steradian","steradians"], 1.0, "solid_angle", ["<steradian>"]],

  /* rotation */
  "<rotation>" : [["rotation"], 2.0 * Math.PI, "angle", ["<radian>"]],
  "<rpm>"   :[["rpm"], 2.0 * Math.PI / 60.0, "angular_velocity", ["<radian>"], ["<second>"]],

  /* information */
  "<byte>"  :[["B","byte","bytes"], 1.0, "information", ["<byte>"]],
  "<bit>"  :[["b","bit","bits"], 0.125, "information", ["<byte>"]],

  /* information rate */
  "<Bps>" : [["Bps"], 1.0, "information_rate", ["<byte>"], ["<second>"]],
  "<bps>" : [["bps"], 0.125, "information_rate", ["<byte>"], ["<second>"]],

  /* currency */
  "<dollar>":[["USD","dollar"], 1.0, "currency", ["<dollar>"]],
  "<cents>" :[["cents"], 0.01, "currency", ["<dollar>"]],

  /* luminosity */
  "<candela>" : [["cd","candela"], 1.0, "luminosity", ["<candela>"]],
  "<lumen>" : [["lm","lumen"], 1.0, "luminous_power", ["<candela>","<steradian>"]],
  "<lux>" :[["lux"], 1.0, "illuminance", ["<candela>","<steradian>"], ["<meter>","<meter>"]],

  /* power */
  "<watt>"  : [["W","watt","watts"], 1.0, "power", ["<kilogram>","<meter>","<meter>"], ["<second>","<second>","<second>"]],
  "<volt-ampere>"  : [["VA","volt-ampere"], 1.0, "power", ["<kilogram>","<meter>","<meter>"], ["<second>","<second>","<second>"]],
  "<volt-ampere-reactive>"  : [["var","Var","VAr","VAR","volt-ampere-reactive"], 1.0, "power", ["<kilogram>","<meter>","<meter>"], ["<second>","<second>","<second>"]],
  "<horsepower>"  :  [["hp","horsepower"], 745.699872, "power", ["<kilogram>","<meter>","<meter>"], ["<second>","<second>","<second>"]],

  /* radiation */
  "<gray>" : [["Gy","gray","grays"], 1.0, "radiation", ["<meter>","<meter>"], ["<second>","<second>"]],
  "<roentgen>" : [["R","roentgen"], 0.009330, "radiation", ["<meter>","<meter>"], ["<second>","<second>"]],
  "<sievert>" : [["Sv","sievert","sieverts"], 1.0, "radiation", ["<meter>","<meter>"], ["<second>","<second>"]],
  "<becquerel>" : [["Bq","becquerel","becquerels"], 1.0, "radiation", ["<1>"],["<second>"]],
  "<curie>" : [["Ci","curie","curies"], 3.7e10, "radiation", ["<1>"],["<second>"]],

  /* rate */
  "<cpm>" : [["cpm"], 1.0 / 60.0, "rate", ["<count>"],["<second>"]],
  "<dpm>" : [["dpm"], 1.0 / 60.0, "rate", ["<count>"],["<second>"]],
  "<bpm>" : [["bpm"], 1.0 / 60.0, "rate", ["<count>"],["<second>"]],

  /* resolution / typography */
  "<dot>" : [["dot","dots"], 1, "resolution", ["<each>"]],
  "<pixel>" : [["pixel","px"], 1, "resolution", ["<each>"]],
  "<ppi>" : [["ppi"], 1, "resolution", ["<pixel>"], ["<inch>"]],
  "<dpi>" : [["dpi"], 1, "typography", ["<dot>"], ["<inch>"]],

  /* other */
  "<cell>" : [["cells","cell"], 1, "counting", ["<each>"]],
  "<each>" : [["each"], 1.0, "counting", ["<each>"]],
  "<count>" : [["count"], 1.0, "counting", ["<each>"]],
  "<base-pair>"  : [["bp","base-pair"], 1.0, "counting", ["<each>"]],
  "<nucleotide>" : [["nt","nucleotide"], 1.0, "counting", ["<each>"]],
  "<molecule>" : [["molecule","molecules"], 1.0, "counting", ["<1>"]],
  "<dozen>" :  [["doz","dz","dozen"],12.0,"prefix_only", ["<each>"]],
  "<percent>": [["%","percent"], 0.01, "prefix_only", ["<1>"]],
  "<ppm>" :  [["ppm"],1e-6, "prefix_only", ["<1>"]],
  "<ppt>" :  [["ppt"],1e-9, "prefix_only", ["<1>"]],
  "<gross>" :  [["gr","gross"],144.0, "prefix_only", ["<dozen>","<dozen>"]],
  "<decibel>"  : [["dB","decibel","decibels"], 1.0, "logarithmic", ["<decibel>"]]
};

export var BASE_UNITS = ["<meter>","<kilogram>","<second>","<mole>", "<ampere>","<radian>","<kelvin>","<temp-K>","<byte>","<dollar>","<candela>","<each>","<steradian>","<decibel>"];

export var UNITY = "<1>";
export var UNITY_ARRAY = [UNITY];

// Setup

/**
 * Asserts unit definition is valid
 *
 * @param {string} unitDef - Name of unit to test
 * @param {Object} definition - Definition of unit to test
 *
 * @returns {void}
 * @throws {QtyError} if unit definition is not valid
 */
function validateUnitDefinition(unitDef, definition) {
  var scalar = definition[1];
  var numerator = definition[3] || [];
  var denominator = definition[4] || [];
  if (!isNumber(scalar)) {
    throw new QtyError(unitDef + ": Invalid unit definition. " +
                       "'scalar' must be a number");
  }

  numerator.forEach(function(unit) {
    if (UNITS[unit] === undefined) {
      throw new QtyError(unitDef + ": Invalid unit definition. " +
                         "Unit " + unit + " in 'numerator' is not recognized");
    }
  });

  denominator.forEach(function(unit) {
    if (UNITS[unit] === undefined) {
      throw new QtyError(unitDef + ": Invalid unit definition. " +
                         "Unit " + unit + " in 'denominator' is not recognized");
    }
  });
}

export var PREFIX_VALUES = {};
export var PREFIX_MAP = {};
export var UNIT_VALUES = {};
export var UNIT_MAP = {};
export var OUTPUT_MAP = {};
for (var unitDef in UNITS) {
  if (UNITS.hasOwnProperty(unitDef)) {
    var definition = UNITS[unitDef];
    if (definition[2] === "prefix") {
      PREFIX_VALUES[unitDef] = definition[1];
      for (var i = 0; i < definition[0].length; i++) {
        PREFIX_MAP[definition[0][i]] = unitDef;
      }
    }
    else {
      validateUnitDefinition(unitDef, definition);
      UNIT_VALUES[unitDef] = {
        scalar: definition[1],
        numerator: definition[3],
        denominator: definition[4]
      };
      for (var j = 0; j < definition[0].length; j++) {
        UNIT_MAP[definition[0][j]] = unitDef;
      }
    }
    OUTPUT_MAP[unitDef] = definition[0][0];
  }
}

/**
 * Returns a list of available units of kind
 *
 * @param {string} [kind] - kind of units
 * @returns {array} names of units
 * @throws {QtyError} if kind is unknown
 */
export function getUnits(kind) {
  var i;
  var units = [];
  var unitKeys = Object.keys(UNITS);
  if (typeof kind === "undefined") {
    for (i = 0; i < unitKeys.length; i++) {
      if (["", "prefix"].indexOf(UNITS[unitKeys[i]][2]) === -1) {
        units.push(unitKeys[i].substr(1, unitKeys[i].length - 2));
      }
    }
  }
  else if (this.getKinds().indexOf(kind) === -1) {
    throw new QtyError("Kind not recognized");
  }
  else {
    for (i = 0; i < unitKeys.length; i++) {
      if (UNITS[unitKeys[i]][2] === kind) {
        units.push(unitKeys[i].substr(1, unitKeys[i].length - 2));
      }
    }
  }

  return units.sort(function(a, b) {
    if (a.toLowerCase() < b.toLowerCase()) {
      return -1;
    }
    if (a.toLowerCase() > b.toLowerCase()) {
      return 1;
    }
    return 0;
  });
}

/**
 * Returns a list of alternative names for a unit
 *
 * @param {string} unitName - name of unit
 * @returns {string[]} aliases for unit
 * @throws {QtyError} if unit is unknown
 */
export function getAliases(unitName) {
  if (!UNIT_MAP[unitName]) {
    throw new QtyError("Unit not recognized");
  }
  return UNITS[UNIT_MAP[unitName]][0];
}
