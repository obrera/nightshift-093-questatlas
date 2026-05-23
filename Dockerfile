FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./server.ts
EXPOSE 3000
CMD ["bun", "server.ts"]
