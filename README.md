# Render Private Proxy

Simple Render service to proxy web requests to a private Render service.

Built with TypeScript and Deno.

## Configuring

Set `TARGET_URL` for to the private host name from Render with the protocol,
ex: `http://my-faktory:7420`

If the web service requires basic auth, confiure `TARGET_USERNAME` and
`TARGET_PASSWORD`, and it'll also prompt users to enter that too.

## Deploying

1. Create a new Render Web Service
2. Enter this URL: https://github.com/brettchalupa/render_private_proxy

## Developing

Run `deno task dev` to boot up the server locally.
