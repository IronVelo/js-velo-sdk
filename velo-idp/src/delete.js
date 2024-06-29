/**
 * @fileoverview This file contains the delete state machine and associated utilities.
 */

import { Fetcher, Flow } from "./utils.js";
import {DeleteError} from "./errors";

/**
 * @typedef {"ask_delete"} AskDeleteState
 * @typedef {"password"} PasswordState
 * @typedef {"confirm"} ConfirmState
 */

/**
 * @typedef {AskDeleteState | PasswordState | ConfirmState} DeleteState
 */

/**
 * @typedef {{ASK: AskDeleteState, PASSWORD: PasswordState, CONFIRM: ConfirmState, TERMINAL: TerminalState}} DeleteStates
 */

/**
 * @type {DeleteStates}
 */
export const DELETE_STATES = {
    ASK: "ask_delete",
    PASSWORD: "password",
    CONFIRM: "confirm",
    TERMINAL: ""
}

/**
 * @class DeleteFlow
 * @classdesc A class for managing the delete flow.
 *
 * @property {string} token The token representing the user being logged in to use for the flow.
 * @property {string | null} permit The permit to use for requests.
 * @property {DeleteState} state The current state of the flow.
 *
 * @extends Flow
 */
export default class DeleteFlow extends Flow {
    /**
     * @type {string}
     * @private
     */
    token;

    /**
     * @type {function(string): boolean}
     */

    /**
     * Create a new DeleteFlow.
     *
     * @param {string} baseUrl The base URL for the API.
     * @param {Fetcher} fetch The fetch function to use.
     * @param {string} token The token to use for the flow.
     */
    constructor(baseUrl, fetch, token) {
        super("/delete", "DeleteFlow", baseUrl, fetch);

        this.state = DELETE_STATES.ASK;
        this.token = token;
        this.hello.bind(this);
        this.password.bind(this);
        this.confirm.bind(this);
        this.toSerializable.bind(this);
        this.serialize.bind(this);
        this.deserialize.bind(this);
        this.restore.bind(this);
    }

    /**
     * @typedef {{state: DeleteState, token: string, permit: string | null}} SerializableDeleteFlow
     */

    /**
     * Get the serializable state of the flow.
     *
     * @returns {SerializableDeleteFlow} The serializable state.
     */
    toSerializable() {
        return {
            state: this.state,
            token: this.token,
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
        let state = JSON.parse(serialized);
        this.restore(state);
    }

    /**
     * Restore the state of the flow from a serializable state.
     *
     * @param {SerializableDeleteFlow} state The serializable state.
     */
    restore(state) {
        this._setState(state.state);
        this._setPermit(state.permit);
        this.token = state.token;
    }

    /**
     * Start the delete flow, asking the user to confirm their username.
     *
     * @param {string} username The username to schedule deletion for.
     * @returns {Promise<DeleteFlow>}
     *
     * @throws {DeleteError} If the username is incorrect -- **YOU MUST USE THE NEW TOKEN**.
     * @throws {InvalidStateError} If the flow is not in the correct state.
     * @throws {HttpError} If the request fails.
     */
    async hello(username) {
        this._checkState(DELETE_STATES.ASK, "Cannot call hello() in state other than 'ask_delete'.");
        /**
         * @typedef {{[invalid_username]: string, [ask_delete]: string}} AskDeleteResponse
         */

        let res = await this._post({
            args: { ask_delete: { username, token: this.token } }
        });

        /**
         * @type {ApiResponse<AskDeleteResponse>}
         */
        let body = await res.json();

        if (body.ret.invalid_username !== undefined) {
            throw new DeleteError(body.ret.invalid_username, "Incorrect username provided, does not match token.");
        }

        this._setState(DELETE_STATES.PASSWORD);
        this._setPermit(body.permit);
        this.token = body.ret.ask_delete;

        return this;
    }

    /**
     * Provide the password to confirm the deletion.
     *
     * @param {string} password The password to confirm the deletion.
     * @returns {Promise<DeleteFlow>}
     *
     * @throws {DeleteError} If the password is incorrect -- **YOU MUST USE THE NEW TOKEN**.
     * @throws {InvalidStateError} If the flow is not in the correct state.
     * @throws {HttpError} If the request fails.
     * @throws {PreconditionFailure} If the permit has expired.
     */
    async password(password) {
        this._checkState(DELETE_STATES.PASSWORD, "Cannot call password() in state other than 'password'.");
        /**
         * @typedef {{[invalid_password]: string, [password]: string}} PasswordResponse
         */

        let res = await this._post_with_permit(
            { password: { password, token: this.token } }
        );

        /**
         * @type {ApiResponse<PasswordResponse>}
         */
        let body = await res.json();

        if (body.ret.invalid_password !== undefined) {
            throw new DeleteError(body.ret.invalid_password, "Incorrect password provided.");
        }

        this._setState(DELETE_STATES.CONFIRM);
        this._setPermit(body.permit);
        this.token = body.ret.password;

        return this;
    }

    /**
     * Confirm the deletion.
     *
     * @returns {Promise<void>}
     *
     * @throws {InvalidStateError} If the flow is not in the correct state.
     * @throws {HttpError} If the request fails.
     * @throws {PreconditionFailure} If the permit has expired
     */
    async confirm() {
        this._checkState(DELETE_STATES.CONFIRM, "Cannot call confirm() in state other than 'confirm'.");
        await this._post_with_permit({ confirm: { token: this.token } });
        this._setState(DELETE_STATES.TERMINAL);
    }
}