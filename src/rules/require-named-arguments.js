/** 関数を値として生成する式の種類。 */
const FUNCTION_EXPRESSION_TYPES = new Set(["FunctionExpression", "ArrowFunctionExpression"]);

/**
 * 識別子の名前を、参照している位置のスコープから外側へたどって解決する。
 * @param {import("eslint").Scope.Scope} scope
 * @param {string} name
 * @returns {import("eslint").Scope.Variable | null}
 */
function findVariable(scope, name) {
  for (let current = scope; current !== null; current = current.upper) {
    const variable = current.set.get(name);

    if (variable !== undefined) {
      return variable;
    }
  }

  return null;
}

/**
 * 変数の定義が、プロジェクト内で定義された関数を指しているかを判定する。
 * @param {import("eslint").Scope.Definition} definition
 * @returns {boolean}
 */
function isProjectFunctionDefinition(definition) {
  switch (definition.type) {
    case "FunctionName":
      return true;
    case "ImportBinding":
      return definition.parent.source.value.startsWith(".");
    case "Variable":
      return FUNCTION_EXPRESSION_TYPES.has(definition.node.init?.type);
    default:
      return false;
  }
}

/**
 * 型情報が提供されている場合に、TypeScript のプログラムと ESTree との対応表を取得する。
 * @param {import("eslint").SourceCode} sourceCode
 * @returns {{ program: import("typescript").Program, esTreeNodeToTSNodeMap: Map<unknown, import("typescript").Node> } | null}
 */
function getTypeServices(sourceCode) {
  const services = sourceCode.parserServices;

  return services?.program ? services : null;
}

/**
 * 関数呼び出しの引数をオブジェクトリテラル1つにまとめ、名前付きで渡させるルール。
 * 引数の形を決められる、プロジェクト内で定義された関数の呼び出しだけを検査する。
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "プロジェクト内で定義された関数の呼び出しで、引数をオブジェクトリテラル1つにまとめて名前付きで渡させる",
    },
    schema: [],
    messages: {
      requireNamedArguments:
        "関数呼び出しの引数は、オブジェクトリテラル1つにまとめて名前付きで渡してください。",
    },
  },
  create(context) {
    const { sourceCode } = context;
    const typeServices = getTypeServices(sourceCode);

    /**
     * 型情報から呼び出し先の宣言を特定し、外部ライブラリと標準ライブラリ以外で宣言されているかを判定する。
     * @param {import("estree").CallExpression} node
     * @returns {boolean}
     */
    function isProjectCallByType(node) {
      const { program, esTreeNodeToTSNodeMap } = typeServices;
      const tsNode = esTreeNodeToTSNodeMap.get(node);
      const declaration = program.getTypeChecker().getResolvedSignature(tsNode)?.declaration;

      if (declaration === undefined) {
        return false;
      }

      const sourceFile = declaration.getSourceFile();
      const isExternal =
        program.isSourceFileFromExternalLibrary(sourceFile) ||
        program.isSourceFileDefaultLibrary(sourceFile) ||
        sourceFile.fileName.includes("/node_modules/");

      return !isExternal;
    }

    /**
     * 型情報を使わずに、同じファイル内で定義した関数か相対パスから import した関数の呼び出しかを判定する。
     * @param {import("estree").CallExpression} node
     * @returns {boolean}
     */
    function isProjectCallByScope(node) {
      if (node.callee.type !== "Identifier") {
        return false;
      }

      const variable = findVariable(sourceCode.getScope(node), node.callee.name);
      const definition = variable?.defs.at(-1);

      return definition !== undefined && isProjectFunctionDefinition(definition);
    }

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

        const isProjectCall = typeServices === null ? isProjectCallByScope(node) : isProjectCallByType(node);

        if (!isProjectCall) {
          return;
        }

        context.report({ node, messageId: "requireNamedArguments" });
      },
    };
  },
};
