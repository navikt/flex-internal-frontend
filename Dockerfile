FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --chown=node:node .next/standalone ./
COPY --chown=node:node .next/static ./.next/static
COPY --chown=node:node public ./public

CMD ["server.js"]
