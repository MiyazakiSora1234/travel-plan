# 旅行計画管理アプリ

旅行計画を管理するWebアプリケーションの初期実装。現時点では「旅行計画を登録する」機能のみを実装しているが、
一覧・詳細・編集・認証などを継続開発しても作り直しが発生しないことを前提に設計している。

## 1. システム概要

- 旅行計画（旅行名・開始日・終了日・メモ）を登録できるWebアプリケーション
- `/trips/new` で旅行計画を1件登録できる
- Frontend（React SPA）→ Backend（Spring Boot REST API）→ PostgreSQL のシンプルな3層構成

## 2. アーキテクチャ

```
┌─────────────┐      HTTP/JSON       ┌──────────────────┐      JDBC       ┌─────────────┐
│   Frontend   │ ───────────────────> │     Backend       │ ──────────────> │ PostgreSQL  │
│ React + Vite │ <─────────────────── │  Spring Boot API  │ <────────────── │             │
│ (port 5173)  │                      │   (port 8080)      │                 │ (port 5432) │
└─────────────┘                      └──────────────────┘                 └─────────────┘
```

各サービスは独立したDockerコンテナで動作する（Node/Java/PostgreSQLを1コンテナに混在させない）。

### Backendのレイヤー構成

```
Controller  … HTTPの入出力のみ（@Valid によるリクエスト検証、ステータスコードの決定）
    ↓
Service     … ユースケース・業務ロジック（Entity ⇔ DTO 変換、トランザクション境界）
    ↓
Repository  … DBアクセスのみ（Spring Data JPA）
    ↓
PostgreSQL
```

例外は `GlobalExceptionHandler`（`@RestControllerAdvice`）に集約し、APIのエラーレスポンス形式を統一する。
内部情報（スタックトレース、SQL文言等）はレスポンスに含めず、ログにのみ出力する。

## 3. 技術選定理由

| 領域 | 選定 | 理由 |
|---|---|---|
| UIライブラリ | **MUI** | ドキュメント・コンポーネントの成熟度が高く、フォーム部品(TextField等)の完成度が高い。将来の一覧画面（Table）・詳細画面（Dialog等）でも一貫したデザインシステムを維持しやすい |
| 状態管理 | TanStack Query（サーバー状態）+ React Hook Form（フォーム状態） | サーバー状態とローカルUI状態を混同しない。グローバルな状態管理ライブラリ（Redux等）は現時点で必要な状態が存在しないため導入しない |
| ID方式 | `BIGINT GENERATED ALWAYS AS IDENTITY` | 現時点では推測されても実害がなく（認証なし・所有者概念なし）、可読性とindex性能を優先。将来IDの推測可能性が問題になる場合（マルチテナント化等）はUUIDへの移行を検討する |
| DB Migration | Flyway | Spring Bootとの統合が公式にサポートされ、素のSQLで管理できるため学習コストが低い |
| Lombok | 使用（Entityの getter/setter のみ） | ボイラープレート削減が目的であり、ビジネスロジックには使わない。DTOはJavaの `record` を使うためLombok不要 |
| DTO ⇔ Entity 分離 | 常にDTOを介してAPI入出力を行う | 詳細は[4. DTOを分離する理由](#4-dtoを分離する理由)を参照 |

### 採用しなかった代替案

| 不採用 | 理由 |
|---|---|
| shadcn/ui | コピー&ペーストでコンポーネントを自プロジェクトに取り込む方式のため、初期段階では管理コストが割高。デザインを大きくカスタマイズする段階で再検討 |
| Ant Design | デザインの独自性が強く、MUIより細部のカスタマイズがしにくいと判断 |
| UUID主キー | 現時点では推測耐性が不要であり、可読性とパフォーマンスを優先（将来切替可能な設計にとどめる） |
| Liquibase | FlywayよりXML/YAML中心で学習コストが高いため見送り |
| Redux / Zustand等 | 現時点でクライアントのグローバル状態が存在しないため過剰 |
| マイクロサービス化 | 現在の規模に対して明確な過剰設計 |

## 4. DTOを分離する理由

EntityをそのままAPIレスポンスとして返さず、`CreateTripRequest` / `TripResponse` を用意している。理由：

1. **意図しないフィールド露出の防止** — Entityにカラムを追加した際、それが自動的にAPIレスポンスへ露出することを防ぐ
2. **APIとDBスキーマの独立進化** — DB側のリファクタリング（カラム名変更等）がAPI契約に影響しないようにする
3. **入力と出力で異なる制約を表現できる** — 登録時は `id` を受け取らない、更新時は一部項目のみ必須にする、といった非対称な要件をDTO単位で表現できる
4. **Bean Validationの責務を明確化** — Entityの永続化制約（DB制約）とAPI入力検証（ユーザー向けエラーメッセージ）を混同しない

## 5. ディレクトリ構成

```
travel-plan/
├── frontend/                      React + TypeScript + Vite
│   └── src/
│       ├── app/                   App shell（QueryClient, Router, Theme のセットアップ）
│       ├── components/            機能に依存しない汎用UIコンポーネント（将来追加）
│       ├── features/
│       │   └── trips/
│       │       ├── api/           axiosによるAPI通信関数
│       │       ├── components/    trips機能のUIコンポーネント
│       │       ├── hooks/         TanStack Queryフック
│       │       ├── schemas/       Zodスキーマ
│       │       └── types/         trips機能の型定義
│       ├── pages/                 ルートに対応する画面コンポーネント
│       ├── routes/                React Routerのルーティング定義
│       ├── lib/                   axiosインスタンス等の共通基盤
│       └── main.tsx
├── backend/                        Java + Spring Boot + Gradle
│   └── src/main/java/com/travelplan/
│       ├── controller/             HTTPの入出力
│       ├── service/                 ユースケース・業務ロジック
│       ├── repository/              DBアクセス（Spring Data JPA）
│       ├── entity/                  DB永続化モデル
│       ├── dto/{request,response}/  APIの入出力モデル
│       ├── exception/               例外・エラーレスポンス統一
│       └── config/                  CORS等の設定
│   └── src/main/resources/db/migration/  Flywayマイグレーション
├── docker/
│   ├── backend/Dockerfile
│   ├── frontend/Dockerfile
│   └── postgres/initdb/            アプリ用DBロール作成スクリプト
├── compose.yml
├── .env.example
├── .gitignore
└── README.md
```

機能（trips）を軸にディレクトリを分けているため、「旅行先管理」「ユーザー管理」等の新機能追加時は
`features/` 配下に新しいディレクトリを追加するだけでよく、既存コードへの影響を抑えられる。

## 6. 起動方法

### 前提

- Docker / Docker Compose

### 手順

```bash
git clone <このリポジトリ>
cd travel-plan
cp .env.example .env   # 値は用途に応じて変更する
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- 旅行計画登録画面: http://localhost:5173/trips/new

初回起動時、PostgreSQLコンテナの初期化スクリプト（`docker/postgres/initdb/`）がアプリ用DBロールを作成し、
Backend起動時にFlywayが `trips` テーブルを作成する。

[`just`](https://github.com/casey/just) が入っていれば `just up` で同じことができる。よく使う操作は
`justfile` にまとめてあり、`just --list` で一覧できる（`just db-shell` でDBに接続、`just test` でBackend/Frontend
両方のテストを実行、など）。

### ローカルで個別に動かす場合

```bash
# Backend
cd backend
./gradlew bootRun

# Frontend
cd frontend
npm install
npm run dev
```

## 7. 環境変数

`.env.example` を参照。DB接続情報・パスワード等はソースコードにハードコードせず、すべて環境変数から取得する。

| 変数名 | 説明 |
|---|---|
| `POSTGRES_DB` | PostgreSQLのデータベース名 |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | コンテナ起動時のみ使用するbootstrap superuser。アプリケーションはこの権限では接続しない |
| `APP_DB_USER` / `APP_DB_PASSWORD` | Flywayマイグレーション・アプリケーションが実際に使用するDBロール。SUPERUSER/CREATEDB/CREATEROLE権限を持たない（[8. DB設計](#8-db設計)を参照） |
| `DATABASE_URL` | Backendが接続するJDBC URL |
| `CORS_ALLOWED_ORIGINS` | CORSで許可するオリジン（カンマ区切り）。`*` は使用しない |
| `SERVER_PORT` | Backendのリッスンポート |
| `VITE_API_BASE_URL` | FrontendがAPIを呼び出す際のベースURL |

`.env` は `.gitignore` に含まれておりコミットされない。

## 8. DB設計

```sql
CREATE TABLE trips (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    start_date  DATE          NOT NULL,
    end_date    DATE          NOT NULL,
    memo        VARCHAR(2000),
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

- 日時は `TIMESTAMPTZ`（UTC基準）で保存し、アプリ層で `OffsetDateTime` として扱う。APIレスポンスはISO8601（`+09:00` 等のオフセット付き）で返す
- マイグレーションは `backend/src/main/resources/db/migration/V1__create_trips_table.sql` としてFlywayで管理し、`ddl-auto: validate` によりJPA側がスキーマを勝手に変更しないようにしている
- DBユーザー権限: `docker/postgres/initdb/01-create-app-role.sh` が、コンテナ起動時のみ使用するbootstrap superuser（`POSTGRES_USER`）とは別に、SUPERUSER/CREATEDB/CREATEROLE権限を持たない `APP_DB_USER` ロールを作成する。アプリケーションとFlywayは常にこの制限された権限のロールで接続する

## 9. API仕様

### `POST /api/v1/trips` — 旅行計画登録

Request:

```json
{
  "name": "東京・京都旅行",
  "startDate": "2026-09-01",
  "endDate": "2026-09-05",
  "memo": "寺社巡りをする"
}
```

Response (`201 Created`):

```json
{
  "id": 1,
  "name": "東京・京都旅行",
  "startDate": "2026-09-01",
  "endDate": "2026-09-05",
  "memo": "寺社巡りをする",
  "createdAt": "2026-08-08T10:00:00+09:00",
  "updatedAt": "2026-08-08T10:00:00+09:00"
}
```

バリデーション：

| 項目 | ルール |
|---|---|
| `name` | 必須、最大100文字 |
| `startDate` | 必須 |
| `endDate` | 必須、`startDate` 以降の日付 |
| `memo` | 任意、最大2000文字 |

Frontend（Zod）とBackend（Bean Validation + Service層の業務ルール）の両方で検証する。
`startDate`/`endDate` の前後関係はフィールド単体の制約では表現できないため、`TripService` 内で検証する。

エラーレスポンス（`400 Bad Request`）：

```json
{
  "code": "VALIDATION_ERROR",
  "message": "入力内容に誤りがあります",
  "errors": [
    { "field": "name", "message": "旅行名は必須です" }
  ]
}
```

## 10. テスト方法

### Backend

```bash
cd backend
./gradlew test
```

- `TripServiceTest`: 業務ロジックの単体テスト（正常登録、終了日<開始日の例外）
- `TripControllerTest`: `@WebMvcTest` によるAPIテスト（201/400、エラーレスポンス形式）
- `CreateTripRequestValidationTest`: Bean Validationの制約テスト（必須・文字数上限）

### Frontend

```bash
cd frontend
npm run test
```

- `TripCreateForm.test.tsx`: フォームバリデーション（必須項目、文字数上限、日付の前後関係、二重送信防止のためのボタン無効化）

## 11. 今後の拡張方法

- **旅行計画一覧・詳細・編集・削除**: `features/trips/api` にAPI関数を、`features/trips/hooks` にクエリ/ミューテーションフックを追加し、`pages/` に画面を追加する。Backend側も `TripController` にエンドポイントを追加し、`TripService` に対応するユースケースを追加する（既存の責務分離を維持すれば既存コードへの影響は小さい）
- **旅行先管理・ユーザー管理**: `features/` 配下に新しい機能ディレクトリ（例: `features/destinations`）を追加し、Backend側も `entity` / `dto` / `service` / `controller` を機能ごとに追加する
- **認証**: Backendに `SecurityConfig`（`config/` 配下）を追加し、`WebConfig` のCORS設定と統合する。Frontendは `lib/apiClient.ts` にトークン付与のインターセプターを追加し、認証状態は `app/` 配下でグローバルに管理する
- **DBスキーマ変更**: 既存マイグレーション（`V1__...`）は変更せず、`V2__add_xxx.sql` のように追加していく

## 12. CI/CD / Deploy

### 仕組み

`main` ブランチへのpushをトリガーに、GitHub Actionsが自動でEC2へデプロイする。

```
push to main
  → [test]           Frontend(lint/test/build) + Backend(test/build)
  → [build-and-push]  Docker Image（backend/frontend）をビルドし、GHCRへ commit SHA タグでPush
  → [deploy]          checkout → SCPで本番ファイルをEC2へ配置 → SSHでEC2へ接続
                        → Image pull → docker compose up -d → Health Check
                        → 成功: CURRENT_IMAGE_TAG更新 / 失敗: 直前タグへ自動ロールバック
```

- テストが1つでも失敗すれば、以降のビルド・Push・デプロイは実行されない（`needs:` による依存関係）
- `main` へのPull Requestでは `.github/workflows/ci.yml` によりテストのみ実行され、デプロイは行われない。featureブランチ単体のpushではどちらのworkflowも動かない
- テストのロジックは `.github/workflows/test.yml`（再利用ワークフロー）に集約し、CIとDeployの両方から呼び出している
- **EC2上にはリポジトリ全体をcloneしない**。`deploy` jobは `actions/checkout@v4` でGitHub Actions runner上にリポジトリを取得し、そこから `appleboy/scp-action` で `compose.prod.yml` と `docker/postgres/initdb/` だけをEC2の `/opt/travel-plan` へ都度転送する（runner → EC2 の一方向。EC2上には転送元のファイルが存在しないため、EC2側からscpすることはできない）
- SCP転送後、`appleboy/ssh-action` でEC2へSSH接続し、同一セッション内でGHCRログイン→pull→起動→Health Check→（必要なら）ロールバック→GHCRログアウトまでを実行する
- EC2上では **ビルドを一切行わない**。EC2が実行するのは「本番ファイルの受け取り」「Imageのpull」「コンテナ起動」「Health Check」のみ
- Imageには必ず `git commit SHA` をタグ付けする（`latest` は補助的に付与するのみで、デプロイでは常にSHAタグを使用）。これによりロールバックが可能になる

### 必要なGitHub Secrets

| Secret | 用途 |
|---|---|
| `EC2_HOST` | デプロイ先EC2のホスト名/IP |
| `EC2_USER` | SSH接続ユーザー |
| `EC2_SSH_KEY` | SSH秘密鍵（PEM形式） |

GHCRへの認証は上記Secretsとは別に、GitHub Actions標準の `GITHUB_TOKEN` を使用する（追加のSecret登録は不要）。

また、FrontendのビルドにはバックエンドAPIのURL（`VITE_API_BASE_URL`）が必要になる。Viteはこの値をビルド時にバンドルへ埋め込むため、実行時の環境変数では差し替えられない。機密情報ではないため、Secretではなく **Repository variables**（`Settings > Secrets and variables > Actions > Variables`）に `VITE_API_BASE_URL` を登録すること（例: `http://<EC2のIPまたはドメイン>:8080`）。

### EC2側の初期設定（初回のみ）

```bash
# 1. Docker / Docker Composeプラグインをインストール（Amazon Linux 2023の例）
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
DOCKER_COMPOSE_VERSION=v2.29.7
sudo curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
  -o /usr/libexec/docker/cli-plugins/docker-compose
sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose

# 2. アプリ用ディレクトリを作成する（compose.prod.ymlとpostgres初期化スクリプトは
#    リポジトリをcloneせず、deploy.ymlがpushのたびにSCPで自動配置するため、
#    ディレクトリを空で用意しておくだけでよい）
sudo mkdir -p /opt/travel-plan
sudo chown $USER:$USER /opt/travel-plan

# 3. 本番用.envを作成する（.env.prod.example を参考に値を入れる。Gitには絶対にコミットしない。
#    compose.prod.ymlはまだ配置されていないが、.envはdeploy.ymlが一切触らないファイルなので
#    最初のdeployより前にここで作成しておく）
vi /opt/travel-plan/.env

# 4. SSH公開鍵をauthorized_keysに登録し、対応する秘密鍵をGitHub Secrets `EC2_SSH_KEY` に登録する

# 5. Security Groupで、SSH(22)は自宅/オフィス/GitHub Actions runnerのIPレンジ等、接続元を絞る。
#    PostgreSQL(5432)はインバウンドを一切開放しない（Compose上も公開していない）

# 6. mainへ最初にpushすると、deploy.ymlが compose.prod.yml と docker/postgres/initdb/ を
#    /opt/travel-plan へSCPで配置し、続けてdocker compose up -dとHealth Checkが走る
```

### 本番.envの配置

- 配置場所: `/opt/travel-plan/.env`
- `.env.prod.example`（リポジトリ直下）を雛形として、DBパスワードなどの本番固有値を **EC2上で直接** 設定する
- GitHub ActionsからこのファイルへアクセスすることもPushすることも一切ない。`deploy.yml` は `IMAGE_TAG` のみを環境変数としてSSHセッションに渡し、その他の値は既存の `/opt/travel-plan/.env` を `docker compose` が自動で読み込む

### GHCR（GitHub Container Registry）

- Image名: `ghcr.io/miyazakisora1234/travel-plan/backend`, `ghcr.io/miyazakisora1234/travel-plan/frontend`
- 初回Push後、GitHubのPackages設定でリポジトリにリンクし、可視性を **Private** にすることを推奨する
- EC2側は、デプロイのたびにジョブ有効期限内の `GITHUB_TOKEN` を使って一時的に `docker login` してからpullする（EC2に長期間有効な認証情報を保存しない）

### Health Check

- `backend` は `spring-boot-starter-actuator` を導入し、`/actuator/health` のみを公開（他のactuatorエンドポイントは非公開）
- デプロイジョブは `docker compose up -d` の後、EC2上から `curl http://localhost:8080/actuator/health` を最大60秒（5秒間隔×12回）リトライし、`"status":"UP"` を確認できて初めてデプロイ成功とする
- 単に `docker compose up -d` が成功しただけでは成功扱いにしない

### ロールバック方法

- デプロイのたびに、EC2上の `/opt/travel-plan/CURRENT_IMAGE_TAG` に成功した `IMAGE_TAG`（commit SHA）を記録する
- 新しいImageのHealth Checkが失敗した場合、`deploy.yml` が自動で直前の `CURRENT_IMAGE_TAG` を使って `docker compose -f compose.prod.yml up -d` を再実行する（＝自動ロールバック）
- 手動でロールバックしたい場合は、EC2上で以下を実行する

```bash
cd /opt/travel-plan
export IMAGE_TAG=<戻したいcommit SHA>
docker compose -f compose.prod.yml pull
docker compose -f compose.prod.yml up -d
curl -fsS http://localhost:8080/actuator/health
```

### デプロイ失敗時の確認方法

1. GitHub Actionsの `Deploy` ワークフローの実行結果を確認し、どのjob（test / build-and-push / deploy）で失敗したか特定する
2. `deploy` jobで失敗した場合は、SSHログの中でHealth Checkの結果とロールバックの有無を確認する
3. EC2に直接SSHし、以下でコンテナの状態を確認する

```bash
cd /opt/travel-plan
docker compose -f compose.prod.yml ps
docker compose -f compose.prod.yml logs backend --tail 100
```
