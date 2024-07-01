import { Fetcher, Flow, INIT_STATE } from "./utils";
import {
    HttpError, PreconditionFailure,
    InvalidStateError, InvalidArguments,
    MfaNotSetUpError, InvalidOtpError, LoginError
} from "./errors";

/**
 * @typedef {"init_mfa"} InitMfaState
 * @typedef {"check_simple_mfa"} CheckSimpleMfaState
 * @typedef {"check_totp"} CheckTotpState
 * @typedef {"retry_init_mfa"} RetryInitMfaState
 */

/**
 * @typedef {InitMfaState | CheckSimpleMfaState | CheckTotpState | RetryInitMfaState | TerminalState} LoginFlowState
 */

/**
 * @typedef {{
 *     INIT: InitState,
 *     INIT_MFA: InitMfaState,
 *     CHECK_SIMPLE_MFA: CheckSimpleMfaState,
 *     CHECK_TOTP: CheckTotpState,
 *     RETRY_INIT_MFA: RetryInitMfaState,
 *     TERMINAL: TerminalState
 * }} LoginFlowStates
 */

/**
 * @type {LoginFlowStates}
 */
export const LOGIN_STATES = {
    INIT: INIT_STATE,
    INIT_MFA: 'init_mfa',
    CHECK_SIMPLE_MFA: 'check_simple_mfa',
    CHECK_TOTP: 'check_totp',
    RETRY_INIT_MFA: 'retry_init_mfa',
    TERMINAL: ''
}

/**
 * Acts as both verification of the correct state and getting the correct OTP length in the same breath.
 *
 * @type {{[key in LoginFlowState]: number | undefined}}
 */
const OTP_LENS = {
    [LOGIN_STATES.CHECK_SIMPLE_MFA]: 6,
    [LOGIN_STATES.CHECK_TOTP]: 8
}

/**
 * @typedef {"Totp" | "Sms" | "Email"} MfaType
 */

/**
 * @type {MfaType}
 */
const TOTP = 'Totp';
/**
 * @type {MfaType}
 */
const SMS = 'Sms';
/**
 * @type {MfaType}
 */
const EMAIL = 'Email';

/**
 * The response of the ingress flow. If MFA is non-optional you must always continue the flow.
 *
 * @property {string | null} token - non-null if the user has not set MFA up and MFA is optional.
 *
 * @property {Array<MfaType>} mfa_kinds - non-empty if the user has set MFA up, this can never be non-empty if `token`
 *   is not `null`. This array includes the supported MFA kinds.
 *
 * @property {boolean} complete - If MFA is optional and the user has not set MFA up. If this is true it indicates that
 *   the token is not `null`.
 */
export class HelloResult {
    /**
     * @readonly
     * @type {string | null}
     */
    token;

    /**
     * @readonly
     * @type {Array<MfaType>}
     */
    mfa_kinds;

    /**
     * @readonly
     * @type {boolean}
     *
     * If the login process is complete, indicating that the user had not set MFA up and that the `token` property is
     * non-null.
     */
    complete

    /**
     * @private
     * @param {string | null} token
     * @param {Array<MfaType>} mfa_kinds
     */
    constructor(token, mfa_kinds) {
        if (token !== null && mfa_kinds.length !== 0) {
            // Impossibility, no need for a custom error.
            throw new InvalidArguments(
                "Impossibility, user had MFA kinds but also was logged in. " +
                "This would indicate a network error, a really weird one."
            );
        }

        this.complete = token !== null;
        this.token = token;
        this.mfa_kinds = mfa_kinds;
    }

    /**
     * The user had no MFA kinds and MFA is optional, their token is returned and stored in `token`.
     *
     * @param {string} token
     * @returns {HelloResult}
     */
    static Token(token) {
        return new HelloResult(token, []);
    }

    /**
     * The user had MFA setup, they must continue the flow. The MFA kinds they have already set are stored in the
     * `mfa_kinds` property.
     *
     * @param {Array<MfaType>} mfa_kinds
     * @returns {HelloResult}
     */
    static NeedsMfa(mfa_kinds) {
        return new HelloResult(null, mfa_kinds);
    }
}

/**
 * @class LoginFlow
 * @classdesc A class for handling a login flow.
 *
 * @property {Fetcher} fetch The fetcher to use for requests.
 * @property {LoginFlowState} state The current state of the flow.
 * @property {string | null} permit The permit to use for requests.
 * @property {Array<MfaType>} mfaTypes The types of MFA that are available.
 *
 * @extends Flow
 */
export default class LoginFlow extends Flow {
    /**
     * @private
     * @readonly
     * @type {boolean}
     */
    _mfa_optional;

    /**
     * Create a new LoginFlow.
     *
     * @param {string} [baseUrl] The base URL for the Velo API.
     * @param {Fetcher} [fetch] The fetcher to use for requests. The endpoint for the fetcher should be the base URL +
     * '/login'.
     * @param {boolean} mfa_optional Whether MFA is optional or required. True indicates it being optional.
     *
     * @throws {InvalidArguments} If both `baseUrl` and `fetch` are not provided.
     */
    constructor(baseUrl, fetch, mfa_optional) {
        super('/login', 'LoginFlow', baseUrl, fetch);
        this._mfa_optional = mfa_optional;
        this.mfaTypes = [];

        // this is the worst language of all time, I hate you Brandon Eich. I genuinely hate you.

        this.hello.bind(this);
        this.prepareTotp.bind(this);
        this.prepareSms.bind(this);
        this.prepareEmail.bind(this);
        this.verifyOtp.bind(this);
        this.restore.bind(this);
        this.serialize.bind(this);
        this.deserialize.bind(this);
    }

    /**
     * @typedef {{state: LoginFlowState, permit: string, mfaTypes: Array<MfaType>}} SerializableLoginFlow
     */

    /**
     * Get the serializable state of the flow.
     *
     * @returns {SerializableLoginFlow}
     */
    toSerializable() {
        return {
            state: this.state,
            permit: this.permit,
            mfaTypes: this.mfaTypes
        };
    }

    /**
     * Serialize the current state in JSON allowing for the flow to be resumed later.
     *
     * @returns {string} The serialized state.
     */
    serialize() {
        return JSON.stringify(this.toSerializable());
    }

    /**
     * Restore the state of the flow from a serialized state.
     *
     * @param {string} serialized The serialized state.
     * @returns {void}
     */
    deserialize(serialized) {
        const obj = JSON.parse(serialized);
        this.restore(obj);
    }

    /**
     * Restore the state of the flow from a serializable state.
     *
     * @param {SerializableLoginFlow} obj The serializable state.
     */
    restore(obj) {
        this._setState(obj.state);
        this._setState(obj.permit);
        this.mfaTypes = obj.mfaTypes;
    }

    /**
     * Check the response for an error.
     *
     * @param {ApiResponse<any>} response The response to check.
     * @param {function(any): Error} errorFactory The error factory to use. Takes the "failure" field as the argument.
     *
     * @throws {Error} If the response contains a failure, whatever the returned error of `errorFactory` is.
     * @returns {void}
     *
     * @private
     * @static
     */
    static _checkResponse(response, errorFactory) {
        if (response.ret !== null && response.ret["failure"] !== undefined) {
            throw errorFactory(response.ret["failure"]);
        }
    }

    /**
     * Start the login flow.
     *
     * ## Transitions To:
     *
     * - [Prepare TOTP]{@link LoginFlow.prepareTotp} - If the username and password were correct and the user has set
     *   up TOTP as a mode of MFA.
     * - [Prepare SMS]{@link LoginFlow.prepareSms} - If the username and password were correct and the user has set up
     *   SMS as a mode of MFA.
     * - [Prepare Email]{@link LoginFlow.prepareEmail} - If the username and password were correct and the user has set
     *   up email as a mode of MFA.
     *
     * @param {string} username The username to log in with.
     * @param {string} password The password to log in with.
     * @returns {Promise<HelloResult>} The types of MFA that are available.
     *
     * @throws {InvalidStateError} If the current state is not INIT.
     * @throws {HttpError} If the request fails.
     * @throws {LoginError} If the login fails for an anticipated reason.
     */
    async hello(username, password) {
        this._checkState(LOGIN_STATES.INIT, 'The login flow has already been started.');

        // not stable
        const response = await this._post({
            args: {hello_login: {username: username, password: password}}
        });

        /**
         * @typedef {{hello_login: Array<MfaType>}} MfaTypesResponse
         */

        /**
         * @typedef {{issue_token: string}} IssueTokenResponse
         */

        /**
         * @type {ApiResponse<MfaTypesResponse | any | IssueTokenResponse>}
         */
        const data = await response.json();

        LoginFlow._checkResponse(data, (failure) => new LoginError(failure));

        if (this._mfa_optional && data.ret["issue_token"] !== undefined) {
            this._setState(LOGIN_STATES.TERMINAL);
            return HelloResult.Token(data.ret.issue_token);
        }

        this._setState(LOGIN_STATES.INIT_MFA);
        this._setPermit(data.permit);
        this.mfaTypes = data.ret.hello_login;

        return HelloResult.NeedsMfa(this.mfaTypes);
    }

    /**
     * Check the MFA type.
     *
     * This does not assert that the state is correct, as it is used in multiple states.
     *
     * @param {MfaType} mfaType The type of MFA to check.
     * @param {string} successState The state to transition to if the MFA type is valid.
     * @returns {Promise<void>}
     *
     * @throws {MfaNotSetUpError} If the MFA type is not set up for the user.
     * @throws {HttpError} If the request fails.
     * @throws {PreconditionFailure} If the permit has expired.
     *
     * @private
     */
    async _prepareMfa(mfaType, successState) {
        if (!this.mfaTypes.includes(mfaType)) {
            throw new MfaNotSetUpError(mfaType);
        }

        const response = await this._post_with_permit({[this.state]: { kind: mfaType }});
        /**
         * @type {ApiResponse<null | any>}
         */
        const data = await response.json();

        LoginFlow._checkResponse(data, (failure) => new MfaNotSetUpError(failure));

        this._setState(successState);
        this._setPermit(data.permit);
    }

    /**
     * Prepare for TOTP verification.
     *
     * ## Transitions To:
     *
     * - [Verify TOTP]{@link LoginFlow.verifyOtp} - If `prepareTotp` is successful.
     *
     * ## Transitioned From:
     *
     * - [Hello]{@link LoginFlow.hello} - If the username and password were correct and the user has set up TOTP as a
     *   mode of MFA.
     *
     * @returns {Promise<void>}
     *
     * @throws {InvalidStateError} If the current state is not INIT_MFA.
     * @throws {MfaNotSetUpError} If TOTP is not set up for the user.
     * @throws {HttpError} If the request fails.
     * @throws {PreconditionFailure} If the permit has expired.
     */
    prepareTotp() {
        this._checkState(
            [LOGIN_STATES.INIT_MFA, LOGIN_STATES.RETRY_INIT_MFA],
            'Invalid state for preparing TOTP.'
        );
        return this._prepareMfa(TOTP, LOGIN_STATES.CHECK_TOTP);
    }

    /**
     * Prepare for SMS verification.
     *
     * ## Transitions To:
     *
     * - [Verify OTP]{@link LoginFlow.verifyOtp} - If `prepareSms` is successful.
     *
     * ## Transitioned From:
     *
     * - [Hello]{@link LoginFlow.hello} - If the username and password were correct and the user has set up SMS as a
     *   mode of MFA.
     *
     * @returns {Promise<void>}
     *
     * @throws {InvalidStateError} If the current state is not INIT_MFA.
     * @throws {MfaNotSetUpError} If SMS is not set up for the user.
     * @throws {HttpError} If the request fails.
     * @throws {PreconditionFailure} If the permit has expired.
     */
    prepareSms() {
        this._checkState(
            [LOGIN_STATES.INIT_MFA, LOGIN_STATES.RETRY_INIT_MFA],
            'Invalid state for preparing SMS.'
        );
        return this._prepareMfa(SMS, LOGIN_STATES.CHECK_SIMPLE_MFA);
    }

    /**
     * Prepare for email verification.
     *
     * ## Transitions To:
     *
     * - [Verify OTP]{@link LoginFlow.verifyOtp} - If `prepareEmail` is successful.
     *
     * ## Transitioned From:
     *
     * - [Hello]{@link LoginFlow.hello} - If the username and password were correct and the user has set up email as a
     *   mode of MFA.
     *
     * @returns {Promise<void>}
     *
     * @throws {InvalidStateError} If the current state is not INIT_MFA.
     * @throws {MfaNotSetUpError} If email is not set up for the user.
     * @throws {HttpError} If the request fails.
     * @throws {PreconditionFailure} If the permit has expired.
     */
    prepareEmail() {
        this._checkState(
            [LOGIN_STATES.INIT_MFA, LOGIN_STATES.RETRY_INIT_MFA],
            'Invalid state for preparing email.'
        );
        return this._prepareMfa(EMAIL, LOGIN_STATES.CHECK_SIMPLE_MFA);
    }

    /**
     * Locally validate the OTP code, this doesn't check if the code is correct, just that it is **potentially valid**.
     *
     * @param {string} code
     * @throws {InvalidOtpError} If the OTP is invalid.
     * @returns {void} - The OTP is valid.
     */
    localValidateOtp(code) {
        if (code.length !== OTP_LENS[this.state]) {
            throw new InvalidOtpError('InvalidLength');
        }

        for (let i = 0; i < code.length; i++) {
            if (!(code[i] >= '0' && code[i] <= '9')) {
                throw new InvalidOtpError('NotNumbers');
            }
        }
    }

    /**
     * Verify the one time password.
     *
     * ## Transitions To:
     *
     * - TERMINAL - If the OTP was correct, then the user is logged in (the returned token representing the logged in
     *   state).
     * - [SELF]{@link LoginFlow.verifyOtp} - If the OTP was incorrect, the user must retry.
     *
     * ## Transitioned From:
     *
     * - [Prepare SMS]{@link LoginFlow.prepareSms} - If the user has set up SMS as a mode of MFA.
     * - [Prepare Email]{@link LoginFlow.prepareEmail} - If the user has set up email as a mode of MFA.
     * - [Prepare TOTP]{@link LoginFlow.prepareTotp} - If the user has set up TOTP as a mode of MFA.
     *
     * @param {string} code The code to check.
     * @returns {string | null} - The token if successful, `void` if the user must retry.
     *
     * @throws {InvalidStateError} If the current state is not CHECK_SIMPLE_MFA | CHECK_TOTP.
     * @throws {HttpError} If the request fails.
     * @throws {PreconditionFailure} If the permit has expired.
     * @throws {InvalidOtpError} If the OTP cannot be valid (thrown prior to request dispatch).
     */
    async verifyOtp(code) {
        this._checkState(
            [LOGIN_STATES.CHECK_SIMPLE_MFA, LOGIN_STATES.CHECK_TOTP],
            'Invalid state for checking simple MFA.'
        );

        this.localValidateOtp(code);

        const response = await this._post_with_permit({[this.state]: {guess: code}});

        /**
         * @typedef {Object} VerifyOtpResponse
         * @property {string} [issue_token] The token representing the user.
         * @property {any} [incorrect_otp] The OTP was incorrect, retry.
         */

        /**
         * @type {ApiResponse<VerifyOtpResponse>}
         */
        const data = await response.json();

        // check for the existence of the token, if it is not there then the OTP was incorrect and the user must retry.
        if (data.ret.issue_token) {
            this._setState(LOGIN_STATES.TERMINAL);
            return data.ret.issue_token;
        } else {
            this._setState(LOGIN_STATES.RETRY_INIT_MFA);
            this._setPermit(data.permit);
            return null;
        }
    }
}