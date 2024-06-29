/**
 * Error returned when the state of the signup flow is invalid for the current operation.
 *
 * @extends {Error}
 * @property {string} message - The error message.
 * @property {string} name - The error name.
 */
export class InvalidStateError extends Error {
    /**
     * Create a new InvalidStateError.
     *
     * @param {string} message The error message.
     */
    constructor(message) {
        super(message);
        this.name = 'InvalidStateError';
    }
}

/**
 * Error returned when a username already exists.
 *
 * @extends {Error}
 * @property {string} message - The error message.
 * @property {string} name - The error name.
 */
export class UsernameExistsError extends Error {
    /**
     * Create a new UsernameExistsError.
     *
     * @param {string} message The error message.
     */
    constructor(message) {
        super(message);
        this.name = 'UsernameExistsError';
    }
}

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
export class PreconditionFailure extends Error {
    /**
     * Create a new PreconditionFailedError.
     *
     * Precondition failures are meant to be opaque to prevent leaking information about the system.
     */
    constructor() {
        super('Precondition failed.');
        this.name = 'PreconditionFailedError';
    }
}

/**
 * Error returned when an HTTP request fails.
 *
 * @extends {Error}
 * @property {string} message - The error message.
 * @property {string} name - The error name.
 * @property {number} status - The HTTP status code.
 */
export class HttpError extends Error {
    /**
     * Create a new HttpError.
     *
     * @param {number} status The HTTP status code.
     */
    constructor(status) {
        super('HttpError status: ' + status);
        this.name = 'HttpError';
        this.status = status;
    }
}

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
export class InsufficientPassword extends Error {
    variant;

    /**
     * Create a new PasswordInvalidError.
     * @param {InsufficientPasswordVariant} variant
     * @param {number} [value]
     */
    constructor(variant, value) {
        super(`Password invalid: ${variant}${value ? `: ${value}` : ''}`);
        this.name = 'InsufficientPassword';
        this.variant = variant;
        this.value = value;
    }
}

/**
 * Error returned when the arguments provided to a function are invalid.
 *
 * @extends {Error}
 * @property {string} message - The error message.
 */
export class InvalidArguments extends Error {
    /**
     * Create a new InvalidArguments error.
     *
     * @param {string} message The error message.
     */
    constructor(message) {
        super(message);
        this.name = 'InvalidArguments';
    }
}

/**
 * Error returned when the MFA type has not been set up by the user.
 *
 * @property {string} message - The error message.
 * @property {MfaType} kind - The kind of MFA that is not set up.
 * @extends {Error}
 */
export class MfaNotSetUpError extends Error {
    /**
     * Create a new MfaNotSetUpError.
     *
     * @param {MfaType} kind The kind of MFA that is not set up.
     */
    constructor(kind) {
        super(`MFA type ${kind} not set up.`);
        this.name = 'MfaNotSetUpError';
        this.kind = kind;
    }
}

/**
 * @typedef {"InvalidLength" | "NotNumbers"} InvalidOtpVariant
 */

/**
 * Error returned when the OTP cannot be valid (checked locally).
 *
 * @property {InvalidOtpVariant} variant - How the OTP is invalid.
 * @extends {Error}
 */
export class InvalidOtpError extends Error {
    variant;

    /**
     * Create a new InvalidOtpError.
     *
     * @param {InvalidOtpVariant} reason The reason the OTP is invalid.
     */
    constructor(reason) {
        super(`Invalid OTP: ${reason}`);
        this.name = 'InvalidOtpError';
        this.variant = reason;
    }
}

/**
 * Error returned when `build` is called on a SdkBuilder without a base URL.
 * @extends {Error}
 */
export class BuildError extends Error {
    /**
     * Create a new MissingBaseUrl error.
     */
    constructor() {
        super('Missing base URL or fetcher.');
        this.name = 'MissingBaseUrl';
    }
}

/**
 * Error returned if `https` is not being used.
 * @extends {Error}
 */
export class NeedsHttpsError extends Error {
    /**
     * Create a new NeedsHttpsError.
     */
    constructor() {
        super('HTTPS is required.');
        this.name = 'NeedsHttpsError';
    }
}

/**
 * Invalid token error.
 * @extends {Error}
 */
export class InvalidTokenError extends Error {
    /**
     * Create a new InvalidTokenError.
     */
    constructor() {
        super('Invalid token.');
        this.name = 'InvalidTokenError';
    }
}

/**
 * @typedef {"UsernameNotFound"} UsernameNotFoundErr
 * @typedef {"IncorrectPassword"} IncorrectPasswordErr
 * @typedef {"IllegalMfa"} IllegalMfaErr
 * @typedef {"WrongFlow"} WrongFlowErr
 */

/**
 * @typedef {UsernameNotFoundErr | IncorrectPasswordErr | IllegalMfaErr | WrongFlowErr} LoginErrorKind
 */

/**
 * Login ingress error.
 *
 * These are common errors, such as UsernameNotFound, or IncorrectPassword.
 *
 * @property {LoginErrorKind} kind - The kind of error.
 * @extends {Error}
 */
export class LoginError extends Error {
    /**
     * The kind of error.
     * @type {LoginErrorKind}
     * @readonly
     */
    kind;

    /**
     * Create a new LoginError.
     *
     * @param {LoginErrorKind} kind The kind of error.
     * @param {string} [meta=""] Additional information.
     */
    constructor(kind, meta = "") {
        let meta_msg = meta.length > 0 ? `: ${meta}` : "";
        super(`Login error: ${kind}${meta_msg}`);
        this.name = 'LoginError';
        this.kind = kind;
    }
}

/**
 * Schedule account deletion error.
 *
 * Account deletion is nuanced due to compliance and security contending with each other. On one hand, account deletion
 * must not be challenging for the user, but on the other hand making it easy allows a compromised account to be deleted
 * without intervention.
 *
 * All errors returned by the account deletion flow return a new token, this is to prevent a failed account deletion
 * from logging the user out.
 *
 * **IMPORTANT NOTE**: It is crucial to use the new token (stored within this error) as tokens are one time use, and
 * an account deletion failure should **not log the user out**.
 *
 * @property {string} token - The new token to use.
 * @extends {Error}
 */
export class DeleteError extends Error {
    /**
     * The new token to use.
     * @type {string}
     * @readonly
     */
    token;

    /**
     * Create a new DeleteError.
     *
     * @param {string} token The new token to use.
     * @param {string} [meta=""] Additional information.
     */
    constructor(token, meta = "") {
        let meta_msg = meta.length > 0 ? `: ${meta}` : "";
        super(`Delete error${meta_msg}`);
        this.name = 'DeleteError';
        this.token = token;
    }
}