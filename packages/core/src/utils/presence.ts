import { TSchema } from "@sinclair/typebox";

export function isTypeNullable(schema: TSchema) {
  const anyOf = (schema.anyOf as any[]) || [];
  return anyOf.some((value) => value.type === "null");
}
