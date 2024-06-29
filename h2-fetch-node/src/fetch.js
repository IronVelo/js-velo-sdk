import http2 from "http2";
import { Readable, Transform } from "stream"
import { StringDecoder } from "string_decoder";

/**
 * @typedef {import("http2").ClientHttp2Session} ClientHttp2Session
 * @typedef {import("http2").ClientHttp2Stream} ClientHttp2Stream
 */

/**
 * @typedef {"standard"} StandErrKind
 *
 * -- NOTE: perhaps this should be merged with MalErrKind?
 * @typedef {"frame"} FrameErrKind
 * @typedef {"abort"} AbortErrKind
 * @typedef {"malformed"} MalErrKind
 * @typedef {"go_away"} GoAwayErrKind
 * @typedef {"closed"} ClosedErrKind
 */

/**
 * @typedef {StandErrKind | FrameErrKind | AbortErrKind | MalErrKind | GoAwayErrKind | ClosedErrKind} ErrKind
 */

/**
 * @type {{
 *     STANDARD: StandErrKind,
 *     FRAME: FrameErrKind,
 *     ABORT: AbortErrKind,
 *     MALFORMED: MalErrKind,
 *     GO_AWAY: GoAwayErrKind
 *     CLOSED: ClosedErrKind
 * }}
 */
export const ErrorKinds = {
    STANDARD: "standard",
    FRAME: "frame",
    ABORT: "abort",
    MALFORMED: "malformed",
    GO_AWAY: "go_away",
    CLOSED: "closed"
};

export class AbortError extends Error {
    constructor() {
        // TODO: this should be a more descriptive error message.
        super("The h2 connection was aborted.");
    }
}

export class FrameError extends Error {
    /**
     * @type {number}
     */
    ty;
    /**
     * @type {number}
     */
    code;
    /**
     * @type {number}
     */
    id;

    /**
     * @param {number} ty
     * @param {number} code
     * @param {number} id
     */
    constructor(ty, code, id) {
        super(`FrameError {type: ${ty}, code: ${code}, id: ${id}}`)
        this.ty = ty;
        this.code = code;
        this.id = id;
    }
}

export class GoAwayError extends Error {
    /**
     * @type {number}
     * @readonly
     */
    errorCode;

    /**
     * @type {number}
     * @readonly
     */
    lastStreamId;

    /**
     * @type {Buffer}
     * @readonly
     */
    opaqueData;

    /**
     * @param {number} errorCode
     * @param {number} lastStreamId
     * @param {Buffer} opaqueData
     */
    constructor(errorCode, lastStreamId, opaqueData) {
        super(`GoAwayError {errorCode: ${errorCode}, lastStreamId: ${lastStreamId}}`);
        this.errorCode = errorCode;
        this.lastStreamId = lastStreamId;
        this.opaqueData = opaqueData;
    }
}

export class ClosedError extends Error {
    constructor() {
        super("The connection was closed unexpectedly.");
    }
}

export class H2Error extends Error {
    /**
     * @type {ErrKind}
     * @readonly
     */
    kind;

    /**
     * @type {Error}
     * @readonly
     */
    error;

    /**
     * @param {ErrKind} kind
     * @param {Error} error
     */
    constructor(kind, error) {
        super(error.message);
        this.kind = kind;
        this.error = error;
    }
}

/**
 * @private
 */
class TextDecoderTransform extends Transform {
    constructor(encoding = 'utf-8') {
        super();
        this.decoder = new StringDecoder(encoding);
    }

    _transform(chunk, encoding, callback) {
        const decodedChunk = this.decoder.write(chunk);
        this.push(decodedChunk);
        callback();
    }

    _flush(callback) {
        const remaining = this.decoder.end();
        if (remaining) {
            this.push(remaining);
        }
        callback();
    }
}

export class Response {
    /**
     * The response body as a stream.
     *
     * @type {Readable}
     * @readonly
     */
    stream;

    /**
     * The status read-only property of the {@link Response} interface contains the
     * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status|HTTP status codes} of the response.
     *
     * For example, `200` for success, `404` if the resource could not be found.
     *
     * @type {number}
     * @readonly
     */
    status;

    /**
     * The `ok` read-only property of the Response interface contains a Boolean stating whether the response was
     * successful (status in the range 200-299) or not.
     *
     * @type {boolean}
     * @readonly
     */
    ok;

    /**
     * The headers read-only property of the {@link Response} interface contains the `Headers` object associated with
     * the response.
     *
     * The api for headers diverges from the web api, the headers are a plain object with the header names as keys.
     * @type {object}
     * @readonly
     */
    headers;

    /**
     * @param {Readable} stream
     * @param {number} status
     * @param {Object} headers
     */
    constructor(stream, { status, headers }) {
        this.stream = stream;
        this.status = status;
        this.headers = headers;
        this.ok = status >= 200 && status < 300;
    }

    /**
     * Get the response body as text.
     * @returns {Promise<string>} - The response body as text.
     */
    async text() {
        let result = "";

        const textDecoderStream = new TextDecoderTransform();
        this.stream.pipe(textDecoderStream);

        for await (const chunk of textDecoderStream) {
            result += chunk;
        }

        return result;
    }

    /**
     * Get the response body as a JSON object
     * @returns {Promise<any>}
     */
    async json() {
        return JSON.parse(await this.text());
    }
}

/**
 * @class H2Fetch
 * @classdesc A class for fetching resources using HTTP/2.
 */
export class H2Fetch {
    /**
     * @type {ClientHttp2Session | null}
     * @private
     */
    conn;

    /**
     * @type {string | null}
     * @private
     */
    baseUrl;

    /**
     * Create a new H2Fetch.
     */
    constructor() {
        this.conn = null;
        this.baseUrl = null;

        this._get_conn.bind(this);
        this.fetch.bind(this);
        this.close.bind(this);
    }

    /**
     * @param {string} url
     * @returns {Promise<ClientHttp2Session>}
     * @private
     * @static
     */
    static _connect(url) {
        return new Promise((res, rej) => {
            let conn = http2.connect(url);

            H2Fetch._err_handler(conn, rej);
            H2Fetch._close_handler(conn, rej);

            conn.on("connect", (session, _) => {
                H2Fetch._clear_err_handler(conn);
                H2Fetch._clear_close_handler(conn);
                res(session);
            });
        })
    }

    /**
     * @param {string} baseUrl
     * @returns {Promise<ClientHttp2Session>}
     * @private
     */
    // TODO: this is lazy, probably should manage connections rather than tearing down when communicating w/ different
    // hosts.
    _get_conn(baseUrl) {
        if (this.conn == null || this.conn.closed) {
            this.baseUrl = baseUrl;
            return H2Fetch._connect(baseUrl).then((conn) => {
                this.conn = conn;
                return conn;
            });
        } else if (this.baseUrl !== baseUrl) {
            this.conn.close();
            this.baseUrl = baseUrl;
            return H2Fetch._connect(baseUrl).then((conn) => {
                this.conn = conn;
                return conn;
            });
        } else {
            return Promise.resolve(this.conn);
        }
    }

    /**
     * Handle request errors
     *
     * @param {ClientHttp2Stream | ClientHttp2Session} req
     * @param {function(Error)} rej
     * @private
     * @static
     */
    static _err_handler(req, rej) {
        req.on("error", (error) => rej(new H2Error(ErrorKinds.STANDARD, error)));
        req.on("aborted", () => rej(new H2Error(ErrorKinds.ABORT, new AbortError())));
        req.on(
            "frameError",
            (ty, code, id) => rej(new H2Error(ErrorKinds.FRAME, new FrameError(ty, code, id)))
        );
        req.on("goaway", (errorCode, lastStreamId, opaqueData) => {
            rej(new H2Error(ErrorKinds.GO_AWAY, new GoAwayError(errorCode, lastStreamId, opaqueData)));
        });
    }

    /**
     * Clear the error handlers
     *
     * @param {ClientHttp2Stream | ClientHttp2Session} req
     * @private
     * @static
     */
    static _clear_err_handler(req) {
        req.removeAllListeners("error");
        req.removeAllListeners("aborted");
        req.removeAllListeners("frameError");
        req.removeAllListeners("goaway");
    }

    /**
     * Replace the request error handlers
     *
     * @param {ClientHttp2Stream | ClientHttp2Session} req
     * @param {function(Error)} rej
     * @private
     * @static
     */
    static _replace_err_handler(req, rej) {
        // only time JS single threaded nature is alright, there shouldn't be room for race
        // conditions here.
        H2Fetch._clear_err_handler(req);
        H2Fetch._err_handler(req, rej);
    }

    /**
     * Handle the close event
     *
     * @param {ClientHttp2Stream | ClientHttp2Session} req
     * @param {function(Error)} rej
     * @private
     * @static
     */
    static _close_handler(req, rej) {
        req.on("close", () => rej(new H2Error(ErrorKinds.CLOSED, new ClosedError())));
    }

    /**
     * Clear the close handler
     *
     * @param {ClientHttp2Stream | ClientHttp2Session} req
     * @private
     * @static
     */
    static _clear_close_handler(req) {
        req.removeAllListeners("close");
    }

    /**
     * Get the URL object from a string or URL object.
     *
     * @param {string | URL} resource
     * @returns {URL}
     * @private
     * @static
     */
    static _get_url(resource) {
        if (resource instanceof URL) {
            return resource;
        } else {
            return new URL(resource);
        }
    }

    /**
     * The `fetch()` method starts the process of fetching a resource from the network, returning a promise that is
     * fulfilled once the response is available.
     *
     * The promise resolves to the {@link Response} object representing the response to your request.
     *
     * A `fetch()` promise only rejects when the request fails, for example, because of a badly-formed request URL or a
     * network error. A `fetch()` promise does not reject if the server responds with HTTP status codes that indicate
     * errors (`404`, `504`, etc.). Instead, a `then()` handler must check the {@link Response.ok} and/or
     * {@link Response.status} properties.
     *
     * @param {string | URL} resource - The URL of the resource you want to fetch.
     * @param {object} options - An object containing any custom settings you want to apply to the request.
     * @param {string} [options.method] - The request method, e.g., `"GET"`, `"POST"`. The default is `"GET"`.
     * @param {object} [options.headers] - Any headers you want to add to your request.
     * @param {string | Buffer | Uint8Array | TypedArray | DataView | FormData | Blob} [options.body] -
     *  The body that you want to add to your request. Note that a request using the `GET` or `HEAD` method cannot have
     *  a body.
     * @returns {Promise<Response>}
     */
    fetch(resource, options) {
        const { origin, pathname, search } = H2Fetch._get_url(resource);
        const path = `${pathname}${search}`;

        return new Promise((res, rej) => {
            this._get_conn(origin).then(conn => {
                const { method = 'GET', headers = {}, body } = options;

                // TODO: we should provide all of the mandatory h2 headers here. For right now the service we're
                // TODO: interacting with is lenient.
                let req = conn.request({":method": method, ":path": path, ...headers});

                H2Fetch._err_handler(req, rej);
                H2Fetch._close_handler(req, rej);

                req.setEncoding("utf8");
                if (body) {req.write(body);}
                req.end();

                const stream = new Readable({read() {}});

                req.on("response", (i_headers) => {
                    const status = i_headers[":status"];

                    // ensure status is a number
                    if (typeof status !== "number") {
                        rej(new H2Error(ErrorKinds.MALFORMED, new Error("Status is not a number.")));
                    }

                    const res_headers = i_headers;

                    // On error, we are now destroying the stream now propagating the errors upwards via it.
                    H2Fetch._replace_err_handler(req, stream.destroy.bind(stream));
                    H2Fetch._clear_close_handler(req);
                    req.on("close", () => stream.push(null));

                    res(new Response(stream, { status, headers: res_headers }));
                });

                req.on("data", stream.push.bind(stream));
                req.on("end", () => stream.push(null));
            }).catch(err => rej(err));
        })
    }

    /**
     * Close the connection.
     *
     * @returns {Promise<void>}
     */
    close() {
        return new Promise((res) => {
            if (this.conn) {
                this.conn.close();
                this.conn.on("close", () => res());
            } else {
                res();
            }
        })
    }
}

const conn_ctx = new H2Fetch();

/**
 * Fetch a resource using HTTP/2.
 *
 * @param {string | URL} resource - The URL of the resource you want to fetch.
 * @param {object} options - An object containing any custom settings you want to apply to the request.
 * @param {string} [options.method] - The request method, e.g., `"GET"`, `"POST"`. The default is `"GET"`.
 * @param {object} [options.headers] - Any headers you want to add to your request.
 * @param {string | Buffer | Uint8Array | TypedArray | DataView | FormData | Blob} [options.body] -
 *   The body that you want to add to your request. Note that a request using the `GET` or `HEAD` method cannot have
 *   a body.
 * @returns {Promise<Response>}
 */
export default function fetch(resource, options) {
    return conn_ctx.fetch(resource, options);
}