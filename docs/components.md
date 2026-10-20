# コンポーネント

props・イベント・スタイルの仕様です。使い方の入口は [README](../README.md)。
型は各 `packages/ui/src/web-components/<name>/types.ts` にあります。

共通の方針:

* props は**プロパティ**として渡す。配列やオブジェクトを HTML 属性へ文字列化しない（React は `options={options}`、Vue は `:options="options"`、素の HTML は `element.options = options`）
* 親から props を変えてもイベントは発火しない。イベントはユーザー操作だけ
* 表示文言（「閉じる」「画像を選択」「選択してください」など、コンポーネント内蔵のもの）は日本語固定で、多言語対応は入れていない

## my-button

`label` / `loading` / `disabled` を渡せます。`label` が空なら「こんにちは、{name}！({count})」を表示します。

* `loading` 中は寸法を変えないスピナーと `aria-busy="true"` を表示し、内部の `<button>` を無効にする
* `loading` または `disabled` の間は count を更新せず、`count-change` も発行しない
* `prefers-reduced-motion` ではスピナーを回さない

デモの「変更を保存」は呼び出し側の Promise を待ち、成功・失敗どちらでも `finally` で `loading` を戻します。
Promise や通信は共通 UI に渡さず、表示状態だけを `loading={loading}`（React）/ `:loading="loading"`（Vue）/
`element.loading = loading`（素の HTML）で渡します。

light DOM なので、ホストの Tailwind がそのまま効きます。スタイルを変える方法:

| 方法 | 効く先 |
| --- | --- |
| `class` / `className` | ホストの `<my-button>`（margin・width などレイアウト向き） |
| `buttonClass` | 内側の `<button>`。`tailwind-merge` で衝突を解決するので、`buttonClass="bg-red-500"` が既定の `bg-blue-500` に勝つ |
| アプリ CSS の `my-button button { … }` | light DOM なので普通に届く |

## my-card

Shadow DOM の `<slot>` を持つカード。`label` は見出しに入ります（「こんにちは、{label}！」）。
Tailwind や外部 CSS は中に届かないので、`my-card::part(heading)` と `--my-card-border` / `--my-card-radius` で変更します。

## 入力部品

| 要素 | props | イベント / detail |
| --- | --- | --- |
| `my-input` | `label` `value` `placeholder` `disabled` `error` | `value-change` / `{ value: string }` |
| `my-checkbox` | `label` `checked` `disabled` `error` | `checked-change` / `{ checked: boolean }` |
| `my-select` | `label` `value` `options` `placeholder` `disabled` `error` | `value-change` / `{ value: string }` |

React では `onValueChange` / `onCheckedChange` の `event.detail`、Vue では `@value-change` / `@checked-change` の payload から値を受け取ります。

Shadow DOM 内のネイティブ `input` / `select` と `label` を使うので、Tailwind がなくても動きます。
`::part(input)` / `::part(select)` / `::part(label)` / `::part(error)` でスタイルを変えられます。

`my-select` の `options` は `readonly MySelectOption[]`（`{ value, label, disabled? }`）です。
各 `value` は一意な空でない文字列にします。選択値は `value` のどれか、または未選択を表す空文字で、空文字のときは `placeholder` を表示します。
選択肢を更新するときは新しい配列を代入し、取り除いた項目が選択中なら親の選択値も更新してください。

これらは入力とイベント連携のサンプルで、form-associated custom elements ではありません。
`FormData` やネイティブフォームの送信・reset には自動で参加しません。

## my-dialog

| props | イベント / detail | slot |
| --- | --- | --- |
| `label` `open` | `open-change` / `{ open: false }` | default |

`open` プロパティで開閉します。「閉じる」ボタンまたは Escape による閉じる操作は
`onOpenChange`（React）/ `@open-change`（Vue）で受け取り、親の状態へ反映します。

* ネイティブ `showModal()` に、背景の操作禁止・Escape・起動要素へのフォーカス復帰を任せる
* `focus-trap` で、Shadow DOM と slot をまたぐ Tab / Shift+Tab の循環を保証する
* 最初のフォーカスは「閉じる」ボタン。閉じるとき・切断時に trap を解除する
* Shadow DOM の内部は SSR しないため、閉じたダイアログの内容は mount 完了までホストの `hidden` 属性で隠す（デモ参照）

スタイル: `::part(dialog)` / `::part(heading)` / `::part(close-button)`、
`--my-dialog-background` / `--my-dialog-color` / `--my-dialog-border-color` / `--my-dialog-accent` / `--my-dialog-backdrop`。

## my-tabs

| props | イベント / detail |
| --- | --- |
| `label` `value` `items` | `value-change` / `{ value: string }` |

`items` は `readonly MyTab[]`（`{ value, label, disabled? }`）。`value` は一意な空でない文字列にし、
パネルの中身は `<div slot="overview">…</div>` のように `value` を slot 名にして渡します。
空・無効な `value` のときは最初の有効なタブを表示します。

* 矢印キーは有効なタブを循環し、無効なタブを飛ばす。Home / End で先頭 / 末尾へ。RTL では左右キーを反転する
* 移動と同時に選択も更新する。Tab キーで入れるのは選択中のタブだけ
* `role="tablist"` / `tab` / `tabpanel` と ARIA の ID 参照は内部で管理する

スタイル: `::part(tab)` / `::part(panel)`、`--my-tabs-accent` / `--my-tabs-border-color`。

## my-image-uploader

画像を選ぶ UI で、サーバーへのアップロードはしません。`files`（`readonly File[]`）は新しい配列を渡します。

| イベント | detail | React / Vue |
| --- | --- | --- |
| `files-change` | `{ files: File[] }` | `onFilesChange` / `@files-change` |
| `files-reject` | `{ message: string }` | `onFilesReject` / `@files-reject` |

* 選択と drop は既存のファイルへ追加。削除は新しい配列を通知。選択ダイアログのキャンセルは値を変えない
* 既定は PNG / JPEG / WebP、最大 3 枚、1 枚 2 MiB。`allowedTypes` `maxFiles` `maxBytes` で変更できる
* 制限に違反する追加は一括で拒否し、受理済みの画像は残す。`disabled` は選択・drop・削除を無効にする
* `error` と最新の拒否理由を表示し、拒否理由を優先する
* プレビューの Object URL は削除・置換・reset・切断時に解放し、再接続時に作り直す

通信は呼び出し側で `FormData` などへ変換してください。MIME とサイズの検査は UI 上のもので、
セキュリティの保証ではありません。保存先でも形式・内容・サイズを検証してください。

スタイル: `::part(drop-zone)` / `::part(preview)` / `::part(choose-button)` / `::part(remove-button)` / `::part(error)`、
`--my-image-uploader-border-color` / `--my-image-uploader-background` / `--my-image-uploader-accent`。

## エラー表示と余白

`error` を持つ部品（input / checkbox / select / image-uploader）は、エラー表示の領域を `--my-control-error-space` で常に確保し、
エラーの出入りで画面がずれないようにしています。色は `--my-control-error-color` で変えられます。

## フォームライブラリとの連携

共通 UI が担当するのは、値・変更イベント・`error` の表示と、内部コントロールへの `focus()` / `blur()` だけです。
検証ルール・touched・送信・reset は呼び出し側が管理し、UI パッケージはフォームライブラリに依存しません。

* [React](../apps/react/app/components/form-sample.tsx): React Hook Form 7 の `Controller` で `value` / `onChange` / `onBlur` / `ref` を接続
* [Vue](../apps/vue/app/components/FormSample.vue): vee-validate 4 の `useForm` / `useField` で値・変更・`focusout` を接続。エラー時はホスト要素にフォーカス
* [素の HTML](../apps/native/src/form-sample.ts): 同じ契約へ状態と検証を手で接続
* [共有ルール](../apps/form-demo.ts): 初期値・必須検証・送信結果の表示形式を 5 サイトで揃える

5 サイトとも、名前・権限・同意・画像を検証し、最初のエラーにフォーカスします。
有効な送信ではコールバックが `File[]` を含む値を受け取り、画面にはファイルのメタデータだけを表示します。
リセットは初期値に戻し、エラー・touched・画像・送信結果を消します。
File 型の dirty 判定は React Hook Form に任せず、必要なら呼び出し側で管理してください。

## テーマ

デモページの「テーマ」で システム / ライト / ダーク を選びます。システムは OS の設定とその変更に追従し、
明示的な選択は OS より優先されます。選択は `web-components.theme` キーで localStorage に保存します
（origin ごと。同じ origin の別タブには反映され、保存領域が使えなくてもページ内の切り替えは動く）。

[apps/theme.ts](../apps/theme.ts) の初期スクリプトを React の HTML Layout・Nuxt の head・native の HTML に入れ、
hydration の前に保存したテーマを適用します。React の `suppressHydrationWarning` は、テーマ属性と class を変える html 要素だけに付けています。
inline script を使うので、CSP を導入する場合は nonce か hash の設定が必要です。

コンポーネントは独自のテーマ状態を持ちません。[apps/demo.css](../apps/demo.css) の色トークンを CSS カスタムプロパティとして
Shadow DOM へ継承し、枠線・アクセント・エラー色・ダイアログ・画像プレビューが追従します。
サイトの色定義は CSS の `light-dark()` に対応したブラウザが対象です。

## SSR と開発時の再登録

ブラウザ以外では custom element の登録をスキップするので、React / Vue のサーバーレンダラーからラッパーを import できます。
SSR が出力するのはホストタグと slot の内容で、Lit 内部の描画はブラウザで行います。
Shadow DOM の内部まで SSR するには Lit SSR の導入が別途必要です（このサンプルでは入れていません）。

SSG も同様で、ビルド時の HTML に Shadow DOM の内側は入りません。操作する部品ならこれで困ることは少なく、
ページの主要な内容は部品の内側に持たせず、slot（外側の DOM）に置いてください。

light DOM の要素（`my-button`）は `static usesLightDom = true` を宣言します。React ラッパーは固定した空の
`dangerouslySetInnerHTML` を使って内部 DOM を React の管理から外し、Lit の先行描画による hydration の不一致と、
親の再描画による内部 DOM の消去を防ぎます。この要素に React の children は渡せません。slot が要るなら `my-card` のような Shadow DOM の要素を使ってください。
ユーザー入力を HTML に挿入する処理ではありません。

デモの入力部品は mount が終わるまで無効にし、イベントを接続する前の操作を防ぎます。
`main[data-ready="true"]` が mount 完了の印で、E2E はこれを待ってから操作します。

登録済みのタグは再登録をスキップします。同じモジュールを再評価しても例外にはなりませんが、登録済みのクラスは置き換わらないので、
コンポーネントの実装を変えたらページを再読み込みしてください。
