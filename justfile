set dotenv-load := true

# コマンド一覧を表示
default:
    @just --list

# --- Docker（推奨: これだけで一式起動） ---

# Frontend/Backend/PostgreSQLをビルドして起動
up:
    docker compose up --build -d

# 起動中のコンテナを停止
down:
    docker compose down

# 全コンテナ + ボリューム（DBデータ含む）を削除する。取り扱い注意。
nuke:
    docker compose down -v

# 全サービスのログを追跡
logs:
    docker compose logs -f

# 指定サービスのログを追跡（例: just log backend）
log service:
    docker compose logs -f {{service}}

ps:
    docker compose ps

# 指定サービスを再ビルドして再起動（例: just rebuild backend）
rebuild service:
    docker compose up --build -d {{service}}

# 起動中のpostgresコンテナにpsqlで接続
db-shell:
    docker compose exec postgres psql -U "$APP_DB_USER" -d "$POSTGRES_DB"

# --- Backend（ローカルにJava 21がある場合） ---

be-test:
    cd backend && ./gradlew test

be-build:
    cd backend && ./gradlew bootJar

be-run:
    cd backend && ./gradlew bootRun

be-clean:
    cd backend && ./gradlew clean

# --- Frontend（ローカルにNode.jsがある場合） ---

fe-install:
    cd frontend && npm install

fe-dev:
    cd frontend && npm run dev

fe-test:
    cd frontend && npm run test

fe-lint:
    cd frontend && npm run lint

fe-format:
    cd frontend && npm run format

fe-build:
    cd frontend && npm run build

# --- まとめて実行 ---

# Backend/Frontend双方のテストを実行
test: be-test fe-test

# Backend/Frontend双方のLintを実行
lint: fe-lint
