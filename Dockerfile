FROM node:16.20.2-alpine3.18 AS builder
WORKDIR /app
COPY ./package*.json ./
RUN npm ci
COPY ./tsconfig.build.json ./tsconfig.build.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./openapi.yaml ./openapi.yaml
COPY ./src ./src
COPY ./test ./test
COPY ./typings ./typings
COPY ./config ./config
ARG version="0.0.1"
RUN npm version $version --git-tag-version false
RUN npm run build && npm prune --omit=dev --no-audit

FROM node:16.20.2-alpine3.18
WORKDIR /app
COPY --from=builder ./app/build ./build
COPY --from=builder ./app/node_modules ./node_modules
COPY --from=builder ./app/package.json ./package.json
COPY --from=builder ./app/package-lock.json ./package-lock.json
COPY --from=builder ./app/config ./config
COPY --from=builder ./app/openapi.yaml ./openapi.yaml

CMD ["npm","run","start:prod"]
