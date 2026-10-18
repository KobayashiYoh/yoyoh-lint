/** 例外を投げうる式の種類。 */
const THROWABLE_EXPRESSION_TYPES = new Set([
  "CallExpression",
  "NewExpression",
  "AwaitExpression",
  "TaggedTemplateExpression",
  "ImportExpression",
  "YieldExpression",
]);

/** 定義しただけでは中身が実行されない関数の種類。 */
const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

/** 例外を投げうる式を含んでいれば許可する文の種類。 */
const STATEMENT_TYPES_ALLOWING_THROWABLE = new Set([
  "ExpressionStatement",
  "VariableDeclaration",
  "ReturnStatement",
]);

/**
 * ノードの評価中に例外を投げうる式が含まれているかを判定する。
 * @param {import("estree").Node} node
 * @param {import("eslint").SourceCode["visitorKeys"]} visitorKeys
 * @returns {boolean}
 */
function containsThrowableExpression(node, visitorKeys) {
  if (THROWABLE_EXPRESSION_TYPES.has(node.type)) {
    return true;
  }

  if (FUNCTION_TYPES.has(node.type)) {
    return false;
  }

  const keys = visitorKeys[node.type] ?? [];

  return keys.some((key) => {
    const children = [node[key]].flat();

    return children.some((child) => {
      const isNode = typeof child?.type === "string";

      return isNode && containsThrowableExpression(child, visitorKeys);
    });
  });
}

/**
 * try ブロックに例外を投げうる処理以外を記述することを禁止するルール。
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "try ブロックに例外を投げうる処理以外を記述することを禁止する",
    },
    schema: [],
    messages: {
      nonThrowingStatement:
        "try ブロックには例外を投げうる処理（関数呼び出し・await・new・throw）だけを記述してください。",
    },
  },
  create(context) {
    const { visitorKeys } = context.sourceCode;

    /**
     * try ブロックに記述してよい文かを判定する。
     * @param {import("estree").Statement} statement
     * @returns {boolean}
     */
    function isAllowedStatement(statement) {
      if (statement.type === "ThrowStatement") {
        return true;
      }

      if (STATEMENT_TYPES_ALLOWING_THROWABLE.has(statement.type)) {
        return containsThrowableExpression(statement, visitorKeys);
      }

      return false;
    }

    return {
      TryStatement(node) {
        for (const statement of node.block.body) {
          if (isAllowedStatement(statement)) {
            continue;
          }

          context.report({ node: statement, messageId: "nonThrowingStatement" });
        }
      },
    };
  },
};
