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
      "yoyoh/no-single-line-if": "error",
      "yoyoh/prefer-positive-operand-first": "error",
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

## ルール一覧

| ルール | 内容 |
| --- | --- |
| [`yoyoh/no-single-line-if`](#yoyohno-single-line-if) | if 文を1行で記述しない |
| [`yoyoh/require-logical-expression-variable`](#yoyohrequire-logical-expression-variable) | `&&` と `\|\|` を合わせて2つ以上含む論理式は説明変数に格納する |
| [`yoyoh/no-non-throwing-statement-in-try`](#yoyohno-non-throwing-statement-in-try) | try ブロックには例外を投げうる処理だけを記述する |
| [`yoyoh/require-named-arguments`](#yoyohrequire-named-arguments) | 関数呼び出しの引数はオブジェクト1つにまとめて名前付きで渡す |
| [`yoyoh/prefer-positive-operand-first`](#yoyohprefer-positive-operand-first) | 複合条件では肯定条件を否定条件より先に記述する |

いずれのルールも型情報を使わないため、JavaScript と TypeScript の両方で同じように動作します。自動修正には対応していません。

### `yoyoh/no-single-line-if`

if 文を1行で記述することを禁止します。

```js
// NG
if (isValid) { return; }
if (isValid) return;

// OK
if (isValid) {
  return;
}
```

- if と else の本体がブロックの場合、`{` と `}` が同じ行にあると報告します。空のブロック `{}` も対象です。
- 本体がブロックでない場合、本体が条件式の `)` や `else` と同じ行にあると報告します。
- `else if` は、続く if 文として個別に検査します。

### `yoyoh/require-logical-expression-variable`

`&&` と `||` を合わせて2つ以上含む論理式を、説明変数に格納せずに使うことを禁止します。

```js
// NG
if (isLoggedIn && hasPermission && isActive) {
  execute();
}

// OK
const canExecute = isLoggedIn && hasPermission && isActive;

if (canExecute) {
  execute();
}
```

- 条件式に限らず、`return` や引数など論理式が書けるすべての位置を対象にします。
- 変数の初期化、代入の右辺、クラスのフィールドの初期値にそのまま書かれた論理式は、説明変数とみなして許可します。
- 演算子の数は、括弧や `!` の内側にネストしたものも合わせて数えます（例: `a && !(b || c)` は2つ）。
- `??` は数えません。`??` や関数呼び出しで区切られた論理式は、それぞれ別の論理式として数えます。

### `yoyoh/no-non-throwing-statement-in-try`

try ブロックに、例外を投げうる処理以外を記述することを禁止します。

```js
// NG
try {
  const retryCount = 3;
  await execute(retryCount);
} catch (error) {
  throw new ApplicationError("処理に失敗した", { cause: error });
}

// OK
const retryCount = 3;

try {
  await execute(retryCount);
} catch (error) {
  throw new ApplicationError("処理に失敗した", { cause: error });
}
```

- try ブロックに書けるのは、次のいずれかの文だけです。
  - `throw` 文
  - 関数呼び出し・`await`・`new`・タグ付きテンプレート・動的 `import()`・`yield` を含む式文、変数宣言、`return` 文
- if や for などの制御構文、ブロック、関数宣言は報告します。
- 関数式やアロー関数の中身は、定義した時点では実行されないため、例外を投げうる処理として扱いません。
- プロパティ参照（`a.b`）は例外を投げうる処理として扱いません。
- catch ブロックと finally ブロックは対象外です。

### `yoyoh/require-named-arguments`

関数呼び出しの引数を、オブジェクトリテラル1つにまとめて名前付きで渡すことを強制します。

```js
// NG
createUser(fullName, age);
createUser(`${firstName} ${lastName}`, calculateAge(birthDate));

// OK
createUser({ fullName, age });
execute();
```

- 引数のない呼び出しは許可します。
- 引数がオブジェクトリテラル1つ以外（複数の引数、変数、配列、スプレッド構文、コールバック関数など）の場合に報告します。
- 外部ライブラリや組み込み関数の呼び出し（`console.log(message)`、`items.map(callback)` など）も対象です。必要に応じてファイル単位で無効化してください。
- `super(...)` も関数呼び出しとして対象にします。`new` 式は対象外です。

### `yoyoh/prefer-positive-operand-first`

`&&` や `||` でつないだ複合条件の中で、否定条件を肯定条件より先に記述することを禁止します。

```js
// NG
if (!isDeleted && isActive) {
  execute();
}

// OK
if (isActive && !isDeleted) {
  execute();
}
```

並べ替えても条件の意味が変わらない場合に限って報告します。

- 同じ演算子でつながった項がすべて、識別子・プロパティ参照（`a.b`、`a?.b`、`a["b"]`）・それらの否定である場合だけを対象にします。関数呼び出しなどを含む条件は、評価順の入れ替えで副作用が変わりうるため対象外です。
- 否定条件より後ろにある肯定条件が、否定条件の値のプロパティを参照している場合は報告しません（例: `!user || user.isAdmin` は並べ替えると `user` が `null` のときに例外になる）。
- 真偽値だけが使われる位置（if・while・do-while・for・三項演算子の条件、`!` の被演算子）にある論理式だけを対象にします。変数に格納する論理式は、並べ替えると値が変わりうるため対象外です（例: `!a && b` は `false` か `b` を返す）。
- if / else の条件全体が否定になっているケースは、ESLint 本体の `no-negated-condition` で検査してください。

## 開発

```sh
pnpm install
pnpm test
```
