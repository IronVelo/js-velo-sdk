import {LoginError} from "../src";
import {makeSdk, makeFetch, makeInsecureSdk} from "./t_utils";

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

test('login-user-no-mfa', async () => {
    let fetch = makeFetch();
    let sdk = makeInsecureSdk(fetch.fetch.bind(fetch));

    let signup_flow = sdk.signup();

    await signup_flow.hello("login-no-mfa");
    await signup_flow.setPassword("Password1234!");

    await signup_flow.setupNoMfa();

    let login_flow = sdk.login();

    let res = await login_flow
        .hello("login-no-mfa", "Password1234!");

    expect(res.complete);

    await sdk.delete(res.token).hello("login-no-mfa")
        .then((state) => state.password("Password1234!"))
        .then((state) => state.confirm());

    await fetch.close();
});