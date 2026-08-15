# Travel Plan 環境構築・ネットワーク接続 完全手順書

## 1. このドキュメントの目的

本ドキュメントは、今回構築した `travel-plan` プロジェクトについて、以下の環境構築・接続設定をまとめたものです。

- Windows + WSL2
- Docker Compose
- PostgreSQL
- Backend API
- Frontend
- React Native / Expo Go
- iPhone実機からのExpo Go接続
- iPhone実機からWindows上のBackend APIへの接続
- Windows `netsh interface portproxy`
- Windows Defender Firewall / Network Profile
- LAN経由の通信確認
- `.env` の設定
- トラブルシューティング
- 本番環境との差異と注意点

---

# 2. 全体構成

今回の開発環境は、概ね以下の構成です。

```text
                         自宅Wi-Fi
                            │
              ┌─────────────┴─────────────┐
              │                           │
           iPhone                     Windows PC
              │                       192.168.1.15
              │                           │
              │                    ┌──────┴──────┐
              │                    │    WSL2     │
              │                    │ Ubuntu      │
              │                    │172.31.x.x   │
              │                    └──────┬──────┘
              │                           │
              │                    Docker Compose
              │                           │
              │             ┌─────────────┼─────────────┐
              │             │             │             │
              │         Frontend       Backend      PostgreSQL
              │         :5173           :8080         :5432
              │
              │
              └── Expo Go
                    │
                    │ Metro
                    ▼
             Windows/WSL2
                :8081
```

重要なのは、iPhoneから見た `localhost` とWindows/WSLから見た `localhost` は別物だという点です。

---

# 3. 使用している主要IP

今回確認したIPは以下です。

## Windows側のLAN IP

```text
192.168.1.15
```

これはWi-FiアダプターのIPです。

```text
Wireless LAN adapter Wi-Fi 2:

IPv4 Address : 192.168.1.15
Subnet Mask  : 255.255.255.0
Gateway      : 192.168.1.1
```

iPhone実機からWindowsへ接続する場合、このIPを使用します。

---

## WSL2側のIP

確認した結果：

```text
172.31.63.33
```

ただし、このIPはWSL2内部ネットワークのIPです。

iPhoneから直接使用するIPとしては適していません。

---

## WSL2上のDockerネットワーク

例えば以下のIPも存在しました。

```text
172.19.0.1
172.18.0.1
172.17.0.1
172.20.0.1
```

これらはDockerネットワーク関連のアドレスです。

iPhoneから直接アクセスするためのIPではありません。

---

# 4. WSL2の注意点

WindowsからWSL2を使用しているため、

```text
Windows
192.168.1.15
    │
    ▼
WSL2
172.31.63.33
```

というネットワーク構造になっています。

そのため、

```text
iPhone
  ↓
192.168.1.15:8080
```

というアクセスを、

```text
Windows
  ↓
172.31.63.33:8080
```

へ転送する必要があります。

今回これを `netsh interface portproxy` で実現しました。

---

# 5. Docker Compose構成

現在のDocker Composeでは、以下の3サービスを起動しています。

```text
postgres
backend
frontend
```

確認コマンド：

```bash
docker compose ps
```

今回の状態：

```text
NAME                     SERVICE    STATUS
travel-plan-backend-1    backend    Up
travel-plan-frontend-1   frontend   Up
travel-plan-postgres-1   postgres   Up (healthy)
```

---

# 6. PostgreSQL

Compose上ではPostgreSQL 16 Alpineを使用しています。

```yaml
postgres:
  image: postgres:16-alpine
```

環境変数：

```yaml
environment:
  POSTGRES_DB: ${POSTGRES_DB}
  POSTGRES_USER: ${POSTGRES_USER}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  APP_DB_USER: ${APP_DB_USER}
  APP_DB_PASSWORD: ${APP_DB_PASSWORD}
```

データはDocker Volumeに保存します。

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

初期化SQL：

```yaml
- ./docker/postgres/initdb:/docker-entrypoint-initdb.d:ro
```

---

# 7. PostgreSQLのポート

現在の開発環境では、

```text
Windows/WSL
5433 → PostgreSQL 5432
```

となっています。

確認：

```bash
docker compose ps
```

表示例：

```text
0.0.0.0:5433->5432/tcp
```

つまり、

```text
ホスト側 : 5433
コンテナ : 5432
```

です。

BackendコンテナからPostgreSQLへ接続する場合は、通常、

```text
postgres:5432
```

を使用します。

`localhost:5433` ではありません。

これはDocker Composeのサービス間通信だからです。

---

# 8. Backend

BackendはDockerコンテナとして起動しています。

```yaml
backend:
  image: ghcr.io/miyazakisora1234/travel-plan/backend:${IMAGE_TAG}
```

現在のローカル開発では、

```text
Windows
192.168.1.15:8080
        │
        ▼
WSL2
172.31.63.33:8080
        │
        ▼
Docker
backend:8080
```

という経路になります。

Docker Composeでは、

```yaml
ports:
  - '8080:8080'
```

としています。

---

# 9. Backendのヘルス確認

WSL2内から：

```bash
curl -v http://localhost:8080
```

Backendが正常に起動している場合、HTTPレスポンスが返ります。

今回、

```text
HTTP/1.1 500
```

が返りました。

これは、

```text
ネットワーク接続自体は成功
↓
Backendアプリケーションまで到達
↓
アプリ内部でエラー
```

という意味です。

つまり、

```text
Connection refused
```

とは原因が異なります。

---

# 10. Backendのネットワーク確認

WSL2内：

```bash
curl -v http://172.31.63.33:8080
```

Windows：

```powershell
curl.exe -v http://172.31.63.33:8080
```

結果として、

```text
HTTP/1.1 500
```

が返ったため、

```text
Windows
 ↓
WSL2
 ↓
Docker
 ↓
Backend
```

の通信経路は成立しています。

---

# 11. Frontend

Frontendは、

```yaml
frontend:
  image: ghcr.io/miyazakisora1234/travel-plan/frontend:${IMAGE_TAG}
```

として起動しています。

ポート：

```yaml
ports:
  - '80:80'
```

ただし、今回の開発環境では別途ローカル開発用Frontendが5173番ポートで起動している状態も確認されています。

```text
0.0.0.0:5173->5173/tcp
```

プロジェクトのFrontend構成に応じて、

```text
5173
```

または

```text
80
```

を使用します。

---

# 12. Mobile / Expo

Mobileアプリは以下のディレクトリです。

```text
travel-plan/
└── mobile/
```

Expoプロジェクトとして起動します。

```bash
cd ~/projects/travel-plan/mobile
```

通常：

```bash
npx expo start
```

LANモード：

```bash
npx expo start --lan
```

今回の重要設定：

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.15 npx expo start --lan
```

---

# 13. なぜREACT_NATIVE_PACKAGER_HOSTNAMEが必要だったか

WSL2上でExpoを起動すると、Expoが自動的にWSL/Docker側のIPを選択する場合があります。

実際に、

```text
Metro: exp://172.20.0.1:8081
```

となっていました。

これはiPhoneから到達できない可能性があります。

そこで、

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.15
```

を指定しました。

結果：

```text
Metro: exp://192.168.1.15:8081
```

となりました。

これでiPhoneはWindowsのLAN IPを使用してMetroへ接続できます。

---

# 14. Expo Metroのポート

Expoでは主に、

```text
8081
```

を使用しています。

確認：

```bash
curl -v http://localhost:8081
```

正常時：

```text
HTTP/1.1 200 OK
```

が返ります。

また、Expoのレスポンス内に、

```text
hostUri: 192.168.1.15:8081
```

などが含まれていることを確認できます。

---

# 15. ExpoのLAN接続確認

Windowsから：

```powershell
curl.exe -v http://192.168.1.15:8081
```

正常時：

```text
HTTP/1.1 200 OK
```

となりました。

WSL2から：

```bash
curl -v http://172.31.63.33:8081
```

でも、

```text
HTTP/1.1 200 OK
```

となりました。

つまりMetro自体は正常に動作しています。

---

# 16. Windowsのportproxy

今回の重要設定です。

確認：

```powershell
netsh interface portproxy show all
```

現在：

```text
Address         Port        Address         Port
--------------- ----------  --------------- ----------
192.168.1.15    8080        172.31.63.33    8080
192.168.1.15    8081        172.31.63.33    8081
```

意味：

```text
192.168.1.15:8080
        ↓
172.31.63.33:8080
```

そして、

```text
192.168.1.15:8081
        ↓
172.31.63.33:8081
```

です。

---

# 17. portproxyを構築した理由

iPhoneは、

```text
192.168.1.15
```

にはアクセスできます。

しかしBackend/ExpoはWSL2側にあります。

そのため、

```text
iPhone
  │
  │ 192.168.1.15:8080
  ▼
Windows
  │
  │ portproxy
  ▼
WSL2
  │
  ▼
Docker Backend
```

という経路を作りました。

Expoについても同じです。

```text
iPhone
  │
  │ 192.168.1.15:8081
  ▼
Windows
  │
  │ portproxy
  ▼
WSL2
  │
  ▼
Metro
```

---

# 18. portproxy設定例

管理者権限PowerShellで設定します。

Backend：

```powershell
netsh interface portproxy add v4tov4 `
  listenaddress=192.168.1.15 `
  listenport=8080 `
  connectaddress=172.31.63.33 `
  connectport=8080
```

Expo：

```powershell
netsh interface portproxy add v4tov4 `
  listenaddress=192.168.1.15 `
  listenport=8081 `
  connectaddress=172.31.63.33 `
  connectport=8081
```

確認：

```powershell
netsh interface portproxy show all
```

---

# 19. 注意：WSL2のIPは変わる

重要です。

```text
172.31.63.33
```

は固定IPとは限りません。

WSL2を再起動すると変更される可能性があります。

その場合、

```powershell
netsh interface portproxy show all
```

に表示される、

```text
172.31.63.33
```

が古くなります。

確認：

```bash
hostname -I
```

例：

```text
172.31.63.33 172.19.0.1 ...
```

新しいWSL IPが変わっていたらportproxyを更新します。

---

# 20. hostname -Iについて

WSL内では：

```bash
hostname -I
```

を使用します。

今回、

```text
172.31.63.33
172.19.0.1
172.18.0.1
172.17.0.1
172.20.0.1
```

が確認されました。

注意点として、

```powershell
wsl hostname -I
```

をWSLシェル内で実行すると、環境によってはWindows側の別コマンドとして解釈されることがあります。

そのため、WSL内では直接、

```bash
hostname -I
```

を実行するのが確実です。

---

# 21. MobileのAPI Base URL

Mobileアプリの `.env`：

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.15:8080
```

今回の構成ではこれが正解です。

---

# 22. なぜlocalhostではダメなのか

以下はiPhone実機では使用できません。

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

理由：

```text
iPhone
  localhost
      ↓
iPhone自身
```

だからです。

Windowsのlocalhostではありません。

つまり、

```text
iPhone → localhost:8080
```

は、

```text
Windows → localhost:8080
```

とは意味が違います。

---

# 23. 正しいAPI通信経路

今回：

```text
React Native / Expo Go
        │
        │ http://192.168.1.15:8080
        ▼
Windows
192.168.1.15
        │
        │ portproxy
        ▼
WSL2
172.31.63.33
        │
        ▼
Docker Backend
:8080
```

この構成です。

---

# 24. EXPO_PUBLIC_について

`.env`：

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.15:8080
```

`EXPO_PUBLIC_*` はアプリ側に埋め込まれる値です。

したがって、

```text
API URL
```

のような公開しても問題ない設定値に限定します。

以下は絶対に入れません。

```env
EXPO_PUBLIC_DB_PASSWORD=...
EXPO_PUBLIC_SECRET_KEY=...
EXPO_PUBLIC_JWT_SECRET=...
EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY=...
```

機密情報はBackend側で管理します。

---

# 25. Expo起動コマンド

最終的に今回使用したコマンド：

```bash
cd ~/projects/travel-plan/mobile

REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.15 \
npx expo start --lan
```

成功すると：

```text
Metro: exp://192.168.1.15:8081
```

となります。

---

# 26. Expo Goでの接続

iPhoneとWindows PCを同じWi-Fiに接続します。

今回：

```text
Windows
192.168.1.15

iPhone
同一LAN
```

Expo GoでQRコードを読み取ります。

QRコードに、

```text
exp://192.168.1.15:8081
```

が使われていればOKです。

---

# 27. Windows Firewall

今回、一番ハマったポイントです。

Windowsのネットワークプロファイルが、

```text
NetworkCategory : Public
```

になっていました。

これを、

```text
Private
```

に変更したところ、iPhoneからの通信が正常化しました。

---

# 28. PublicとPrivateの違い

Windowsではネットワークプロファイルによってファイアウォールの扱いが変わります。

## Public

```text
インターネットカフェ
ホテル
空港
公共Wi-Fi
```

など、信頼できないネットワークを想定します。

そのため、外部からの接続を厳しく制限します。

---

## Private

```text
自宅Wi-Fi
信頼できる社内LAN
```

などを想定します。

同一LAN内のPC・スマートフォンとの通信を許可しやすくなります。

今回、自宅LANをPrivateに変更したことで、

```text
iPhone
 ↓
192.168.1.15:8081
```

などの通信が通るようになりました。

---

# 29. Publicのままではダメなのか

必ずしもPrivateにする必要はありません。

本番運用では、

```text
Public → Private
```

だけで解決するのではなく、

```text
必要なポートだけ
必要なネットワークから
必要な方向だけ
```

許可するのがより安全です。

今回の開発PCでは、自宅LANをPrivateとして扱うのが自然です。

---

# 30. Firewallで必要になるポート

今回重要なのは：

```text
8080 Backend
8081 Expo Metro
```

です。

FrontendをLANから確認する場合は、

```text
5173
```

または、

```text
80
```

も対象になります。

ただし、不要なポートは開放しないことが原則です。

---

# 31. 通信確認の順番

トラブルが起きた場合は、上から順番に確認します。

## Step 1 Docker

```bash
docker compose ps
```

確認：

```text
backend   Up
frontend  Up
postgres  Up (healthy)
```

---

## Step 2 Backend

WSL：

```bash
curl -v http://localhost:8080
```

HTTPレスポンスが返ればネットワーク的には到達しています。

---

## Step 3 WSL IP

```bash
hostname -I
```

例：

```text
172.31.63.33
```

---

## Step 4 WindowsからWSL

```powershell
curl.exe -v http://172.31.63.33:8080
```

---

## Step 5 Windows LAN IP

```powershell
curl.exe -v http://192.168.1.15:8080
```

これが成功すれば、

```text
Windows LAN IP
 ↓
portproxy
 ↓
WSL
 ↓
Backend
```

が正常です。

---

## Step 6 Expo

WSL：

```bash
curl -v http://localhost:8081
```

---

## Step 7 WindowsからExpo

```powershell
curl.exe -v http://192.168.1.15:8081
```

以下なら成功：

```text
HTTP/1.1 200 OK
```

---

## Step 8 iPhone

最後にExpo GoからQRコードを読み取ります。

---

# 32. 今回発生したエラーの意味

## `Connection refused`

```text
curl: (7) Failed to connect
```

これはポートに接続できていない状態です。

原因候補：

- Dockerが起動していない
- ポートが公開されていない
- portproxyがない
- Firewallが遮断
- IPアドレスが間違っている

---

## `HTTP 500`

```text
HTTP/1.1 500
```

これは通信成功後にアプリケーションがエラーを返しています。

つまり、

```text
ネットワーク ×
```

ではなく、

```text
Backendアプリケーション側の問題
```

を調査します。

---

## Expo Go `Request Timeout`

今回発生した、

```text
The Request Timeout
```

は、Expo GoからMetroへ到達できていない可能性があります。

今回の原因はネットワーク経路・Firewall・WSL側IPの組み合わせでした。

最終的には、

```text
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.15
```

と、

```text
portproxy 8081
```

およびWindowsネットワークをPrivateにすることで解決しました。

---

# 33. 最終的な.env

Mobile：

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.15:8080
```

重要：

```text
localhost
```

ではなく、

```text
192.168.1.15
```

です。

---

# 34. 最終的な起動手順

## ① Windowsのネットワーク

自宅Wi-FiがPrivateになっていることを確認します。

---

## ② Docker起動

WSL：

```bash
cd ~/projects/travel-plan

docker compose up -d
```

確認：

```bash
docker compose ps
```

---

## ③ Backend確認

```bash
curl -v http://localhost:8080
```

---

## ④ WSL IP確認

```bash
hostname -I
```

---

## ⑤ portproxy確認

Windows PowerShell：

```powershell
netsh interface portproxy show all
```

以下のようになっていることを確認：

```text
192.168.1.15  8080  172.31.63.33  8080
192.168.1.15  8081  172.31.63.33  8081
```

※WSL再起動後は172.31.x.xが変わっていないか確認。

---

## ⑥ Expo起動

```bash
cd ~/projects/travel-plan/mobile

REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.15 \
npx expo start --lan
```

確認：

```text
Metro: exp://192.168.1.15:8081
```

---

## ⑦ WindowsからExpo確認

```powershell
curl.exe -v http://192.168.1.15:8081
```

```text
HTTP/1.1 200 OK
```

ならOK。

---

## ⑧ iPhone

iPhoneを同じWi-Fiへ接続。

Expo Goを起動。

QRコードを読み取る。

---

# 35. 現在の開発環境の最終形

```text
┌──────────────────────────────────────────────┐
│                 自宅LAN                       │
│              192.168.1.0/24                  │
│                                              │
│  ┌───────────────┐                           │
│  │    iPhone     │                           │
│  │   Expo Go     │                           │
│  └───────┬───────┘                           │
│          │                                    │
│          │ 192.168.1.15:8081                │
│          │ 192.168.1.15:8080                │
│          ▼                                    │
│  ┌────────────────────────────┐              │
│  │        Windows PC          │              │
│  │        192.168.1.15        │              │
│  │                            │              │
│  │      portproxy             │              │
│  │       │            │       │              │
│  │      8080         8081     │              │
│  └───────┼────────────┼───────┘              │
│          │            │                       │
│          ▼            ▼                       │
│  ┌────────────────────────────┐              │
│  │          WSL2              │              │
│  │       172.31.63.33         │              │
│  │                            │              │
│  │    ┌──────────────────┐    │              │
│  │    │ Docker Compose   │    │              │
│  │    │                  │    │              │
│  │    │ Backend :8080    │    │              │
│  │    │ Frontend         │    │              │
│  │    │ PostgreSQL       │    │              │
│  │    └──────────────────┘    │              │
│  │                            │              │
│  │    Expo Metro :8081        │              │
│  └────────────────────────────┘              │
└──────────────────────────────────────────────┘
```

---

# 36. ディレクトリ構成

現在のプロジェクトは概ね：

```text
travel-plan/
├── backend/
├── frontend/
├── mobile/
├── docker/
│   └── postgres/
│       └── initdb/
├── compose.yaml
└── ...
```

Mobile：

```text
mobile/
├── app/
├── assets/
├── package.json
├── app.json
├── .env
└── ...
```

---

# 37. 各設定ファイルの役割

## compose.yaml

Dockerサービス全体を定義します。

```text
PostgreSQL
Backend
Frontend
```

の起動方法、ポート、Volume、環境変数などを管理します。

---

## mobile/.env

MobileアプリからBackendへ接続するためのURLを定義します。

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.15:8080
```

---

## mobile/app.json

Expoアプリの基本設定を管理します。

今回のレスポンスでは、

```text
name: Travel Plan
slug: travel-plan-mobile
version: 1.0.0
orientation: portrait
```

などが確認されています。

---

# 38. よくある事故

## 事故1 localhostを使う

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

iPhone実機では、

```text
iPhone自身のlocalhost
```

になるためBackendに到達できません。

---

## 事故2 WSL IPをiPhoneに設定する

```env
EXPO_PUBLIC_API_BASE_URL=http://172.31.63.33:8080
```

これは開発PC内部では動いても、iPhoneから到達できない構成になることがあります。

基本的には、

```text
Windows LAN IP
192.168.1.15
```

を使用します。

---

## 事故3 Expoが172.x.x.xになる

```text
Metro: exp://172.20.0.1:8081
```

の場合、

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.15 \
npx expo start --lan
```

を使用します。

---

## 事故4 WSL IP変更

WSL再起動後、

```text
172.31.63.33
```

が、

```text
172.31.xx.xx
```

に変わる可能性があります。

portproxyを確認します。

```powershell
netsh interface portproxy show all
```

---

## 事故5 Firewall

WindowsのネットワークがPublicの場合、LAN通信が遮断されることがあります。

今回のような自宅LANではPrivateにするのが適切です。

---

# 39. セキュリティ上の注意

今回の設定は開発環境向けです。

LAN内にBackendを公開しています。

```text
192.168.1.15:8080
```

そのため、同一ネットワーク上の端末からアクセス可能になります。

公共Wi-Fiではこの構成を使用しないでください。

---

# 40. 本番環境ではどうするか

本番では、

```text
iPhone
 ↓ HTTPS
Internet
 ↓
ALB / CloudFront
 ↓
Backend
 ↓
RDS
```

などの構成にします。

今回の、

```text
192.168.1.15
172.31.x.x
netsh portproxy
```

は本番環境へ持ち込むものではありません。

---

# 41. 本番と開発の責務を分離する

開発：

```text
iPhone
 ↓
Windows LAN
 ↓
WSL2
 ↓
Docker
```

本番：

```text
Mobile
 ↓
HTTPS
 ↓
AWS
 ↓
Backend
 ↓
RDS
```

というように分離します。

---

# 42. トラブルシューティング早見表

| 症状 | 最初に確認するもの |
|---|---|
| Dockerが起動しない | `docker compose ps` |
| Backend localhostが接続拒否 | Backendコンテナ |
| Backendが500 | Backendアプリケーションログ |
| Windows→WSLが失敗 | portproxy |
| iPhone→Windowsが失敗 | Firewall / Network Profile |
| Expo QRが172.x.x.x | `REACT_NATIVE_PACKAGER_HOSTNAME` |
| Expo Go Timeout | 8081 / Firewall / portproxy |
| iPhoneからAPIに接続できない | `.env`のAPI URL |
| WSL再起動後に動かない | WSL IPとportproxy |
| localhostがiPhoneから使えない | localhostの意味を確認 |

---

# 43. 最低限覚えておくコマンド

## Docker

```bash
docker compose ps
docker compose up -d
docker compose down
docker compose logs -f backend
```

---

## WSL IP

```bash
hostname -I
```

---

## Backend

```bash
curl -v http://localhost:8080
```

---

## Expo

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.15 \
npx expo start --lan
```

---

## Windows portproxy

```powershell
netsh interface portproxy show all
```

---

## Windowsから確認

```powershell
curl.exe -v http://192.168.1.15:8080
curl.exe -v http://192.168.1.15:8081
```

---

# 44. 今回の最終チェックリスト

```text
[✓] Windows Wi-Fi IP = 192.168.1.15
[✓] Windows NetworkCategory = Private
[✓] Docker Compose起動
[✓] Backend :8080
[✓] Frontend
[✓] PostgreSQL healthy
[✓] WSL IP確認
[✓] portproxy :8080
[✓] portproxy :8081
[✓] Expo Metro :8081
[✓] REACT_NATIVE_PACKAGER_HOSTNAME設定
[✓] Expo Metro URL = 192.168.1.15:8081
[✓] Mobile API URL = http://192.168.1.15:8080
[✓] Windows → WSL通信確認
[✓] Windows → Expo通信確認
[✓] iPhone → Expo Go接続
```

---

# 45. 結論

今回の環境で最も重要なのは、

```text
iPhoneからWindowsのLAN IPへ接続する
```

という設計です。

具体的には、

```text
Windows LAN IP
192.168.1.15
```

を入口として、

```text
192.168.1.15:8080
        ↓
WSL2:8080
        ↓
Docker Backend

192.168.1.15:8081
        ↓
WSL2:8081
        ↓
Expo Metro
```

という構成にしています。

Mobile側：

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.15:8080
```

Expo起動：

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.15 \
npx expo start --lan
```

Windows側：

```powershell
netsh interface portproxy show all
```

で、

```text
192.168.1.15:8080 → 172.31.x.x:8080
192.168.1.15:8081 → 172.31.x.x:8081
```

を確認します。

そして、自宅Wi-FiをWindowsでPrivate Networkとして扱うことで、LAN内のiPhoneから開発環境へ接続できる状態になっています。

この構成は「Windows + WSL2 + Docker + Expo Go + iPhone実機」という今回の開発環境に対して、最小限の変更で成立させる方法です。
