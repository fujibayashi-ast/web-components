# 開発

## セットアップ

Bun 1.4.2 以降で `bun install` を実行します。パッケージ管理とスクリプトの実行は Bun、
React Router / Nuxt のツールと SSR のランタイムは Node.js 24.21.0 です。
Volta があればプロジェクトの固定版が選ばれます。使わない場合は対応する Node.js を用意してください。
依存のバージョンは `bun.lock` で固定され、CI では `bun install --frozen-lockfile` を使います。

初回は `bunx playwright install chromium` でブラウザを取得します。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `bun run build` | 全パッケージのビルド（型チェック込み。SPA / SSR 両方） |
| `bun run dev:react` / `bun run dev:vue` | デモを起動（SPA） |
| `bun run dev:react:ssr` / `bun run dev:vue:ssr` | SSR の開発サーバーを起動 |
| `bun run dev:native` | フレームワークなしのデモを起動 |
| `bun run lint` / `bun run lint:fix` | Biome |
| `bun run test:e2e` / `bun run test:e2e:ui` | Playwright（5 サイト。サーバーは自動起動） |
| `bun run --cwd packages/ui vitest run` | コンポーネントテスト |
| `bun run --filter @web-components/ui storybook` | Storybook |

## 5 つのサイト

React / Vue の `dev` は `ssr: false`、`dev:ssr` は `ssr: true` の開発サーバーです。
アプリや画面を複製せず、同じフレームワーク設定・同じ画面を `RENDER_MODE=spa` / `ssr` で切り替えます。
サーバー起動・SSR・hydration・HMR は React Router / Nuxt の標準に任せ、独自の SSR プラグインやサーバーエントリは作りません。
同時に動かせるよう、キャッシュ・生成物・ビルド先だけモード別に分けています。SSG と Lit 内部のサーバー描画は導入していません。

| Project | 起動コマンド | URL |
| --- | --- | --- |
| `react-spa` | `bun run dev:react --host 127.0.0.1 --port 5199 --strictPort` | http://127.0.0.1:5199/ |
| `vue-spa` | `bun run dev:vue --host 127.0.0.1 --port 5198` | http://127.0.0.1:5198/ |
| `react-ssr` | `bun run dev:react:ssr --host 127.0.0.1 --port 5197 --strictPort` | http://127.0.0.1:5197/ |
| `vue-ssr` | `bun run dev:vue:ssr --host 127.0.0.1 --port 5196` | http://127.0.0.1:5196/ |
| `native` | `bun run dev:native --host 127.0.0.1 --port 5195 --strictPort` | http://127.0.0.1:5195/ |

## E2E

共有コンポーネントが「どのサイトでも同じ挙動」になることを確かめるため、spec は 5 サイト共通です。
1 サイトだけ実行するには `E2E_SITE`（`react-spa` `vue-spa` `react-ssr` `vue-ssr` `native`）を使います。

```sh
E2E_SITE=react-spa bun run test:e2e
E2E_SITE=react-ssr bun run test:e2e e2e/components/input.spec.ts
bun run test:e2e e2e/components/dialog.spec.ts e2e/components/tabs.spec.ts
```

`E2E_SITE` を省略すると全サイトのサーバーが起動します。`--project=react-ssr` も使えますが、サーバーは全サイト分起動します。

| spec | 内容 |
| --- | --- |
| [button](../e2e/components/button.spec.ts) | count-change / クラスの上書き / loading |
| [card](../e2e/components/card.spec.ts) | Shadow DOM / slot |
| [input](../e2e/components/input.spec.ts) | 値の変更 / 親からのリセット |
| [checkbox](../e2e/components/checkbox.spec.ts) | true / false / 親からのリセット |
| [select](../e2e/components/select.spec.ts) | 配列 props / 選択変更 / 無効な選択肢 / リセット |
| [dialog](../e2e/components/dialog.spec.ts) | slot / 閉じる操作 / フォーカスの循環と復帰 |
| [tabs](../e2e/components/tabs.spec.ts) | named slot / ARIA / キーボード操作 / RTL |
| [image-uploader](../e2e/components/image-uploader.spec.ts) | 選択・drop・削除 / 制限 / プレビュー |
| [form](../e2e/form.spec.ts) | フォームの検証 / reset / 送信結果 |
| [theme](../e2e/theme.spec.ts) | システム / ライト / ダークの切り替えと保存 |
| [integration](../e2e/integration.spec.ts) | SSR / hydration / 再登録 / レイアウト / disabled の連携 |

SSR 専用のテストは、JavaScript を無効にしたブラウザでもページと slot の内容があること、有効にしたとき hydration エラーがなく、
操作で親の状態が更新されることを確かめます。SPA と native ではこの SSR 専用テストだけがスキップされます。

## 本番ビルドの確認

先に `bun run build` を実行します。Nuxt は Nitro 標準の Node サーバー出力を使います。

| 対象 | ビルド先 | 起動コマンド |
| --- | --- | --- |
| React SPA | `apps/react/build/spa/client` | `bun run --filter ./apps/react preview` |
| React SSR | `apps/react/build/ssr` | `bun run --filter ./apps/react start:ssr` |
| Nuxt SPA | `apps/vue/.output/spa` | `bun run --filter ./apps/vue preview` |
| Nuxt SSR | `apps/vue/.output/ssr` | `bun run --filter ./apps/vue start:ssr` |

## Storybook

`bun run --filter @web-components/ui storybook` で http://localhost:6006/ が開きます。
共通の Web Components をそのまま表示し、Controls で props を変えられます。画像は実際に選択・削除できます。
ツールバーの Theme でライト / ダーク / システムを切り替えます。

## `Lit is in dev mode` の警告

`vite dev` は Lit の開発ビルドを使うので、コンソールにこの警告が出ます。開発時のアサーションが有効という印で、
`vite build` の本番ビルドでは出ません。想定内なので抑えていません。
