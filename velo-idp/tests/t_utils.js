import {SdkBuilder} from "../src";
import {TOTP} from "totp-generator";

/**
 * Create a new SDK.
 * @param {function(string, Object): Promise<Response>} fetch
 * @returns {VeloSdk}
 */
export function makeSdk(fetch) {
    return new SdkBuilder()
        .fetch(fetch)
        .port(3069)
        .baseUrl("https://example.local")
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
