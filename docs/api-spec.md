# API仕様書: 予約管理サービス

## 1. 概要
### 1.1 API基本情報
- ベースURL: `https://<project>.pages.dev`
- バージョン: v1
- データ形式: JSON (UTF-8)

### 1.2 バージョニング方針
- URLパスにバージョン番号を含める (`/api/v1/...`)。
- 後方互換が破壊される変更時にv2を追加し、移行期間を確保。

### 1.3 認証方式
- 店舗オーナー向けAPI: セッションCookie（HttpOnly）または Bearer Token。
- 公開API（予約作成/キャンセル）はトークンベースのワンタイムリンク。

## 2. 共通仕様
### 2.1 エンドポイントURL規則
- 管理API: `/api/v1/admin/**`
- 公開API: `/api/v1/public/**`
- リソース名は複数形とし、詳細操作はサブパスで表現。

### 2.2 HTTPメソッド
- GET: 資源取得
- POST: 新規作成
- PATCH: 部分更新
- DELETE: 論理削除/キャンセル

### 2.3 ステータスコード
- 200: 正常（取得）
- 201: 正常（作成）
- 204: 正常（削除/更新）
- 400: リクエスト不備
- 401/403: 認証・権限エラー
- 404: 資源未発見
- 409: 競合（枠の埋まり）
- 500: サーバエラー

### 2.4 エラーレスポンス形式
```json
{
  "error": {
    "code": "reservation_conflict",
    "message": "The selected slot is already booked.",
    "requestId": "abc123"
  }
}
```

## 3. エンドポイント詳細
### 3.1 管理API
#### GET /api/v1/admin/reservations
- 概要: 指定期間の予約一覧取得。
- クエリ: `start`, `end`, `status`。
- レスポンス: 予約配列。

#### POST /api/v1/admin/reservations
- 概要: オーナーによる予約登録。
- リクエスト: `{ "customer": {...}, "slot": {...} }`
- レスポンス: 予約詳細。

#### PATCH /api/v1/admin/reservations/:id
- 概要: 予約内容更新。
- リクエスト: 更新フィールドのみ。

#### DELETE /api/v1/admin/reservations/:id
- 概要: 予約のキャンセル。

#### GET /api/v1/admin/settings
- 概要: 営業設定取得。

#### PUT /api/v1/admin/settings
- 概要: 営業設定更新。

### 3.2 公開API
#### GET /api/v1/public/slots
- 概要: 空き枠検索。
- クエリ: `date`, `service`。

#### POST /api/v1/public/reservations
- 概要: 顧客による予約作成。
- リクエストサンプル:
```json
{
  "customer": {
    "name": "山田太郎",
    "email": "taro@example.com",
    "phone": "080-1234-5678"
  },
  "slot": {
    "start": "2024-07-01T10:00:00Z",
    "end": "2024-07-01T10:30:00Z"
  },
  "memo": "初回カウンセリング希望"
}
```

#### POST /api/v1/public/reservations/:token/cancel
- 概要: 顧客による自己キャンセル。

### 3.3 認証API
#### POST /api/v1/auth/login
- リクエスト: `{ "email": "owner@example.com", "password": "****" }`
- レスポンス: セッショントークン。

#### POST /api/v1/auth/logout
- 概要: セッション破棄。

### 3.4 サンプルコード
```typescript
const res = await fetch("/api/v1/public/reservations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
if (!res.ok) {
  const error = await res.json();
  throw new Error(error.error.message);
}
const data = await res.json();
```

## 4. データモデル
### 4.1 オブジェクト定義
- Reservation: `id`, `start`, `end`, `status`, `customer`, `memo`, `cancelToken`。
- Customer: `id`, `name`, `email`, `phone`。
- Setting: `businessHours`, `slotMinutes`, `maxParallel`, `holidays`。

### 4.2 列挙型
- ReservationStatus: `booked`, `cancelled`, `no_show`。

### 4.3 バリデーション規則
- `email`: RFC準拠のメール形式。
- `phone`: 数字・ハイフン許可、10-13桁。
- `start/end`: ISO8601形式、`end` は `start` より後。
- `memo`: 最大500文字。

