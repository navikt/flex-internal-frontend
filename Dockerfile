FROM gcr.io/distroless/nodejs24-debian12@sha256:aad62f814208ec57ff3a67a9ca8764b0bfa0f7af9809008a04aada96f6987dab
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY .next/standalone ./
COPY .next/static ./.next/static

ENTRYPOINT ["/nodejs/bin/node"]
CMD ["server.js"]
