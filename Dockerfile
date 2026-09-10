FROM node:22.16.0-bookworm

USER root
WORKDIR /app

ENV FORCE_COLOR=1
ENV skip_postinstall=yes
ENV NODE_ENV=development

COPY assets ./assets
COPY package.json ./package.json

# The legacy package-lock.json is intentionally not consumed here. ORESoftware/.github#190
# owns restoring one reviewed reproducible npm lock; until then match the exact-head TJSV CI.
RUN npm install --package-lock=false

COPY contracts ./contracts
COPY scripts ./scripts
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY favicon.ico ./favicon.ico
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh \
    && npm run verify

ENV NODE_ENV=production

EXPOSE 3900

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3900/readyz', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/main.js"]
