# Render Private Proxy

Simple Render service to proxy web requests to a private Render service.

Built specifically for accessing the Faktory web UI when running it as a
private service on Render: https://github.com/contribsys/faktory-render but can
be used for any private service responding to HTTP requests on Render.

Built with TypeScript and Deno.

## Configuring

Set `TARGET_URL` for to the private host name from Render with the protocol,
ex: `http://my-faktory:7420`

If the web service requires basic auth, confiure `TARGET_USERNAME` and
`TARGET_PASSWORD`, and it'll also prompt users to enter that too.

## Deploying

1. Create a new Render Web Service
2. Select from public repo & enter this URL: https://github.com/brettchalupa/render_private_proxy
3. Optionally configure `/up` to be the health check endpoint

## Developing

1. Install Deno 2+
2. Run `deno task dev` to boot up the server locally in watch mode
