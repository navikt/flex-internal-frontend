FROM gcr.io/distroless/nodejs24-debian13@sha256:482fabdb0f0353417ab878532bb3bf45df925e3741c285a68038fb138b714cba
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY .next/standalone ./
COPY .next/static ./.next/static

ENTRYPOINT ["/nodejs/bin/node"]
CMD ["server.js"]
