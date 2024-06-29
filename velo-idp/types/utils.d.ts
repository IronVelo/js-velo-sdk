export const INIT_STATE: "init";
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
    constructor(endpoint: string, fetch?: (arg0: string, arg1: any) => Promise<Response>);
    endpoint: string;
    inner_fetch: (arg0: string, arg1: any) => Promise<Response>;
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
    private _fetch_wrapper;
    /**
     * Fetch the endpoint
     *
     * @param {Object} [options] The fetch options.
     * @returns {ResponsePromise} The response.
     *
     * @throws {PreconditionFailure} If the permit has expired or the maximum attempts have been reached.
     * @throws {HttpError} If the HTTP request fails.
     */
    fetch(options?: any): ResponsePromise;
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
    fetch_with_permit(permit: number[], args: any): ResponsePromise;
}
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
export class Flow {
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
    constructor(path: string, name: string, baseUrl?: string, fetch?: Fetcher);
    fetch: Fetcher;
    state: string;
    permit: any;
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
    protected _checkState(expectedState: string | Array<string>, errorMessage: string): void;
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
    protected _fetch_with_permit(args: any): ResponsePromise;
}
export type ResponsePromise = Promise<Response>;
