# syntax=docker/dockerfile:1
#
# 開発環境向け: Viteのdevサーバーをホットリロード付きで起動する。
# 本番ビルド（nginx等での静的配信）は将来の拡張時に別途Dockerfileを追加する想定。
FROM node:22-alpine
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
