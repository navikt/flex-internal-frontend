FROM gcr.io/distroless/nodejs24-debian13@sha256:24bc0fe0225c7518f202a822587dad74fe143b96326b81fe5cc08c1df8bed03e
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

ENTRYPOINT ["/nodejs/bin/node"]
CMD ["server.js"]
