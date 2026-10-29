
FROM node:24-bookworm-slim AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./


# Development
FROM base AS dev
ENV CI=true
RUN --mount=type=secret,id=github_token,dst=/etc/secrets/github_token \
    GITHUB_TOKEN="$(cat /etc/secrets/github_token)" && \
    pnpm config set "//npm.pkg.github.com/:_authToken" "$GITHUB_TOKEN" && \
    pnpm install --no-frozen-lockfile && \
    pnpm config delete "//npm.pkg.github.com/:_authToken"

COPY . .
EXPOSE 3000
CMD ["pnpm", "start:dev"]


# Build
FROM base AS build
RUN --mount=type=secret,id=github_token,dst=/etc/secrets/github_token \
    GITHUB_TOKEN="$(cat /etc/secrets/github_token)" && \
    pnpm config set "//npm.pkg.github.com/:_authToken" "$GITHUB_TOKEN" && \
    pnpm install --frozen-lockfile && \
    pnpm config delete "//npm.pkg.github.com/:_authToken"
COPY . .
RUN pnpm build


# Production
FROM node:24-bookworm-slim AS production
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=secret,id=github_token,dst=/etc/secrets/github_token \
    GITHUB_TOKEN="$(cat /etc/secrets/github_token)" && \
    pnpm config set "//npm.pkg.github.com/:_authToken" "$GITHUB_TOKEN" && \
    pnpm install --prod --frozen-lockfile && \
    pnpm config delete "//npm.pkg.github.com/:_authToken"
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]