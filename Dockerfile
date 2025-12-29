FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

ENTRYPOINT ["node"]
CMD ["server.js"]
