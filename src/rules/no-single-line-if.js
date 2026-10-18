/**
 * if 文を1行で記述することを禁止するルール。
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "layout",
    docs: {
      description: "if 文を1行で記述することを禁止する",
    },
    schema: [],
    messages: {
      singleLine: "if 文は複数行で記述してください。",
    },
  },
  create(context) {
    const { sourceCode } = context;

    /**
     * 分岐の本体が直前のトークンと同じ行に収まっているかを判定する。
     * @param {import("estree").Statement} body if または else の本体
     * @returns {boolean}
     */
    function isSingleLineBody(body) {
      if (body.type === "BlockStatement") {
        return body.loc.start.line === body.loc.end.line;
      }

      const precedingToken = sourceCode.getTokenBefore(body);

      return precedingToken.loc.end.line === body.loc.start.line;
    }

    return {
      IfStatement(node) {
        if (isSingleLineBody(node.consequent)) {
          context.report({ node, messageId: "singleLine" });
        }

        const hasElseBody = node.alternate !== null && node.alternate.type !== "IfStatement";

        if (hasElseBody && isSingleLineBody(node.alternate)) {
          context.report({ node: node.alternate, messageId: "singleLine" });
        }
      },
    };
  },
};
