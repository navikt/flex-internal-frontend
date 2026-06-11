FROM gcr.io/distroless/nodejs24-debian13@sha256:10e262383ceb3a2a5f6f5ceaca5ecebe74951eff21868a055589676eec3a8001
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY .next/standalone ./
COPY .next/static ./.next/static

ENTRYPOINT ["/nodejs/bin/node"]
CMD ["server.js"]
