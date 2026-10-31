# 予約受付・管理画面の準備メモ

この実装は準備中です。予約受付は既定で停止し、Cloudflare の設定がそろうまで有効になりません。請求書の発行・送信、入金確認、お客様への連絡、キャンセル、返金は自動では行われません。

## 設定状況（2026-10-31）

- Cloudflare Pages `carshare-lp` と接続先 GitHub リポジトリを確認済み。
- 本番用 D1 `carshare-bookings` を作成し、`migrations/0001_bookings.sql` のテーブルとインデックスを適用、Pages の本番バインディング `DB` に設定済み。現在のデプロイには次回のデプロイ時に反映される。
- 本番ホスト `carshare-lp.pages.dev` 向け Turnstile を作成し、サイトキーと秘密鍵を Pages 本番環境に設定済み。秘密鍵は Secret として保存し、コードには含めない。
- Zero Trust Free を登録し、Pages のプレビューを Access で保護済み。同じ Access アプリに本番の `/admin`、`/admin/*`、`/api/admin`、`/api/admin/*` を追加し、`fritz@fritz.jp` のワンタイム PIN 認証のみを許可。Cookie のパス限定はオフ。
- 本番環境に `ADMIN_EMAILS`、`CF_ACCESS_TEAM_DOMAIN`、`CF_ACCESS_AUD` を設定済み（次回デプロイ時に反映）。`FEATURE_BOOKINGS_ENABLED=false` で受付停止中。
- 未認証の `/admin/` と `/api/admin/bookings` が Access のログイン画面に遷移し、公開トップページが閲覧できることを確認済み。認証後の管理画面・API の連携はコードをデプロイ後に要検証。
- コードは未デプロイ。プレビュー環境用の DB と設定は未作成。公開中のサイトには予約機能がない。

## 公開前に決めること

1. 直接の有償貸渡しに必要な許可、および外国免許を持つ運転者を含む保険の適用を確認する。
2. 事業者情報、貸渡条件、キャンセル・返金、免責、保険と ETC の精算時期、プライバシーポリシーを確定する。現在の利用規約は草案であり、同意の取得・規約版の記録は未実装。
3. 取得する情報、保管期間、削除・訂正手順、管理者の認証方法を確定する。免許証や旅券の画像・番号、カード番号、銀行口座番号はこのサイトで収集しない。
4. Cloudflare Pages の本番用アカウント、D1、Cloudflare Access、Turnstile の設定権限と、Square の請求書管理権限を確認する。

## Cloudflare 設定

対象は静的な Pages プロジェクト。`functions/` に Pages Functions、`migrations/0001_bookings.sql` に D1 の初期スキーマがある。サイトの Pages 設定に D1 binding `DB` を追加し、対象データベースへマイグレーションを適用する。データベース ID や環境の紐付けは本番・プレビューで分ける。

Cloudflare Access で管理画面 `/admin`、`/admin/*` と管理 API `/api/admin`、`/api/admin/*` を保護し、本人だけを許可する。各パスは同じ Access アプリに設定し、API が検証する audience を共通にする。各 API でも Access の署名付き JWT、発行元、audience、有効期限、メール許可リストを検証する。管理画面の HTML の保護だけでは不十分なため、デプロイ後にも API の認証とアクセス制限を確認する。未認証リクエストは Access によってログイン画面へリダイレクトされ、アプリ側の未認証 API は 401 を返す。

対象ホストに Turnstile ウィジェットを作り、サイトキーと秘密鍵を設定する。秘密鍵は Cloudflare の秘密情報として設定し、リポジトリ・チャット・ログに記録しない。次の環境変数と D1 binding が必要：

- `CF_ACCESS_TEAM_DOMAIN`: Access のチームドメイン（例: `example.cloudflareaccess.com`、スキームなし）
- `CF_ACCESS_AUD`: 管理アプリの audience
- `ADMIN_EMAILS`: 許可する管理者のメールアドレス（複数はカンマ区切り）
- `TURNSTILE_SITE_KEY`: 公開サイトキー
- `TURNSTILE_SECRET_KEY`: Turnstile 秘密鍵
- `FEATURE_BOOKINGS_ENABLED`: 上記と運営・規約の準備が終わり検証を終えるまでは設定しない、または `false`

受付を開く前に、最終的な規約とプライバシー通知の表示・同意記録を実装し、上記の確認を完了する。現在の草案のまま `FEATURE_BOOKINGS_ENABLED=true` にしてはいけない。実際の Access・Turnstile・D1・メール連絡・決済を検証した後に有効化する。

## 日常の手動運用

1. 管理画面 `/admin/` で申請を確認し、DriveShare を含めた空き状況と運転資格を確認する。申請通知は自動送信されないため、管理画面を定期確認する。
2. 車両料金と ETC 前払金を含む合計、および ETC 前払金の内訳を入力して承認する。承認時に他の承認済み・請求待ち・確定済み予約との重複を確認し、枠を確保する。
3. Square 側で日本円の請求書を作成・送信し、管理画面に請求書番号を記録する。Square の顧客メール送信は管理画面から自動では行われない。
4. Square 側で該当請求書の全額・通貨を確認する。支払参照番号と確認額を管理画面に入力して予約を確定し、顧客へ別途連絡する。ボタンは Square の入金状態を自動照合しない。
5. ETC 明細確定後、実費を照合し、余りの返金・不足分の請求を個別に行う。Square 決済の一部返金は元取引への返金が基本。Wise を別送金に使う場合は、二重返金防止のため元取引と送金記録を照合し、送金先・費用・為替条件を事前確認する。送金はこのアプリでは実行・記録されない。

未請求の承認済み予約は、Square 請求書が未発行であることを確認して枠を解除できる。請求済み・未入金の予約は、Square で請求書を無効化し未入金を確認した後に解除する。いずれも Square での確認は手動で、管理画面は事実を自動照合しない。入金済み・確定後の枠解除、請求書の無効化、返金状態の記録・自動処理、通知、保持期限に応じた削除、予約データの出力は未実装。これらの運用を決め、必要な機能を追加してから実運用する。

## 検証

`npm run build` と `node --test tests/booking-api.test.js` を実行する。ローカルの Cloudflare 環境では `wrangler pages dev dist --d1 DB=local-booking` を使用できる。実サービスへの公開や受付有効化は行わず、設定欠落時に `/api/config` が停止を返し、認証なしの `/api/admin/bookings` が拒否されることを確認する。
