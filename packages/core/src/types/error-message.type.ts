export type ErrorMessageSchemaOptions = Record<string, string>;

export interface ErrorMessage {
  field: string;
  message: string;
  type: number;
  path: string;
}
