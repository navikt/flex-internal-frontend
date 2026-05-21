FROM gcr.io/distroless/nodejs24-debian13@sha256:e70510b44870c5686983f2b11f22b884f2dfacf86aea69b6b0edb2ccb3f237f4
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY .next/standalone ./
COPY .next/static ./.next/static

ENTRYPOINT ["/nodejs/bin/node"]
CMD ["server.js"]
