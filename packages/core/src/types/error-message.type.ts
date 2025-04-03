export type ErrorMessageTypeOptions = string | Record<string, string>;
export type ErrorMessageSchemaOptions = Record<string, ErrorMessageTypeOptions>;

export interface FormatErrorOptions {
  locale?: string;
}
