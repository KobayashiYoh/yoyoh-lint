import rule from "../../src/rules/require-named-arguments.js";
import { ruleTester, typeScriptRuleTester } from "../rule-tester.js";

const error = { messageId: "requireNamedArguments" };

ruleTester.run("require-named-arguments", rule, {
  valid: [
    "execute();",
    "createUser({ fullName, age });",
    "createUser({ fullName: `${firstName} ${lastName}`, age: calculateAge({ birthDate }) });",
    "createUser({ ...base, age });",
    "user.save({ force: true });",
    "user?.save({ force: true });",
    "new User(fullName, age);",
  ],
  invalid: [
    { code: "createUser(fullName, age);", errors: [error] },
    { code: "createUser(fullName);", errors: [error] },
    { code: "createUser(`${firstName} ${lastName}`, calculateAge(birthDate));", errors: [error, error] },
    { code: "createUser({ fullName }, age);", errors: [error] },
    { code: "createUser(...args);", errors: [error] },
    { code: "createUser([fullName, age]);", errors: [error] },
    { code: "items.map((item) => item.id);", errors: [error] },
    { code: "class A extends B { constructor() { super(value); } }", errors: [error] },
  ],
});

typeScriptRuleTester.run("require-named-arguments (TypeScript)", rule, {
  valid: ["createUser<User>({ fullName, age });"],
  invalid: [{ code: "createUser<User>(fullName, age);", errors: [error] }],
});
