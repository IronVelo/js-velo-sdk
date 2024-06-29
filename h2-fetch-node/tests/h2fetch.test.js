import http2 from 'http2';
import { Readable } from 'stream';
import H2Fetch, { Response, H2Error, ErrorKinds, AbortError, FrameError } from '../src/fetch.js';

jest.mock('http2');

describe('H2Fetch', () => {
    let h2fetch;
    let mockSession;
    let mockRequest;
    let mockResponseStream;

    beforeEach(() => {
        h2fetch = new H2Fetch();
        mockRequest = {
            on: jest.fn(),
            setEncoding: jest.fn(),
            write: jest.fn(),
            end: jest.fn(),
            removeAllListeners: jest.fn()
        };
        mockResponseStream = new Readable({
            read() {}
        });
        mockSession = {
            request: jest.fn(() => mockRequest),
            on: jest.fn(),
            close: jest.fn(),
            removeAllListeners: jest.fn()
        };
        http2.connect.mockImplementation((url) => {
            // Simulate async connection establishment
            setImmediate(() => {
                mockSession.on.mock.calls.forEach(([event, cb]) => {
                    if (event === 'connect') {
                        cb(mockSession);
                    }
                });
            });
            return mockSession;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should connect to the server', async () => {
        const session = await h2fetch._connect('https://example.com');
        expect(session).toBe(mockSession);
    });

    test('should handle connection errors', async () => {
        mockSession.on.mockImplementation((event, cb) => {
            if (event === 'error') {
                cb(new Error('Connection error'));
            }
        });

        await expect(h2fetch._connect('https://example.com')).rejects.toThrow('Connection error');
    });

    test('should fetch a resource', async () => {
        mockRequest.on.mockImplementation((event, cb) => {
            if (event === 'response') {
                setImmediate(() => cb({ ':status': 200 }));
            }
            if (event === 'data') {
                setImmediate(() => cb('{"key":"value"}'));
            }
            if (event === 'end') {
                setImmediate(() => cb());
            }
        });

        const response = await h2fetch.fetch('https://example.com/resource', { method: 'GET' });
        const jsonResponse = await response.json();
        expect(jsonResponse).toEqual({ key: 'value' });
        expect(response.status).toBe(200);
        expect(response.ok).toBe(true);
    });

    test('should handle fetch errors', async () => {
        mockRequest.on.mockImplementation((event, cb) => {
            if (event === 'error') {
                setImmediate(() => cb(new Error('Fetch error')));
            }
        });

        await expect(h2fetch.fetch('https://example.com/resource', { method: 'GET' })).rejects.toThrow('Fetch error');
    });
});