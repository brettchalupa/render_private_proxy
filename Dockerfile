FROM denoland/deno:2.1.4

WORKDIR /app

ADD . /app

CMD ["task", "serve"]
