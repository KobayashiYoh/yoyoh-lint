/**
 * 関数呼び出しの引数をオブジェクトリテラル1つにまとめ、名前付きで渡させるルール。
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "関数呼び出しの引数をオブジェクトリテラル1つにまとめて名前付きで渡させる",
    },
    schema: [],
    messages: {
      requireNamedArguments:
        "関数呼び出しの引数は、オブジェクトリテラル1つにまとめて名前付きで渡してください。",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const { arguments: args } = node;

        if (args.length === 0) {
          return;
        }

        const isSingleObjectLiteral = args.length === 1 && args[0].type === "ObjectExpression";

        if (isSingleObjectLiteral) {
          return;
        }

        context.report({ node, messageId: "requireNamedArguments" });
      },
    };
  },
};
