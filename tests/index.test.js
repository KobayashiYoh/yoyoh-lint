import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ESLint } from "eslint";
import plugin from "../src/index.js";

describe("configs.all", () => {
  it("提供している全ルールを error で有効化する", () => {
    const expectedRules = Object.fromEntries(
      Object.keys(plugin.rules).map((ruleName) => [`yoyoh/${ruleName}`, "error"]),
    );

    assert.deepEqual(plugin.configs.all.rules, expectedRules);
  });

  it("フラット設定としてそのまま ESLint に渡せる", async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [plugin.configs.all],
    });

    const [result] = await eslint.lintText("const value = 1;\n");

    assert.equal(result.fatalErrorCount, 0);
  });
});
