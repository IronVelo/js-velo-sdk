import { BuildError, InvalidTokenError, NeedsHttpsError } from "./errors";
import { Fetcher } from "./utils";
import LoginFlow   from "./login";
import SignupFlow  from "./signup";
import DeleteFlow  from "./delete";

export class SdkBuilder {
    /**
     * @type {string | null}
     * @private
     */
    _baseUrl;

    /**
     * @type {number}
     * @private
     */
    _port;

    /**
     * @type {function(string, Object): Promise<Response> | null}
     * @private
     */
    _fetcher;

    /**
     * @type {boolean}
     * @private
     */
    _password;

    /**
     * @type {boolean}
     * @private
     */
    _mfa_optional;

    /**
     * Create a new SdkBuilder.
     */
    constructor() {
        this._baseUrl = null;
        this._port = 443;
        this._fetcher = null;
        this._password = true;
        this._mfa_optional = false;
    }

    /**
     * Set the URL of the Identity Provider (IdP).
     *
     * @param {string} baseUrl - The base URL of the Identity Provider (IdP)
     * @returns {SdkBuilder}
     */
    baseUrl(baseUrl) {
        this._baseUrl = baseUrl;
        return this;
    }

    /**
     * Set the port of the Identity Provider (IdP). Default is 443.
     *
     * @param {number} port - The port of the Identity Provider (IdP)
     * @returns {SdkBuilder}
     */
    port(port) {
        this._port = port;
        return this;
    }

    /**
     * Set the fetcher to use for requests.
     *
     * On the browser, this should be `window.fetch`, in Node.js this should be the provided h2-fetch-node library's
     * fetch function.
     *
     * @param {function(string, Object): Promise<Response>} fetcher - The fetcher to use for requests
     * @returns {SdkBuilder}
     */
    fetch(fetcher) {
        this._fetcher = fetcher;
        return this;
    }

    /**
     * Declare whether you're using passwords or not. Default is true.
     *
     * **NOTE**: This is not yet relevant, in a future version this will be implemented. Until then this is here for
     * stability.
     *
     * @param {boolean} password - Whether you're using passwords or not
     * @returns {SdkBuilder}
     */
    password(password) {
        this._password = password;
        return this;
    }

    /**
     * Declare whether MFA is optional or required. MFA is required by default. Updating this setting will not
     * update the IdP's configuration, but ensure the SDK is in sync with the IdP.
     *
     * @param {boolean} is_optional - Whether MFA is optional or not.
     * @returns {SdkBuilder}
     */
    mfaOptional(is_optional) {
        this._mfa_optional = is_optional;
        return this;
    }

    /**
     * Transform the base URL to have the correct protocol.
     *
     * @param {string | null} baseUrl - The base URL to transform and check
     * @returns {string}
     *
     * @throws {BuildError} If the base URL is not set.
     * @throws {NeedsHttpsError} If the base URL starts with `http://`.
     *
     * @private
     * @static
     */
    _transform_check_base_url(baseUrl) {
        if (!baseUrl) {
            throw new BuildError("Either baseUrl or fetch must be provided for the SdkBuilder.");
        }
        if (baseUrl.startsWith("http://")) {
            throw new NeedsHttpsError();
        }
        if (!baseUrl.startsWith("https://")) {
            return `https://${baseUrl}`;
        }

        return baseUrl;
    }

    /**
     * Build the SDK.
     *
     * @returns {VeloSdk}
     * @throws {BuildError} If the base URL or fetcher is not set.
     * @throws {NeedsHttpsError} If the base URL starts with `http://`.
     */
    build() {
        let baseUrl = this._transform_check_base_url(this._baseUrl);
        let fetcher = new Fetcher(`${baseUrl}:${this._port}`, this._fetcher);

        return new VeloSdk(baseUrl, fetcher, this._password, this._mfa_optional);
    }
}

/**
 * The SDK for IronVelo's Identity Provider (IdP).
 */
export class VeloSdk {
    /**
     * @type {string}
     * @private
     * @readonly
     */
    _baseUrl;

    /**
     * @type {Fetcher}
     * @private
     */
    _fetcher;

    /**
     * @type {boolean}
     * @private
     * @readonly
     */
    _password;

    /**
     * @type {boolean}
     * @private
     * @readonly
     */
    _mfa_optional;

    /**
     * Create a new VeloSdk.
     *
     * @param {string} baseUrl - The base URL of the Identity Provider (IdP)
     * @param {Fetcher} fetcher - The fetcher to use for requests
     * @param {boolean} password - Whether you're using passwords or not
     * @param {boolean} mfa_optional - Whether MFA is optional or not. (true denotes this being optional)
     */
    constructor(baseUrl, fetcher, password, mfa_optional) {
        this._baseUrl = baseUrl;
        this._fetcher = fetcher;
        this._password = password;
        this._mfa_optional = mfa_optional;

        this.signup.bind(this);
        this.login.bind(this);
        this.delete.bind(this);
        this.verifyToken.bind(this);
        this.revokeTokens.bind(this);
    }

    /**
     * Initiate a signup flow.
     *
     * @returns {SignupFlow}
     */
    signup() {
        return new SignupFlow(this._baseUrl, this._fetcher, this._mfa_optional);
    }

    /**
     * Initiate a login flow.
     *
     * @returns {LoginFlow}
     */
    login() {
        return new LoginFlow(this._baseUrl, this._fetcher, this._mfa_optional);
    }

    /**
     * Schedule account deletion for the user.
     *
     * @param {string} token - The token representing the user being logged in
     * @returns {DeleteFlow}
     */
    delete(token) {
        return new DeleteFlow(this._baseUrl, this._fetcher, token);
    }

    /**
     * @typedef {{token: string, user_id: string}} VerifyTokenResponse
     */

    /**
     * Verify and rotate a token for the user.
     *
     * **USAGE NOTE**: This endpoint is ridiculously fast, and to enhance the security of your service you should
     * leverage it on **every request**. This will ensure that the users session has not been compromised or revoked.
     *
     * **IMPORTANT**: Tokens are rotated on each verification. That means that the token you send will be invalidated,
     * and if you reuse it the request will be rejected. This is to prevent replay attacks and circumvent theft of
     * tokens. It also allows this endpoint to be repurposed as a logout endpoint, though there is also a dedicated
     * mode of logging out provided by the IdP.
     *
     * @param {Buffer | Uint8Array | DOMString} token - The decoded token to verify and rotate
     * @returns {Promise<VerifyTokenResponse>} The new token and the user ID
     *
     * @throws {InvalidTokenError} If the token is invalid
     * @throws {HttpError} If the HTTP request fails
     */
    async verifyToken(token) {
        let response = await this._fetcher.fetch("/refresh", {
            method: 'POST',
            body: token
        });

        if (!response.ok) {
            throw new InvalidTokenError();
        }

        let res = await response.json();

        return {
            token: res["new"],
            user_id: res["user_id"]
        }
    }

    /**
     * Revoke all tokens associated with a user, effectively logging out all sessions.
     *
     * **USAGE NOTE**: This endpoint is useful for logging out a user from all devices. If a user's account has been
     * compromised from auth delegation or other means, this endpoint will allow you to log out the user from all
     * devices. Under compromise this should be the first action taken.
     *
     * **UNDER FAILURE**: There are various degrees of severity for this request failing, the worst being that it
     * straight up fails due to AWS having outages. Outside of this worst case, the IdP will return a new token for
     * the user to retry the request with. This is to help ensure that this action takes place due to the critical
     * nature of it.
     *
     * @param {Buffer | Uint8Array | DOMString} token - The decoded token to revoke
     * @returns {Promise<?string>} The new token if the request failed, null otherwise
     */
    async revokeTokens(token) {
        let response = await this._fetcher.fetch("/revoke", {
            method: 'POST',
            body: token
        });

        if (response.ok) {
            let body = await response.json();
            if (body["failure"] !== undefined) {
                return body["failure"]["token"];
            }

            return null;
        }

        throw new InvalidTokenError();
    }
}