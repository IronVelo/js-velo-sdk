import { H2Fetch } from "../src";
import path from "node:path";

test('can communicate', async () => {
    let client = new H2Fetch({
        tls_path: path.join(process.env.HOME, "unsafe-dev-certificate.pem")
    });

    if (!process.env.IV_DEV_B_URL || !process.env.IV_DEV_PORT) {
        console.error('Environment variables IV_DEV_B_URL and IV_DEV_PORT must be set');
        process.exit(1);
    }

    let url = `${process.env["IV_DEV_B_URL"]}:${process.env["IV_DEV_PORT"]}/login`;

    let res = await client.fetch(url, {
        method: "POST",
        body: JSON.stringify({
            args: {
                hello_login: {username: "test", password: "test"}
            }
        })
    });

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);

    let data = await res.json();
    expect(data["ret"]["failure"]).toBe("UsernameNotFound");
    expect(data["permit"]).toBeNull();

    await client.close();
});