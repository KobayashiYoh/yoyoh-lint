# yoyoh-lint

自分のコーディング規約を検査する ESLint プラグインです。JavaScript と TypeScript の両方で使えます。

## 動作環境

- ESLint 9 以降（フラット設定形式）
- Node.js 20.19 以降

## インストール

npm には公開していないため、GitHub から直接インストールします。ビルドは不要です。

```sh
pnpm add -D eslint github:KobayashiYoh/yoyoh-lint
```

特定のブランチ・タグ・コミットに固定する場合は `#` の後に指定します。

```sh
pnpm add -D github:KobayashiYoh/yoyoh-lint#<ブランチ・タグ・コミット>
```

## 設定

### 個別のルールを有効化する

必要なルールだけを選んで有効化します。ルール名の接頭辞は `yoyoh/` です。

```js
// eslint.config.js
import yoyohLint from "yoyoh-lint";

export default [
  {
    plugins: {
      yoyoh: yoyohLint,
    },
    rules: {
      "yoyoh/<ルール名>": "error",
    },
  },
];
```

### 全ルールを有効化する

`configs.all` は独自ルールをすべて `error` で有効化します。ルールを追加すると `configs.all` にも自動で含まれるため、プラグインを更新すると新しいルールが有効になります。

```js
// eslint.config.js
import yoyohLint from "yoyoh-lint";

export default [
  yoyohLint.configs.all,
];
```

### 既存のルールセットと組み合わせる

`typescript-eslint` などのルールセットと並べて使えます。

次の規約は ESLint 本体のルールで検査できるため、このプラグインでは実装していません。`typescript-eslint` の `strict` や `strictTypeChecked` には含まれないため、利用側で明示的に有効化してください。

| 規約 | ESLint 本体のルール |
| --- | --- |
| if 文では波括弧を省略しない | `curly: ["error", "all"]` |
| if / else の条件は否定より肯定を先にする | `no-negated-condition: "error"` |

```js
// eslint.config.js
import tseslint from "typescript-eslint";
import yoyohLint from "yoyoh-lint";

export default [
  ...tseslint.configs.strict,
  yoyohLint.configs.all,
  {
    rules: {
      curly: ["error", "all"],
      "no-negated-condition": "error",
    },
  },
];
```

## 開発

```sh
pnpm install
pnpm test
```
