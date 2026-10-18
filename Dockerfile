# Build the static export once on the build platform (the output is the same
# for every architecture), then copy it into a multi-arch nginx image. Node 22,
# like .nvmrc, package.json's engines and CI (Dependabot skips Node majors).
FROM --platform=$BUILDPLATFORM docker.io/library/node:22.23.3-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 AS build
WORKDIR /src
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM docker.io/library/nginx:1.31.0-alpine@sha256:2f07d83bf561b506400dc183b1b2003803e39efbd22451f848adaba14d28c7c7

LABEL org.opencontainers.image.source="https://github.com/ncecere/pdp-website" \
      org.opencontainers.image.description="The Pi Durable Platform website (pdp.bitop.dev)" \
      org.opencontainers.image.licenses="MIT AND CC-BY-4.0"

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/build/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build --chown=101:101 /src/out/ /usr/share/nginx/html/

USER 101:101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
