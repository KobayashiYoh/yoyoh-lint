/** テストで呼び出す、プロジェクト内で定義された関数。 */
export function createUser(fullName: string, age: number): string {
  return `${fullName}${age}`;
}

/** テストで継承する、プロジェクト内で定義されたクラス。 */
export class BaseModel {
  constructor(public readonly id: string) {}
}
