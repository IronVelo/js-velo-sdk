function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./utils", "./errors"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./utils"), require("./errors"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.utils, global.errors);
    global.signup = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _utils, _errors) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = void 0;
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
  function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
  function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  var STATES = {
    INIT: _utils.INIT_STATE,
    PASSWORD: 'password',
    SETUP_FIRST_MFA: 'setup_first_mfa',
    SETUP_MFA_OR_ISSUE_TOKEN: 'setup_mfa_or_issue_token',
    VERIFY_TOTP: 'verify_totp',
    VERIFY_PLAIN_OTP: 'verify_plain_otp',
    TERMINAL: ''
  };

  /**
   * @class SignupFlow
   * @classdesc A class that provides a high-level interface for the signup API.
   *
   * @property {Array<number> | null} permit The current permit.
   * @property {string} state The current state of the signup flow.
   * @property {Fetcher} fetch The `Fetcher` instance to use for requests.
   *
   * @extends {Flow}
   *
   * @example
   * // Establish a new SignupFlow
   * let signup_flow = new SignupFlow("https://some-url-to-velo-idp.com");
   *
   * // Say hello, requesting a username
   * try { await signup_flow.helloSignup("username"); } catch (e) {
   *     if (e instanceof UsernameExistsError) {
   *         console.log("Username already exists.");
   *     }
   *     return;
   * };
   *
   * // Set the password
   * try {
   *     await signup_flow.setPassword("Password123!");
   * } catch (e) {
   *     if (e instanceof InsufficientPassword) {
   *         console.log(`Try a better pass, reason: ${e.variant}`);
   *         return;
   *     } else if (e instanceof PreconditionFailedError) {
   *         console.log("Permit expired. Start over");
   *         return;
   *     }
   * };
   *
   * // Set up our first MFA method, TOTP is always best
   * const qr_code = await signup_flow.setupTotp();
   * // display the QR code to the user, so they can scan it ...
   *
   * // Verify the TOTP code
   * if (await signup_flow.verifyTotp("12345678")) {
   *     console.log("TOTP verified!");
   * } else {
   *     console.log("TOTP failed verification.");
   *     // user should retry, they have 5 attempts by default
   *     return;
   * }
   *
   * // Setup another form of MFA, SMS OTP
   * await signup_flow.setupSmsOtp("5555555555");
   *
   * // Verify the SMS OTP
   * if (await signup_flow.verifyOtp("111111")) {
   *     console.log("SMS OTP verified!");
   * } else {
   *     console.log("SMS OTP failed verification.");
   *     // user should retry, they have 5 attempts by default
   *     return;
   * }
   *
   * // At any point after the first MFA method we could have issued
   * // a token. We can set up Email as another MFA method, but we'll
   * // just finalize the signup process here.
   * const token = await signup_flow.issueToken();
   *
   * // now our signup process is complete, and we are logged in with
   * // the token.
   */
  var SignupFlow = _exports["default"] = /*#__PURE__*/function (_Flow) {
    /**
     * Create a new SignupFlow instance.
     *
     * @param {string} [baseUrl] The base URL for the Velo API.
     * @param {Fetcher} [fetch] The `Fetcher` instance to use for requests. The endpoint for the fetcher should be
     * the base URL + '/signup'.
     *
     * @throws {InvalidArguments} If both `baseUrl` and `fetch` are not provided.
     */
    function SignupFlow(baseUrl, fetch) {
      _classCallCheck(this, SignupFlow);
      return _callSuper(this, SignupFlow, ['/signup', 'SignupFlow', baseUrl, fetch]);
    }

    /**
     * Start the signup process by sending the username.
     *
     * ## Transitions To:
     *
     * - [Set Password]{@link SignupFlow.setPassword} - If the username is available, otherwise an error is thrown.
     *
     * @param {string} username The username to sign up with.
     * @returns {Promise<void>}
     *
     * @throws {UsernameExistsError} If the username already exists.
     * @throws {HttpError} If the HTTP request fails.
     *
     * @example
     * let flow = new SignupFlow("https://example.com");
     *
     * // Say hello, requesting a username
     * flow.hello("username").then(() => {
     *     // the flow has been initialized,
     *     // and the username is reserved.
     *     console.log("username is available!");
     * }.catch((e) => {
     *     if (e instanceof UsernameExistsError) {
     *         // this is a very quick check, try a
     *         // different username.
     *         console.log("Username already exists.");
     *     }
     *     // other errors are possible but in practice
     *     // fair to consider infallible.
     *     console.error(e);
     * });
     *
     */
    _inherits(SignupFlow, _Flow);
    return _createClass(SignupFlow, [{
      key: "hello",
      value: (function () {
        var _hello = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(username) {
          var response, data;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.fetch.post({
                  args: {
                    hello_signup: {
                      username: username
                    }
                  }
                });
              case 2:
                response = _context.sent;
                _context.next = 5;
                return response.json();
              case 5:
                data = _context.sent;
                if (!(data[0] !== null)) {
                  _context.next = 10;
                  break;
                }
                throw new _errors.UsernameExistsError('Username already exists.');
              case 10:
                this.permit = data[1];
                this.state = STATES.PASSWORD;
              case 12:
              case "end":
                return _context.stop();
            }
          }, _callee, this);
        }));
        function hello(_x) {
          return _hello.apply(this, arguments);
        }
        return hello;
      }()
      /**
       * Set the password for the user.
       *
       * ## Transitions To:
       *
       * - [Setup TOTP]{@link SignupFlow.setupTotp}
       * | [Setup SMS OTP]{@link SignupFlow.setupSmsOtp}
       * | [Setup Email OTP]{@link SignupFlow.setupEmailOtp} - If the password is sufficiently complex.
       * - [Set Password]{@link SignupFlow.setPassword} - If the password is insufficiently complex the user should
       * be prompted to enter a new password. See {@link InsufficientPassword} for details on the requirements.
       *
       * ## Transitioned From:
       *
       * - [Hello]{@link SignupFlow.hello} - If the username is available.
       * - [Set Password]{@link SignupFlow.setPassword} - If the password was insufficiently complex.
       *
       * @param {string} password The password to set.
       * @returns {Promise<void>}
       *
       * @throws {InvalidStateError} If the current state is invalid for this operation.
       * @throws {InsufficientPassword} If the password is insufficiently complex.
       * @throws {PreconditionFailure} If the permit from `helloSignup` has expired.
       * @throws {HttpError} If the HTTP request fails.
       *
       * @example
       * let flow = new SignupFlow("https://example.com");
       *
       * await flow.hello("username").catch((e) => {
       *      // ... handle error, see hello docs
       * });
       *
       * // Set the password
       * flow.setPassword("Password123!").then(() => {
       *     // the password is sufficiently complex
       *     // and now you can set up MFA
       * }).catch((e) => {
       *     if (e instanceof InsufficientPassword) {
       *         // the password is insufficiently complex,
       *         // the reason is in e.variant
       *         console.log(`Try a better pass, reason: ${e.variant}`);
       *     } else if (e instanceof PreconditionFailedError) {
       *         // the permit has expired, you need to start over
       *         console.log("Permit expired. Start over");
       *     }
       *     // other errors are possible but practically infallible.
       *     return;
       * });
       */
      )
    }, {
      key: "setPassword",
      value: (function () {
        var _setPassword = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(password) {
          var response, data;
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                this._checkState(STATES.PASSWORD, 'Invalid state for setting password.');
                _context2.next = 3;
                return this._fetch_with_permit({
                  password: {
                    password: password
                  }
                });
              case 3:
                response = _context2.sent;
                _context2.next = 6;
                return response.json();
              case 6:
                data = _context2.sent;
                // make sure we update the permit prior to possibly throwing so that the user can retry
                this.permit = data[1];
                if (!(data[0] !== null)) {
                  _context2.next = 15;
                  break;
                }
                _context2.t0 = Object.keys(data[0].invalid_password)[0];
                _context2.next = _context2.t0 === 'TooFewChars' ? 12 : _context2.t0 === 'TooManyChars' ? 13 : 14;
                break;
              case 12:
                throw new _errors.InsufficientPassword('TooFewCharacters', data[0].invalid_password['TooFewChars']);
              case 13:
                throw new _errors.InsufficientPassword('TooManyCharacters', data[0].invalid_password['TooManyChars']);
              case 14:
                throw new _errors.InsufficientPassword(Object.keys(data[0].invalid_password)[0]);
              case 15:
                this.state = STATES.SETUP_FIRST_MFA;
              case 16:
              case "end":
                return _context2.stop();
            }
          }, _callee2, this);
        }));
        function setPassword(_x2) {
          return _setPassword.apply(this, arguments);
        }
        return setPassword;
      }()
      /**
       * Setup TOTP as an MFA method.
       *
       * ## Transitions To:
       *
       * - [Verify TOTP]{@link SignupFlow.verifyTotp} - To verify that the users authenticator is set up correctly.
       *
       * ## Transitioned From:
       *
       * - [Set Password]{@link SignupFlow.setPassword} - If the password was sufficiently complex.
       * - {@link SignupFlow.verifyOtp|Verify OTP} - If the OTP was valid (for setting up SMS or Email OTP).
       *
       * @returns {Promise<string>} The url which you should display in a QR code for the user to scan.
       *
       * @throws {InvalidStateError} If the current state is invalid for this operation.
       * @throws {PreconditionFailure} If the permit from either `setPassword` or any verification state has expired.
       * @throws {HttpError} If the HTTP request fails.
       *
       * @example
       * let flow = new SignupFlow("https://example.com");
       *
       * await flow.hello("username").catch((e) => {
       *     // ... handle error, see hello docs
       * });
       *
       * await flow.setPassword("Password123!").catch((e) => {
       *     // ... handle error, see setPassword docs
       * });
       *
       * // Set up TOTP
       * const url = await flow.setupTotp();
       *
       * // generate the qr code with a library like `qrcode`
       * const qr_code = await QRCode.toDataURL(url);
       *
       * // display to user and have them scan it and enter the code
       * // verify the code with verifyTotp ...
       */
      )
    }, {
      key: "setupTotp",
      value: (function () {
        var _setupTotp = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
          var response, data;
          return _regeneratorRuntime().wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                this._checkState([STATES.SETUP_FIRST_MFA, STATES.SETUP_MFA_OR_ISSUE_TOKEN], 'Invalid state for TOTP setup.');
                _context3.next = 3;
                return this._fetch_with_permit(_defineProperty({}, this.state, {
                  kind: {
                    Totp: null
                  }
                }));
              case 3:
                response = _context3.sent;
                _context3.next = 6;
                return response.json();
              case 6:
                data = _context3.sent;
                this.permit = data[1];
                this.state = STATES.VERIFY_TOTP;
                return _context3.abrupt("return", data[0].setup_totp);
              case 10:
              case "end":
                return _context3.stop();
            }
          }, _callee3, this);
        }));
        function setupTotp() {
          return _setupTotp.apply(this, arguments);
        }
        return setupTotp;
      }()
      /**
       * Verify the TOTP code.
       *
       * ## Transitions To:
       *
       * - [Issue Token]{@link SignupFlow.issueToken}
       * | [Setup SMS OTP]{@link SignupFlow.setupSmsOtp}
       * | [Setup Email OTP]{@link SignupFlow.setupEmailOtp} - If the TOTP code is valid the user can either finalize the
       * signup process or set up another MFA method.
       * - [Verify TOTP]{@link SignupFlow.verifyTotp} - If the TOTP code is invalid, the user should be prompted to retry,
       * by default, they have 5 attempts.
       *
       * ## Transitioned From:
       *
       * - [Setup TOTP]{@link SignupFlow.setupTotp}
       * - [Verify TOTP]{@link SignupFlow.verifyTotp} - If the TOTP code was invalid the user should be prompted to retry.
       *
       * @param {string} totp The 8 digit TOTP code to verify.
       * @returns {Promise<boolean>} A promise that resolves to true if the TOTP code is valid, false otherwise.
       * If false, the user should be prompted to enter the code again.
       *
       * @throws {InvalidStateError} If the current state is invalid (the previous state was not `setupTotp`).
       * @throws {PreconditionFailure} If the permit from `setupTotp` has expired or the maximum attempts have been
       * reached.
       * @throws {HttpError} If the HTTP request fails.
       *
       * @example
       * let flow = new SignupFlow("https://example.com");
       *
       * await flow.hello("username").catch((e) => {
       *     // ... handle error, see hello docs
       * });
       *
       * await flow.setPassword("Password123!").catch((e) => {
       *     // ... handle error, see setPassword docs
       * });
       *
       * const qr_code = await flow.setupTotp();
       * // display to user and have them scan it and enter the code
       *
       * let guess = "12345678";
       *
       * while (!await flow.verifyTotp(guess)) {
       *     // prompt user to enter the code again
       * };
       *
       * // now you can set up another MFA method or issue a token
       */
      )
    }, {
      key: "verifyTotp",
      value: (function () {
        var _verifyTotp = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(totp) {
          var response, data;
          return _regeneratorRuntime().wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
              case 0:
                this._checkState(STATES.VERIFY_TOTP, 'Invalid state for TOTP verification.');
                _context4.next = 3;
                return this._fetch_with_permit({
                  verify_totp: {
                    guess: totp
                  }
                });
              case 3:
                response = _context4.sent;
                _context4.next = 6;
                return response.json();
              case 6:
                data = _context4.sent;
                this.permit = data[1];
                if (!data[0].verify_totp) {
                  _context4.next = 13;
                  break;
                }
                this.state = STATES.SETUP_MFA_OR_ISSUE_TOKEN;
                return _context4.abrupt("return", true);
              case 13:
                return _context4.abrupt("return", false);
              case 14:
              case "end":
                return _context4.stop();
            }
          }, _callee4, this);
        }));
        function verifyTotp(_x3) {
          return _verifyTotp.apply(this, arguments);
        }
        return verifyTotp;
      }()
      /**
       * @typedef {Object} PlainOtpKind
       * @property {{Email: string} | {Phone: string}} kind
       */
      /**
       * @typedef {"setup_mfa_or_issue_token" | "setup_first_mfa"} SetupPlainOtpState
       */
      /**
       * Setup plain OTP as an MFA method. (SMS or Email). This is not meant to be used directly.
       *
       * @param {{[SetupPlainOtpState]: PlainOtpKind}} args The arguments for the setup.
       * @returns {Promise<void>}
       * @private
       */
      )
    }, {
      key: "_setup_plain_otp",
      value: (function () {
        var _setup_plain_otp2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(args) {
          var response, data;
          return _regeneratorRuntime().wrap(function _callee5$(_context5) {
            while (1) switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this._fetch_with_permit(args);
              case 2:
                response = _context5.sent;
                _context5.next = 5;
                return response.json();
              case 5:
                data = _context5.sent;
                this.permit = data[1];
                this.state = STATES.VERIFY_PLAIN_OTP;
              case 8:
              case "end":
                return _context5.stop();
            }
          }, _callee5, this);
        }));
        function _setup_plain_otp(_x4) {
          return _setup_plain_otp2.apply(this, arguments);
        }
        return _setup_plain_otp;
      }()
      /**
       * Setup SMS OTP as an MFA method.
       *
       * ## Transitions To:
       *
       * - [Verify OTP]{@link SignupFlow.verifyOtp} - To verify that the SMS OTP is set up correctly.
       *
       * ## Transitioned From:
       *
       * - [Set Password]{@link SignupFlow.setPassword} - If the password was sufficiently complex.
       * - [Verify OTP]{@link SignupFlow.verifyOtp} - If the OTP was valid (for setting up Email OTP).
       * - [Verify TOTP]{@link SignupFlow.verifyTotp} - If the TOTP was valid.
       *
       * @param {string} phoneNumber The phone number to associate with the SMS OTP.
       * @returns {Promise<void>}
       *
       * @throws {InvalidStateError} If the current state is invalid for this operation.
       * @throws {PreconditionFailure} If the permit from either `setPassword` or any verification state has expired.
       * @throws {HttpError} If the HTTP request fails.
       *
       * @example
       * let flow = new SignupFlow("https://example.com");
       *
       * await flow.hello("username").catch((e) => {
       *     // ... handle error, see hello docs
       * });
       *
       * await flow.setPassword("Password123!").catch((e) => {
       *     // ... handle error, see setPassword docs
       * });
       *
       * flow.setupSmsOtp("5555555555").then(() => {
       *     // the SMS OTP is set up, now verify it
       *     let guess = "111111";
       *     while (!await flow.verifyOtp(guess)) {
       *         // prompt user to enter the code again
       *         // they have 5 attempts by default
       *     };
       *     // now you can set up another MFA method or issue a token
       * }).catch((e) => {
       *     if (e instanceof PreconditionFailedError) {
       *         // the permit has expired, you need to start over
       *         console.log("Permit expired. Start over");
       *     }
       *     // other errors are possible but practically infallible.
       *     return;
       * });
       */
      )
    }, {
      key: "setupSmsOtp",
      value: function setupSmsOtp(phoneNumber) {
        this._checkState([STATES.SETUP_FIRST_MFA, STATES.SETUP_MFA_OR_ISSUE_TOKEN], 'Invalid state for SMS OTP setup.');
        return this._setup_plain_otp(_defineProperty({}, this.state, {
          kind: {
            Phone: phoneNumber
          }
        }));
      }

      /**
       * Setup Email OTP as an MFA method.
       *
       * ## Transitions To:
       *
       * - [Verify OTP]{@link SignupFlow.verifyOtp} - To verify that the Email OTP is set up correctly.
       *
       * ## Transitioned From:
       *
       * - [Set Password]{@link SignupFlow.setPassword} - If the password was sufficiently complex.
       * - [Verify OTP]{@link SignupFlow.verifyOtp} - If the OTP was valid (for setting up SMS OTP).
       * - [Verify TOTP]{@link SignupFlow.verifyTotp} - If the TOTP was valid.
       *
       * @param {string} email The email address to associate with the Email OTP.
       * @returns {Promise<void>}
       *
       * @throws {InvalidStateError} If the current state is invalid for this operation.
       * @throws {PreconditionFailure} If the permit from either `setPassword` or any verification state has expired.
       * @throws {HttpError} If the HTTP request fails.
       *
       * @example
       * let flow = new SignupFlow("https://example.com");
       *
       * await flow.hello("username").catch((e) => {
       *     // ... handle error, see hello docs
       * });
       *
       * await flow.setPassword("Password123!").catch((e) => {
       *     // ... handle error, see setPassword docs
       * });
       *
       * flow.setupEmailOtp("example@email.com").then(() => {
       *     // the email OTP is set up, now verify it
       *     let guess = "111111";
       *     while (!await flow.verifyOtp(guess)) {
       *         // prompt user to enter the code again
       *         // they have 5 attempts by default
       *     };
       *     // now you can set up another MFA method or issue a token
       * }).catch((e) => {
       *     if (e instanceof PreconditionFailedError) {
       *         // the permit has expired, you need to start over
       *         console.log("Permit expired. Start over");
       *     }
       *     // other errors are possible but practically infallible.
       *     return;
       * });
       */
    }, {
      key: "setupEmailOtp",
      value: function setupEmailOtp(email) {
        this._checkState([STATES.SETUP_FIRST_MFA, STATES.SETUP_MFA_OR_ISSUE_TOKEN], 'Invalid state for Email OTP setup.');
        return this._setup_plain_otp(_defineProperty({}, this.state, {
          kind: {
            Email: email
          }
        }));
      }

      /**
       * Verify the OTP for either SMS or Email.
       *
       * ## Transitions To:
       *
       * [Issue Token]{@link SignupFlow.issueToken}
       * | [Setup SMS OTP]{@link SignupFlow.setupSmsOtp}
       * | [Setup Email OTP]{@link SignupFlow.setupEmailOtp}
       * | [Setup TOTP]{@link SignupFlow.setupTotp} - If the OTP is valid the user can either finalize the signup process,
       * This cannot transition to any setup state that it has already transitioned from.
       *
       * ## Transitioned From:
       *
       * - [Setup SMS OTP]{@link SignupFlow.setupSmsOtp}
       * - [Setup Email OTP]{@link SignupFlow.setupEmailOtp}
       * - [Verify OTP]{@link SignupFlow.verifyOtp} - If the OTP was invalid the user should be prompted to retry. They
       * have 5 attempts by default.
       *
       * @param {string} otp The OTP to verify.
       * @returns {Promise<boolean>} A promise that resolves to true if the OTP is valid, false otherwise.
       * If the OTP is invalid, the user should be prompted to enter the code again.
       *
       * @throws {InvalidStateError} If the current state is invalid (the previous state was not `setupSmsOtp` or
       * `setupEmailOtp`).
       * @throws {PreconditionFailure} If the permit from `setupSmsOtp` or `setupEmailOtp` has expired or the maximum
       * attempts have been reached.
       * @throws {HttpError} If the HTTP request fails.
       *
       * @example
       * let flow = new SignupFlow("https://example.com");
       *
       * await flow.hello("username").catch((e) => {
       *     // ... handle error, see hello docs
       * });
       *
       * await flow.setPassword("Password123!").catch((e) => {
       *     // ... handle error, see setPassword docs
       * });
       *
       * // setup email or sms otp (both use the same verifyOtp method)
       * await flow.setupEmailOtp("example@email.com");
       *
       * let guess = "111111";
       *
       * while (!await flow.verifyOtp(guess)) {
       *     // prompt user to enter the code again
       *     // they have 5 attempts by default
       * };
       *
       * // now you can set up another MFA method or issue a token
       */
    }, {
      key: "verifyOtp",
      value: (function () {
        var _verifyOtp = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(otp) {
          var response, data;
          return _regeneratorRuntime().wrap(function _callee6$(_context6) {
            while (1) switch (_context6.prev = _context6.next) {
              case 0:
                this._checkState(STATES.VERIFY_PLAIN_OTP, 'Invalid state for OTP verification.');
                _context6.next = 3;
                return this._fetch_with_permit({
                  verify_plain_otp: {
                    guess: otp
                  }
                });
              case 3:
                response = _context6.sent;
                _context6.next = 6;
                return response.json();
              case 6:
                data = _context6.sent;
                this.permit = data[1];

                // We don't need to check if maybe_retry_plain is true, you can think of it as a simple flag, if it is there,
                // the user should be prompted to enter the code again.
                if (!(data[0] === null)) {
                  _context6.next = 11;
                  break;
                }
                this.state = STATES.SETUP_MFA_OR_ISSUE_TOKEN;
                return _context6.abrupt("return", true);
              case 11:
                return _context6.abrupt("return", false);
              case 12:
              case "end":
                return _context6.stop();
            }
          }, _callee6, this);
        }));
        function verifyOtp(_x5) {
          return _verifyOtp.apply(this, arguments);
        }
        return verifyOtp;
      }()
      /**
       * Issue a token for the user, finalizing the signup process.
       *
       * If this is not ever called, the signup process so far will have 0 impact on the system, like it never happened.
       *
       * ## Transitions To:
       *
       * - TERMINAL - The signup process is complete.
       *
       * ## Transitioned From:
       *
       * - [Verify OTP]{@link SignupFlow.verifyOtp} - If the OTP was valid.
       * - [Verify TOTP]{@link SignupFlow.verifyTotp} - If the TOTP was valid.
       *
       * @returns {Promise<Array<number>>} A promise that resolves to the issued token.
       *
       * @throws {InvalidStateError} If the current state is invalid for this operation (the previous state was not
       * an MFA verification state).
       * @throws {HttpError} If the HTTP request fails.
       * @throws {PreconditionFailure} If the permit has expired.
       */
      )
    }, {
      key: "issueToken",
      value: (function () {
        var _issueToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
          var response, data;
          return _regeneratorRuntime().wrap(function _callee7$(_context7) {
            while (1) switch (_context7.prev = _context7.next) {
              case 0:
                this._checkState(STATES.SETUP_MFA_OR_ISSUE_TOKEN, 'Invalid state for issuing token.');
                _context7.next = 3;
                return this._fetch_with_permit({
                  setup_mfa_or_issue_token: {
                    kind: null
                  }
                });
              case 3:
                response = _context7.sent;
                _context7.next = 6;
                return response.json();
              case 6:
                data = _context7.sent;
                this.state = STATES.TERMINAL;
                return _context7.abrupt("return", data[0]);
              case 9:
              case "end":
                return _context7.stop();
            }
          }, _callee7, this);
        }));
        function issueToken() {
          return _issueToken.apply(this, arguments);
        }
        return issueToken;
      }())
    }]);
  }(_utils.Flow);
});