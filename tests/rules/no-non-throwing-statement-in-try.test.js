import rule from "../../src/rules/no-non-throwing-statement-in-try.js";
import { ruleTester, typeScriptRuleTester } from "../rule-tester.js";

const error = { messageId: "nonThrowingStatement" };

ruleTester.run("no-non-throwing-statement-in-try", rule, {
  valid: [
    "async function f() { try { await execute(); } catch (error) { throw error; } }",
    "try { execute(); } catch {}",
    "try { const result = execute(); } catch {}",
    "try { const user = new User(); } catch {}",
    "try { throw new Error('failed'); } catch {}",
    "function f() { try { return execute(); } catch {} }",
    "try { value = parse(text); } catch {}",
    "try { result.items = load(); } catch {}",
    "try { const { a } = execute(); } catch {}",
    "try { tag`text`; } catch {}",
    "async function f() { try { const m = await import('./m.js'); } catch {} }",
    "function* f() { try { yield value; } catch {} }",
    "try {} catch {}",
    "try { execute(); } catch { const value = 1; } finally { const other = 2; }",
  ],
  invalid: [
    { code: "try { const value = 1; } catch {}", errors: [error] },
    { code: "try { value = other; } catch {}", errors: [error] },
    { code: "try { execute(); const value = 1; } catch {}", errors: [error] },
    { code: "try { if (isValid) { execute(); } } catch {}", errors: [error] },
    { code: "try { for (const item of items) { execute(item); } } catch {}", errors: [error] },
    { code: "try { { execute(); } } catch {}", errors: [error] },
    { code: "function f() { try { return; } catch {} }", errors: [error] },
    { code: "function f() { try { return value; } catch {} }", errors: [error] },
    { code: "try { const run = () => execute(); } catch {}", errors: [error] },
    { code: "try { function run() { execute(); } } catch {}", errors: [error] },
    { code: "try { const value = 1; const other = 2; } catch {}", errors: [error, error] },
  ],
});

typeScriptRuleTester.run("no-non-throwing-statement-in-try (TypeScript)", rule, {
  valid: ["try { const user = execute() as User; } catch {}", "try { const user = find()!; } catch {}"],
  invalid: [
    { code: "try { const user = value as User; } catch {}", errors: [error] },
    { code: "try { type Id = string; } catch {}", errors: [error] },
  ],
});
