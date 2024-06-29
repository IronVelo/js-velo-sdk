(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./signup", "./login", "./errors"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./signup"), require("./login"), require("./errors"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.signup, global.login, global.errors);
    global.index = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _signup, _login, _errors) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  var _exportNames = {
    SignupFlow: true,
    LoginFlow: true
  };
  Object.defineProperty(_exports, "LoginFlow", {
    enumerable: true,
    get: function get() {
      return _login["default"];
    }
  });
  Object.defineProperty(_exports, "SignupFlow", {
    enumerable: true,
    get: function get() {
      return _signup["default"];
    }
  });
  _signup = _interopRequireDefault(_signup);
  _login = _interopRequireDefault(_login);
  Object.keys(_errors).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (key in _exports && _exports[key] === _errors[key]) return;
    Object.defineProperty(_exports, key, {
      enumerable: true,
      get: function get() {
        return _errors[key];
      }
    });
  });
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
});