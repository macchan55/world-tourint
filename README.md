# World Tourint

世界の国・主要都市をどれだけ訪問したかをスコアリングするアプリ。

## 機能

- **訪問記録**: 国連加盟193カ国＋主要地域（台湾・香港・パレスチナ等）と主要都市の訪問記録
- **スコアリング**: 国ごとの難易度（★1〜5）に応じた加重スコア
- **地域別カバレッジ**: アジア・ヨーロッパ・北米・中南米・アフリカ・中東・オセアニアの7地域で訪問率を可視化（レーダーチャート）
- **世界地図**: クリックで訪問済みのオン/オフを切り替え可能な塗り分け地図
- **ウィッシュリスト**: 行きたい国を管理
- **目標設定**: 訪問国数の目標・地域制覇の目標・特定の国を訪問する目標と、達成率の表示

## 技術スタック

- React 19 + TypeScript + Vite
- React Router
- Supabase（Postgres + Auth、Row Level Security でユーザーごとにデータを分離）
- react-leaflet + world-atlas（TopoJSON）による世界地図
- recharts（地域別カバレッジのレーダーチャート）

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # なければ .env.local に Supabase の URL / publishable key を設定
npm run dev
```

## DBスキーマ・シードデータ

`supabase/migrations/` にスキーマとシードデータのSQLがあります。

- `0001_schema.sql`: テーブル定義・RLSポリシー
- `0002_seed_data.sql`: 地域・国・主要都市のシードデータ（`scripts/generate-seed-sql.mjs` で `supabase/seed-data/*.json` から生成）

シードデータを編集した場合は以下で再生成できます。

```bash
node scripts/generate-seed-sql.mjs
```

## テーブル構成

- `regions` / `countries` / `cities`: 参照データ（全ユーザー共通、読み取り専用）
- `profiles`: ユーザープロフィール（サインアップ時に自動作成）
- `visits` / `city_visits`: ユーザーごとの訪問記録
- `wishlist`: 行きたい国リスト
- `goals`: 目標（訪問国数・地域制覇・特定国訪問）

## デプロイ（GitHub Pages）

```bash
./scripts/deploy.sh   # npm run build して docs/ に出力
git add docs vite.config.ts
git commit -m "Deploy to GitHub Pages"
git push
```

その後リポジトリの Settings > Pages で「Deploy from a branch」→ このブランチ →
`/docs` を選択すると `https://<owner>.github.io/world-tourint/` で公開されます。

サインアップ時のメール確認リンクを機能させるには、Supabaseダッシュボードの
Authentication > URL Configuration で Site URL / Redirect URLs に上記のPages URLを
登録してください（未登録のURLへのリダイレクトはSupabase側で拒否されます）。

Supabase Storage / Edge Functionsは `*.supabase.co` 上でHTMLと判定したオブジェクトに
`Content-Type: text/plain` と `Content-Security-Policy: default-src 'none'; sandbox` を
強制する（フィッシング対策と思われる）ため、実行可能な `index.html` をそこから直接配信する
ことはできません。そのため通常の静的ホスティング（GitHub Pages）を使っています。
`src/App.tsx` で `HashRouter` を使っているのは、GitHub PagesにSPAのサーバー側フォールバック
設定がなく、`BrowserRouter` だと `/dashboard`等への直接アクセスや再読み込みで404になるためです
（URLに `#` が入る代わりに、リライト設定なしでどのパスでも動作します）。
