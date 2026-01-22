FROM gcr.io/distroless/nodejs24-debian12@sha256:aa9ea28c521590ff497a06449109f26582ca9fa7eacfe8b169fec24399c1bd8a
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

ENTRYPOINT ["node"]
CMD ["server.js"]
