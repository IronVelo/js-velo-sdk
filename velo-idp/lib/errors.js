function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.errors = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.UsernameExistsError = _exports.PreconditionFailure = _exports.MfaNotSetUpError = _exports.InvalidStateError = _exports.InvalidArguments = _exports.InsufficientPassword = _exports.HttpError = void 0;
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
  function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
  function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
  function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
  function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
  function _isNativeFunction(fn) { try { return Function.toString.call(fn).indexOf("[native code]") !== -1; } catch (e) { return typeof fn === "function"; } }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
  /**
   * Error returned when the state of the signup flow is invalid for the current operation.
   *
   * @extends {Error}
   * @property {string} message - The error message.
   * @property {string} name - The error name.
   */
  var InvalidStateError = _exports.InvalidStateError = /*#__PURE__*/function (_Error) {
    /**
     * Create a new InvalidStateError.
     *
     * @param {string} message The error message.
     */
    function InvalidStateError(message) {
      var _this;
      _classCallCheck(this, InvalidStateError);
      _this = _callSuper(this, InvalidStateError, [message]);
      _this.name = 'InvalidStateError';
      return _this;
    }
    _inherits(InvalidStateError, _Error);
    return _createClass(InvalidStateError);
  }( /*#__PURE__*/_wrapNativeSuper(Error));
  /**
   * Error returned when a username already exists.
   *
   * @extends {Error}
   * @property {string} message - The error message.
   * @property {string} name - The error name.
   */
  var UsernameExistsError = _exports.UsernameExistsError = /*#__PURE__*/function (_Error2) {
    /**
     * Create a new UsernameExistsError.
     *
     * @param {string} message The error message.
     */
    function UsernameExistsError(message) {
      var _this2;
      _classCallCheck(this, UsernameExistsError);
      _this2 = _callSuper(this, UsernameExistsError, [message]);
      _this2.name = 'UsernameExistsError';
      return _this2;
    }
    _inherits(UsernameExistsError, _Error2);
    return _createClass(UsernameExistsError);
  }( /*#__PURE__*/_wrapNativeSuper(Error));
  /**
   * Error returned when a precondition fails (412).
   *
   * Precondition failures happen from grossly illegal inputs, or permit preconditions. Permit preconditions include
   * things such as their expiration being reached (which is most common).
   *
   * The purpose of expirations isn't preventing replay attacks, as permits are single use, but just an additional layer
   * of security.
   *
   * Encountered:
   * - The permit has expired.
   * - Maximum attempts have been reached.
   *
   * These errors are meant to be opaque to prevent leaking information about the system, the message is always the same.
   * The contents of the error also do not impact the state in any way, if you ever receive this error you will need to
   * restart the flow.
   *
   * @extends {Error}
   * @property {string} message - The error message.
   * @property {string} name - The error name.
   */
  var PreconditionFailure = _exports.PreconditionFailure = /*#__PURE__*/function (_Error3) {
    /**
     * Create a new PreconditionFailedError.
     *
     * Precondition failures are meant to be opaque to prevent leaking information about the system.
     */
    function PreconditionFailure() {
      var _this3;
      _classCallCheck(this, PreconditionFailure);
      _this3 = _callSuper(this, PreconditionFailure, ['Precondition failed.']);
      _this3.name = 'PreconditionFailedError';
      return _this3;
    }
    _inherits(PreconditionFailure, _Error3);
    return _createClass(PreconditionFailure);
  }( /*#__PURE__*/_wrapNativeSuper(Error));
  /**
   * Error returned when an HTTP request fails.
   *
   * @extends {Error}
   * @property {string} message - The error message.
   * @property {string} name - The error name.
   * @property {number} status - The HTTP status code.
   */
  var HttpError = _exports.HttpError = /*#__PURE__*/function (_Error4) {
    /**
     * Create a new HttpError.
     *
     * @param {number} status The HTTP status code.
     */
    function HttpError(status) {
      var _this4;
      _classCallCheck(this, HttpError);
      _this4 = _callSuper(this, HttpError, ['HttpError status: ' + status]);
      _this4.name = 'HttpError';
      _this4.status = status;
      return _this4;
    }
    _inherits(HttpError, _Error4);
    return _createClass(HttpError);
  }( /*#__PURE__*/_wrapNativeSuper(Error));
  /**
   * @typedef {
   *     "TooFewCharacters"  |
   *     "TooManyCharacters" |
   *     "NeedsSpecial"      |
   *     "NeedsNumeric"      |
   *     "NeedsCapital"      |
   *     "NeedsLowercase"    |
   *     "IllegalCharacter"
   * } InsufficientPasswordVariant
   */
  /**
   * Error returned when a password is insufficiently complex.
   *
   * @property {InsufficientPasswordVariant} variant - How the password is insufficiently complex.
   * @property {number} [value] - The associated value of the error, this is only included with the
   *                              "TooFewCharacters" and "TooManyCharacters" variants.
   *
   * @extends {Error}
   */
  var InsufficientPassword = _exports.InsufficientPassword = /*#__PURE__*/function (_Error5) {
    /**
     * Create a new PasswordInvalidError.
     * @param {InsufficientPasswordVariant} variant
     * @param {number} [value]
     */
    function InsufficientPassword(variant, value) {
      var _this5;
      _classCallCheck(this, InsufficientPassword);
      _this5 = _callSuper(this, InsufficientPassword, ["Password invalid: ".concat(variant).concat(value ? ": ".concat(value) : '')]);
      _this5.name = 'InsufficientPassword';
      _this5.variant = variant;
      _this5.value = value;
      return _this5;
    }
    _inherits(InsufficientPassword, _Error5);
    return _createClass(InsufficientPassword);
  }( /*#__PURE__*/_wrapNativeSuper(Error));
  /**
   * Error returned when the arguments provided to a function are invalid.
   *
   * @extends {Error}
   * @property {string} message - The error message.
   */
  var InvalidArguments = _exports.InvalidArguments = /*#__PURE__*/function (_Error6) {
    /**
     * Create a new InvalidArguments error.
     *
     * @param {string} message The error message.
     */
    function InvalidArguments(message) {
      var _this6;
      _classCallCheck(this, InvalidArguments);
      _this6 = _callSuper(this, InvalidArguments, [message]);
      _this6.name = 'InvalidArguments';
      return _this6;
    }
    _inherits(InvalidArguments, _Error6);
    return _createClass(InvalidArguments);
  }( /*#__PURE__*/_wrapNativeSuper(Error));
  /**
   * Error returned when the MFA type has not been set up by the user.
   * @property {string} message - The error message.
   * @property {MfaType} kind - The kind of MFA that is not set up.
   * @extends {Error}
   */
  var MfaNotSetUpError = _exports.MfaNotSetUpError = /*#__PURE__*/function (_Error7) {
    /**
     * Create a new MfaNotSetUpError.
     *
     * @param {MfaType} kind The kind of MFA that is not set up.
     */
    function MfaNotSetUpError(kind) {
      var _this7;
      _classCallCheck(this, MfaNotSetUpError);
      _this7 = _callSuper(this, MfaNotSetUpError, ["MFA type ".concat(kind, " not set up.")]);
      _this7.name = 'MfaNotSetUpError';
      _this7.kind = kind;
      return _this7;
    }
    _inherits(MfaNotSetUpError, _Error7);
    return _createClass(MfaNotSetUpError);
  }( /*#__PURE__*/_wrapNativeSuper(Error));
});