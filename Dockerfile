FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN addgroup --system --gid 1001 app && adduser --system --uid 1001 app
COPY --from=build /app/build build/
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules node_modules/
ENV NODE_ENV=production
EXPOSE 3000
USER app
CMD ["node", "build"]
# DEPLOY 8 — 2026-05-31 23:06:18 UTC
