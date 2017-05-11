/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setDeleteTarget = setDeleteTarget;
exports.setSelectedImage = setSelectedImage;
function setDeleteTarget(deleteTarget) {

  return {
    type: 'SET_DELETE_TARGET',
    payload: deleteTarget
  };
}

function setSelectedImage(id) {
  console.log('fired');
  console.log(id);

  return {
    type: "SET_SELECTED_IMAGE",
    payload: id
  };
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  hideDraggers: function hideDraggers() {
    Array.from(document.getElementsByClassName('dragger')).forEach(function (dragger) {
      this.hideElement(dragger);
    }.bind(this));
  },
  hideOtherDraggers: function hideOtherDraggers(id) {
    Array.from(document.getElementsByClassName('dragger')).forEach(function (dragger) {
      if (dragger.id !== id) {
        this.hideElement(dragger);
      };
    }.bind(this));
  },
  hideID: function hideID(id) {
    document.getElementById(id).style.display = 'none';
  },
  hideElement: function hideElement(element) {
    element.style.display = 'none';
  },
  showID: function showID(id) {
    document.getElementById(id).style.display = 'block';
  },
  deletePreview: function deletePreview() {
    var deleteTarget = window.store.getState().deleteTarget;

    // show
    document.getElementById('delete_preview_container').classList.add('delete_preview_container_is_open');
    document.getElementById('delete_preview').src = deleteTarget.element.src;

    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  },
  openTools: function openTools() {
    // show
    document.getElementById('tools_container').classList.add('tools_container_is_open');
    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
    document.getElementById('dragger_switches_container').classList.remove('dragger_switches_container_is_open');
  },
  openAccount: function openAccount() {
    // show
    document.getElementById('login_container').classList.add('login_container_is_open');
    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  },
  openUpload: function openUpload() {
    // show
    document.getElementById('upload_container').classList.add('upload_container_is_open');
    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  },
  uploadPreview: function uploadPreview() {
    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  },
  afterUpload: function afterUpload() {
    // show element
    document.getElementById('navigation_container').classList.add('navigation_container_is_open');
    // hide elements
    document.getElementById('upload_container').classList.remove('upload_container_is_open');
    this.hideID('upload_preview_container');
    document.getElementById('upload_preview_container').classList.remove('upload_preview_container_is_open');
    document.getElementById('confirm_or_reject_container_info').textContent = '';
    // This setTimeout is so that the upload_preview_container disappears immediately, and then resets
    // to visible after the transition effect takes place
    setTimeout(function () {
      this.showID('upload_preview_container');
      document.getElementById('confirm_or_reject_container').style.display = 'flex';
    }, 500);
    // replace image_upload_preview image
    document.getElementById('image_upload_preview').src = '/icons/1x1.png';
  },
  afterDelete: function afterDelete() {
    // show element
    document.getElementById('navigation_container').classList.add('navigation_container_is_open');
    // hide elements
    document.getElementById('delete_preview_container').style.display = 'none';
    document.getElementById('delete_preview_container').classList.remove('delete_preview_container_is_open');
    this.hideDraggers();
    // This setTimeout is so that the delete_preview_container disappears immediately, and then resets
    // to visible after the transition effect takes place
    setTimeout(function () {
      document.getElementById('delete_preview_container').style.display = 'block';
    }, 500);
    // replace delete_preview
    document.getElementById('delete_preview').src = '/icons/1x1.png';
  },
  rejectDelete: function rejectDelete() {
    var deleteTarget = window.store.getState().deleteTarget;

    // show element
    document.getElementById('navigation_container').classList.add('navigation_container_is_open');
    // hide elements
    document.getElementById('delete_preview_container').style.display = 'none';
    document.getElementById('delete_preview_container').classList.remove('delete_preview_container_is_open');
    setTimeout(function () {
      document.getElementById('delete_preview_container').style.display = 'block';
    }, 500);
    // reshow hidden image that wasn't deleted
    deleteTarget.element.style.display = 'initial';

    // show image on other clients
    window.socket.emit('c-e:  show_image', deleteTarget.id);
  },
  closeAll: function closeAll() {
    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
    document.getElementById('upload_preview_container').classList.remove('upload_preview_container_is_open');
    document.getElementById('delete_preview_container').classList.remove('delete_preview_container_is_open');
    document.getElementById('dragger_switches_container').classList.remove('dragger_switches_container_is_open');
    document.getElementById('tools_container').classList.remove('tools_container_is_open');
    document.getElementById('login_container').classList.remove('login_container_is_open');
    document.getElementById('upload_container').classList.remove('upload_container_is_open');
    document.getElementById('connect_info').classList.remove('connect_info_is_open');
    document.getElementById('explore_container').style.display = 'none';
    document.getElementById('insta_header').style.display = 'none';
    document.getElementById('insta_div').style.display = 'none';

    // replace image_upload_preview image and delete_preview image
    document.getElementById('image_upload_preview').src = '/icons/1x1.png';
    document.getElementById('delete_preview').src = '/icons/1x1.png';
    // close navigation button
    document.body.classList.remove('button_container_is_open');
    // animate close hamburgers
    document.getElementById('line_one').style.top = '40%';
    document.getElementById('line_three').style.top = '60%';
  }
};

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__root_js__ = __webpack_require__(26);


/** Built-in value references. */
var Symbol = __WEBPACK_IMPORTED_MODULE_0__root_js__["a" /* default */].Symbol;

/* harmony default export */ __webpack_exports__["a"] = (Symbol);


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__getPrototype_js__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isObjectLike_js__ = __webpack_require__(27);




/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__isObjectLike_js__["a" /* default */])(value) || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__["a" /* default */])(value) != objectTag) {
    return false;
  }
  var proto = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__getPrototype_js__["a" /* default */])(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

/* harmony default export */ __webpack_exports__["a"] = (isPlainObject);


/***/ }),
/* 4 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = compose;
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  var last = funcs[funcs.length - 1];
  var rest = funcs.slice(0, -1);
  return function () {
    return rest.reduceRight(function (composed, f) {
      return f(composed);
    }, last.apply(undefined, arguments));
  };
}

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_es_isPlainObject__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_symbol_observable__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_symbol_observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_symbol_observable__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return ActionTypes; });
/* harmony export (immutable) */ __webpack_exports__["a"] = createStore;



/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_lodash_es_isPlainObject__["a" /* default */])(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return { unsubscribe: unsubscribe };
      }
    }, _ref[__WEBPACK_IMPORTED_MODULE_1_symbol_observable___default.a] = function () {
      return this;
    }, _ref;
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[__WEBPACK_IMPORTED_MODULE_1_symbol_observable___default.a] = observable, _ref2;
}

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__createStore__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__combineReducers__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__bindActionCreators__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__applyMiddleware__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__compose__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils_warning__ = __webpack_require__(8);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "createStore", function() { return __WEBPACK_IMPORTED_MODULE_0__createStore__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "combineReducers", function() { return __WEBPACK_IMPORTED_MODULE_1__combineReducers__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "bindActionCreators", function() { return __WEBPACK_IMPORTED_MODULE_2__bindActionCreators__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "applyMiddleware", function() { return __WEBPACK_IMPORTED_MODULE_3__applyMiddleware__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "compose", function() { return __WEBPACK_IMPORTED_MODULE_4__compose__["a"]; });







/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__utils_warning__["a" /* default */])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}


/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(4)))

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _stateChange = __webpack_require__(1);

var _stateChange2 = _interopRequireDefault(_stateChange);

var _actions = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  init: function init() {
    this.buttons = [];
    this.createButton('n1', 'open-account', 'account', '/icons/person_circle_icon.png');
    this.createButton('n2', 'open-tools', 'tools', '/icons/tools_icon.png');
    this.createButton('n3', 'open-upload', 'upload', '/icons/upload_icon.png');
    this.createButton('n4', 'exit-door', 'remove', '/icons/door_icon.png');

    this.addEvents();
  },
  createButton: function createButton(domLocation, action, text, iconPath) {
    var targetDiv = document.getElementById(domLocation),
        iconDiv = document.createElement('img');

    targetDiv.classList.remove('button_no_show');
    targetDiv.classList.add('button', 'navigation_button');
    targetDiv.setAttribute('data-action', action);
    targetDiv.innerText = text;
    iconDiv.classList.add('icon_image');
    iconDiv.src = iconPath;
    targetDiv.appendChild(iconDiv);

    this.buttons.push(targetDiv);
  },
  onClick: function onClick(e) {
    console.log(e.currentTarget);
    switch (e.currentTarget.getAttribute('data-action')) {
      case 'open-tools':
        _stateChange2.default.openTools();
        // NOTES: this.store.dispatch(open-tools())
        break;

      case 'open-account':
        _stateChange2.default.openAccount();
        break;

      case 'open-upload':
        _stateChange2.default.openUpload();
        break;
      case 'exit-door':
        // hide original image
        _stateChange2.default.hideElement(selectedImage);
        // hide draggers
        _stateChange2.default.hideDraggers();
        // show delete_preview_container
        _stateChange2.default.deletePreview();
        this.handleDelete();
        break;
      default:
        break;
    }
  },
  handleDelete: function handleDelete() {
    var selectedImageID = window.store.getState().selectedImage.id,
        selectedImage = document.getElementById(selectedImageID);

    if (selectedImageID !== '') {
      window.store.dispatch((0, _actions.setDeleteTarget)(selectedImage));

      // send socket to hide on other clients
      window.socket.emit('c-e:  hide_image', selectedImageID);
    };
  },
  addEvents: function addEvents() {
    var _this = this;

    this.buttons.forEach(function (button) {
      button.addEventListener('click', _this.onClick.bind(_this));
    });
  }
};
// import socketFile from '../socket-file';

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  debugOn: true, // set debug div

  // set upload placement
  uploadTop: '0px',
  uploadLeft: '0px',
  uploadWidth: '75px',
  uploadheight: '100px',

  // set maximum limit for draggers
  blurLevel: 7,
  brightnessLevel: 8,
  contrastLevel: 10,
  saturateLevel: 10

};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _helpers = __webpack_require__(15);

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {

  init: function init(store) {
    _helpers2.default.clickme('navigation_toggle_button', 50);
    // helpers.clickme('debug-button', 0);
    // helpers.clickme('dragger_switches_button', 1000);
    // helpers.clickme('explore_button', 0);
    // helpers.clickme('upload_container_button', 1000);

    this.createDebugButton();
    this.createDebugDiv();
    this.setListeners();

    // console log store
    document.addEventListener('click touchstart', function () {
      console.log(store.getState());

      // uncomment to log whichever element is clicked on
      // console.log(event.target.getAttribute('id'));

      // uncomment to log all the elements below the click
      // console.log(document.querySelectorAll( ":hover" ));

      // uncomment to log whichever elements are clicked on. ONLY WORKS WITH CHROME
      // console.log(document.elementsFromPoint(event.pageX, event.pageY));
    });
  },

  createDebugButton: function createDebugButton() {
    var debugButton = document.getElementById('debug-holder'),
        debugIcon = document.createElement('img'),
        debugText = document.createElement('span');

    // create debug button
    debugButton.setAttribute('id', 'debug-button');
    debugButton.classList.add('button', 'tools_button');
    debugButton.classList.remove('button_no_show');

    debugText.textContent = 'report is off';
    debugText.setAttribute('id', 'debug-text');

    debugIcon.classList.add('icon_image');
    debugIcon.src = '/icons/debug_icon.png';
    debugButton.appendChild(debugText);
    debugButton.appendChild(debugIcon);

    // add button functionality
    debugButton.addEventListener('click', function () {

      if (this.classList.contains('debug-on')) {
        this.classList.remove('debug-on');
        document.getElementById('debug-container').style.display = 'none';
        document.getElementById('debug-text').innerText = 'report is off';
      } else {
        this.classList.add('debug-on');
        document.getElementById('debug-container').style.display = 'block';
        document.getElementById('debug-text').innerText = 'report is on';
      };
    });
  },

  createDebugDiv: function createDebugDiv() {
    var wrapperEl = document.getElementById('wrapper'),
        debugEl = document.createElement('div'),
        infoLineEl,
        i,
        that = this;

    // create debug div
    debugEl.setAttribute('id', 'debug-container');
    debugEl.style.display = 'none';
    for (i = 1; i <= 10; i++) {
      infoLineEl = document.createElement('div');
      infoLineEl.setAttribute('id', 'info' + i);
      infoLineEl.classList.add('info');
      debugEl.appendChild(infoLineEl);
    };

    wrapperEl.appendChild(debugEl);

    // make debug-container draggable
    $('#debug-container').draggable({
      containment: 'parent',
      start: function start() {
        that.clearDebugInfo();
        that.addDebugInfo([[1, 'this div width    : ' + $(this).css('width')], [2, 'wrapper width     : ' + document.getElementById('wrapper').style.width], [3, 'screen.width      : ' + screen.width.toString()], [4, 'window.innerWidth : ' + window.innerWidth.toString()], [5, 'screen.availWidth : ' + screen.availWidth.toString()]]);
      },
      drag: function drag() {
        var debugEl = document.getElementById('debug-container'),
            debugDivInfo = debugEl.getBoundingClientRect();

        that.addDebugInfo([[6, ''], [7, this.style.left + ' <css> ' + $(this).css('right')], [8, debugDivInfo.left.toString() + ' <dom> ' + debugDivInfo.right.toString()]]);
      }
    });
  },

  setListeners: function setListeners() {
    var that = this;

    // resize window
    window.addEventListener('resize', function () {
      that.clearDebugInfo();
      that.addDebugInfo([[1, 'resize: new width  : ' + window.innerWidth + 'px'], [2, 'resize: new height : ' + window.innerHeight + 'px']]);
    });

    // click on image
    document.getElementById('images').addEventListener('click', function (e) {
      var clickedEl = e.target;

      that.clearDebugInfo();
      that.addDebugInfo([[1, 'Filename: ' + clickedEl.getAttribute('title')], [2, 'Z-index: ' + clickedEl.style.zIndex], [3, 'Start: Left: ' + clickedEl.style.left + ' Top: ' + clickedEl.style.top], [4, 'Current: '], [5, 'Stop: ']]);
    });

    // dragged images
    $(document).on('dragstart', '.wallPic', function (e) {
      var draggedEl = e.target;

      that.clearDebugInfo();
      that.addDebugInfo([[1, 'Filename: ' + draggedEl.getAttribute('title')], [2, 'Z-index: ' + draggedEl.style.zIndex], [3, 'Start: Left: ' + draggedEl.style.left + ' Top: ' + draggedEl.style.top], [4, 'Current: '], [5, 'Stop: ']]);
    });

    $(document).on('drag', '.wallPic', function (e) {
      var draggedEl = e.target;

      that.addDebugInfo([[4, 'Current: Left: ' + draggedEl.style.left + ' Top: ' + draggedEl.style.top]]);
    });

    $(document).on('dragstop', '.wallPic', function (e) {
      var draggedEl = e.target;

      that.addDebugInfo([[5, 'Stop: Left: ' + draggedEl.style.left + ' Top: ' + draggedEl.style.top]]);
    });
  },

  // debugInfoText: a multidimensional array: [[1, string], [2, string]]
  addDebugInfo: function addDebugInfo(debugInfoText) {
    debugInfoText.forEach(function (item) {
      document.getElementById('info' + item[0]).textContent = item[1];
    });
  },

  clearDebugInfo: function clearDebugInfo() {
    Array.from(document.getElementsByClassName('info')).forEach(function (element) {
      element.textContent = '';
    });
  }
};

/***/ }),
/* 13 */,
/* 14 */,
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {

  clickme: function clickme(id, time) {
    setTimeout(function () {
      document.getElementById(id).dispatchEvent(new Event('click'));
    }, time);
  }

};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _config = __webpack_require__(11);

var _config2 = _interopRequireDefault(_config);

var _configureStore = __webpack_require__(35);

var _configureStore2 = _interopRequireDefault(_configureStore);

var _pageSettings = __webpack_require__(36);

var _pageSettings2 = _interopRequireDefault(_pageSettings);

var _stateChange = __webpack_require__(1);

var _stateChange2 = _interopRequireDefault(_stateChange);

var _buttons = __webpack_require__(10);

var _buttons2 = _interopRequireDefault(_buttons);

var _actions = __webpack_require__(0);

var _debug = __webpack_require__(12);

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// keep modularizing
// state changes
// buttons
// fix selected-image id


// wall-collective
//
// Version: 0.7.0
// Requires: jQuery v1.7+
//           jquery-ui
//           jquery.form
//           jquery.mobile-events
//           jquery.ui.touch-punch
//           socket.io v1.3.7+
//           interact.js
//
// Copyright (c) 2018 Andrew Nease (andrew.nease.code@gmail.com)

var store = (0, _configureStore2.default)();

// dispatched when an image is dragged onto the exit_door icon or exit_door is clicked

// dispatched when an image is clicked or dragged; used by draggers


// DEBUG
// DEBUG
if (_config2.default.debugOn) _debug2.default.init(store);

_buttons2.default.init();
_pageSettings2.default.init();

// set socket location : io.connect('http://localhost:8000'); || io.connect('http://www.domain_name.com');
var socket = io.connect([location.protocol, '//', location.host, location.pathname].join('')),


// assigned by initial socket; used by upload counter
sessionID = String,


// assigned by initial socket; used by instagram link
instaAppID = String,


// used with a cookie to store which draggers are active for individual persistence
switches_status = String,


// used by the upload counter
uploadtotal = 0,


// used when an image is clicked more than once
click_count = 0,
    previous_clicked_ids = '',


// used when an image is dragged from the instagram div; assigned by socket when download is complete
insta_download_ready_filename = {},


// used when an access token is available for the client after a user authenticates with Instagram
instaAccessReady = false;

window.store = store;
window.socket = socket;

var insta = {
  init: function init() {
    // set insta_divs height
    document.getElementById('insta_div').style.height = window.innerHeight + 'px';
    document.getElementById('insta_image_container').style.height = window.innerHeight * 0.8 + 'px';
    document.getElementById('insta_image_container').style.top = window.innerHeight * 0.1 + 'px';
    document.getElementById('insta_header').style.height = window.innerHeight * 0.07 + 'px';
    document.getElementById('background_opacity_trick').style.height = window.innerHeight * 0.8 + 'px';
    document.getElementById('background_opacity_trick').style.top = window.innerHeight * 0.1 + 'px';
  }

};

insta.init();

// assign draggable to all .wallPic elements
assigndrag();

// insta_step 6: Open the instagram_div and fetch instagram data
if (openInstagramDiv === true) {
  socket.emit('ce: get_instagram_data');

  document.getElementById('insta_header').style.display = 'flex';
  document.getElementById('insta_div').style.display = 'block';
  document.body.classList.add('button_container_is_open');

  // animate open hamburgers
  document.getElementById('line_one').style.top = '35%';
  document.getElementById('line_three').style.top = '65%';
};

// --Page helpers

// prevent default behavior to prevent iphone dragging and bouncing
// http://www.quirksmode.org/mobile/default.html
//  document.ontouchmove = function (event) {
//    event.preventDefault();
//  };

// process any click on the wrapper
$('#wrapper').on('click touchstart', function (event) {
  var dragger_elements = {};

  // if the images div alone is clicked...
  if (event.target.getAttribute('id') === 'images') {
    dragger_elements = document.getElementsByClassName('dragger');
    // remove all draggers
    _stateChange2.default.hideDraggers();
    // close button containers and remove dragger_transitions
    document.body.classList.remove('dragger_transitions');
  }; // end of if
}); // end of document.on.click


// used by delete image button
function clear_selected_file() {
  store.getState().selectedImage.id = '';
  // selected_file.imageFilename  = '';
  // selected_file.src             = '';
  // selected_file.width           = '';
  // selected_file.height          = '';
  // selected_file.transform       = '';
  // selected_file.zindex          = '';
  store.dispatch((0, _actions.setSelectedImage)(''));
};

// cookie setter
function setCookie(cookie_name, cookie_value, days_til_expire) {
  var expires_string = '',
      d = new Date();

  d.setTime(d.getTime() + days_til_expire * 24 * 60 * 60 * 1000);
  expires_string = 'expires=' + d.toUTCString();
  document.cookie = cookie_name + '=' + cookie_value + '; ' + expires_string;
}

// cookie value getter
function getCookie(cookie_name) {
  var i = 0,
      cookie_element = '',

  // create an array of key=value pairs e.g. ['name=Shannon', 'sessionID=Vy94J6V1W']
  cookie_array = document.cookie.split(';');

  for (i = 0; i < cookie_array.length; i++) {
    cookie_element = cookie_array[i];

    // remove leading empty characters from cookie element
    while (cookie_element.charAt(0) === ' ') {
      cookie_element = cookie_element.substring(1);
    } // if the cookie_name can be found in the element, return the key portion of the element
    if (cookie_element.indexOf(cookie_name) === 0) return cookie_element.substring(cookie_name.length + 1, cookie_element.length);
  };
  // else return empty string
  return '';
}

// remove
// if (document.getElementById('insta_div').style.display === 'block') {
//   history.replaceState({}, 'wall-collective', '/');
//   document.getElementById('insta_header').style.display = 'none';
//   document.getElementById('insta_div').style.display = 'none';
// };


// --Create grid line divs
//    use left/top parameter with unit
//    id is optional

function vline(left, color, id) {
  var wrapper_element = document.getElementById('wrapper'),
      line_element = document.createElement('div');

  if (id) line_element.setAttribute('id', id);
  line_element.classList.add('vline');
  line_element.style.backgroundColor = color;
  line_element.style.left = left;
  // add 'line_element' to 'wrapper'
  wrapper_element.appendChild(line_element);
} // end of vline

function hline(top, color, id) {
  var wrapper_element = document.getElementById('wrapper'),
      line_element = document.createElement('div');

  if (id) line_element.setAttribute('id', id);
  line_element.classList.add('hline');
  line_element.style.backgroundColor = color;
  line_element.style.top = top;
  // add 'line_element' to 'wrapper'
  wrapper_element.appendChild(line_element);
} // end of hline

// create a grid and dragger_info box.  used when draggers are dragging.
function make_grid() {
  var wrapper_element = document.getElementById('wrapper'),
      info_element = document.createElement('div');

  info_element.setAttribute('id', 'dragger_info');
  info_element.style.left = _pageSettings2.default.draggerWidth / 2 + 1 + 'px';
  info_element.style.height = _pageSettings2.default.draggerHeight / 2 + 'px';
  info_element.style.width = _pageSettings2.default.mainWide - _pageSettings2.default.draggerWidth - 2 + 'px';
  // add 'info_element' to 'wrapper'
  wrapper_element.appendChild(info_element);
  // show grid lines
  vline(_pageSettings2.default.mainWide - _pageSettings2.default.draggerWidth / 2 + 'px', 'red', 'inner_right');
  vline(_pageSettings2.default.draggerWidth / 2 + 'px', 'blue', 'inner_left');
  hline(_pageSettings2.default.mainHigh - _pageSettings2.default.draggerHeight / 2 + 'px', 'purple', 'inner_bottom');
  hline(_pageSettings2.default.draggerHeight / 2 + 'px', 'yellow', 'inner_top');
}; // end of make_grid

function remove_grid() {
  // remove the elements created by make_grid
  document.getElementById('inner_top').remove();
  document.getElementById('inner_bottom').remove();
  document.getElementById('inner_left').remove();
  document.getElementById('inner_right').remove();
  document.getElementById('dragger_info').remove();
}; // end of remove_grid

// --Socket.io
//     These functions receive an emit from the server,
//     recognize its name, receive its data, and do something with the data.
//
//     socket.on('bc: name', function(data) {
//       use data
//     });


// on initial connect, retrieve sessionID cookie and send results to server
socket.on('connect', function () {
  var clientVars = {};

  clientVars.sessionID = getCookie('sessionID');
  socket.emit('c-e:  sessionID_check', clientVars);
});

// used to see instagram results
socket.on('check_out', function (data) {
  console.log(data);
});

socket.on('ce: insta_access_ready', function () {
  instaAccessReady = true;
});

// initial set up for all visits.
socket.on('connect_set_clientVars', function (clientVars) {
  var i = 0,
      switches = ['stretch', 'rotation', 'opacity', 'blur_brightness', 'contrast_saturate', 'grayscale_invert', 'threeD', 'party'];

  // assign sessionID.  used by upload_counter and user_count
  // the server sends a unique id or the previous id from the cookie
  sessionID = clientVars.sessionID;

  instaAppID = clientVars.instaAppID;

  //    instaAccessReady = clientVars.clients_instaAccessReady;

  // set or reset sessionID cookie
  setCookie('sessionID', sessionID, 7);

  // hack: Problem:  busboy stream received the file stream before the sessionID, which was passed as a data value in the ajax submit
  //       Solution: change the HTML 'name' attribute of the form's input to the sessionID, which always arrives concurrently
  document.getElementById('fileselect').setAttribute('name', sessionID);

  // switches_status cookie stores which draggers are activated when the page loads; capital letters denote an activated dragger
  if (getCookie('switches_status') === '') setCookie('switches_status', 'SRObcgtp', 7);

  switches_status = getCookie('switches_status');

  // if the switches_status character is uppercase, switch on the corresponding dragger_switch
  for (i = 0; i < switches.length; i++) {
    if (switches_status[i] === switches_status[i].toUpperCase()) document.getElementById(switches[i] + '_dragger_switch').classList.add('switchon');
  };
});

// display the number of connected clients
socket.on('bc: change_user_count', function (data) {
  var i = 0,
      content = '',
      connect_info_element = document.getElementById('connect_info');

  // for each connected_client, add an icon to connect_info element
  for (i = 0; i < data.length; i++) {
    content = content + "<img src='icons/person_icon.png' class='person_icon' />";
    // debug: report sessionID rather than image. underline connected sessionID
    // if (data[i] === sessionID) content = content + '<u>'; content = content + '  ' + data[i]; if (data[i] === sessionID) content = content + '</u>';
  };
  connect_info_element.innerHTML = content;
});

// on another client moving an image, move target
socket.on('bc: moving', function (data) {
  document.getElementById(data.image_id).style.top = data.imageTop;
  document.getElementById(data.image_id).style.left = data.imageLeft;
});

// on another client resizing an image, resize target
socket.on('bc: resizing', function (data) {
  document.getElementById(data.image_id).style.transform = data.imageTransform;
  document.getElementById(data.image_id).style.top = data.imageTop;
  document.getElementById(data.image_id).style.left = data.imageLeft;
  document.getElementById(data.image_id).style.width = data.imageWidth;
  document.getElementById(data.image_id).style.height = data.imageHeight;
});

// on resize stop, resize target with new parameters
socket.on('bc: resized', function (data) {
  document.getElementById(data.image_id).style.transform = data.imageTransform;
  document.getElementById(data.image_id).style.top = data.imageTop;
  document.getElementById(data.image_id).style.left = data.imageLeft;
  document.getElementById(data.image_id).style.width = data.imageWidth;
  document.getElementById(data.image_id).style.height = data.imageHeight;
});

// on transforming, transform target
socket.on('bc: transforming', function (data) {
  document.getElementById(data.image_id).style.transform = data.imageTransform;
});

// on transform changes, modify data attributes used by set_dragger_locations
socket.on('bc: change_data_attributes', function (data) {
  document.getElementById(data.image_id).setAttribute('data-scale', data.scale);
  document.getElementById(data.image_id).setAttribute('data-angle', data.angle);
  document.getElementById(data.image_id).setAttribute('data-rotateX', data.rotateX);
  document.getElementById(data.image_id).setAttribute('data-rotateY', data.rotateY);
  document.getElementById(data.image_id).setAttribute('data-rotateZ', data.rotateZ);
});

// on opacity changing, adjust target
socket.on('bc: opacity_changing', function (data) {
  document.getElementById(data.image_id).style.opacity = data.imageOpacity;
});

// on filter changing, adjust target
socket.on('bc: filter_changing', function (data) {
  document.getElementById(data.image_id).style.WebkitFilter = data.imageFilter;
});

// reset page across all clients
socket.on('bc: resetpage', function () {
  window.location.reload(true);
});

// add uploaded image
socket.on('bc: add_upload', function (data) {
  var images_element = document.getElementById('images'),
      image_element = document.createElement('img');

  image_element.setAttribute('id', data.dom_id);
  image_element.src = data.location + data.imageFilename;
  image_element.classList.add('wallPic');
  image_element.setAttribute('title', data.imageFilename);
  image_element.setAttribute('data-scale', '1');
  image_element.setAttribute('data-angle', '0');
  image_element.setAttribute('data-rotateX', '0');
  image_element.setAttribute('data-rotateY', '0');
  image_element.setAttribute('data-rotateZ', '0');
  image_element.style.width = _config2.default.uploadWidth;
  image_element.style.zIndex = data.z_index;
  image_element.style.top = _config2.default.uploadTop;
  image_element.style.left = _config2.default.uploadLeft;
  image_element.style.opacity = 1;
  image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
  image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

  // Add <img id='dom_id'> to <div id='images'>
  images_element.appendChild(image_element);
  // assign drag to added element
  assigndrag(data.dom_id);
});

// remove deleted image
socket.on('bc: delete_image', function (data) {
  document.getElementById(data.id_to_delete).remove();
  if (data.id_to_delete === store.getState().selectedImage.id) {
    clear_selected_file();
    _stateChange2.default.hideDraggers();
  };
});

// remove filter
socket.on('bc: remove_filter', function (data) {
  document.getElementById(data).setAttribute('data-filter', document.getElementById(data).style.WebkitFilter);
  document.getElementById(data).style.WebkitFilter = '';
});
// replace filter
socket.on('bc: restore_filter', function (data) {
  document.getElementById(data).style.WebkitFilter = document.getElementById(data).getAttribute('data-filter');
  document.getElementById(data).removeAttribute('data-filter');
});

// disable dragging; other client is moving image
socket.on('bc: freeze', function (data) {
  $('#' + data).draggable('disable');
});
// enable dragging; other client has stopped moving image
socket.on('bc: unfreeze', function (data) {
  $('#' + data).draggable('enable');
});

// hide element; other client has primed image for deletion
socket.on('bc: hide_image', function (data) {
  document.getElementById(data).style.display = 'none';
});
// show element; other client has cancelled deletion
socket.on('bc: show_image', function (data) {
  console.log(data);
  document.getElementById(data).style.display = 'initial';
});

// if this client is the uploader, show upload statistics from busboy
socket.on('bc: chunk_sent', function (uploaddata) {
  if (uploaddata.sessionID === sessionID) {
    uploadtotal += uploaddata.chunkSize;
    document.getElementById('confirm_or_reject_container_info').textContent = 'Uploaded ' + uploadtotal + ' bytes of ' + document.getElementById('fileselect').files[0].size + ' bytes.';
  };
});

// insta_step 10: Add content to insta_div
socket.on('se: add_content_to_insta_div', function (insta_fetch_data) {
  var i = 0,
      insta_image_container = document.getElementById('insta_image_container');

  // set content in insta_header
  document.getElementById('insta_username').textContent = insta_fetch_data.username;
  document.getElementById('insta_profile_pic').src = insta_fetch_data.profile_picture;
  document.getElementById('insta_profile_link').setAttribute('href', 'https://www.instagram.com/' + insta_fetch_data.username + '/?hl=en');

  // destroy current images in insta_image_container
  insta_image_container.innerHTML = '';

  // use insta_images_src to display fetched Instagram images
  for (i = 0; i < insta_fetch_data.insta_images_src.length; i++) {

    var temp_img = document.createElement('img'),
        temp_div = document.createElement('div'),
        spacer_top = document.createElement('div'),
        spacer_middle = document.createElement('div'),
        spacer_bottom = document.createElement('div');

    temp_div.classList.add('insta_image_div');

    temp_img.setAttribute('id', 'insta' + i);
    temp_img.classList.add('insta_image');
    temp_img.src = insta_fetch_data.insta_images_src[i];
    temp_img.setAttribute('data-link', insta_fetch_data.insta_images_link[i]);

    spacer_top.classList.add('spacer_top_bottom');
    spacer_middle.classList.add('spacer_middle');
    spacer_bottom.classList.add('spacer_top_bottom');

    temp_div.appendChild(temp_img);
    insta_image_container.appendChild(temp_div);

    // add spacers for scrolling
    if (i < insta_fetch_data.insta_images_src.length - 1) {
      insta_image_container.appendChild(spacer_top);
      insta_image_container.appendChild(spacer_middle);
      insta_image_container.appendChild(spacer_bottom);
    };

    // insta_step 11: Make the imported Instagram images draggable

    // use a clone so that the images can escape the scrollable div
    $('#insta' + i).draggable({
      helper: 'clone',
      appendTo: 'body',
      scroll: true,
      start: function start() {

        // insta_step 12: When dragging starts, save dragged image to server storage, using id as an index
        console.log(this);

        socket.emit('ce: save_insta_image', { src: this.getAttribute('src'), id: parseInt(this.getAttribute('id').replace('insta', '')) });

        // assign temporary z-index
        this.style.zIndex = 60000;

        _stateChange2.default.hideDraggers();
      }
    });
  };
}); // end of socket se: add_content_to_insta_div


// insta_step 15: Receive new filename from server
socket.on('ce: insta_download_ready', function (newFileData) {

  //  store new filename in an object with the id as the key
  insta_download_ready_filename['insta' + newFileData.iIndex] = newFileData.newFilename;

  console.log(newFileData.newFilename + ' downloaded.');
});

// insta_step 16: Make dragged insta_image droppable in images_div

// http://stackoverflow.com/questions/36181050/jquery-ui-draggable-and-droppable-duplicate-issue
// This allows the image to be draggable outside of the scrollable div
$('#images').droppable({
  accept: '.insta_image',
  drop: function drop(event, ui) {
    var clone = {},
        instaDropData = {},
        timeout_counter = 0;

    // clone is a jQuery method.  false specifies that event handlers should not be copied.
    // create a clone of the ui.draggable within the images div
    clone = ui.draggable.clone(false);
    clone.css('left', ui.offset.left).css('top', ui.offset.top).css('position', 'absolute')
    // consider changing id so that id is not duplicated in dom
    // .attr('id', 'i' + clone.attr('id')),
    .removeClass('ui-draggable ui-draggable-dragging resize-drag');
    $('#images').append(clone);

    // wait for the filename to be received from the server
    function wait_for_download() {

      if (insta_download_ready_filename[ui.draggable[0].getAttribute('id')] === undefined) {

        // if timeout_counter has lasted too long, cancel operation
        timeout_counter = timeout_counter + 50;
        console.log('Waiting for download: ' + timeout_counter / 1000 + 's');
        if (timeout_counter > 10000) {
          alert('Download error.  Refreshing page.');
          window.location.assign([location.protocol, '//', location.host, location.pathname].join(''));
        } else {
          // wait 50 milliseconds then recheck
          setTimeout(wait_for_download, 50);
          return;
        };
      };

      // once the filename is received...

      // insta_step 17: Send instaDropData to server
      instaDropData.iID = ui.draggable[0].getAttribute('id');
      instaDropData.iFilename = insta_download_ready_filename[ui.draggable[0].getAttribute('id')];
      instaDropData.posleft = ui.offset.left;
      instaDropData.postop = ui.offset.top;
      instaDropData.iWidth = window.getComputedStyle(ui.draggable[0]).width;
      instaDropData.iHeight = window.getComputedStyle(ui.draggable[0]).height;
      instaDropData.iLink = ui.draggable[0].getAttribute('data-link');

      socket.emit('ce: insta_drop', instaDropData);

      // delete id key from insta_download_ready_filename object
      delete insta_download_ready_filename[ui.draggable[0].getAttribute('id')];
    }

    wait_for_download();

    // It would be much less complex to initiate the download here,
    // however, this strategy (of starting the download when the drag starts)
    // provides a quicker user experience.
  }
});

// insta_step 20: Convert dragged image to typical .wallPic
socket.on('se: change_clone_to_image', function (instaDBData) {
  var image_element = document.getElementById(instaDBData.iID);

  image_element.setAttribute('id', instaDBData.dom_id);
  image_element.src = instaDBData.location + instaDBData.iFilename;
  image_element.classList.add('wallPic');
  image_element.style.width = instaDBData.width;
  image_element.style.height = instaDBData.height;
  image_element.classList.remove('insta_image');
  image_element.setAttribute('title', instaDBData.iFilename);
  image_element.setAttribute('data-link', instaDBData.insta_link);
  image_element.setAttribute('data-scale', '1');
  image_element.setAttribute('data-angle', '0');
  image_element.setAttribute('data-rotateX', '0');
  image_element.setAttribute('data-rotateY', '0');
  image_element.setAttribute('data-rotateZ', '0');
  image_element.style.zIndex = instaDBData.z_index;
  image_element.style.opacity = 1;
  image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
  image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

  // assign drag to added element
  assigndrag(instaDBData.dom_id);
});

// insta_step 22: Add image to other clients
socket.on('be: add_insta_image_to_other_clients', function (instaDBData) {
  var images_element = document.getElementById('images'),
      image_element = document.createElement('img');

  image_element.setAttribute('id', instaDBData.dom_id);
  image_element.setAttribute('title', instaDBData.iFilename);
  image_element.src = instaDBData.location + instaDBData.iFilename;
  image_element.classList.add('wallPic');
  image_element.style.width = instaDBData.width;
  image_element.style.height = instaDBData.height;
  image_element.style.top = instaDBData.postop;
  image_element.style.left = instaDBData.posleft;
  image_element.style.zIndex = instaDBData.z_index;
  image_element.setAttribute('data-link', instaDBData.insta_link);

  image_element.setAttribute('data-scale', '1');
  image_element.setAttribute('data-angle', '0');
  image_element.setAttribute('data-rotateX', '0');
  image_element.setAttribute('data-rotateY', '0');
  image_element.setAttribute('data-rotateZ', '0');
  image_element.style.opacity = 1;
  image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
  image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

  images_element.appendChild(image_element);

  // assign drag to added element
  assigndrag(instaDBData.dom_id);
});

// --Buttons


document.getElementById('navigation_toggle_button').onclick = function () {
  var button_element = document.getElementById('navigation_toggle_button');

  // if the button is being dragged, don't use the click.  FUTURE WORK: stop event propagation
  if (button_element.classList.contains('dragging_no_click') === false) {

    // otherwise, if button containers are open
    if (document.body.classList.contains('button_container_is_open')) {
      // close all containers
      _stateChange2.default.closeAll();
      // show selected_file in case it was removed by being dragged onto the exit door
      // except when no file is selected: store.getState().selectedImage.id is undefined or ''
      if (store.getState().selectedImage.id !== '') {
        document.getElementById(store.getState().selectedImage.id).style.display = 'initial';
      };
      // else when no containers are open
    } else {
      // open the navigation container
      document.getElementById('navigation_container').classList.add('navigation_container_is_open');
      document.body.classList.add('button_container_is_open');
      document.getElementById('connect_info').classList.add('connect_info_is_open');

      // animate open hamburgers
      document.getElementById('line_one').style.top = '35%';
      document.getElementById('line_three').style.top = '65%';

      _stateChange2.default.hideDraggers();
    };
  };
};

//
// <div id='exit_door' class='button navigation_button'> remove
//   <img class='icon_image' src='/icons/door_icon.png'>
// </div>


//var exitDoor = require('./exit-door');


// dragger_all_switch; used to toggle all dragger switches
$('#dragger_all_switch').click(function () {
  var i = 0,
      switch_elements = {},
      dragger_elements = {};

  // add or remove 'switchon' class in dragger_all_switch
  this.classList.toggle('switchon');
  // if dragger_all_switch has been switched on
  if (document.getElementById('dragger_all_switch').classList.contains('switchon')) {
    // add 'switchon' class to all dragger_switch elements
    switch_elements = document.getElementsByClassName('dragger_switch');
    for (i = 0; i < switch_elements.length; i++) {
      switch_elements[i].classList.add('switchon');
    };
    // set dragger element locations
    set_dragger_locations(store.getState().selectedImage.id);
    // show dragger elements if an image is selected
    if (store.getState().selectedImage.id) {
      dragger_elements = document.getElementsByClassName('dragger');
      for (i = 0; i < dragger_elements.length; i++) {
        dragger_elements[i].style.display = 'block';
      };
    };
    // set cookie to all uppercase
    setCookie('switches_status', 'SROBCGTP', 7);
    switches_status = 'SROBCGTP';
    // else when dragger_all_switch has been switched off
  } else {
    // remove 'switchon' class from dragger_status elements
    switch_elements = document.getElementsByClassName('dragger_switch');
    for (i = 0; i < switch_elements.length; i++) {
      switch_elements[i].classList.remove('switchon');
    };
    // hide all draggers
    dragger_elements = document.getElementsByClassName('dragger');
    for (i = 0; i < dragger_elements.length; i++) {
      dragger_elements[i].style.display = 'none';
    };
    // set cookie to all lowercase
    setCookie('switches_status', 'srobcgtp', 7);
    switches_status = 'srobcgtp';
  };
});

// set up dragger_switch functionalities
$('.dragger_switch').click(function () {
  var switch_status_array = [],

  // use id='stretch_dragger_switch' to get 'stretch_dragger'
  dragger_name = this.getAttribute('id').replace('_switch', '');

  // toggle dragger_switch
  this.classList.toggle('switchon');

  // convert d_status string to array
  switch_status_array = switches_status.split('');

  // if switched on
  if (this.classList.contains('switchon')) {
    // set dragger locations
    set_dragger_locations(store.getState().selectedImage.id);
    // show dragger if an image is selected
    if (store.getState().selectedImage.id) {
      document.getElementById(dragger_name).style.display = 'block';
    };
    // use first letter of dragger_name to find corresponding character in array and replace it
    // with uppercase character to indicate dragger_switch is on
    switch_status_array[switch_status_array.indexOf(dragger_name[0])] = dragger_name[0].toUpperCase();
    // else when switched off
  } else {
    // hide dragger
    document.getElementById(dragger_name).style.display = 'none';
    // use first letter of dragger_name to find corresponding character in array and replace it
    // with lowercase character to indicate dragger_switch is off
    switch_status_array[switch_status_array.indexOf(dragger_name[0].toUpperCase())] = dragger_name[0].toLowerCase();
  };
  // convert switch_status_array back to string and set cookie
  switches_status = switch_status_array.join('');
  setCookie('switches_status', switches_status, 7);
});

// dragger_switches button
$('#dragger_switches_button').on('click', function () {
  // toggle dragger_switches container
  document.getElementById('dragger_switches_container').classList.toggle('dragger_switches_container_is_open');
  // if dragger_switches container opens, close navigation container
  if (document.getElementById('dragger_switches_container').classList.contains('dragger_switches_container_is_open')) {
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  };
});

// reset page button
// uses jquery $.get to reset the page, and sends socket to other clients to reset as well
$('#reset_page_button').on('click', function () {
  $.get('/resetpage', function () {
    socket.emit('c-e:  resetpage');
    // reload the page
    window.location.assign([location.protocol, '//', location.host, location.pathname].join(''));
  });
});

$('#info_button').on('click', function () {
  document.getElementById('app_info').style.display = 'block';
  document.getElementById('close_info_container').style.display = 'block';
});

$('#close_info_container').on('click', function () {
  document.getElementById('app_info').style.display = 'none';
  document.getElementById('close_info_container').style.display = 'none';
});

// on file_select element change, load up the image preview
$('#fileselect').on('change', function () {
  // open upload_preview_container
  _stateChange2.default.uploadPreview();
  readURL(this);
});

// this function puts the image selected by the browser into the upload_preview container.
// http://stackoverflow.com/questions/18934738/select-and-display-images-using-filereader
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
function readURL(input) {
  var reader;

  if (input.files && input.files[0]) {
    reader = new FileReader();
    reader.onload = function (event) {
      // wait until the image is ready to upload_preview container
      document.getElementById('upload_preview_container').classList.add('upload_preview_container_is_open');
      document.getElementById('image_upload_preview').src = event.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  };
}

// confirm upload button
// on click, send a submit to the html form with id='upload_image_button'
// the html form with id='upload_image_button' posts to '/addfile'
$('#confirm_upload_button').on('click', function () {
  document.getElementById('confirm_or_reject_container').style.display = 'none';

  $('#upload_image_button').ajaxSubmit({
    // method from jquery.form
    error: function error(xhr) {
      console.log('Error:' + xhr.status);
      // change navigation_container and remove upload_preview
      _stateChange2.default.afterUpload();
      uploadtotal = 0;
    },
    success: function success(response) {
      // response variable from server is the uploaded file information
      var socketdata = {},
          images_element = document.getElementById('images'),
          image_element = document.createElement('img');

      // create new image
      image_element.setAttribute('id', response.dom_id);
      image_element.setAttribute('title', response.imageFilename);
      image_element.classList.add('wallPic');
      image_element.src = response.location + response.imageFilename;
      image_element.setAttribute('data-scale', '1');
      image_element.setAttribute('data-angle', '0');
      image_element.setAttribute('data-rotateX', '0');
      image_element.setAttribute('data-rotateY', '0');
      image_element.setAttribute('data-rotateZ', '0');
      image_element.setAttribute('data-persective', '0');
      image_element.style.width = _config2.default.uploadWidth;
      image_element.style.height = _config2.default.uploadheight;
      image_element.style.zIndex = response.z_index;
      image_element.style.top = _config2.default.uploadTop;
      image_element.style.left = _config2.default.uploadLeft;
      image_element.style.opacity = 1;
      image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
      image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

      // Add <div id='dom_id'> to <div id='images'>
      images_element.appendChild(image_element);
      // assign drag to added element
      assigndrag(response.dom_id);
      // change navigation container and remove upload_preview
      _stateChange2.default.afterUpload();
      // emit to other clients
      socketdata.uploadedFilename = response.imageFilename;
      socket.emit('c-e:  share_upload', socketdata);

      uploadtotal = 0;
    }
  });
});

// reject upload
$('#reject_upload_button').on('click', function () {
  _stateChange2.default.afterUpload();
});

$('#n4').on('click', function () {});

// reject delete
$('#reject_delete_button').on('click', function () {
  var deleteTargetID = store.getState().deleteTarget.id;

  _stateChange2.default.rejectDelete();
  // send socket to show on other clients
  socket.emit('c-e:  show_image', deleteTargetID);
});

// confirm delete
$('#confirm_delete_button').on('click', function () {
  var socketdata = {},
      deleteTarget = store.getState().deleteTarget;

  // remove image
  deleteTarget.element.remove();
  // change navigation container
  _stateChange2.default.afterDelete();
  // prepare data to send
  socketdata.filenameToDelete = deleteTarget.element.getAttribute('title');
  socketdata.id_to_delete = deleteTarget.id;
  // send data to server
  socket.emit('c-e:  delete_image', socketdata);
  clear_selected_file();
});

$('#instagram_login').on('click', function () {
  var redirect_url = [location.protocol, '//', location.host, location.pathname].join('');

  // redirect_url: http://www.example.com?myclient_id=johndoe
  redirect_url = redirect_url + '?myclient_id=' + sessionID;

  // insta_step 24: If the client has an access token, open Instagram divs and skip to insta_step 7.

  // instaAccessReady is assigned during the initial socket 'connect_set_clientVars'
  if (instaAccessReady === true) {

    socket.emit('ce: get_instagram_data');

    document.getElementById('insta_header').style.display = 'flex';
    document.getElementById('insta_div').style.display = 'block';
    document.getElementById('upload_container').classList.remove('upload_container_is_open');
    document.body.classList.add('button_container_is_open');

    // animate open hamburgers
    document.getElementById('line_one').style.top = '35%';
    document.getElementById('line_three').style.top = '65%';
  } else {

    // insta_step 1: Redirect to Instagram API to prompt user to authenticate
    // instaAppID, provided to Instagram developers, is stored on the server
    // and fetched with the initial socket connection
    // Successful authentication will send the browser back to the server's
    // app.get('/') with 'myclient_id' and 'code' query parameter to be parsed by the server

    window.location = 'https://api.instagram.com/oauth/authorize/?client_id=' + instaAppID + '&redirect_uri=' + redirect_url + '&response_type=code';
  };
});

// insta_step 25: Use the instagram logout link in an image tag to log out.
// http://stackoverflow.com/questions/10991753/instagram-api-user-logout
$('#instagram_logout_button').on('click', function () {
  var logout_image_element = document.createElement('img');

  logout_image_element.src = 'http://instagram.com/accounts/logout/';
  logout_image_element.setAttribute('id', 'temp_instagram_logout');
  logout_image_element.style.display = 'none';
  logout_image_element.style.height = '0';
  logout_image_element.style.width = '0';

  // create the logout 'image' briefly in the dom.
  document.getElementById('wrapper').appendChild(logout_image_element);
  document.getElementById('temp_instagram_logout').remove();

  alert('logged out');

  // insta_step 26: Remove client's access token from server
  socket.emit('ce: remove_client_from_clients_access', sessionID);

  instaAccessReady = false;
});

$('#explore_button').on('click', function () {

  document.getElementById('explore_container').style.display = 'block';
  document.getElementById('close_explore_container').style.display = 'block';

  document.getElementById('explore_image').src = document.getElementById(store.getState().selectedImage.id).src;

  if (document.getElementById(store.getState().selectedImage.id).getAttribute('data-link').length > 1) {

    document.getElementById('insta_link').setAttribute('href', document.getElementById(store.getState().selectedImage.id).getAttribute('data-link'));
  };

  if (typeof store.getState().selectedImage.id !== 'undefined' && store.getState().selectedImage.id.length > 0) {

    // if selected file is empty, fill it.


  } else {};
});

$('#close_explore_container').on('click', function () {
  document.getElementById('explore_container').style.display = 'none';
  document.getElementById('close_explore_container').style.display = 'none';
});

// --Main drag function

// use this function to assign draggable to all '.wallPic' elements
// and then specific elements by passing an id
function assigndrag(id) {

  if (typeof id === 'undefined') {
    id = '.wallPic';
  } else {
    id = '#' + id;
  };

  // draggable method from jquery.ui
  $(id).draggable({
    // containment: 'window',
    stack: '.wallPic', // the stack option automatically adjusts z-indexes for all .wallPic elements
    scroll: true,
    start: function start(event, ui) {
      // recoup for transformed objects, to keep the drag event centered on a transformed object.
      // http://stackoverflow.com/questions/3523747/webkit-and-jquery-draggable-jumping
      // uses a ternary operator:
      //   boolean statement ? true result : false result;
      //   if boolean statement is true, do first, else do second.
      //   so if left is not a number, make it zero, otherwise make it left
      var left = parseInt(this.style.left),
          top = parseInt(this.style.top);

      left = isNaN(left) ? 0 : left;
      top = isNaN(top) ? 0 : top;
      this.recoupLeft = left - ui.position.left;
      this.recoupTop = top - ui.position.top;

      // store the original z index
      this.original_zindex = this.style.zIndex;

      // store image id
      this.image_id = this.getAttribute('id');

      // assign temporary z-index
      this.style.zIndex = 60000;

      _stateChange2.default.hideDraggers();

      // remove filter
      // --this is necessary because dragging images with filter causes too much rendering lag
      this.setAttribute('data-filter', this.style.webkitFilter);
      this.style.webkitFilter = '';

      // send emit to remove filter from other clients
      socket.emit('c-e:  remove_filter', this.image_id);

      // pass id to c-e:  freeze
      socket.emit('c-e:  freeze', this.image_id);

      // begin to prepare socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
    },
    drag: function drag(event, ui) {
      // recoup drag position
      ui.position.left += this.recoupLeft;
      ui.position.top += this.recoupTop;

      // prepare socketdata to pass
      this.socketdata.imageTop = this.style.top;
      this.socketdata.imageLeft = this.style.left;

      // pass socket data to server
      socket.emit('c-e:  moving', this.socketdata);
    },
    stop: function stop() {
      // prepare data to send to ajax post, get all wallPic elements
      var dropPost = {},
          i = 0,
          drawing_elements = document.body.getElementsByClassName('wallPic');

      // return to the original z-index
      this.style.zIndex = this.original_zindex;

      // restore filter
      this.style.webkitFilter = this.getAttribute('data-filter');
      this.removeAttribute('data-filter');

      // send emit to restore filter to other clients
      socket.emit('c-e:  restore_filter', this.image_id);

      // send emit to unfreeze in other clients
      socket.emit('c-e:  unfreeze', this.image_id);

      // prepare data to send to server
      dropPost.domIDs = [];
      dropPost.filenames = [];
      dropPost.zIndexes = [];
      dropPost.dFilename = this.getAttribute('title');
      dropPost.dLeft = this.style.left;
      dropPost.dTop = this.style.top;

      // populate dropPost
      for (i = 0; i < drawing_elements.length; i++) {
        dropPost.domIDs[i] = drawing_elements[i].getAttribute('id');
        dropPost.filenames[i] = drawing_elements[i].getAttribute('title');
        dropPost.zIndexes[i] = drawing_elements[i].style.zIndex;
      };

      // ajax post from jquery.  FUTURE WORK: replace with a socket
      $.ajax({
        method: 'POST',
        url: '/dragstop',
        data: JSON.stringify({ dropPost: dropPost }),
        contentType: 'application/json'
      }).done(function () {});

      // for set dragger locations
      store.getState().selectedImage.id = this.getAttribute('id');
      store.dispatch((0, _actions.setSelectedImage)(this.getAttribute('id')));

      // reset click count
      click_count = 0;

      //          set_dragger_locations(store.getState().selectedImage.id);
    }
  }).click(function () {
    var i = 0,
        image_objects = document.getElementsByClassName('wallPic'),
        id_and_zindex = [],
        clicked_ids_zindexes = [],
        clickX = event.pageX,
        clickY = event.pageY,
        offset_left = 0,
        offset_top = 0,
        image_px_range = {},
        clicked_ids = '';

    // for each .wallPic on the page...
    for (i = 0; i < image_objects.length; i++) {

      // calculate the range of pixels it occupies on the page...
      offset_left = image_objects[i].getBoundingClientRect().left + document.body.scrollLeft;
      offset_top = image_objects[i].getBoundingClientRect().top + document.body.scrollTop;
      image_px_range = { x: [offset_left, offset_left + image_objects[i].offsetWidth],
        y: [offset_top, offset_top + image_objects[i].offsetHeight] };

      // if the click is within the image's range, add the .wallPic id and z-index to an array.
      if (clickX >= image_px_range.x[0] && clickX <= image_px_range.x[1] && clickY >= image_px_range.y[0] && clickY <= image_px_range.y[1]) {
        id_and_zindex = [image_objects[i].id, image_objects[i].style.zIndex];
        clicked_ids_zindexes.push(id_and_zindex);
      };
    };

    // sort the array by z-index, highest to lowest.
    clicked_ids_zindexes.sort(function (a, b) {
      return b[1] - a[1];
    });

    // if selected_file is not empty, remove selected_file_animation class
    if (typeof store.getState().selectedImage.id !== 'undefined' && store.getState().selectedImage.id.length > 0) {
      document.getElementById(store.getState().selectedImage.id).classList.remove('selected_file_animation');
      // css-trick: this will 'trigger a reflow' which will allow the class to be added again before the animation ends.
      document.getElementById(store.getState().selectedImage.id).offsetWidth;
    };

    // if one image is clicked...
    if (clicked_ids_zindexes.length === 1) {

      // set the selected_file
      store.getState().selectedImage.id = this.getAttribute('id');
      store.dispatch((0, _actions.setSelectedImage)(this.getAttribute('id')));

      // add the selected_file_animation class
      document.getElementById(store.getState().selectedImage.id).classList.add('selected_file_animation');

      // reset the click count
      click_count = 0;
      console.log('click count: ' + click_count);

      // else when more than one image is clicked...
    } else {
      // create a string of clicked ids
      for (i = 0; i < clicked_ids_zindexes.length; i++) {
        clicked_ids = clicked_ids + '.' + clicked_ids_zindexes[i][0];
        // remove temp_fade from all clicked images
        document.getElementById(clicked_ids_zindexes[i][0]).classList.remove('temp_fade');
        document.getElementById(clicked_ids_zindexes[i][0]).offsetWidth;
      };
      // if the clicked_ids have changed, reset the click_count to 0
      if (clicked_ids !== previous_clicked_ids || previous_clicked_ids === '') click_count = 0;

      // add a click
      click_count++;
      // console.log('click_count: ' + click_count);
      // console.log((click_count - 1) % clicked_ids_zindexes.length);

      // set the selected image to an id in the clicked array using the remainder of the click_count divided by the number of clicked images
      store.getState().selectedImage.id = clicked_ids_zindexes[(click_count - 1) % clicked_ids_zindexes.length][0];
      document.getElementById(store.getState().selectedImage.id).classList.add('selected_file_animation');

      // add temp_fade class to all clicked images other than the one selected
      for (i = 0; i < clicked_ids_zindexes.length; i++) {

        // don't add temp_fade class to selected_file, or to an image already faded, or if the selected_file is already on top
        if (clicked_ids_zindexes[i][0] !== store.getState().selectedImage.id && document.getElementById(clicked_ids_zindexes[i][0]).style.opacity > 0.50 && click_count % clicked_ids_zindexes.length !== 1) {
          document.getElementById(clicked_ids_zindexes[i][0]).classList.add('temp_fade');
        };
      };

      // store clicked ids in a global string.  Note: Can't use an array as global variable.  Primitives are passed by value.  Objects are passed by 'copy of a reference'.
      previous_clicked_ids = clicked_ids;
    };

    set_dragger_locations(store.getState().selectedImage.id);
  });
};

// --Interact('.wallPic').gesturable, for touchscreen rotating and scaling

interact('.wallPic').gesturable({
  onstart: function onstart(event) {

    this.image_id = event.target.getAttribute('id');
    this.image_element = event.target;

    _stateChange2.default.hideDraggers();

    // retrieve original angle and scale
    this.angle = parseFloat(this.image_element.getAttribute('data-angle'));
    this.scale = parseFloat(this.image_element.getAttribute('data-scale'));

    // pass id to c-e:  freeze
    socket.emit('c-e:  freeze', this.image_id);

    // prepare socketdata
    this.socketdata = {};
    this.socketdata.image_id = this.image_id;
    this.socketdata.imageFilename = this.image_element.getAttribute('title');
  },
  onmove: function onmove(event) {
    // retrieve scale and angle from event object
    // event.ds is scale difference; event.da is the angle difference
    this.scale = this.scale * (1 + event.ds);
    this.angle += event.da;

    // modify element with new transform
    this.image_element.style.transform = this.image_element.style.transform.replace(/rotate\(.*?\)/, 'rotate(' + this.angle + 'deg)');
    this.image_element.style.transform = this.image_element.style.transform.replace(/scale\(.*?\)/, 'scale(' + this.scale + ')');

    // send socketdata
    this.socketdata.imageTransform = this.image_element.style.transform;
    socket.emit('c-e:  transforming', this.socketdata);
  },
  onend: function onend(event) {
    // if angle is < 0 or > 360, revise the angle to 0-360 range
    if (this.angle < 0) {
      this.angle = 360 + this.angle;
      this.image_element.style.transform = this.image_element.style.transform.replace(/rotate\(.*?\)/, 'rotate(' + this.angle + 'deg)');
    };
    if (this.angle > 360) {
      this.angle = this.angle - 360;
      this.image_element.style.transform = this.image_element.style.transform.replace(/rotate\(.*?\)/, 'rotate(' + this.angle + 'deg)');
    };

    // send socketdata
    this.socketdata.scale = this.scale.toFixed(2);
    this.socketdata.angle = this.angle.toFixed(2);
    this.socketdata.rotateX = this.image_element.getAttribute('data-rotateX');
    this.socketdata.rotateY = this.image_element.getAttribute('data-rotateY');
    this.socketdata.rotateZ = this.image_element.getAttribute('data-rotateZ');

    socket.emit('c-e:  store_data_attributes', this.socketdata);
    this.socketdata.imageTransform = this.image_element.style.transform;
    socket.emit('c-e:  store_transformed', this.socketdata);

    // pass id to c-e:  unfreeze
    socket.emit('c-e:  unfreeze', this.image_id);

    // put new scale and angle into data-scale and data-angle
    event.target.setAttribute('data-scale', this.scale.toFixed(2));
    event.target.setAttribute('data-angle', this.angle.toFixed(2));

    // reset draggers
    //      set_dragger_locations(this.image_id);

    // reset click count
    click_count = 0;
  }
});

// --Exit door.droppable, for preparing a dropped image to delete

$('#n4').droppable({
  accept: '.wallPic',
  // activeClass: 'exit_active_class',
  hoverClass: 'exit_door_hover',
  tolerance: 'pointer',

  over: function over() {
    //       console.log('over exit door');
  },
  out: function out() {
    //       console.log('back out over exit door ');
  },
  drop: function drop(event, ui) {
    //       console.log('Draggable wallPic dropped on exit door.');
    var deleteTarget = ui.draggable[0];

    store.dispatch((0, _actions.setDeleteTarget)(deleteTarget));

    // hide original image
    deleteTarget.style.display = 'none';

    // hide draggers
    _stateChange2.default.hideDraggers();

    // show delete_preview_container
    _stateChange2.default.deletePreview();

    // send socket to hide on other clients
    socket.emit('c-e:  hide_image', deleteTarget.id);
  }
});

// --Navigation_toggle_button.draggable, for dragging the navigation_toggle_button around the sides

$('#navigation_toggle_button_container').draggable({
  cancel: true,
  containment: 'parent',
  scroll: false,
  start: function start() {

    // used to prevent click from registering
    document.getElementById('navigation_toggle_button').classList.add('dragging_no_click');

    _debug2.default.clearDebugInfo();

    // get the starting size
    this.high = $(this).height();
    this.wide = $(this).width();

    // get values of top and left for bottom and right placements
    this.top_when_on_bottom_num = _pageSettings2.default.mainHigh - this.high;
    this.left_when_on_right_num = _pageSettings2.default.mainWide - this.wide;
    console.log(this.left_when_on_right_num);
    console.log(_pageSettings2.default.mainWide);

    this.top_when_on_bottom_px = this.top_when_on_bottom_num.toString().concat('px');
    this.left_when_on_right_px = this.left_when_on_right_num.toString().concat('px');
    this.commit_distance = 5;
  },
  drag: function drag(event, ui) {
    // ui.position.top is wherever the drag cursor goes

    // take y axis measurements
    if (this.style.top === '0px') {
      // console.log('Top or Bottom: Top');
      this.yplace = 'top';
      this.mostrecentyplace = 'top';
    } else if (this.style.top === this.top_when_on_bottom_px) {
      // console.log('Top or Bottom: Bottom');
      this.yplace = 'bottom';
      this.mostrecentyplace = 'bottom';
    } else {
      // console.log('Top or Bottom: Between');
      this.yplace = 'between';
    };

    // take x axis measurements
    if (this.style.left === '0px') {
      // console.log('Left or Right: Left');
      this.xplace = 'left';
      this.mostrecentxplace = 'left';
    } else if (this.style.left === this.left_when_on_right_px) {
      // console.log('Left or Right: Right');
      this.xplace = 'right';
      this.mostrecentxplace = 'right';
    } else {
      // console.log('Left or Right: Between');
      this.xplace = 'between';
    };

    // console.log('Corner: Not a corner.');

    // if the element is on a side already, keep it there
    if (this.yplace === 'top' && this.xplace === 'between') {
      ui.position.top = 0;
    } else if (this.yplace === 'bottom' && this.xplace === 'between') {
      ui.position.top = this.top_when_on_bottom_num;
    } else if (this.xplace === 'left' && this.yplace === 'between') {
      ui.position.left = 0;
    } else if (this.xplace === 'right' && this.yplace === 'between') {
      ui.position.left = this.left_when_on_right_num;
      // else when the element is in a corner
      // usually the next drag ui will lock the element to a side
      // but on the occasion that the ui.position goes uniformly toward the center (e.g. 0,0 to 1,1)
      // select the side based on which directional threshold the ui crosses first
    } else {
      // console.log(`Corner: ${this.mostrecentxplace} ${this.mostrecentyplace}`);
      // top left corner: left drag
      if (this.mostrecentxplace === 'left' && this.mostrecentyplace === 'top' && ui.position.left > this.commit_distance) {
        ui.position.top = 0;
      };
      // top left corner: down drag
      if (this.mostrecentxplace === 'left' && this.mostrecentyplace === 'top' && ui.position.top > this.commit_distance) {
        ui.position.left = 0;
      };
      // top right corner: right drag
      if (this.mostrecentxplace === 'right' && this.mostrecentyplace === 'top' && this.left_when_on_right_num - ui.position.left > this.commit_distance) {
        ui.position.top = 0;
      };
      // top right corner: down drag
      if (this.mostrecentxplace === 'right' && this.mostrecentyplace === 'top' && ui.position.top > this.commit_distance) {
        ui.position.left = this.left_when_on_right_num;
      };
      // bottom left corner: left drag
      if (this.mostrecentxplace === 'left' && this.mostrecentyplace === 'bottom' && ui.position.left > this.commit_distance) {
        ui.position.top = this.top_when_on_bottom_num;
      };
      // bottom left corner: up drag
      if (this.mostrecentxplace === 'left' && this.mostrecentyplace === 'bottom' && this.top_when_on_bottom_num - ui.position.top > this.commit_distance) {
        ui.position.left = 0;
      };
      // bottom right corner: right drag
      if (this.mostrecentxplace === 'right' && this.mostrecentyplace === 'bottom' && this.left_when_on_right_num - ui.position.left > this.commit_distance) {
        ui.position.top = this.top_when_on_bottom_num;
      };
      // bottom right corner: up drag
      if (this.mostrecentxplace === 'right' && this.mostrecentyplace === 'bottom' && this.top_when_on_bottom_num - ui.position.top > this.commit_distance) {
        ui.position.left = this.left_when_on_right_num;
      };
    };
  },
  stop: function stop() {
    // this causes the class to be removed before the next click event begins
    setTimeout(function () {
      document.getElementById('navigation_toggle_button').classList.remove('dragging_no_click');
      //        navigation_toggle_button_is_stationary = true;
    }, 200);
  }
});

// --Draggers

$('#stretch_dragger').draggable({
  containment: 'parent',
  scroll: false,
  start: function start() {
    // hide other draggers
    _stateChange2.default.hideOtherDraggers(this.getAttribute('id'));
    // prepare dom elements for manipulation
    this.image_id = store.getState().selectedImage.id;
    this.image_element = document.getElementById(store.getState().selectedImage.id);
    // prepare the socketdata
    this.socketdata = {};
    this.socketdata.image_id = this.image_id;
    // gather selected_image stats
    this.image_original_width = parseInt(this.image_element.style.width);
    this.image_original_height = parseInt(this.image_element.style.height);
    this.image_original_left = parseInt(this.image_element.style.left);
    this.image_original_top = parseInt(this.image_element.style.top);
    // show some grid lines and dragger_info box
    make_grid();
    this.dragger_info = document.getElementById('dragger_info');
    // disallow transitions
    this.classList.remove('dragger_transitions');
    // put the filter in a data attribute and remove filter
    // --this was necessary because dragging images with filter caused too much rendering lag
    this.image_element.setAttribute('data-filter', this.image_element.style.WebkitFilter);
    this.image_element.style.WebkitFilter = '';
    // socket to other clients
    socket.emit('c-e:  remove_filter', this.image_id);
  },
  drag: function drag(event, ui) {
    // dynamic percentage defined by the dragger in relation to the inner window
    this.percentage_wide = ui.position.left / _pageSettings2.default.innerWidth;
    this.percentage_high = (_pageSettings2.default.innerHeight - ui.position.top) / _pageSettings2.default.innerHeight;
    // calculate changes: define the selected_image's new width/height/left/right in relation to the window size

    this.new_width = this.percentage_wide * _pageSettings2.default.mainWide;
    this.new_height = this.percentage_high * _pageSettings2.default.mainHigh;
    this.new_left = this.image_original_left + (this.image_original_width - this.new_width) / 2;
    this.new_top = this.image_original_top + (this.image_original_height - this.new_height) / 2;
    // display the percentages in the dragger_info div
    this.dragger_info.textContent = 'width:' + (this.percentage_wide * 100).toFixed(0) + '% height: ' + (this.percentage_high * 100).toFixed(0) + '%';
    // make the calculated changes
    this.image_element.style.width = this.new_width + 'px';
    this.image_element.style.height = this.new_height + 'px';
    this.image_element.style.left = this.new_left + 'px';
    this.image_element.style.top = this.new_top + 'px';
    // emit to other clients
    this.socketdata.imageTransform = this.image_element.style.transform;
    this.socketdata.imageWidth = this.image_element.style.width;
    this.socketdata.imageHeight = this.image_element.style.height;
    this.socketdata.imageLeft = this.image_element.style.left;
    this.socketdata.imageTop = this.image_element.style.top;
    socket.emit('c-e:  resizing', this.socketdata);
  },
  stop: function stop() {
    // remove grid and dragger_info box
    remove_grid();
    // allow transitions
    this.classList.add('dragger_transitions');
    // restore filter
    this.image_element.style.WebkitFilter = this.image_element.getAttribute('data-filter');
    this.image_element.removeAttribute('data-filter');
    // show draggers
    set_dragger_locations(this.image_id);
    // socket to other clients
    socket.emit('c-e:  restore_filter', this.image_id);
    // save to database
    this.socketdata.imageFilename = this.image_element.getAttribute('title');
    // socket to other clients
    socket.emit('c-e:  store_resized', this.socketdata);
    // reset click count
    click_count = 0;
  }
});

$('#opacity_dragger').draggable({
  containment: 'parent',
  scroll: false,
  start: function start() {
    // hide other draggers
    _stateChange2.default.hideOtherDraggers(this.getAttribute('id'));
    // prepare dom elements for manipulation
    this.image_id = store.getState().selectedImage.id;
    this.image_element = document.getElementById(store.getState().selectedImage.id);
    // prepare the socketdata
    this.socketdata = {};
    this.socketdata.image_id = this.image_id;
    // gather selected_image stats
    this.image_original_opacity = this.image_element.style.opacity;
    // disallow transitions
    this.classList.remove('dragger_transitions');
    // show some grid lines and dragger_info box
    make_grid();
    this.dragger_info = document.getElementById('dragger_info');
  },
  drag: function drag(event, ui) {
    // dynamic percentage defined by the dragger in relation to the inner window
    this.percentage_wide = ui.position.left / _pageSettings2.default.innerWidth;
    // display the percentages in the dragger_info div
    this.dragger_info.textContent = 'opacity:' + (this.percentage_wide * 100).toFixed(0) + '%';
    // make the calculated changes
    this.image_element.style.opacity = this.percentage_wide;
    // socket to other clients
    this.socketdata.imageOpacity = this.percentage_wide;
    socket.emit('c-e:  opacity_changing', this.socketdata);
  },
  stop: function stop() {
    // remove grid and dragger_info box
    remove_grid();
    // allow transitions
    this.classList.add('dragger_transitions');
    // show draggers
    set_dragger_locations(this.image_id);
    // save to database
    this.socketdata.imageFilename = this.image_element.getAttribute('title');
    socket.emit('c-e:  store_opacity', this.socketdata);
    // reset click count
    click_count = 0;
  }
});

$('#rotation_dragger').draggable({
  containment: 'parent',
  scroll: false,
  start: function start() {
    // hide other draggers
    _stateChange2.default.hideOtherDraggers(this.getAttribute('id'));
    // prepare dom elements for manipulation
    this.image_id = store.getState().selectedImage.id;
    this.image_element = document.getElementById(store.getState().selectedImage.id);
    // prepare the socketdata
    this.socketdata = {};
    this.socketdata.image_id = this.image_id;

    // show some grid lines and dragger_info box
    make_grid();
    this.dragger_info = document.getElementById('dragger_info');
    // disallow transitions
    this.classList.remove('dragger_transitions');
    // put the filter in a data attribute and remove filter
    // this.image_element.setAttribute('data-filter', this.image_element.style.WebkitFilter);
    // this.image_element.style.WebkitFilter = '';
    // socket to other clients
    // socket.emit('c-e:  remove_filter', this.image_id);
  },
  drag: function drag(event, ui) {
    // calculate changes: define the selected_image's new rotation in relation to the percentage of inner window size
    this.new_rotation = Math.round(ui.position.left / _pageSettings2.default.innerWidth * 100) * 3.6;
    this.new_rotateZ = Math.round(ui.position.top / _pageSettings2.default.innerHeight * 100) * 3.6;

    // display the percentages in the dragger_info div
    this.dragger_info.textContent = 'rotation: ' + this.new_rotation.toFixed(2) + 'deg   rotateZ: ' + this.new_rotateZ.toFixed(2) + 'deg';
    // make the calculated changes
    this.image_element.style.transform = this.image_element.style.transform.replace(/rotate\(.*?\)/, 'rotate(' + this.new_rotation + 'deg)');
    this.image_element.style.transform = this.image_element.style.transform.replace(/rotateZ\(.*?\)/, 'rotateZ(' + this.new_rotateZ + 'deg)');

    // socket to other clients
    this.socketdata.imageTransform = this.image_element.style.transform;
    socket.emit('c-e:  transforming', this.socketdata);
  },
  stop: function stop() {
    // remove grid and dragger_info box
    remove_grid();
    // allow transitions
    this.classList.add('dragger_transitions');
    // restore filter
    // this.image_element.style.WebkitFilter = this.image_element.getAttribute('data-filter');
    // this.image_element.removeAttribute('data-filter');
    // socket.emit('c-e:  restore_filter', this.image_id);
    // save to database
    this.socketdata.imageFilename = this.image_element.getAttribute('title');
    // this.socketdata.imageTransform = this.image_element.style.transform;
    socket.emit('c-e:  store_transformed', this.socketdata);
    // store angle in data-angle
    this.image_element.setAttribute('data-angle', this.new_rotation.toFixed(2));
    this.image_element.setAttribute('data-rotateZ', this.new_rotateZ.toFixed(2));
    // show draggers
    set_dragger_locations(this.image_id);
    // send to socket
    this.socketdata.angle = this.new_rotation.toString();
    this.socketdata.scale = this.image_element.getAttribute('data-scale');
    this.socketdata.rotateX = this.image_element.getAttribute('data-rotateX');
    this.socketdata.rotateY = this.image_element.getAttribute('data-rotateY');
    this.socketdata.rotateZ = this.image_element.getAttribute('data-rotateZ');
    socket.emit('c-e:  store_data_attributes', this.socketdata);
    // reset click count
    click_count = 0;
  }
});

$('#grayscale_invert_dragger').draggable({
  containment: 'parent',
  scroll: false,
  start: function start() {
    // hide other draggers
    _stateChange2.default.hideOtherDraggers(this.getAttribute('id'));
    // prepare dom elements for manipulation
    this.image_id = store.getState().selectedImage.id;
    this.image_element = document.getElementById(store.getState().selectedImage.id);
    // prepare the socketdata
    this.socketdata = {};
    this.socketdata.image_id = this.image_id;
    // gather selected_image stats
    this.image_original_filter = this.image_element.style.WebkitFilter;
    // show some grid lines and dragger_info box
    make_grid();
    this.dragger_info = document.getElementById('dragger_info');
    // disallow transitions
    this.classList.remove('dragger_transitions');
  },
  drag: function drag(event, ui) {
    // dynamic percentage defined by the dragger in relation to the inner window
    this.percentage_wide = ui.position.left / _pageSettings2.default.innerWidth;
    this.percentage_high = (_pageSettings2.default.innerHeight - ui.position.top) / _pageSettings2.default.innerHeight;
    // display the percentages in the dragger_info div
    this.dragger_info.textContent = 'grayscale: ' + (this.percentage_high * 100).toFixed(0) + '% invert:' + (this.percentage_wide * 100).toFixed(0) + '%';
    // make the calculated changes and use regex to replace
    this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/invert\(.*?\)/, 'invert(' + this.percentage_wide + ')');
    this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/grayscale\(.*?\)/, 'grayscale(' + this.percentage_high + ')');
    // socket to other clients
    this.socketdata.imageFilter = this.image_element.style.WebkitFilter;
    socket.emit('c-e:  filter_changing', this.socketdata);
  },
  stop: function stop() {
    // remove grid and dragger_info box
    remove_grid();
    // allow transitions
    this.classList.add('dragger_transitions');
    // show draggers
    set_dragger_locations(this.image_id);
    // save to database
    this.socketdata.imageFilename = this.image_element.getAttribute('title');
    socket.emit('c-e:  store_filter', this.socketdata);
    // reset click count
    click_count = 0;
  }
});

$('#blur_brightness_dragger').draggable({
  containment: 'parent',
  scroll: false,
  start: function start() {
    // hide other draggers
    _stateChange2.default.hideOtherDraggers(this.getAttribute('id'));
    // prepare dom elements for manipulation
    this.image_id = store.getState().selectedImage.id;
    this.image_element = document.getElementById(store.getState().selectedImage.id);
    // prepare the socketdata
    this.socketdata = {};
    this.socketdata.image_id = this.image_id;
    // gather selected_image stats
    this.image_original_filter = this.image_element.style.WebkitFilter;
    // show some grid lines and dragger_info box
    make_grid();
    this.dragger_info = document.getElementById('dragger_info');
    // disallow transitions
    this.classList.remove('dragger_transitions');
  },
  drag: function drag(event, ui) {
    // dynamic percentage defined by the dragger in relation to the inner window
    this.percentage_wide = ui.position.left / _pageSettings2.default.innerWidth;
    this.percentage_high = (_pageSettings2.default.innerHeight - ui.position.top) / _pageSettings2.default.innerHeight;
    // display the percentages in the dragger_info div
    this.dragger_info.textContent = 'blur:' + ((1 - this.percentage_high) * _config2.default.blurLevel).toFixed(2) + 'px brightness: ' + (this.percentage_wide * _config2.default.brightnessLevel).toFixed(2);
    // make the calculated changes
    this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/blur\(.*?\)/, 'blur(' + (1 - this.percentage_high) * _config2.default.blurLevel + 'px)');
    this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/brightness\(.*?\)/, 'brightness(' + this.percentage_wide * _config2.default.brightnessLevel + ')');
    // socket to other clients
    this.socketdata.imageFilter = this.image_element.style.WebkitFilter;
    socket.emit('c-e:  filter_changing', this.socketdata);
  },
  stop: function stop() {
    // remove grid and dragger_info box
    remove_grid();
    // allow transitions
    this.classList.add('dragger_transitions');
    // show draggers
    set_dragger_locations(this.image_id);
    // save to database
    this.socketdata.imageFilename = this.image_element.getAttribute('title');
    socket.emit('c-e:  store_filter', this.socketdata);
    // reset click count
    click_count = 0;
  }
});

$('#contrast_saturate_dragger').draggable({
  containment: 'parent',
  scroll: false,
  start: function start() {
    // hide other draggers
    _stateChange2.default.hideOtherDraggers(this.getAttribute('id'));
    // prepare dom elements for manipulation
    this.image_id = store.getState().selectedImage.id;
    this.image_element = document.getElementById(store.getState().selectedImage.id);
    // prepare the socketdata
    this.socketdata = {};
    this.socketdata.image_id = this.image_id;
    // gather selected_image stats
    this.image_original_filter = this.image_element.style.WebkitFilter;
    // show some grid lines and dragger_info box
    make_grid();
    this.dragger_info = document.getElementById('dragger_info');
    // disallow transitions
    this.classList.remove('dragger_transitions');
  },
  drag: function drag(event, ui) {
    // dynamic percentage defined by the dragger in relation to the inner window
    this.percentage_wide = ui.position.left / _pageSettings2.default.innerWidth;
    this.percentage_high = (_pageSettings2.default.innerHeight - ui.position.top) / _pageSettings2.default.innerHeight;
    // display the percentages in the dragger_info div
    this.dragger_info.textContent = 'contrast:' + ((1 - this.percentage_high) * _config2.default.contrastLevel).toFixed(2) + ' saturate: ' + (this.percentage_wide * _config2.default.saturateLevel).toFixed(2);
    // make the calculated changes
    this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/contrast\(.*?\)/, 'contrast(' + (1 - this.percentage_high) * _config2.default.contrastLevel + ')');
    this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/saturate\(.*?\)/, 'saturate(' + this.percentage_wide * _config2.default.saturateLevel + ')');
    // socket to other clients
    this.socketdata.imageFilter = this.image_element.style.WebkitFilter;
    socket.emit('c-e:  filter_changing', this.socketdata);
  },
  stop: function stop() {
    // remove grid and dragger_info box
    remove_grid();
    // allow transitions
    this.classList.add('dragger_transitions');
    // show draggers
    set_dragger_locations(this.image_id);
    // save to database
    this.socketdata.imageFilename = this.image_element.getAttribute('title');
    socket.emit('c-e:  store_filter', this.socketdata);
    // reset click count
    click_count = 0;
  }
});

$('#party_dragger').draggable({
  containment: 'parent',
  scroll: false,
  start: function start() {
    // hide other draggers
    _stateChange2.default.hideOtherDraggers(this.getAttribute('id'));
    // prepare dom elements for manipulation
    this.image_id = store.getState().selectedImage.id;
    this.image_element = document.getElementById(store.getState().selectedImage.id);
    // prepare the socketdata
    this.socketdata = {};
    this.socketdata.image_id = this.image_id;
    // show some grid lines and dragger_info box
    make_grid();
    this.dragger_info = document.getElementById('dragger_info');
    // disallow transitions
    this.classList.remove('dragger_transitions');
  },
  drag: function drag(event, ui) {
    // dynamic percentage defined by the dragger in relation to the inner window
    this.percentage_wide = ui.position.left / _pageSettings2.default.innerWidth;
    this.percentage_high = (_pageSettings2.default.innerHeight - ui.position.top) / _pageSettings2.default.innerHeight;
    // calculate changes
    this.new_opacity = this.percentage_wide;
    this.new_hue_rotate = Math.round(this.percentage_high * 100) * 3.6;
    // display the percentages in the dragger_info div
    this.dragger_info.textContent = 'opacity: ' + Math.round(this.new_opacity * 100) + '%   hue-rotation: ' + this.new_hue_rotate.toFixed(2);
    // make the calculated changes
    this.image_element.style.opacity = this.new_opacity;
    this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/hue-rotate\(.*?\)/, 'hue-rotate(' + this.new_hue_rotate + 'deg)');
    // socket to other clients
    this.socketdata.imageOpacity = this.percentage_wide;
    this.socketdata.imageFilter = this.image_element.style.WebkitFilter;
    socket.emit('c-e:  opacity_changing', this.socketdata);
    socket.emit('c-e:  filter_changing', this.socketdata);
  },
  stop: function stop() {
    // remove grid and dragger_info box
    remove_grid();
    // allow transitions
    this.classList.add('dragger_transitions');
    // show draggers
    set_dragger_locations(this.image_id);
    // save to database
    this.socketdata.imageFilename = this.image_element.getAttribute('title');
    this.socketdata.image_id = this.image_id;
    socket.emit('c-e:  store_opacity', this.socketdata);
    socket.emit('c-e:  store_filter', this.socketdata);
    // reset click count
    click_count = 0;
  }
});

$('#threeD_dragger').draggable({
  containment: 'parent',
  scroll: false,
  start: function start() {
    // hide other draggers
    _stateChange2.default.hideOtherDraggers(this.getAttribute('id'));
    // prepare dom elements for manipulation
    this.image_id = store.getState().selectedImage.id;
    this.image_element = document.getElementById(store.getState().selectedImage.id);

    // prepare the socketdata
    this.socketdata = {};
    this.socketdata.image_id = this.image_id;
    // show some grid lines and dragger_info box
    make_grid();
    this.dragger_info = document.getElementById('dragger_info');
    // disallow transitions
    this.classList.remove('dragger_transitions');
  },
  drag: function drag(event, ui) {
    // dynamic percentage defined by the dragger in relation to the inner window
    this.percentage_wide = ui.position.left / _pageSettings2.default.innerWidth;
    this.percentage_high = (_pageSettings2.default.innerHeight - ui.position.top) / _pageSettings2.default.innerHeight;
    // calculate changes
    this.new_rotate_x = Math.round(this.percentage_high * 100) * 3.6 - 180;
    this.new_rotate_y = Math.round(this.percentage_wide * 100) * 3.6 - 180;

    // display the percentages in the dragger_info div
    this.dragger_info.textContent = 'rotateX: ' + this.new_rotate_x.toFixed(2) + 'deg   rotateY: ' + this.new_rotate_y.toFixed(2) + 'deg';
    // make the calculated changes
    this.image_element.style.transform = this.image_element.style.transform.replace(/rotateX\(.*?\)/, 'rotateX(' + this.new_rotate_x + 'deg)');
    this.image_element.style.transform = this.image_element.style.transform.replace(/rotateY\(.*?\)/, 'rotateY(' + this.new_rotate_y + 'deg)');

    // socket to other clients
    this.socketdata.imageTransform = this.image_element.style.transform;
    socket.emit('c-e:  transforming', this.socketdata);
  },
  stop: function stop() {
    // remove grid and dragger_info box
    remove_grid();
    // allow transitions
    this.classList.add('dragger_transitions');
    // save to database
    this.socketdata.imageFilename = this.image_element.getAttribute('title');
    this.socketdata.image_id = this.image_id;
    socket.emit('c-e:  store_transformed', this.socketdata);
    // store rotate in data-rotateX,Y
    this.image_element.setAttribute('data-rotateX', this.new_rotate_x.toFixed(2));
    this.image_element.setAttribute('data-rotateY', this.new_rotate_y.toFixed(2));
    // show draggers
    set_dragger_locations(this.image_id);

    // send to socket
    this.socketdata.scale = this.image_element.getAttribute('data-scale');
    this.socketdata.angle = this.image_element.getAttribute('data-angle');
    this.socketdata.rotateX = this.image_element.getAttribute('data-rotateX');
    this.socketdata.rotateY = this.image_element.getAttribute('data-rotateY');
    this.socketdata.rotateZ = this.image_element.getAttribute('data-rotateZ');
    socket.emit('c-e:  store_data_attributes', this.socketdata);
    // reset click count
    click_count = 0;
  }
});

// --Set dragger locations

function set_dragger_locations(id) {

  if (id) {
    if (document.getElementById('stretch_dragger_switch').classList.contains('switchon')) {
      set_stretch_dragger_to(id);
    };
    if (document.getElementById('opacity_dragger_switch').classList.contains('switchon')) {
      set_opacity_dragger_to(id);
    };
    if (document.getElementById('rotation_dragger_switch').classList.contains('switchon')) {
      set_rotation_dragger_to(id);
    };
    if (document.getElementById('grayscale_invert_dragger_switch').classList.contains('switchon')) {
      set_grayscale_invert_dragger_to(id);
    };
    if (document.getElementById('blur_brightness_dragger_switch').classList.contains('switchon')) {
      set_blur_brightness_dragger_to(id);
    };
    if (document.getElementById('contrast_saturate_dragger_switch').classList.contains('switchon')) {
      set_contrast_saturate_dragger_to(id);
    };
    if (document.getElementById('threeD_dragger_switch').classList.contains('switchon')) {
      set_threeD_dragger_to(id);
    };
    if (document.getElementById('party_dragger_switch').classList.contains('switchon')) {
      set_party_dragger_to(id);
    };
  };
};

function set_stretch_dragger_to(id) {
  var dragger_element = document.getElementById('stretch_dragger'),
      image_element = document.getElementById(id),

  // get the width and height
  selected_imageWidth = parseInt(image_element.style.width),
      selected_imageHeight = parseInt(image_element.style.height),

  // calculate the dragger location
  selected_imageWidth_percentage = selected_imageWidth / _pageSettings2.default.mainWide,
      selected_imageHeight_percentage = selected_imageHeight / _pageSettings2.default.mainHigh,
      dragger_location_left = selected_imageWidth_percentage * innerWidth,
      dragger_location_top = (1 - selected_imageHeight_percentage) * _pageSettings2.default.innerHeight;

  // set the dragger location
  dragger_element.style.left = dragger_location_left + 'px';
  dragger_element.style.top = dragger_location_top + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  // setTimeout is needed because the dragger will otherwise transition from no selection to selection
  setTimeout(function () {
    dragger_element.classList.add('dragger_transitions');
  }, 0);
};

function set_opacity_dragger_to(id) {
  var dragger_element = document.getElementById('opacity_dragger'),
      image_element = document.getElementById(id),

  // get the opacity percentage: 0-1
  selected_image_opacity = parseInt(image_element.style.opacity * 100) / 100,

  // calculate the dragger location
  dragger_location_left = selected_image_opacity * _pageSettings2.default.innerWidth;

  // set the dragger location
  dragger_element.style.left = dragger_location_left + 'px';
  dragger_element.style.top = _pageSettings2.default.innerHeight / 3 * 2 + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('dragger_transitions');
  }, 0);
};

function set_rotation_dragger_to(id) {
  var dragger_element = document.getElementById('rotation_dragger'),
      image_element = document.getElementById(id),

  // calculate the dragger location
  dragger_location_left = parseFloat(image_element.getAttribute('data-angle') / 360 * _pageSettings2.default.innerWidth),
      dragger_location_top = parseFloat(image_element.getAttribute('data-rotateZ') / 360 * _pageSettings2.default.innerHeight);

  // set the dragger location
  dragger_element.style.left = dragger_location_left + 'px';
  dragger_element.style.top = dragger_location_top + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('dragger_transitions');
  }, 0);
};

function set_grayscale_invert_dragger_to(id) {
  var dragger_element = document.getElementById('grayscale_invert_dragger'),
      image_element = document.getElementById(id),

  // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
  selected_image_filter = image_element.style.WebkitFilter,

  // get the numbers within the grayscale and invert parentheses
  grayscale_Exp = /grayscale\(([^)]+)\)/,
      invert_Exp = /invert\(([^)]+)\)/,
      grayscale_matches = grayscale_Exp.exec(selected_image_filter),
      invert_matches = invert_Exp.exec(selected_image_filter),

  // calculate the dragger location
  dragger_location_top = (1 - parseFloat(grayscale_matches[1])) * _pageSettings2.default.innerHeight,
      dragger_location_left = parseFloat(invert_matches[1]) * _pageSettings2.default.innerWidth;

  // set the dragger location
  dragger_element.style.left = dragger_location_left + 'px';
  dragger_element.style.top = dragger_location_top + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('dragger_transitions');
  }, 0);
};

function set_blur_brightness_dragger_to(id) {
  var dragger_element = document.getElementById('blur_brightness_dragger'),
      image_element = document.getElementById(id),

  // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
  selected_image_filter = image_element.style.WebkitFilter,

  // get the numbers within the blur and brightness parentheses
  blur_Exp = /blur\(([^)]+)\)/,
      brightness_Exp = /brightness\(([^)]+)\)/,
      blur_matches = blur_Exp.exec(selected_image_filter),
      brightness_matches = brightness_Exp.exec(selected_image_filter),

  // calculate the dragger location
  dragger_location_top = parseFloat(blur_matches[1]) * _pageSettings2.default.innerHeight / _config2.default.blurLevel,
      dragger_location_left = parseFloat(brightness_matches[1]) * _pageSettings2.default.innerWidth / _config2.default.brightnessLevel;

  // set the dragger location
  dragger_element.style.left = dragger_location_left + 'px';
  dragger_element.style.top = dragger_location_top + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('dragger_transitions');
  }, 0);
};

function set_contrast_saturate_dragger_to(id) {
  var dragger_element = document.getElementById('contrast_saturate_dragger'),
      image_element = document.getElementById(id),

  // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
  selected_image_filter = image_element.style.WebkitFilter,

  // get the numbers within the contrast and saturate parentheses
  contrast_Exp = /contrast\(([^)]+)\)/,
      saturate_Exp = /saturate\(([^)]+)\)/,
      contrast_matches = contrast_Exp.exec(selected_image_filter),
      saturate_matches = saturate_Exp.exec(selected_image_filter),

  // calculate the dragger location
  dragger_location_top = parseFloat(contrast_matches[1]) * _pageSettings2.default.innerHeight / _config2.default.contrastLevel,
      dragger_location_left = parseFloat(saturate_matches[1]) * _pageSettings2.default.innerWidth / _config2.default.saturateLevel;

  // set the dragger location
  dragger_element.style.left = dragger_location_left + 'px';
  dragger_element.style.top = dragger_location_top + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('dragger_transitions');
  }, 0);
};

function set_party_dragger_to(id) {
  var dragger_element = document.getElementById('party_dragger'),
      image_element = document.getElementById(id),

  // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
  // and opacity percentage: (0-1)
  selected_image_filter = image_element.style.WebkitFilter,
      selected_image_opacity = parseInt(image_element.style.opacity * 100) / 100,

  // get the number within the hue-rotation parentheses
  hue_rotate_Exp = /hue-rotate\(([^)]+)\)/,
      hue_rotate_matches = hue_rotate_Exp.exec(selected_image_filter),

  // calculate the dragger location
  dragger_location_left = selected_image_opacity * _pageSettings2.default.innerWidth,
      dragger_location_top = _pageSettings2.default.innerHeight - parseFloat(hue_rotate_matches[1]) / 360 * _pageSettings2.default.innerHeight;

  // set the dragger location
  dragger_element.style.left = dragger_location_left + 'px';
  dragger_element.style.top = dragger_location_top + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('dragger_transitions');
  }, 0);
};

function set_threeD_dragger_to(id) {
  var dragger_element = document.getElementById('threeD_dragger'),
      image_element = document.getElementById(id),

  // calculate the dragger location
  dragger_location_top = _pageSettings2.default.innerHeight - (180 + parseFloat(image_element.getAttribute('data-rotateX'))) / 360 * _pageSettings2.default.innerHeight,
      dragger_location_left = (180 + parseFloat(image_element.getAttribute('data-rotateY'))) / 360 * _pageSettings2.default.innerWidth;

  // set the dragger location
  dragger_element.style.left = dragger_location_left + 'px';
  dragger_element.style.top = dragger_location_top + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('dragger_transitions');
  }, 0);
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { element: {}, id: '' };
  var action = arguments[1];

  switch (action.type) {
    case "SET_DELETE_TARGET":
      return _extends({}, state, { element: action.payload, id: action.payload.id });
    default:
      return state;
  }
};

;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _redux = __webpack_require__(7);

var _deleteTarget = __webpack_require__(17);

var _deleteTarget2 = _interopRequireDefault(_deleteTarget);

var _selectedImage = __webpack_require__(19);

var _selectedImage2 = _interopRequireDefault(_selectedImage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _redux.combineReducers)({
	selectedImage: _selectedImage2.default,
	deleteTarget: _deleteTarget2.default
});

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { id: '' };
  var action = arguments[1];

  switch (action.type) {
    case "SET_SELECTED_IMAGE":
      return _extends({}, state, { id: action.payload });
    default:
      return state;
  }
};

;

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Symbol_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__getRawTag_js__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__objectToString_js__ = __webpack_require__(24);




/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */] ? __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */].toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__getRawTag_js__["a" /* default */])(value)
    : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__objectToString_js__["a" /* default */])(value);
}

/* harmony default export */ __webpack_exports__["a"] = (baseGetTag);


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/* harmony default export */ __webpack_exports__["a"] = (freeGlobal);

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(9)))

/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__overArg_js__ = __webpack_require__(25);


/** Built-in value references. */
var getPrototype = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__overArg_js__["a" /* default */])(Object.getPrototypeOf, Object);

/* harmony default export */ __webpack_exports__["a"] = (getPrototype);


/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Symbol_js__ = __webpack_require__(2);


/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */] ? __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */].toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/* harmony default export */ __webpack_exports__["a"] = (getRawTag);


/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/* harmony default export */ __webpack_exports__["a"] = (objectToString);


/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* harmony default export */ __webpack_exports__["a"] = (overArg);


/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__freeGlobal_js__ = __webpack_require__(21);


/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = __WEBPACK_IMPORTED_MODULE_0__freeGlobal_js__["a" /* default */] || freeSelf || Function('return this')();

/* harmony default export */ __webpack_exports__["a"] = (root);


/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/* harmony default export */ __webpack_exports__["a"] = (isObjectLike);


/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__compose__ = __webpack_require__(5);
/* harmony export (immutable) */ __webpack_exports__["a"] = applyMiddleware;
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };



/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = __WEBPACK_IMPORTED_MODULE_0__compose__["a" /* default */].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}

/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}

/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__createStore__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash_es_isPlainObject__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_warning__ = __webpack_require__(8);
/* harmony export (immutable) */ __webpack_exports__["a"] = combineReducers;




function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === __WEBPACK_IMPORTED_MODULE_0__createStore__["b" /* ActionTypes */].INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_lodash_es_isPlainObject__["a" /* default */])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });

  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: __WEBPACK_IMPORTED_MODULE_0__createStore__["b" /* ActionTypes */].INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + __WEBPACK_IMPORTED_MODULE_0__createStore__["b" /* ActionTypes */].INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils_warning__["a" /* default */])('No reducer provided for key "' + key + '"');
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  if (process.env.NODE_ENV !== 'production') {
    var unexpectedKeyCache = {};
  }

  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    if (sanityError) {
      throw sanityError;
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils_warning__["a" /* default */])(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(4)))

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(32);


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, module) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ponyfill = __webpack_require__(33);

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var root; /* global window */


if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (true) {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9), __webpack_require__(34)(module)))

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports['default'] = symbolObservablePonyfill;
function symbolObservablePonyfill(root) {
	var result;
	var _Symbol = root.Symbol;

	if (typeof _Symbol === 'function') {
		if (_Symbol.observable) {
			result = _Symbol.observable;
		} else {
			result = _Symbol('observable');
			_Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};

/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = configureStore;

var _redux = __webpack_require__(7);

var _reducers = __webpack_require__(18);

var _reducers2 = _interopRequireDefault(_reducers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function configureStore() {
  // return createStore(reducers, {}, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
  return (0, _redux.createStore)(_reducers2.default, {});
};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  init: function init() {
    var _this = this;

    this.render();

    // add perspective to 3d transforms
    var imagesDiv = document.getElementById('images');

    imagesDiv.style.width = window.innerWidth + 'px';
    imagesDiv.style.height = window.innerHeight + 'px';
    imagesDiv.style.webkitPerspective = '500px';
    imagesDiv.style.webkitPerspectiveOriginX = '50%';
    imagesDiv.style.webkitPerspectiveOriginY = '50%';

    // listen for resize and orientation changes and make adjustments
    window.addEventListener('resize', function () {
      _this.render();
    }, false);
  },

  render: function render() {
    var navToggleDiv = document.getElementById('navigation_toggle_button_container'),
        closeInfoDiv = document.getElementById('close_info_container'),
        appInfoDiv = document.getElementById('app_info'),
        closeExploreDiv = document.getElementById('close_explore_container');

    // retrieve dragger size from css
    this.draggerWidth = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).width);
    this.draggerHeight = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).height);

    // retrieve window size; calculate dragger limit box size
    this.mainWide = window.innerWidth;
    this.mainHigh = window.innerHeight;

    this.innerWidth = this.mainWide - this.draggerWidth;
    this.innerHeight = this.mainHigh - this.draggerHeight;

    // set wrapper size; (css vh and vw were not working with mobile safari)
    document.getElementById('wrapper').style.width = this.mainWide + 'px';
    document.getElementById('wrapper').style.height = this.mainHigh + 'px';

    // position the navigation_toggle_button_container on the bottom right
    navToggleDiv.style.left = this.mainWide - parseFloat(window.getComputedStyle(navToggleDiv).width) + 'px';
    navToggleDiv.style.top = this.mainHigh - parseFloat(window.getComputedStyle(navToggleDiv).height) + 'px';

    // set app_info height
    document.getElementById('app_info').style.height = this.innerHeight * 0.9 + 'px';

    // set explore_container height
    document.getElementById('explore_container').style.height = this.innerHeight * 0.9 + 'px';

    // set position and size of the close_info container divs
    closeInfoDiv.style.width = parseFloat(window.getComputedStyle(appInfoDiv).height) * 0.1 + 'px';
    closeInfoDiv.style.height = parseFloat(window.getComputedStyle(appInfoDiv).height) * 0.1 + 'px';
    closeInfoDiv.style.top = this.mainHigh * 0.05 + (parseFloat(window.getComputedStyle(appInfoDiv).height) - parseInt(closeInfoDiv.style.height)) + 'px';

    // set position and size of the x_icon container divs
    closeExploreDiv.style.width = parseFloat(window.getComputedStyle(appInfoDiv).height) * 0.1 + 'px';
    closeExploreDiv.style.height = parseFloat(window.getComputedStyle(appInfoDiv).height) * 0.1 + 'px';
    closeExploreDiv.style.top = this.mainHigh * 0.05 + (parseFloat(window.getComputedStyle(appInfoDiv).height) - parseInt(closeInfoDiv.style.height)) + 'px';
  }
};

/***/ })
/******/ ]);