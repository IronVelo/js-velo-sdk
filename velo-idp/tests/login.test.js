import {LoginError} from "../src";
import { H2Fetch } from "../../h2-fetch-node/src/index.js";
import { makeSdk } from "./t_utils";

test('login-username-exists', async () => {
    let fetch = new H2Fetch();
    let sdk = makeSdk(fetch.fetch.bind(fetch));

    try {
        await sdk.login().hello("test", "test");
    } catch (e) {
        if (e instanceof LoginError) {
            expect(e.kind).toBe("UsernameNotFound");
            fetch.close();
        } else {
            fetch.close();
            throw e;
        }
    }
});

test('login-invalid-password', async () => {
    let fetch = new H2Fetch();
    let sdk = makeSdk(fetch.fetch.bind(fetch));

    try {
        await sdk.login().hello("bob", "wrong");
    } catch (e) {
        if (e instanceof LoginError) {
            expect(e.kind).toBe("IncorrectPassword");
            fetch.close();
        } else {
            fetch.close();
            throw e;
        }
    }
});

test('correct-password-wrong-otp', async () => {
    let fetch = new H2Fetch();
    let sdk = makeSdk(fetch.fetch.bind(fetch));

    let login_flow = sdk.login();
    await login_flow.hello("bob", "Password1234!");
    await login_flow.prepareTotp();

    let maybe_token = await login_flow.verifyOtp("12345678");
    expect(maybe_token).toBeNull();
    fetch.close();
});
