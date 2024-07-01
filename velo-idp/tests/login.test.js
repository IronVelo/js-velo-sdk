import {LoginError} from "../src";
import { makeSdk, makeFetch } from "./t_utils";

test('login-username-exists', async () => {
    let fetch = makeFetch();
    let sdk = makeSdk(fetch.fetch.bind(fetch));

    try {
        await sdk.login().hello("test", "test");
    } catch (e) {
        if (e instanceof LoginError) {
            expect(e.kind).toBe("UsernameNotFound");
            await fetch.close();
        } else {
            await fetch.close();
            throw e;
        }
    }
});

test('login-invalid-password', async () => {
    let fetch = makeFetch();
    let sdk = makeSdk(fetch.fetch.bind(fetch));

    try {
        await sdk.login().hello("bob", "wrong");
    } catch (e) {
        if (e instanceof LoginError) {
            expect(e.kind).toBe("IncorrectPassword");
            await fetch.close();
        } else {
            await fetch.close();
            throw e;
        }
    }
});

test('correct-password-wrong-otp', async () => {
    let fetch = makeFetch();
    let sdk = makeSdk(fetch.fetch.bind(fetch));

    let login_flow = sdk.login();
    await login_flow.hello("bob", "Password1234!");
    await login_flow.prepareTotp();

    let maybe_token = await login_flow.verifyOtp("12345678");
    expect(maybe_token).toBeNull();
    await fetch.close();
});
