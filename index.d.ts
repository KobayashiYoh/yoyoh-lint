import type { ESLint, Linter } from "eslint";

/** yoyoh-lint の ESLint プラグイン本体。 */
declare const plugin: ESLint.Plugin & {
  /** プラグインが提供するフラット設定。 */
  configs: {
    /** 独自ルールをすべて error で有効化する設定。 */
    all: Linter.Config;
  };
};

export default plugin;
