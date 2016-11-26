(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.BrowserESModuleLoader = factory());
}(this, function () { 'use strict';

  /*
   * Environment
   */
  var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  var isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
  var isWindows = typeof process !== 'undefined' && typeof process.platform === 'string' && process.platform.match(/^win/);

  var envGlobal = typeof self !== 'undefined' ? self : global;
  /*
   * Environment baseURI
   */
  var baseURI;

  // environent baseURI detection
  if (typeof document != 'undefined' && document.getElementsByTagName) {
    baseURI = document.baseURI;

    if (!baseURI) {
      var bases = document.getElementsByTagName('base');
      baseURI = bases[0] && bases[0].href || window.location.href;
    }
  }
  else if (typeof location != 'undefined') {
    baseURI = location.href;
  }

  // sanitize out the hash and querystring
  if (baseURI) {
    baseURI = baseURI.split('#')[0].split('?')[0];
    baseURI = baseURI.substr(0, baseURI.lastIndexOf('/') + 1);
  }
  else if (typeof process != 'undefined' && process.cwd) {
    baseURI = 'file://' + (isWindows ? '/' : '') + process.cwd();
    if (isWindows)
      baseURI = baseURI.replace(/\\/g, '/');
  }
  else {
    throw new TypeError('No environment baseURI');
  }

  // ensure baseURI has trailing "/"
  if (baseURI[baseURI.length - 1] !== '/')
    baseURI += '/';

  /*
   * LoaderError with chaining for loader stacks
   */
  var errArgs = new Error(0, '_').fileName == '_';
  function LoaderError__Check_error_message_above_for_loader_stack(childErr, newMessage) {
    // Convert file:/// URLs to paths in Node
    if (!isBrowser)
      newMessage = newMessage.replace(isWindows ? /file:\/\/\//g : /file:\/\//g, '');

    var message = (childErr.message || childErr) + '\n  ' + newMessage;

    var err;
    if (errArgs && childErr.fileName)
      err = new Error(message, childErr.fileName, childErr.lineNumber);
    else
      err = new Error(message);


    var stack = childErr.originalErr ? childErr.originalErr.stack : childErr.stack;

    if (isNode)
      // node doesn't show the message otherwise
      err.stack = message + '\n  ' + stack;
    else
      err.stack = stack;

    err.originalErr = childErr.originalErr || childErr;

    return err;
  }

  /*
   * Simple Symbol() shim
   */
  var hasSymbol = typeof Symbol !== 'undefined';
  function createSymbol(name) {
    return hasSymbol ? Symbol() : '@@' + name;
  }

  /*
   * Simple Array values shim
   */
  function arrayValues(arr) {
    if (arr.values)
      return arr.values();

    if (typeof Symbol === 'undefined' || !Symbol.iterator)
      throw new Error('Cannot return values iterator unless Symbol.iterator is defined');

    var iterable = {};
    iterable[Symbol.iterator] = function() {
      var keys = Object.keys(arr);
      var keyIndex = 0;
      return {
        next: function() {
          if (keyIndex < keys.length)
            return {
              value: arr[keys[keyIndex++]],
              done: false
            };
          else
            return {
              value: undefined,
              done: true
            };
        }
      };
    };
    return iterable;
  }

  /*
   * 3. Reflect.Loader
   *
   * We skip the entire native internal pipeline, just providing the bare API
   */
  // 3.1.1
  function Loader(baseKey) {
    this.key = baseKey || baseURI;
    this.registry = new Registry();
  }
  // 3.3.1
  Loader.prototype.constructor = Loader;
  // 3.3.2
  Loader.prototype.import = function(key, parent) {
    if (typeof key !== 'string')
      throw new TypeError('Loader import method must be passed a module key string');
    return this.load(key, parent);
  };
  // 3.3.3
  var RESOLVE$1 = Loader.resolve = createSymbol('resolve');

  // instantiate sets the namespace into the registry
  // it is up to implementations to ensure instantiate is debounced properly
  var INSTANTIATE = Loader.instantiate = createSymbol('instantiate');

  Loader.prototype.resolve = function(key, parent) {
    return this[RESOLVE$1](key, parent)
    .catch(function(err) {
      throw LoaderError__Check_error_message_above_for_loader_stack(err, 'Resolving ' + key + (parent ? ' to ' + parent : ''));
    });
  };

  // 3.3.4
  Loader.prototype.load = function(key, parent) {
    var loader = this;
    var registry = loader.registry._registry;

    var resolvedKey;

    // there is the potential for an internal perf optimization to allow resolve to return { resolved, namespace }
    // but this needs to be done based on performance measurement
    return Promise.resolve(this[RESOLVE$1](key, parent || this.key))
    .then(function(resolved) {
      var existingNamespace = registry[resolved];

      if (existingNamespace)
        return Promise.resolve(existingNamespace);

      return loader[INSTANTIATE](resolved)
      .then(function(namespace) {

        // returning the namespace from instantiate can be considered a sort of perf optimization
        if (!namespace)
          namespace = loader.registry.get(resolvedKey);
        else if (!(namespace instanceof ModuleNamespace))
          throw new TypeError('Instantiate did not resolve a Module Namespace');

        return namespace;
      });
    })
    .catch(function(err) {
      throw LoaderError__Check_error_message_above_for_loader_stack(err, 'Loading ' + key + (resolvedKey ? ' as ' + resolvedKey : '') + (parent ? ' from ' + parent : ''));
    });
  };

  /*
   * 4. Registry
   *
   * Instead of structuring through a Map, just use a dictionary object
   * We throw for construction attempts so this doesn't affect the public API
   *
   * Registry has been adjusted to use Namespace objects over ModuleStatus objects
   * as part of simplifying loader API implementation
   */
  var iteratorSupport = typeof Symbol !== 'undefined' && Symbol.iterator;
  function Registry() {
    this._registry = {};
  }
  // 4.4.1
  Registry.prototype.constructor = function() {
    throw new TypeError('Custom registries cannot be created.');
  };

  if (iteratorSupport) {
    // 4.4.2
    Registry.prototype[Symbol.iterator] = function() {
      return this.entries()[Symbol.iterator]();
    };

    // 4.4.3
    Registry.prototype.entries = function() {
      var registry = this._registry;
      return arrayValues(Object.keys(registry).map(function(key) {
        return [key, registry[key]];
      }));
    };
  }

  // 4.4.4
  Registry.prototype.keys = function() {
    return arrayValues(Object.keys(this._registry));
  };
  // 4.4.5
  Registry.prototype.values = function() {
    var registry = this._registry;
    return arrayValues(Object.keys(registry).map(function(key) {
      return registry[key];
    }));
  };
  // 4.4.6
  Registry.prototype.get = function(key) {
    return this._registry[key];
  };
  // 4.4.7
  Registry.prototype.set = function(key, namespace) {
    if (!(namespace instanceof ModuleNamespace))
      throw new Error('Registry must be set with an instance of Module Namespace');
    this._registry[key] = namespace;
    return this;
  };
  // 4.4.8
  Registry.prototype.has = function(key) {
    return !!this._registry[key];
  };
  // 4.4.9
  Registry.prototype.delete = function(key) {
    if (this._registry[key]) {
      //delete this._registry[key];
      // much faster...
      this._registry[key] = undefined;
      return true;
    }
    return false;
  };

  /*
   * Simple ModuleNamespace Exotic object based on a baseObject
   * We export this for allowing a fast-path for module namespace creation over Module descriptors
   */
  function ModuleNamespace(baseObject, evaluate) {
    var ns = this;
    Object.keys(baseObject).forEach(function(key) {
      Object.defineProperty(ns, key, {
        configurable: false,
        enumerable: true,
        get: function () {
          return baseObject[key];
        },
        set: function() {
          throw new TypeError('Module exports cannot be changed externally.');
        }
      });
    });
    if (evaluate)
      Object.defineProperty(ns, '$__evaluate', {
        value: evaluate,
        writable: true
      });
  }

  if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
    ModuleNamespace.prototype[Symbol.toStringTag] = 'Module';
  else
    Object.defineProperty(ModuleNamespace.prototype, 'toString', {
      value: function() {
        return '[object Module]';
      }
    });

  // 8.3.1 Reflect.Module
  function Module(descriptors, executor, evaluate) {
    if (typeof descriptors !== 'object')
      throw new TypeError('Expected descriptors object');

    // instead of providing a mutator, just provide the base object
    var baseObject = {};

    // 8.2.1 ParseExportsDescriptors
    Object.keys(descriptors).forEach(function(key) {
      var descriptor = descriptors[key];

      if (!('value' in descriptor))
        throw new TypeError('Error reading descriptor for "' + key + '" - module polyfill only supports value descriptors currently');

      baseObject[key] = descriptor.value;
    });

    var ns = new ModuleNamespace(baseObject, evaluate);

    if (executor)
      executor(baseObject, ns);

    return ns;
  };
  // 8.4.2
  Module.prototype = null;

  // 8.4.1 Module.evaluate
  Module.evaluate = function(ns) {
    if (ns.$__evaluate) {
      ns.$__evaluate();
      ns.$__evaluate = undefined;
    }
  };

  /*
   * Optimized URL normalization assuming a syntax-valid URL parent
   */ 
  function resolveUrlToParentIfNotPlain(relUrl, parentUrl) {

    function throwResolveError() {
      throw new RangeError('Unable to resolve "' + relUrl + '" to ' + parentUrl);
    }

    var protocolIndex = relUrl.indexOf(':');
    if (protocolIndex !== -1) {
      if (isNode) {
        // Windows filepath compatibility (unique to SystemJS, not in URL spec at all)
        // C:\x becomes file:///c:/x (we don't support C|\x)
        if (relUrl[1] === ':' && relUrl[2] === '\\' && relUrl[0].match(/[a-z]/i) && parentUrl.substr(0, 5) === 'file:')
          return 'file:///' + relUrl.replace(/\\/g, '/');
      }
      return relUrl;
    }

    var parentProtocol = parentUrl && parentUrl.substr(0, parentUrl.indexOf(':') + 1);

    // protocol-relative
    if (relUrl[0] === '/' && relUrl[1] === '/') {
      if (!parentProtocol)
        throwResolveError();
      return parentProtocol + relUrl;
    }
    // relative-url
    else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2) || relUrl.length === 1)
        || relUrl[0] === '/') {
      var parentIsPlain = !parentProtocol || parentUrl[parentProtocol.length] !== '/';

      // read pathname from parent if a URL
      // pathname taken to be part after leading "/"
      var pathname;
      if (parentIsPlain) {
        // resolving to a plain parent -> skip standard URL prefix, and treat entire parent as pathname
        if (parentUrl === undefined)
          throwResolveError();
        pathname = parentUrl;
      }
      else if (parentUrl[parentProtocol.length + 1] === '/') {
        // resolving to a :// so we need to read out the auth and host
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.substr(parentProtocol.length + 2);
          pathname = pathname.substr(pathname.indexOf('/') + 1);
        }
        else {
          pathname = parentUrl.substr(8);
        }
      }
      else {
        // resolving to :/ so pathname is the /... part
        pathname = parentUrl.substr(parentProtocol.length + 1);
      }

      if (relUrl[0] === '/') {
        if (parentIsPlain)
          throwResolveError();
        else
          return parentUrl.substr(0, parentUrl.length - pathname.length - 1) + relUrl;
      }
      
      // join together and split for removal of .. and . segments
      // looping the string instead of anything fancy for perf reasons
      // '../../../../../z' resolved to 'x/y' is just 'z' regardless of parentIsPlain
      var segmented = pathname.substr(0, pathname.lastIndexOf('/') + 1) + relUrl;

      var output = [];
      var segmentIndex = undefined;

      for (var i = 0; i < segmented.length; i++) {
        // busy reading a segment - only terminate on '/'
        if (segmentIndex !== undefined) {
          if (segmented[i] === '/') {
            output.push(segmented.substr(segmentIndex, i - segmentIndex + 1));
            segmentIndex = undefined;
          }
          continue;
        }

        // new segment - check if it is relative
        if (segmented[i] === '.') {
          // ../ segment
          if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i === segmented.length - 2)) {
            output.pop();
            i += 2;
          }
          // ./ segment
          else if (segmented[i + 1] === '/' || i === segmented.length - 1) {
            i += 1;
          }
          else {
            // the start of a new segment as below
            segmentIndex = i;
            continue;
          }

          // this is the plain URI backtracking error (../, package:x -> error)
          if (parentIsPlain && output.length === 0)
            throwResolveError();
          
          // trailing . or .. segment
          if (i === segmented.length)
            output.push('');
          continue;
        }

        // it is the start of a new segment
        segmentIndex = i;
      }
      // finish reading out the last segment
      if (segmentIndex !== undefined)
        output.push(segmented.substr(segmentIndex, segmented.length - segmentIndex));
      
      return parentUrl.substr(0, parentUrl.length - pathname.length) + output.join('');
    }
    
    // plain name -> return undefined
  }

  var emptyModule = new ModuleNamespace({});

  /*
   * Register Loader
   *
   * Builds directly on top of loader polyfill to provide:
   * - loader.register support
   * - hookable higher-level normalize with metadata argument
   * - instantiate hook with metadata arugment returning a ModuleNamespace or undefined for es module loading
   * - loader error behaviour as in HTML and loader specs, clearing failed modules from registration cache synchronously
   * - build tracing support by providing a .trace=true and .loads object format
   */
  function RegisterLoader(baseKey) {
    Loader.apply(this, arguments);

    // last anonymous System.register call
    this._registeredLastAnon = undefined;

    // in-flight es module load records
    this._registerRegistry = {};

    // tracing
    this.trace = false;
    // trace load objects when tracing
    this.loads = {};
  }

  RegisterLoader.prototype = Object.create(Loader.prototype);
  RegisterLoader.prototype.constructor = RegisterLoader;

  // these are implementation specific

  // this allows a v2 migration path into symbols so normalize and instantiate
  // aren't exposed to end-users
  RegisterLoader.normalize = 'normalize';
  RegisterLoader.instantiate = 'instantiate';
  RegisterLoader.createMetadata = 'createMetadata';

  // default normalize is the WhatWG style normalizer
  RegisterLoader.prototype.normalize = function(key, parentKey, metadata) {
    return resolveUrlToParentIfNotPlain(key, parentKey);
  };

  RegisterLoader.prototype.instantiate = function(key, metadata) {};

  // this function is an optimization to allow loader extensions to 
  // implement it to set the metadata object shape upfront to ensure
  // it can run as a single hidden class throughout the normalize
  // and instantiate pipeline hooks in the js engine
  RegisterLoader.prototype.createMetadata = function() {
    return {};
  };

  var RESOLVE = Loader.resolve;

  RegisterLoader.prototype[RESOLVE] = function(key, parentKey) {
    var loader = this;
    var registry = loader.registry._registry;

    // normalization shortpath if already in the registry or loading
    if (loader._registerRegistry[key] || registry[key])
      return Promise.resolve(key);

    var metadata = this.createMetadata();
    return Promise.resolve(loader.normalize(key, parentKey, metadata))
    .then(function(resolvedKey) {
      if (resolvedKey === undefined)
        throw new RangeError('No resolution normalizing "' + key + '" to ' + parentKey);
      
      // we create the in-progress load record already here to store the normalization metadata
      if (!registry[resolvedKey])
        (loader._registerRegistry[resolvedKey] || createLoadRecord(loader, resolvedKey)).metadata = metadata;

      return resolvedKey;
    });
  };

  // provides instantiate promise cache
  // we need to first wait on instantiate which will tell us if it is ES or not
  // this record represents that waiting period, and when set, we then populate
  // the esLinkRecord record into this load record.
  // instantiate is a promise for a module namespace or undefined
  function createLoadRecord(loader, key) {
    return loader._registerRegistry[key] = {
      key: key,
      metadata: undefined,

      // define cache
      defined: undefined,
      // in-flight
      instantiatePromise: undefined,
      // loaded
      module: undefined,

      // es-specific
      esLinkRecord: undefined,
      importerSetters: undefined
    };
  }

  RegisterLoader.prototype[Loader.instantiate] = function(key) {
    var loader = this;
    return instantiate(this, key)
    .then(function(instantiated) {
      if (instantiated instanceof ModuleNamespace)
        return Promise.resolve(instantiated);

      return instantiateAllDeps(loader, instantiated, [])
      .then(function() {
        var err = ensureEvaluated(loader, instantiated, []);
        if (err)
          return Promise.reject(err);

        if (loader.trace)
          traceLoadRecord(loader, instantiated, []);
        return instantiated.module || emptyModule;
      })
      .catch(function(err) {
        clearLoadErrors(loader, instantiated);
        throw err;
      });
    })
  };

  // instantiates the given module name
  // returns the load record for es or the namespace object for dynamic
  // setting the dynamic namespace into the registry
  function instantiate(loader, key) {
    var load = loader._registerRegistry[key];

    // this is impossible assuming resolve always runs before instantiate
    if (!load)
      throw new TypeError('Internal error, load record not created');

    return load.instantiatePromise || (load.instantiatePromise = Promise.resolve(loader.instantiate(key, load.metadata))
    .then(function(instantiation) {
      // dynamic module
      if (instantiation !== undefined) {
        loader.registry._registry[key] = instantiation;
        loader._registerRegistry[key] = undefined;
        return instantiation;
      }

      // run the cached loader.register declaration if there is one
      ensureRegisterLinkRecord.call(loader, load);

      // metadata no longer needed
      if (!loader.trace)
        load.metadata = undefined;

      return load;
    })
    .catch(function(err) {
      err = LoaderError__Check_error_message_above_for_loader_stack(err, 'Instantiating ' + load.key);

      // immediately clear the load record for an instantiation error
      if (loader._registerRegistry[load.key] === load)
        loader._registerRegistry[load.key] = undefined;

      throw err;
    }));
  }

  // this only applies to load records with load.esLinkRecord set
  function instantiateAllDeps(loader, load, seen) {
    // skip if already linked
    if (load.module)
      return Promise.resolve();

    var esLinkRecord = load.esLinkRecord;

    // no dependencies shortpath
    if (!esLinkRecord.dependencies.length)
      return Promise.resolve();

    // assumes seen does not contain load already
    seen.push(load);

    var instantiateDepsPromises = Array(esLinkRecord.dependencies.length);
    var registry = loader.registry._registry;

    // normalize dependencies
    for (var i = 0; i < esLinkRecord.dependencies.length; i++) (function(i) {
      // this resolve can potentially be cached on the link record, should be a measured optimization
      instantiateDepsPromises[i] = loader[RESOLVE](esLinkRecord.dependencies[i], load.key)
      .catch(function(err) {
        throw LoaderError__Check_error_message_above_for_loader_stack(err, 'Resolving ' + esLinkRecord.dependencies[i] + ' to ' + load.key);
      })
      .then(function(resolvedDepKey) {
        if (loader.trace) {
          esLinkRecord.depMap = esLinkRecord.depMap || {};
          esLinkRecord.depMap[esLinkRecord.dependencies[i]] = resolvedDepKey;
        }

        var existingNamespace = registry[resolvedDepKey];
        if (existingNamespace) {
          esLinkRecord.dependencyInstantiations[i] = existingNamespace;
          // run setter to reference the module
          if (esLinkRecord.setters[i])
            esLinkRecord.setters[i](existingNamespace);
          return Promise.resolve();
        }

        return instantiate(loader, resolvedDepKey)
        .then(function(instantiation) {
          // instantiation is either a load record or a module namespace
          esLinkRecord.dependencyInstantiations[i] = instantiation;

          // dynamic module
          if (instantiation instanceof ModuleNamespace) {
            if (esLinkRecord.setters[i])
              esLinkRecord.setters[i](instantiation);
            return Promise.resolve();
          }

          // register setter with dependency
          instantiation.importerSetters.push(esLinkRecord.setters[i]);

          // run setter now to pick up the first bindings from the dependency
          if (esLinkRecord.setters[i])
            esLinkRecord.setters[i](instantiation.esLinkRecord.moduleObj);

          // circular
          if (seen.indexOf(instantiation) !== -1)
            return Promise.resolve();

          // es module load

          // if not already linked, instantiate dependencies
          if (instantiation.esLinkRecord)
            return instantiateAllDeps(loader, instantiation, seen);
        });
      })
    })(i);

    return Promise.all(instantiateDepsPromises)
    .catch(function(err) {
      err = LoaderError__Check_error_message_above_for_loader_stack(err, 'Loading ' + load.key);

      // throw up the instantiateAllDeps stack
      // loads are then synchonously cleared at the top-level through the helper below
      // this then ensures avoiding partially unloaded tree states
      esLinkRecord.error = err;

      throw err;
    });
  }

  // clears an errored load and all its errored dependencies from the loads registry
  function clearLoadErrors(loader, load) {
    // clear from loads
    if (loader._registerRegistry[load.key] === load)
      loader._registerRegistry[load.key] = undefined;

    var esLinkRecord = load.esLinkRecord;

    if (!esLinkRecord)
      return;

    esLinkRecord.dependencyInstantiations.forEach(function(depLoad, index) {
      if (!depLoad || depLoad instanceof ModuleNamespace)
        return;

      if (depLoad.esLinkRecord && depLoad.esLinkRecord.error) {
        // unregister setters for es dependency load records
        var setterIndex = depLoad.importerSetters.indexOf(esLinkRecord.setters[index]);
        depLoad.importerSetters.splice(setterIndex, 1);

        // provides a circular reference check
        if (loader._registerRegistry[depLoad.key] === depLoad)
          clearLoadErrors(loader, depLoad);
      }
    });
  }

  function createESLinkRecord(dependencies, setters, module, moduleObj, execute) {
    return {
      dependencies: dependencies,

      error: undefined,

      // will be the dependency ES load record, or a module namespace
      dependencyInstantiations: Array(dependencies.length),

      setters: setters,

      module: module,
      moduleObj: moduleObj,
      execute: execute
    };
  }

  /*
   * System.register
   * Places the status into the registry and a load into the loads list
   */
  RegisterLoader.prototype.register = function(key, deps, declare) {
    // anonymous modules get stored as lastAnon
    if (declare === undefined)
      this._registeredLastAnon = [key, deps];

    // everything else registers into the register cache
    else
      (this._registerRegistry[key] || createLoadRecord(this, key)).defined = [deps, declare];
  };

  RegisterLoader.prototype.processRegisterContext = function(contextKey) {
    if (!this._registeredLastAnon)
      return;

    (this._registerRegistry[contextKey] || createLoadRecord(this, contextKey)).defined = this._registeredLastAnon;
    this._registeredLastAnon = undefined;
  };

  function ensureRegisterLinkRecord(load) {
    // ensure we already have a link record
    if (load.esLinkRecord)
      return;

    var key = load.key;
    var registrationPair = load.defined;

    if (!registrationPair)
      throw new TypeError('Module instantiation did not call an anonymous or correctly named System.register');

    load.defined = undefined;

    var importerSetters = [];

    var moduleObj = {};

    var locked = false;

    var declared = registrationPair[1].call(envGlobal, function(name, value) {
      // export setter propogation with locking to avoid cycles
      if (locked)
        return;

      if (typeof name == 'object') {
        for (var p in name)
          moduleObj[p] = name[p];
      }
      else {
        moduleObj[name] = value;
      }

      if (importerSetters.length) {
        locked = true;
        for (var i = 0; i < importerSetters.length; i++)
          // this object should be a defined module object
          // but in order to do that we need the exports returned by declare
          // for now we assume no exports in the implementation
          importerSetters[i](moduleObj);

        locked = false;
      }
      return value;
    }, new ContextualLoader(this, key));

    var setters, execute;

    if (typeof declared !== 'function') {
      setters = declared.setters;
      execute = declared.execute;
    }
    else {
      setters = [],
      execute = declared;
    }

    // TODO, pass module when we can create it here already via exports
    load.importerSetters = importerSetters;
    load.esLinkRecord = createESLinkRecord(registrationPair[0], setters, undefined, moduleObj, execute);
  }

  // ContextualLoader class
  // backwards-compatible with previous System.register context argument by exposing .id
  function ContextualLoader(loader, key) {
    this.loader = loader;
    this.key = this.id = key;
  }
  ContextualLoader.prototype.constructor = function() {
    throw new TypeError('Cannot subclass the contextual loader only Reflect.Loader.');
  };
  ContextualLoader.prototype.import = function(key) {
    return this.loader.import(key, this.key);
  };
  ContextualLoader.prototype.resolve = function(key) {
    return this.loader[Loader.resolve](key, this.key);
  };
  ContextualLoader.prototype.load = function(key) {
    return this.loader.load(key, this.key);
  };

  // ensures the given es load is evaluated
  // returns the error if any
  function ensureEvaluated(loader, load, seen) {
    var esLinkRecord = load.esLinkRecord;
    
    // no esLinkRecord means evaluated
    if (!esLinkRecord)
      return;

    // assumes seen does not contain load already
    seen.push(load);

    var err, depLoad;

    for (var i = 0; i < esLinkRecord.dependencies.length; i++) {
      depLoad = esLinkRecord.dependencyInstantiations[i];

      // non ES load

      // it is the responsibility of the executor to remove the module from the registry on failure
      if (depLoad instanceof ModuleNamespace)
        err = namespaceEvaluate(depLoad);

      // ES load
      else if (seen.indexOf(depLoad) === -1)
        err = ensureEvaluated(loader, depLoad, seen);

      if (err)
        return LoaderError__Check_error_message_above_for_loader_stack(err, 'Evaluating ' + load.key);
    }

    // es load record evaluation
    err = esEvaluate(esLinkRecord);
    
    if (err)
      return LoaderError__Check_error_message_above_for_loader_stack(err, 'Evaluating ' + load.key);

    load.module = new ModuleNamespace(esLinkRecord.moduleObj);
    loader.registry._registry[load.key] = load.module;
    
    // can clear link record now
    if (!loader.trace)
      load.esLinkRecord = undefined;
  }

  var execContext = {};
  if (Object.freeze)
    Object.freeze(execContext);

  function esEvaluate(esLinkRecord) {
    try {
      // {} is the closest we can get to call(undefined)
      // this should really be blocked earlier though
      esLinkRecord.execute.call(execContext);
    }
    catch(err) {
      return err;
    }
  }
  function namespaceEvaluate(namespace) {
    try {
      Module.evaluate(namespace);
    }
    catch(err) {
      return err;
    }
  }

  function traceLoadRecord(loader, load, seen) {
    // its up to dynamic instantiate layers to ensure their own traces are present
    if (load instanceof ModuleNamespace)
      return;

    seen.push(load);

    if (!load.esLinkRecord || load.esLinkRecord.dependencies.length && !load.esLinkRecord.depMap)
      throw new Error('Tracing error, ensure loader.trace is set before loading begins');

    loader.loads[load.key] = {
      key: load.key,
      dependencies: load.esLinkRecord.dependencies,
      depMap: load.esLinkRecord.depMap || {},
      metadata: load.metadata
    };

    load.esLinkRecord.dependencyInstantiations.forEach(function(dep) {
      if (seen.indexOf(dep) === -1)
        traceLoadRecord(loader, dep, seen);
    });
  }

  if (!window.babel || !window.babelPluginTransformES2015ModulesSystemJS)
    throw new Error('babel-browser-build.js must be loaded first');

  var loader;

  // <script type="module"> support
  var anonSources = {};
  if (typeof document != 'undefined' && document.getElementsByTagName) {
    function ready() {
      document.removeEventListener('DOMContentLoaded', ready, false );

      var anonCnt = 0;

      var scripts = document.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];
        if (script.type == 'module' && !script.loaded) {
          script.loaded = true;
          if (script.src) {
            loader.import(script.src);
          }
          // anonymous modules supported via a custom naming scheme and registry
          else {
            var anonName = resolveUrlToParentIfNotPlain('./<anon' + ++anonCnt + '>', baseURI);
            anonSources[anonName] = script.innerHTML;
            loader.import(anonName);
          }
        }
      }
    }

    // simple DOM ready
    if (document.readyState === 'complete')
      setTimeout(ready);
    else
      document.addEventListener('DOMContentLoaded', ready, false);
  }

  function BrowserESModuleLoader(baseKey) {
    if (baseKey)
      baseKey = resolveUrlToParentIfNotPlain(baseKey, baseURI) || resolveUrlToParentIfNotPlain('./' + baseKey, baseURI);
    
    RegisterLoader.call(this, baseKey);

    var loader = this;

    // ensure System.register is available
    envGlobal.System = envGlobal.System || {};
    if (typeof envGlobal.System.register == 'function')
      var prevRegister = envGlobal.System.register;
    envGlobal.System.register = function() {
      loader.register.apply(loader, arguments);
      if (prevRegister)
        prevRegister.apply(this, arguments);
    };
  }
  BrowserESModuleLoader.prototype = Object.create(RegisterLoader.prototype);

  // normalize is never given a relative name like "./x", that part is already handled
  BrowserESModuleLoader.prototype[RegisterLoader.normalize] = function(key, parent, metadata) {
    var resolved = RegisterLoader.prototype.normalize.call(this, key, parent, metadata) || key;
    if (!resolved)
      throw new RangeError('ES module loader does not resolve plain module names, resolving "' + key + '" to ' + parent);

    return resolved;
  };

  function xhrFetch(url, resolve, reject) {
    var xhr = new XMLHttpRequest();
    function load(source) {
      resolve(xhr.responseText);
    }
    function error() {
      reject(new Error('XHR error' + (xhr.status ? ' (' + xhr.status + (xhr.statusText ? ' ' + xhr.statusText  : '') + ')' : '') + ' loading ' + url));
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        // in Chrome on file:/// URLs, status is 0
        if (xhr.status == 0) {
          if (xhr.responseText) {
            load();
          }
          else {
            // when responseText is empty, wait for load or error event
            // to inform if it is a 404 or empty file
            xhr.addEventListener('error', error);
            xhr.addEventListener('load', load);
          }
        }
        else if (xhr.status === 200) {
          load();
        }
        else {
          error();
        }
      }
    };
    xhr.open("GET", url, true);
    xhr.send(null);
  }

  // instantiate just needs to run System.register
  // so we fetch the source, convert into the Babel System module format, then evaluate it
  BrowserESModuleLoader.prototype[RegisterLoader.instantiate] = function(key, metadata) {
    var loader = this;

    // load as ES with Babel converting into System.register
    return new Promise(function(resolve, reject) {
      // anonymous module
      if (anonSources[key]) {
        resolve(anonSources[key])
        anonSources[key] = undefined;
      }
      // otherwise we fetch
      else {
        xhrFetch(key, resolve, reject);
      }
    })
    .then(function(source) {
      // transform source with Babel
      var output = babel.transform(source, {
        compact: false,
        filename: key + '!transpiled',
        sourceFileName: key,
        moduleIds: false,
        sourceMaps: 'inline',
        plugins: [babelPluginTransformES2015ModulesSystemJS]
      });

      // evaluate without require, exports and module variables
      // we leave module in for now to allow module.require access
      (0, eval)(output.code + '\n//# sourceURL=' + key + '!transpiled');
      loader.processRegisterContext(key);
    });
  };

  // create a default loader instance in the browser
  if (isBrowser)
    loader = new BrowserESModuleLoader();

  return BrowserESModuleLoader;

}));