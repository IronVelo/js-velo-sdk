# IronVelo SDK

## Introduction

The IronVelo JS SDK provides a secure and semi-user-friendly interface for integrating with IronVelo's Identity Provider
(IdP). Due to JavaScript's weak type system, this SDK is not as robust or user-friendly as our other SDKs. We strongly 
recommend leveraging tools like jest to test your implementations. While we generally use a correct-by-construction 
approach, this is currently not the case for this SDK. In time, we will add custom linters to enforce usage invariants, 
but this requires a decent amount of effort.

## Stability

This SDK is currently unstable, and we will be iterating and changing the interface significantly based on user 
feedback. We follow semantic versioning, meaning all versions prior to `v1.0.0` are not considered stable.

## Usage

Using this SDK is relatively straightforward. All interactions with the SDK begin with the `VeloSdk` type, which can be 
created either via its constructor or the `SdkBuilder` class.

```js
import {SdkBuilder} from "velo-idp/src";
import fetch from "h2-fetch-node/src";

const velo_sdk = new SdkBuilder()
    .fetch(fetch) // either use browsers `fetch` or the provided `fetch` for node
    .baseUrl("https://example-endpoint.com")
    .port(443)
    .build()
```

### Basics

There are two ways of using the SDK, one being significantly simpler for most use cases. One advantage of interacting 
with our IdP is that your server does not need to store any state, alleviating the complexities of sticky connections.

Every flow can be serialized and deserialized. Each serialized state includes a state field, which describes the action 
to be invoked.

**Security Note:** If a user tampers with this state, it is not a security concern as all security properties are 
ensured in the IdP itself. To reduce the number of requests sent to the IdP, a simple solution is using an HMAC.

```js
let signup_flow = velo_sdk.Signup();

await signup_flow
    .hello("desired-username"); // throws `UsernameExistsError` if taken

let ser = signup_flow.serialize();

// give ser to the user ...
```

For further information on using the SDK for flows, refer to the comprehensive API documentation. The tests can also 
serve as usage examples.

### Token Management

Token management is where IronVelo has most of its innovations beyond writing an IdP as a compiler. Our API for token 
management is highly performant and should be used on every authenticated request without leveraging any caching.

Every user has an identifier associated with their account. This identifier should be used for storing their information
in your database. Every time you validate a token, a new token and the user's identifier are provided. In our IdP, 
tokens are strictly single-use to prevent replay attacks and detect token theft. Each time a token is used (outside of 
revocation), a new token is returned. The token provided to the API should be discarded, and the new token used in its 
place. We generally model our tokens as affine types for this reason, and in the future, we will add affine types to 
JavaScript via eslint.

**Verify a Token**:

```js
let {user_id, token} = await velo_sdk.verifyToken(provided_token);

// use the user_id and return the token to the user ...
```

When an account is compromised via auth delegation, or the user cannot access the device where the token was 
compromised, the `revokeTokens` API should be used to log out of all sessions.

```js
await velo_sdk.revokeTokens(users_token);
```

## Connecting to the Development Server

```js
/**
 * Create an SDK instance connected to the development server.
 *
 * @returns {{sdk: VeloSdk, conn: H2Fetch}}
 */
function createDevSdkExample() {
    let conn = new H2Fetch({
        // path to the CA certificate we provided to you directly.
        tls_path: path.join(process.env.HOME, "unsafe-dev-certificate.pem")
    })

    let sdk = new SdkBuilder()
        // First, we set the fetcher, as the default is window.fetch which is not accessible from node
        .fetch(conn.fetch.bind(conn /* bind to the H2Fetch instance. */))
        // Tell the SDK which port to connect to
        .port(0 /* The port we sent you directly */)
        // The baseUrl we provided directly ...
        .baseUrl("https://the_url_we_sent_you_directly")
        // Finally construct the SDK
        .build();

    return {sdk, conn}
}

async function useSdkExample() {
    let {sdk, conn} = createDevSdkExample();

    // use the sdk directly, for example:
    await sdk.verifyToken(Buffer.from("some token here", "base64"));

    // close the connection if in a test, as jest will hang with any handles open. You won't need to do this in 
    // production, as h2 connections can be reused and support multiplexing. TCP and TLS handshakes are many hops that 
    // should in a perfect world happen only on your server or serverless function's startup.
    await conn.close();
}
```

## Optional MFA

MFA by default is a required, if you don't want this both the IdP and the SDK must be aware of this. If you've 
previously expressed you want MFA to be optional, then the provided IdP will respect this. 

### Enabling for the SDK

```js
let sdk = new SdkBuilder()
    // Set the fetch method
    .fetch(Function.prototype.bind.call(window.fetch, window))
    // Tell the SDK which port to connect to
    .port(0 /* The port we sent you directly */)
    // The baseUrl we provided directly ...
    .baseUrl("https://the_url_we_sent_you_directly")
    // Express that MFA is optional
    .mfaOptional(true)
    // Finally construct the SDK
    .build();
```

Now, you can create a user without MFA:

```js
let signup_flow = sdk.signup();

await signup_flow.hello("desired-username");
await signup_flow.setPassword("Password1234!");

// finish the flow
let token = await signup_flow.setupNoMfa();
```

Logging in for a user without MFA:

```js
let login_flow = sdk.login();

let result = await login_flow.hello("desired-username", "Passwod1234!");

if (result.complete) {
    // the user has not set MFA up, so we are finished the flow.
    let token = result.token;
} else {
    // the user set up MFA, the supported MFA kinds are returned.
    let mfa_kinds = result.mfa_kinds;
    
    // continue the flow ...
}
```