import {
  FormatRegistry,
  StringOptions,
  TSchema,
  Type,
} from "@sinclair/typebox";
import { EMAIL_FORMAT, EmailFormat } from "./custom-formats/email-format";
import { ErrorMessageSchemaOptions } from "./types/error-message.type";
import { TypeNullable } from "./custom-types";

const t = Object.assign({}, Type);

const TypeEmail = (options?: StringOptions) =>
  t.String({ ...options, format: EMAIL_FORMAT });

const TypeOptionalNullable = <T extends TSchema>(schema: T) =>
  t.Optional(TypeNullable(schema));

t.Email = TypeEmail;
t.OptionalNullable = TypeOptionalNullable;

if (!FormatRegistry.Has(EMAIL_FORMAT)) {
  FormatRegistry.Set(EMAIL_FORMAT, EmailFormat);
}

declare module "@sinclair/typebox" {
  interface JavaScriptTypeBuilder {
    Email: typeof TypeEmail;
    OptionalNullable: typeof TypeOptionalNullable;
  }
  interface SchemaOptions {
    label?: string | Record<string, string>;
    errorMessage?: ErrorMessageSchemaOptions;
  }
}

export { t };
export { TypeCompiler, TypeCheck } from "@sinclair/typebox/compiler";
export { TypeRegistry, FormatRegistry } from "@sinclair/typebox";
