import { TSchema } from "@sinclair/typebox";
import { TypeCheck } from "../type-system";
import { Value } from "@sinclair/typebox/value";

/**
 * Parse value into target schema
 * Noted that for now only available for Type.Object as top level schema
 */
export function parseSchemaValue<T extends TSchema>(
  schema: T | TypeCheck<T>,
  value: unknown,
) {
  const finalSchema = schema instanceof TypeCheck ? schema.Schema() : schema;
  const strictSchema = { ...finalSchema, additionalProperties: false };
  return Value.Cast(strictSchema, value);
}
