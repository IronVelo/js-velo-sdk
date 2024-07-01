import {SdkBuilder} from "../src";
import {H2Fetch} from "../../h2-fetch-node";
import {TOTP} from "totp-generator";
import path from "node:path";

/**
 * @returns {H2Fetch}
 */
export function makeFetch() {
    return new H2Fetch({
        tls_path: path.join(process.env.HOME, "unsafe-dev-certificate.pem")
    });
}

/**
 * Get the URL and port from the env
 * @returns {{bUrl: string, port: number}}
 */
export function fromEnv() {
    if (!process.env.IV_DEV_B_URL || !process.env.IV_DEV_PORT) {
        console.error('Environment variables `IV_DEV_B_URL` and `IV_DEV_PORT` must be set');
        process.exit(1);
    }

    return {bUrl: process.env.IV_DEV_B_URL, port: parseInt(process.env.IV_DEV_PORT)}
}

/**
 * Create a new SDK.
 * @param {function(string, Object): Promise<Response>} fetch
 * @returns {VeloSdk}
 */
export function makeSdk(fetch) {
    let {bUrl, port} = fromEnv();

    return new SdkBuilder()
        .fetch(fetch)
        .port(port)
        .baseUrl(bUrl)
        .build();
}

/**
 * Create a new SDK with a less-secure configuration.
 * @param {function(string, Object): Promise<Response>} fetch
 * @returns {VeloSdk}
 */
export function makeInsecureSdk(fetch) {
    let {bUrl, port} = fromEnv();

    return new SdkBuilder()
        .fetch(fetch)
        .port(port)
        .mfaOptional(true)
        .baseUrl(bUrl)
        .build();
}

/**
 * Get the current TOTP from a provisioning URI.
 *
 * @param {string} uri The provisioning URI.
 *
 * @returns {string} The current TOTP.
 */
export function getTotp(uri) {
    // get client secret
    let parsed = new URL(uri);

    let secret = parsed.searchParams.get("secret");
    let digits = parseInt(parsed.searchParams.get("digits"));
    let period = parseInt(parsed.searchParams.get("period"));

    return TOTP.generate(secret, {digits, period, algorithm: "SHA-256"}).otp;
}
