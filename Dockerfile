FROM gcr.io/distroless/nodejs24-debian12@sha256:b35a10df56aa17825e81e836ff70fe3c27002809dd94e6bfd655ed05bac52230
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

ENTRYPOINT ["/nodejs/bin/node"]
CMD ["server.js"]
