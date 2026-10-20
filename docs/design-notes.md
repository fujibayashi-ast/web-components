# 設計メモ

このサンプルで選んだ書き方とその理由です。

## デコレータを使わない理由

Lit の `@customElement` / `@property() accessor` は TC39 標準デコレータで、
**Vite の dev トランスフォーマ（esbuild / oxc）が変換してくれません**。
`vite build`（rolldown）は変換するので本番だけ通り、`vite dev` は `Unexpected token 'export'` で落ちます。
利用側すべてに Babel プラグインを入れるか、`packages/ui` にビルド工程を足せば使えますが、「薄く」ではなくなります。

そこで element は**デコレータなしの Lit 記法**で書いています。

```ts
export class MyButton extends LitElement implements MyButtonProps {
  static override properties = { name: { type: String }, count: { type: Number } };
  name = "World";
  count = 0;
}
if (typeof customElements !== "undefined" && !customElements.get("my-button")) {
  customElements.define("my-button", MyButton);
}
```

`packages/ui/tsconfig.json` は **`useDefineForClassFields: false`** です。`true` だとフィールド初期化子が
Lit のリアクティブアクセサを覆い隠し、リアクティビティが壊れます（esbuild は各ファイル直近の tsconfig を見るので、
アプリ側が `true` でも、このパッケージのファイルは `false` で変換されます）。

## `types.ts` を分ける理由

公開する型（`MyButtonProps` など）は、`customElements.define` の副作用を持つ element 本体から切り離して `types.ts` に置き、
ラッパーはそこから import します。props とイベントの契約を、フレームワークや要素登録の副作用に依存させないためです。

## カスタムイベントとラッパーの共通化

イベントの契約は element 側にだけ置きます。

```ts
// web-components/button/index.ts
static tagName = "my-button" as const;
static eventNames = ["count-change"] as const
  satisfies readonly (keyof MyButtonEventMap)[];   // 名前を型マップと突き合わせる
```

* **React** — `react/create-wrapper.ts` の `createWrapper<El, EventMap>(El)` を 1 行書く。
  `tagName` と `eventNames` は element の static から読み、`onCountChange` という prop 名と `e.detail` の型は `MyButtonEventMap` から作る

  ```ts
  export const MyButton = createWrapper<MyButtonElement, MyButtonEventMap>(MyButtonElement);
  ```

* **Vue** — `vue/create-wrapper.ts` の `createWrapper<Props, EventMap>(El)` に、props・attrs・slot・イベント転送をまとめている。
  SFC のマクロを使わないので、イベント名と型を二重に宣言しなくてよい

  ```ts
  export const MyButton = createWrapper<MyButtonProps, MyButtonEventMap>(MyButtonElement);
  ```

  `forward-events.ts` は ref にリスナーを登録し、要素の差し替えと unmount でクリーンアップする。
  省略した props は転送せず、Lit の初期値を保つ

## light DOM と Shadow DOM の使い分け

* `my-button` は **light DOM**（`createRenderRoot` が `this` を返す）。ホストの Tailwind がそのまま効くが、スタイルの隔離と `<slot>` はない
* それ以外（`my-card` など）は **Shadow DOM**。`<slot>` が使え、スタイルは隔離される。内部は Tailwind ではなくコンポーネント自身の CSS（`static styles`）

Shadow DOM の外観は `::part()` と `--my-*` カスタムプロパティで変えられます。入力系で共通のスタイルは
[shared-styles.ts](../packages/ui/src/web-components/shared-styles.ts) の css 断片に切り出し、
`static styles = [共通, css`…`]` の配列で合成しています。

## `#` subpath imports

`packages/ui` の内部は `../../` を避け、`package.json` の `imports` フィールドでエイリアスしています。

```jsonc
// packages/ui/package.json
"imports": {
  "#web-components":   "./src/web-components/index.ts",
  "#web-components/*": "./src/web-components/*.ts",
  "#react": "./src/react/index.ts", "#react/*": "./src/react/*.ts",
  "#vue":   "./src/vue/index.ts",   "#vue/*":   "./src/vue/*.ts"
}
```

```ts
import { MyButton as MyButtonElement } from "#web-components";
import type { MyButtonProps } from "#web-components/button/types";
```

`tsconfig.json` の `paths` ではなく `imports` を使うのは、`packages/ui` がビルドされず生のソースで配られ、
`apps/*` が**自分の tsconfig / Vite で**そのソースを解決するからです。`paths` は tsconfig を書いたプロジェクトにしか効かず、
利用側すべてに同じ設定をコピーすることになります。`#` subpath imports は `packages/ui/package.json` の中で完結し、
tsc（bundler）・Vite・vue-tsc・Vue SFC のどれも利用側の設定なしで解決できます。

> ターゲットは `"./src/web-components/*.ts"` のように**拡張子付き**にします。拡張子なしだと、
> tsc の `imports` 解決が `.ts` を補ってくれず失敗します。

`.css` などの型宣言は `packages/ui/src/env.d.ts` が `vite/client` 経由で行っています。
Vue ラッパーも通常の TypeScript なので、`.vue` の型シムは不要です。

## アクセシビリティ

ネイティブ要素（`button` `input` `select` `dialog`）を土台にし、tabs だけ ARIA を使っています。
既定の枠線色は白背景でコントラスト比 3:1 以上になる `#6b7280` にしています。

## TypeScript のバージョン

TypeScript は 6 系です。TS 7（ネイティブ版）は `typescript/lib/tsc` のサブパスを廃止していて `vue-tsc` が動かないため、
Vue ツールチェーンの対応を待っています。
