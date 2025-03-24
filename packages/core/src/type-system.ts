import { FormatRegistry, StringOptions, Type } from "@sinclair/typebox";
import { EMAIL_FORMAT, EmailFormat } from "./custom-formats/email-format";
import { ErrorMessageSchemaOptions } from "./types/error-message.type";

const t = Object.assign({}, Type);

const TypeEmail = (options?: StringOptions) =>
  t.String({ ...options, format: EMAIL_FORMAT });

t.Email = TypeEmail;

if (!FormatRegistry.Has(EMAIL_FORMAT)) {
  FormatRegistry.Set(EMAIL_FORMAT, EmailFormat);
}

declare module "@sinclair/typebox" {
  interface JavaScriptTypeBuilder {
    Email: typeof TypeEmail;
  }
  interface SchemaOptions {
    label?: string | Record<string, any>;
    errorMessage?: ErrorMessageSchemaOptions;
  }
}

export { t };
export { TypeCompiler, TypeCheck } from "@sinclair/typebox/compiler";
export { TypeRegistry, FormatRegistry } from "@sinclair/typebox";
