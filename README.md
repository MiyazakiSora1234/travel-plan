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
- **本番ビルド**: Frontendは現在Vite開発サーバーで起動する構成になっているため、本番投入時は `docker/frontend/Dockerfile` をNginx等で静的配信するマルチステージビルドに切り替える
