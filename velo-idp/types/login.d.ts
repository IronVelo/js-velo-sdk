/**
 * @class LoginFlow
 * @classdesc A class for handling a login flow.
 *
 * @property {Fetcher} fetch The fetcher to use for requests.
 * @property {string} state The current state of the flow.
 * @property {number[] | null} permit The permit to use for requests.
 */
export default class LoginFlow extends Flow {
    /**
     * Create a new LoginFlow.
     *
     * @param {string} [baseUrl] The base URL for the Velo API.
     * @param {Fetcher} [fetch] The fetcher to use for requests. The endpoint for the fetcher should be the base URL +
     * '/login'.
     *
     * @throws {InvalidArguments} If both `baseUrl` and `fetch` are not provided.
     */
    constructor(baseUrl?: string, fetch?: Fetcher);
}
import { Flow } from "./utils";
import { Fetcher } from "./utils";
