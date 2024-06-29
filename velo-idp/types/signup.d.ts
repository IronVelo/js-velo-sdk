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
    constructor(baseUrl?: string, fetch?: Fetcher);
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
    hello(username: string): Promise<void>;
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
    setPassword(password: string): Promise<void>;
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
    setupTotp(): Promise<string>;
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
    verifyTotp(totp: string): Promise<boolean>;
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
    private _setup_plain_otp;
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
    setupSmsOtp(phoneNumber: string): Promise<void>;
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
    setupEmailOtp(email: string): Promise<void>;
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
    verifyOtp(otp: string): Promise<boolean>;
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
    issueToken(): Promise<Array<number>>;
}
import { Flow } from './utils';
import { Fetcher } from './utils';
