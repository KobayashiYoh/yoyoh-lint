import packageJson from "../package.json" with { type: "json" };
import { rules } from "./rules/index.js";

/** 設定ファイルでルール名の接頭辞として使うプラグインの名前空間。 */
const NAMESPACE = "yoyoh";

/**
 * yoyoh-lint の ESLint プラグイン本体。
 * @type {import("eslint").ESLint.Plugin & { configs: { all: import("eslint").Linter.Config } }}
 */
const plugin = {
  meta: {
    name: packageJson.name,
    version: packageJson.version,
    namespace: NAMESPACE,
  },
  rules,
  configs: {},
};

/**
 * 独自ルールをすべて error で有効化するフラット設定。
 * rules から生成するため、ルールを追加すると自動的に含まれる。
 */
plugin.configs.all = {
  name: `${NAMESPACE}/all`,
  plugins: {
    [NAMESPACE]: plugin,
  },
  rules: Object.fromEntries(
    Object.keys(rules).map((ruleName) => [`${NAMESPACE}/${ruleName}`, "error"]),
  ),
};

export default plugin;
