# web-components

Lit で書いた Web Components を React / Vue / フレームワークなしで共有する**公開サンプル**。
構成・使い方・設計メモの詳細は [README.md](README.md) を見る（ここには複製しない）。

## 構成

* `packages/ui/src/web-components/` — Lit の実体（`button` `card` `checkbox` `dialog` `image-uploader` `input` `select` `tabs`）。Web Component は 1 本だけ持つ
* `packages/ui/src/react/` `packages/ui/src/vue/` — 実体を包む薄いラッパー。ロジックを足さない
* `apps/react`（React Router）/ `apps/vue`（Nuxt）/ `apps/native`（フレームワークなし）— デモ。react・vue は SPA と SSR の両方で動く = 5 サイト
* `apps/demo.css` `apps/theme.ts` `apps/form-demo.ts` `apps/async-demo.ts` `apps/demo-options.ts` — 5 サイトで共有
* `e2e/` — Playwright。サイトごとに project が分かれる

## コマンド

* `bun run build` / `bun run lint`（`lint:fix`）
* `bun run test:e2e` — 5 サイトを自動起動して実行。1 サイトだけなら `E2E_SITE=react-spa bun run test:e2e`（`react-spa` `vue-spa` `react-ssr` `vue-ssr` `native`）
* `bun run dev:react` `dev:vue` `dev:react:ssr` `dev:vue:ssr` `dev:native`
* コンポーネントテスト: `bun run --cwd packages/ui vitest run` / Storybook: `bun run --filter @web-components/ui storybook`

## ルール

* Lit のデコレータは使わない（`static properties` + 通常のクラスフィールド。理由は README「デコレータを使わない理由」）
* フォーマットと lint は Biome。手で整形せず `bun run lint:fix` を使う。`any` は避ける
* 依頼されていない変更をしない。デモ・README・テストを直すときは実装との乖離を作らない
* 5 サイトの見た目は共通。画面を変えるときは react / vue / native を揃え、共通化できるものは `apps/demo.css` に置く
* e2e が依存する見出し・セレクタを壊さない
* 「できた」と言う前に、変更範囲に合う `lint` / `build` / `test:e2e` を実行し、結果を報告する。実行していないものは実行していないと書く

## Agent / Token Efficiency

最小限で足りる agent を使う。

* `scout`（安いモデル）に委譲して要約だけ受け取る: ファイル・シンボルの検索、lint / build / e2e の実行と結果確認
* 自分でやる: 実装・リファクタリング・レビュー、単純な逐次作業
* `ux-reviewer`（読み取り専用）に画面を批評させる: 見た目を変えた作業ごとに 1 回。スクリーンショットの png のパスか URL だけを渡す（コードは読ませない）。修正後の再レビューは新しく起動せず `SendMessage` で同じ agent に頼む
* テストは全 pass なら一行の要約、fail したら失敗したテスト名とエラーだけ返す
* コマンドは変更範囲に絞る（`E2E_SITE=...`、`bun run --filter ...`、`bunx biome check <path>`）
* 生成物は読まない: `node_modules` `dist` `build` `.output` `.nuxt` `.react-router` `storybook-static` `bun.lock` `test-results` `playwright-report`（`settings.json` で Read を deny 済み）

## MCP

`.mcp.json` で共有している。

* `context7` — Lit / Tailwind v4 / Nuxt / React Router / Playwright などの最新ドキュメント。API を推測で書かず、ここで確認する
* `playwright` — 画面確認の主役。スクリーンショットは `.playwright-mcp/` に出る（確認後は消してよい）。ログや snapshot は読まない
* `chrome-devtools` — Lighthouse・CSS 検査が要るときだけ使う

## スキル

* `fixing-accessibility` — フォーカス・ARIA・キーボード操作・コントラストの確認。dialog / tabs / フォームを触るとき
* ライブラリや手順を探すときは `find-skills`
