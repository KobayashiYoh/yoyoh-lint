import path from "node:path";
import { fileURLToPath } from "node:url";
import typeScriptParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-named-arguments.js";
import { ruleTester, typeScriptRuleTester } from "../rule-tester.js";

const error = { messageId: "requireNamedArguments" };

/** 型情報付きのテストで使う tsconfig.json があるディレクトリ。 */
const TYPED_FIXTURES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../fixtures/typed");

/** 型情報付きのテストで、検査するコードを置くファイルのパス。 */
const TYPED_FILENAME = path.join(TYPED_FIXTURES_DIR, "file.ts");

/** 型情報を使ってルールを検査する RuleTester。 */
const typedRuleTester = new RuleTester({
  languageOptions: {
    parser: typeScriptParser,
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: TYPED_FIXTURES_DIR,
    },
  },
});

/**
 * 型情報付きのテストケースに、検査対象のファイル名を付ける。
 * @param {string | { code: string }} testCase
 * @returns {{ code: string, filename: string }}
 */
function typed(testCase) {
  const normalized = typeof testCase === "string" ? { code: testCase } : testCase;

  return { ...normalized, filename: TYPED_FILENAME };
}

ruleTester.run("require-named-arguments (型情報なし)", rule, {
  valid: [
    "function execute() {} execute();",
    "function createUser() {} createUser({ fullName, age });",
    "function createUser() {} createUser({ fullName: `${a} ${b}`, age: calc({ birthDate }) });",
    "function createUser() {} createUser({ ...base, age });",
    "createUser(fullName, age);",
    "Array.isArray(value);",
    "text.replace(a, b);",
    "set.add(n);",
    "user.save(fullName, age);",
    "import * as user from './user.js'; user.createUser(fullName, age);",
    "import { useState } from 'react'; useState(0);",
    "import createUser from 'some-lib'; createUser(fullName, age);",
    "const createUser = makeCreator(); createUser(fullName, age);",
    "function run(callback) { callback(value); }",
    "class A extends B { constructor() { super(value); } }",
    "class A { constructor(fullName, age) {} } new A(fullName, age);",
  ],
  invalid: [
    { code: "function createUser() {} createUser(fullName, age);", errors: [error] },
    { code: "const createUser = () => {}; createUser(fullName);", errors: [error] },
    { code: "const createUser = function () {}; createUser(fullName);", errors: [error] },
    { code: "import { createUser } from './user.js'; createUser(fullName, age);", errors: [error] },
    { code: "import createUser from '../user.js'; createUser(fullName, age);", errors: [error] },
    {
      code: "function createUser() {} function calc() {} createUser(`${a} ${b}`, calc(birthDate));",
      errors: [error, error],
    },
    { code: "function createUser() {} createUser({ fullName }, age);", errors: [error] },
    { code: "function createUser() {} createUser(...args);", errors: [error] },
    { code: "function createUser() {} createUser([fullName, age]);", errors: [error] },
    { code: "function outer() { function inner() {} inner(value); }", errors: [error] },
  ],
});

typeScriptRuleTester.run("require-named-arguments (TypeScript・型情報なし)", rule, {
  valid: [
    "function createUser<T>(params: T) {} createUser<User>({ fullName, age });",
    "import { createUser } from 'some-lib'; createUser<User>(fullName, age);",
  ],
  invalid: [
    { code: "function createUser<T>(a: T, b: T) {} createUser<User>(fullName, age);", errors: [error] },
    { code: "import { createUser } from './user'; createUser<User>(fullName, age);", errors: [error] },
  ],
});

typedRuleTester.run("require-named-arguments (型情報あり)", rule, {
  valid: [
    "Array.isArray([]);",
    "'text'.replace('a', 'b');",
    "new Set<number>().add(1);",
    "JSON.stringify({}, null, 2);",
    "[1, 2].map((value) => value * 2);",
    "setTimeout(() => {}, 100);",
    "import { Linter } from 'eslint'; new Linter().verify('', []);",
    "class AppError extends Error { constructor(message: string) { super(message); } }",
    "function createUser(params: { fullName: string }) {} createUser({ fullName: 'a' });",
    "declare const callback: any; callback(1, 2);",
  ].map(typed),
  invalid: [
    { code: "function createUser(fullName: string, age: number) {} createUser('a', 1);", errors: [error] },
    { code: "import { createUser } from './user'; createUser('a', 1);", errors: [error] },
    { code: "import * as user from './user'; user.createUser('a', 1);", errors: [error] },
    {
      code: "const repository = { save(id: string) {} }; repository.save('a');",
      errors: [error],
    },
    {
      code: "type Execute = (args: string) => void; declare const execute: Execute; execute('a');",
      errors: [error],
    },
    {
      code: "import { BaseModel } from './user'; class User extends BaseModel { constructor() { super('a'); } }",
      errors: [error],
    },
  ].map(typed),
});
