(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./errors"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./errors"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.errors);
    global.utils = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _errors) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.INIT_STATE = _exports.Flow = _exports.Fetcher = void 0;
  function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
  function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
  var INIT_STATE = _exports.INIT_STATE = 'init';

  /**
   * @typedef {Promise<Response>} ResponsePromise
   */

  /**
   * @classdesc A class for making requests to a Velo API.
   * @class
   *
   * All endpoints for the Velo API handle permits and errors in a uniform way. This class handles these commonalities.
   *
   * @property {string} endpoint The endpoint to use for requests.
   * @property {function(string, Object): Promise<Response>} inner_fetch The fetch function to use.
   */
  var Fetcher = _exports.Fetcher = /*#__PURE__*/function () {
    /**
     * Create a new Fetcher.
     *
     * @param {string} endpoint The endpoint to use for requests.
     * @param {function(string, Object): Promise<Response>} [fetch=window.fetch] The fetch function to use.
     */
    function Fetcher(endpoint) {
      var fetch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window.fetch.bind(window);
      _classCallCheck(this, Fetcher);
      this.endpoint = endpoint;
      this.inner_fetch = fetch;
    }

    /**
     * Fetch wrapper to handle errors.
     *
     * @param {Promise<Response>} invocation The fetch invocation.
     * @returns {ResponsePromise} The response.
     *
     * @throws {PreconditionFailure} If the permit has expired or the maximum attempts have been reached.
     * @throws {HttpError} If the HTTP request fails.
     * @private
     */
    return _createClass(Fetcher, [{
      key: "_fetch_wrapper",
      value: function _fetch_wrapper(invocation) {
        return invocation.then(function (response) {
          if (response.ok) {
            return response;
          }
          // 401 should never happen, sdk prevents against illegal state transitions
          if (response.status === 412) {
            throw new _errors.PreconditionFailure();
          } else {
            throw new _errors.HttpError(response.status);
          }
        });
      }

      /**
       * Fetch the endpoint
       *
       * @param {Object} [options] The fetch options.
       * @returns {ResponsePromise} The response.
       *
       * @throws {PreconditionFailure} If the permit has expired or the maximum attempts have been reached.
       * @throws {HttpError} If the HTTP request fails.
       */
    }, {
      key: "fetch",
      value: function fetch() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return this._fetch_wrapper(this.inner_fetch(this.endpoint, options));
      }

      /**
       * POST the endpoint
       *
       * @param {Object} args The arguments to pass to the endpoint.
       * @returns {ResponsePromise} The response.
       *
       * @throws {PreconditionFailure} If the permit has expired or the maximum attempts have been reached.
       * @throws {HttpError} If the HTTP request fails.
       */
    }, {
      key: "post",
      value: function post(args) {
        return this.fetch({
          method: 'POST',
          body: JSON.stringify(args)
        });
      }

      /**
       * Fetch with permit
       *
       * POST the endpoint with the permit and arguments in the expected format.
       *
       * @param {number[]} permit The permit to use for the request.
       * @param {Object} args The arguments to pass to the endpoint.
       * @returns {ResponsePromise} The response.
       *
       * @throws {PreconditionFailure} If the permit has expired or the maximum attempts have been reached.
       * @throws {HttpError} If the HTTP request fails.
       */
    }, {
      key: "post_with_permit",
      value: function post_with_permit(permit, args) {
        return this.post({
          permit: permit,
          args: args
        });
      }
    }]);
  }();
  /**
   * @classdesc A class for handling a flow.
   * @class
   *
   * @property {Fetcher} fetch The fetcher to use for requests.
   * @property {string} state The current state of the flow.
   * @property {number[] | null} permit The permit to use for requests.
   *
   * @private
   */
  var Flow = _exports.Flow = /*#__PURE__*/function () {
    /**
     * Create a new Flow.
     *
     * @param {string} path The path to the endpoint.
     * @param {string} name The name of the flow extending this class.
     * @param {string} [baseUrl] The base URL for the Velo API.
     * @param {Fetcher} [fetch] The fetcher to use for requests.
     *
     * @throws {InvalidArguments} If both `baseUrl` and `fetch` are not provided.
     */
    function Flow(path, name, baseUrl, fetch) {
      _classCallCheck(this, Flow);
      if (!baseUrl && !fetch) {
        throw new _errors.InvalidArguments("Either baseUrl or fetch must be provided for the ".concat(name, " constructor."));
      }
      this.fetch = fetch || new Fetcher(baseUrl + path);
      this.state = INIT_STATE;
      this.permit = null;
    }

    /**
     * Check that the current state is correct for the operation.
     *
     * @param {string | Array<string>} expectedState
     * @param {string} errorMessage
     * @returns {void}
     *
     * @throws {InvalidStateError} If the current state is invalid for the operation.
     * @protected
     */
    return _createClass(Flow, [{
      key: "_checkState",
      value: function _checkState(expectedState, errorMessage) {
        if (Array.isArray(expectedState) && !expectedState.includes(this.state)) {
          throw new _errors.InvalidStateError(errorMessage);
        } else if (this.state !== expectedState) {
          throw new _errors.InvalidStateError(errorMessage);
        }
      }

      /**
       * Fetch with the current permit.
       *
       * @param {Object} args The expected arguments for the IdP.
       * @returns {ResponsePromise}
       *
       * @throws {PreconditionFailure} If the permit has expired or the maximum attempts have been reached.
       * @throws {HttpError} If the HTTP request fails.
       *
       * @protected
       */
    }, {
      key: "_fetch_with_permit",
      value: function _fetch_with_permit(args) {
        return this.fetch.post_with_permit(this.permit, args);
      }
    }]);
  }();
});