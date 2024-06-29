import { H2Fetch } from "../src";

test('can communicate', async () => {
    let client = new H2Fetch();

    let res = await client.fetch("https://example.local:3069/login", {
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