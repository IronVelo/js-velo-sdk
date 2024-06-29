import { Fetcher, Flow, INIT_STATE } from './utils';
import {
    HttpError, PreconditionFailure,
    InvalidArguments,
    InvalidStateError, UsernameExistsError, InsufficientPassword
} from './errors';

/**
 * @typedef {"password"} PasswordState
 * @typedef {"setup_first_mfa"} SetupFirstMfaState
 * @typedef {"setup_mfa_or_issue_token"} SetupMfaOrIssueTokenState
 * @typedef {"verify_totp"} VerifyTotpState
 * @typedef {"verify_plain_otp"} VerifyPlainOtpState
 */

/**
 * @typedef {
 *     InitState
 *     | PasswordState
 *     | SetupFirstMfaState
 *     | SetupMfaOrIssueTokenState
 *     | VerifyTotpState
 *     | VerifyPlainOtpState
 *     | TerminalState
 * } SignupFlowState
 */

/**
 * @typedef {{
 *     INIT: InitState,
 *     PASSWORD: PasswordState,
 *     SETUP_FIRST_MFA: SetupFirstMfaState,
 *     SETUP_MFA_OR_ISSUE_TOKEN: SetupMfaOrIssueTokenState,
 *     VERIFY_TOTP: VerifyTotpState,
 *     VERIFY_PLAIN_OTP: VerifyPlainOtpState,
 *     TERMINAL: TerminalState
 * }} SignupFlowStates
 */

/**
 * @type {SignupFlowStates}
 */
const SIGNUP_STATES = {
    INIT: INIT_STATE,
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
 * @property {SignupFlowState} state The current state of the signup flow.
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
export default class SignupFlow extends Flow {
    /**
     * Create a new SignupFlow instance.
     *
     * @param {string} [baseUrl] The base URL for the Velo API.
     * @param {Fetcher} [fetch] The `Fetcher` instance to use for requests. The endpoint for the fetcher should be
     * the base URL + '/signup'.
     *
     * @throws {InvalidArguments} If both `baseUrl` and `fetch` are not provided.
     */
    constructor(baseUrl, fetch) {
        super('/signup', 'SignupFlow', baseUrl, fetch);

        // this is the worst language of all time, I hate you Brandon Eich. I genuinely hate you.
        this.hello.bind(this);
        this.setPassword.bind(this);
        this.setupTotp.bind(this);
        this.verifyTotp.bind(this);
        this.setupSmsOtp.bind(this);
        this.setupEmailOtp.bind(this);
        this.verifyOtp.bind(this);
        this.restore.bind(this);
        this.serialize.bind(this);
        this.deserialize.bind(this);
    }

    /**
     * @typedef {{state: SignupFlowState, permit: string}} SerializableSignupFlow
     */

    /**
     * Get the serializable state of the flow.
     *
     * @returns {SerializableSignupFlow}
     */
    toSerializable() {
        return {
            state: this.state,
            permit: this.permit
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
     * @param {SerializableSignupFlow} obj The serializable state.
     */
    restore(obj) {
        this._setState(obj.state);
        this._setPermit(obj.permit);
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
    async hello(username) {
        const response = await this._post({args: {hello_signup: {username}}});

        /**
         * @typedef {Object} HelloSignupError
         * @property {boolean} username_exists error message if the username already exists.
         */

        /**
         * @type {ApiResponse<?HelloSignupError>}
         */
        const data = await response.json();
        if (data.ret !== null) {
            throw new UsernameExistsError(`Username ${username} already exists.`);
        } else {
            this._setPermit(data.permit);
            this._setState(SIGNUP_STATES.PASSWORD);
        }
    }

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
    async setPassword(password) {
        this._checkState(SIGNUP_STATES.PASSWORD, 'Invalid state for setting password.')
        const response = await this._post_with_permit({password: { password: password }});

        /**
         * @typedef {Object} PasswordLengthError
         * @property {?number} TooFewChars length of the received password. Must be at least 8 characters.
         * @property {?number} TooManyChars length of the received password. Must not be over 72 characters.
         */

        /**
         * @typedef {
         *     "NeedsSpecial"      |
         *     "NeedsNumeric"      |
         *     "NeedsCapital"      |
         *     "NeedsLowercase"    |
         *     "IllegalCharacter"
         * } PasswordComplexityError
         */

        /**
         * @typedef {Object} InvalidPasswordResponse
         * @property {PasswordLengthError | PasswordComplexityError} invalid_password
         */

        /**
         * @type {ApiResponse<?InvalidPasswordResponse>} SetPasswordResponse
         */
        const data = await response.json();

        // make sure we update the permit prior to possibly throwing so that the user can retry
        this._setPermit(data.permit);

        // TODO: HANDLE THESE PRIOR TO MAKING ANY REQUESTS
        if (data.ret !== null) {
            // check cases, throw associated error
            switch (Object.keys(data.ret.invalid_password)[0]) {
                case 'TooFewChars':
                    throw new InsufficientPassword('TooFewCharacters', data.ret.invalid_password['TooFewChars']);
                case 'TooManyChars':
                    throw new InsufficientPassword('TooManyCharacters', data.ret.invalid_password['TooManyChars']);
                default:
                    throw new InsufficientPassword(data.ret.invalid_password);
            }
        }

        this._setState(SIGNUP_STATES.SETUP_FIRST_MFA);
    }

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
    async setupTotp() {
        this._checkState(
            [SIGNUP_STATES.SETUP_FIRST_MFA, SIGNUP_STATES.SETUP_MFA_OR_ISSUE_TOKEN],
            'Invalid state for TOTP setup.'
        );

        let response = await this._post_with_permit({[this.state]: {kind: {Totp: null}}});

        /**
         * @typedef {Object} SetupTotpResponse
         * @property {string} setup_totp The TOTP setup URL.
         */

        /**
         * @type {ApiResponse<SetupTotpResponse>}
         */
        const data = await response.json();

        this._setPermit(data.permit);
        this._setState(SIGNUP_STATES.VERIFY_TOTP);

        return data.ret.setup_totp;
    }

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
    async verifyTotp(totp) {
        this._checkState(SIGNUP_STATES.VERIFY_TOTP, 'Invalid state for TOTP verification.')
        const response = await this._post_with_permit({verify_totp: {guess: totp}});

        /**
         * @typedef {Object} VerifyTotpResponse
         * @property {boolean} verify_totp Whether the TOTP code is valid.
         */

        /**
         * @type {ApiResponse<VerifyTotpResponse>}
         */
        const data = await response.json();

        this._setPermit(data.permit);

        if (data.ret.verify_totp) {
            this._setState(SIGNUP_STATES.SETUP_MFA_OR_ISSUE_TOKEN);
            return true;
        } else {
            return false;
        }
    }

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
    async _setup_plain_otp(args) {
        const response = await this._post_with_permit(args);

        /**
         * @type {ApiResponse<null>}
         */
        const data = await response.json();
        this._setPermit(data.permit);
        this.state = SIGNUP_STATES.VERIFY_PLAIN_OTP
    }

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
    setupSmsOtp(phoneNumber) {
        this._checkState(
            [SIGNUP_STATES.SETUP_FIRST_MFA, SIGNUP_STATES.SETUP_MFA_OR_ISSUE_TOKEN],
            'Invalid state for SMS OTP setup.'
        );
        return this._setup_plain_otp({[this.state]: {kind: {Phone: phoneNumber}}});
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
    setupEmailOtp(email) {
        this._checkState(
            [SIGNUP_STATES.SETUP_FIRST_MFA, SIGNUP_STATES.SETUP_MFA_OR_ISSUE_TOKEN],
            'Invalid state for Email OTP setup.'
        );
        return this._setup_plain_otp({[this.state]: {kind: {Email: email}}});
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
    async verifyOtp(otp) {
        this._checkState(SIGNUP_STATES.VERIFY_PLAIN_OTP, 'Invalid state for OTP verification.')
        const response = await this._post_with_permit({verify_plain_otp: {guess: otp}})

        /**
         * @typedef {Object} VerifyOtpResponse
         * @property {bool} maybe_retry_plain if true, the user should be prompted to enter the code again.
         */

        /**
         * @type {ApiResponse<?VerifyOtpResponse>}
         */
        const data = await response.json();

        this._setPermit(data.permit);

        // We don't need to check if maybe_retry_plain is true, you can think of it as a simple flag, if it is there,
        // the user should be prompted to enter the code again.
        if (data.ret === null) {
            this._setState(SIGNUP_STATES.SETUP_MFA_OR_ISSUE_TOKEN);
            return true;
        }
        return false
    }

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
     * @returns {Promise<string>} A promise that resolves to the issued token.
     *
     * @throws {InvalidStateError} If the current state is invalid for this operation (the previous state was not
     * an MFA verification state).
     * @throws {HttpError} If the HTTP request fails.
     * @throws {PreconditionFailure} If the permit has expired.
     */
    async issueToken() {
        this._checkState(SIGNUP_STATES.SETUP_MFA_OR_ISSUE_TOKEN, 'Invalid state for issuing token.')
        const response = await this._post_with_permit({setup_mfa_or_issue_token: {kind: null}});

        /**
         * @typedef {{issue_token: string}} IssueTokenResponse
         */

        /**
         * @type {ApiResponse<IssueTokenResponse>}
         */
        const data = await response.json();

        this._setState(SIGNUP_STATES.TERMINAL);
        return data.ret.issue_token;
    }
}