const targetUrl = Deno.env.get("TARGET_URL");
const targetUsername = Deno.env.get("TARGET_USERNAME");
const targetPassword = Deno.env.get("TARGET_PASSWORD");

if (!targetUrl) {
  console.error("TARGET_URL environment variable is not set.");
  Deno.exit(1);
}

const target = new URL(targetUrl);

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/up") {
    return new Response("OK", { status: 200 });
  }

  if (targetUsername && targetPassword) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Proxy"' },
      });
    }

    const [authType, authString] = authHeader.split(" ");
    if (authType !== "Basic") {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Proxy"' },
      });
    }

    try {
      const [username, password] = atob(authString).split(":");
      if (username !== targetUsername || password !== targetPassword) {
        return new Response("Unauthorized", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="Proxy"' },
        });
      }
    } catch (error) {
      console.error("Basic Auth Error:", error);
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Proxy"' },
      });
    }
  }

  try {
    const targetPath = url.pathname + url.search;

    const targetRequestUrl = new URL(targetPath, target);

    const headers = new Headers(req.headers);
    headers.delete("host"); // Important: Remove host header

    if (targetUsername && targetPassword) {
      const basicAuth = btoa(`${targetUsername}:${targetPassword}`);
      headers.set("Authorization", `Basic ${basicAuth}`);
    }

    const targetStr = targetRequestUrl.toString();
    console.log(`Proxying request to: ${targetStr}`);
    const targetRequest = new Request(targetStr, {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: "manual",
    });

    const targetResponse = await fetch(targetRequest);

    const responseHeaders = new Headers(targetResponse.headers);

    console.info(`Status response: ${targetResponse.status}`);

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

const port = Deno.env.get("PORT") || 8000;
console.log(`Proxy server listening on http://localhost:${port}`);
Deno.serve({ port }, handler);
