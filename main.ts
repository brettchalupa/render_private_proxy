const targetUrl = Deno.env.get("TARGET_URL");
const targetUsername = Deno.env.get("TARGET_USERNAME");
const targetPassword = Deno.env.get("TARGET_PASSWORD");

if (!targetUrl) {
  console.error("TARGET_URL environment variable is not set.");
  Deno.exit(1);
}

const target = new URL(targetUrl);

async function handler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);

    const targetPath = url.pathname + url.search;

    const targetRequestUrl = new URL(targetPath, target);

    const headers = new Headers(req.headers);
    headers.delete("host"); // Important: Remove host header

    if (targetUsername && targetPassword) {
      const basicAuth = btoa(`${targetUsername}:${targetPassword}`);
      headers.set("Authorization", `Basic ${basicAuth}`);
    }

    const targetRequest = new Request(targetRequestUrl.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: "manual",
    });

    const targetResponse = await fetch(targetRequest);

    const responseHeaders = new Headers(targetResponse.headers);

    // Remove hop-by-hop headers
    responseHeaders.delete("connection");
    responseHeaders.delete("keep-alive");
    responseHeaders.delete("proxy-authenticate");
    responseHeaders.delete("proxy-authorization");
    responseHeaders.delete("te");
    responseHeaders.delete("trailers");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("upgrade");

    return new Response(targetResponse.body, {
      status: targetResponse.status,
      statusText: targetResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

console.log("Proxy server listening on http://localhost:8000");
Deno.serve(handler, { port: 8000 });
