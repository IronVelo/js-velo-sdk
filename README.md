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
