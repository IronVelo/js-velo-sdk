import {getTotp, makeSdk, makeFetch, makeInsecureSdk} from "./t_utils";
import { UsernameExistsError, InsufficientPassword } from "../src";

test('signup-username-exists', async () => {
    let fetch = makeFetch();
    let sdk = makeSdk(fetch.fetch.bind(fetch));

    try {
        await sdk.signup().hello("bob");
    } catch (e) {
        await fetch.close();
        if (e instanceof UsernameExistsError) {
            expect(e.message).toBe("Username bob already exists.");
        } else {
            throw e;
        }
    }
});

/**
 * @param {string} username
 * @param {string} password
 * @param {function(InsufficientPassword): void} inspectErr
 */
async function check_insufficient(username, password, inspectErr) {
    let fetch = makeFetch();
    let sdk = makeSdk(fetch.fetch.bind(fetch));

    let signup_flow = sdk.signup();

    try {
        await signup_flow.hello(username);
        await signup_flow.setPassword(password);
    } catch (e) {
        await fetch.close();
        if (e instanceof InsufficientPassword) {
            inspectErr(e);
        } else {
            throw e;
        }
    }
}

test('signup-password-insufficient', async () => {
    await check_insufficient("insufficient00", "short", (e) => {
        expect(e.variant).toBe("TooFewCharacters");
        expect(e.value).toBe("short".length);
    });
    await check_insufficient("insufficient01", "long".repeat(100), (e) => {
        expect(e.variant).toBe("TooManyCharacters");
        expect(e.value).toBe("long".length * 100);
    });
    await check_insufficient("insufficient02", "noNumbers!", (e) => {
        expect(e.variant).toBe("NeedsNumeric");
        expect(e.value).toBeUndefined();
    });
    await check_insufficient("insufficient03", "noSpecial123", (e) => {
        expect(e.variant).toBe("NeedsSpecial");
        expect(e.value).toBeUndefined();
    });
    await check_insufficient("insufficient04", "no_capital123!", (e) => {
        expect(e.variant).toBe("NeedsCapital");
        expect(e.value).toBeUndefined();
    });
});

test('signup-user-success', async () => {
    let fetch = makeFetch();
    let sdk = makeSdk(fetch.fetch.bind(fetch));

    let signup_flow = sdk.signup();

    await signup_flow.hello("suc-user");
    await signup_flow.setPassword("Password1234!");
    let p_uri = await signup_flow.setupTotp();

    let totp = getTotp(p_uri);
    if (!await signup_flow.verifyTotp(totp)) {
        // maybe weird period or something, feasible. But cannot happen twice.
        await signup_flow.verifyTotp(totp);
    }

    let oToken = await signup_flow.issueToken();

    let {user_id, token} = await sdk.verifyToken(Buffer.from(oToken, "base64"));

    await sdk.delete(token).hello("suc-user")
        .then((state) => state.password("Password1234!"))
        .then((state) => state.confirm());

    await fetch.close();
});

test('signup-user-success-no-mfa', async () => {
    let fetch = makeFetch();
    let sdk = makeInsecureSdk(fetch.fetch.bind(fetch));

    let signup_flow = sdk.signup();

    await signup_flow.hello("suc-user-no-mfa");
    await signup_flow.setPassword("Password1234!");

    let token = await signup_flow.setupNoMfa();

    await sdk.delete(token).hello("suc-user-no-mfa")
        .then((state) => state.password("Password1234!"))
        .then((state) => state.confirm());

    await fetch.close();
});