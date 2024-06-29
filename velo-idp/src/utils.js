import {HttpError, PreconditionFailure, InvalidArguments, InvalidStateError} from "./errors";

/**
 * @typedef {""} TerminalState
 * @typedef {"init"} InitState
 */

/**
 * @type {InitState}
 */
export const INIT_STATE = 'init';

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
export class Fetcher {
    /**
     * Create a new Fetcher.
     *
     * @param {string} endpoint The endpoint to use for requests.
     * @param {function(string, Object): Promise<Response>} [fetch=window.fetch] The fetch function to use.
     */
    constructor(endpoint, fetch = window.fetch.bind(window)) {
        this.endpoint = endpoint;
        this.inner_fetch = fetch;

        this.post.bind(this);
        this.post_with_permit.bind(this);
        this.fetch.bind(this);
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
    static _fetch_wrapper(invocation) {
        return invocation.then((response) => {
            if (response.ok) { return response; }

            // 401 should never happen, sdk prevents against illegal state transitions
            if (response.status === 412) {
                throw new PreconditionFailure();
            }

            throw new HttpError(response.status);
        })
    }

    /**
     * Fetch the endpoint
     *
     * @param {string} path The path to the endpoint.
     * @param {Object} [options] The fetch options.
     * @returns {ResponsePromise} The response.
     *
     * @throws {PreconditionFailure} If the permit has expired or the maximum attempts have been reached.
     * @throws {HttpError} If the HTTP request fails.
     */
    fetch(path, options = {}) {
        return Fetcher._fetch_wrapper(this.inner_fetch(`${this.endpoint}${path}`, options))
    }

    /**
     * POST the endpoint
     *
     * @param {string} path The path to the endpoint.
     * @param {Object} args The arguments to pass to the endpoint.
     * @returns {ResponsePromise} The response.
     *
     * @throws {PreconditionFailure} If the permit has expired or the maximum attempts have been reached.
     * @throws {HttpError} If the HTTP request fails.
     */
    post(path, args) {
        return this.fetch(path, {method: 'POST', body: JSON.stringify(args)})
    }

    /**
     * Fetch with permit
     *
     * POST the endpoint with the permit and arguments in the expected format.
     *
     * @param {string} path The path to the endpoint.
     * @param {string} permit The permit to use for the request.
     * @param {Object} args The arguments to pass to the endpoint.
     * @returns {ResponsePromise} The response.
     *
     * @throws {PreconditionFailure} If the permit has expired or the maximum attempts have been reached.
     * @throws {HttpError} If the HTTP request fails.
     */
    post_with_permit(path, permit, args) {
        return this.post(path, {permit: permit, args: args})
    }
}

/**
 * @classdesc A class for handling a flow.
 * @class
 *
 * @private
 */
export class Flow {
    /**
     * @type {Fetcher}
     * @protected
     */
    fetch;

    /**
     * @type {string}
     * @protected
     */
    path;

    /**
     * @type {string}
     * @protected
     */
    state;

    /**
     * @type {string | null}
     * @protected
     */
    permit;

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
    constructor(path, name, baseUrl, fetch) {
        if (!baseUrl && !fetch) {
            throw new InvalidArguments(`Either baseUrl or fetch must be provided for the ${name} constructor.`);
        }

        this.fetch = fetch || new Fetcher(baseUrl);
        this.path = path;
        this.state = INIT_STATE;
        this.permit = null;

        this._checkState.bind(this);
        this._post.bind(this);
        this._post_with_permit.bind(this);
        this._setState.bind(this);
        this._setPermit.bind(this);
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
    _checkState(expectedState, errorMessage) {
        if (Array.isArray(expectedState)) {
            if (!expectedState.includes(this.state)) { throw new InvalidStateError(errorMessage); }
        } else if (this.state !== expectedState) {
            throw new InvalidStateError(errorMessage);
        }
    }

    /**
     * Set the state.
     *
     * @param {string} newState
     * @protected
     */
    _setState(newState) {
        this.state = newState;
    }

    /**
     * Set the permit.
     *
     * @param {string} permit
     * @protected
     */
    _setPermit(permit) {
        this.permit = permit;
    }

    /**
     * Post to the endpoint.
     *
     * @param {Object} args The arguments to pass to the endpoint.
     * @returns {ResponsePromise}
     *
     * @protected
     */
    _post(args) {
        return this.fetch.post(this.path, args);
    }

    /**
     * Post with the current permit.
     *
     * @param {Object} args The expected arguments for the IdP.
     * @returns {ResponsePromise}
     *
     * @throws {PreconditionFailure} If the permit has expired or the maximum attempts have been reached.
     * @throws {HttpError} If the HTTP request fails.
     *
     * @protected
     */
    _post_with_permit(args) {
        return this.fetch.post_with_permit(this.path, this.permit, args);
    }
}