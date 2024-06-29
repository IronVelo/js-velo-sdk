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
    constructor(message: string);
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
    constructor(message: string);
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
    constructor();
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
    constructor(status: number);
    status: number;
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
    /**
     * Create a new PasswordInvalidError.
     * @param {InsufficientPasswordVariant} variant
     * @param {number} [value]
     */
    constructor(variant: InsufficientPasswordVariant, value?: number);
    variant: InsufficientPasswordVariant;
    value: number;
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
    constructor(message: string);
}
