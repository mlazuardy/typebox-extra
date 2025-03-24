import { ValueError, ValueErrorType } from "@sinclair/typebox/errors";
import { ErrorMessage } from "../types";

const ERROR_TYPE_KEYS = {
  [ValueErrorType.StringMinLength]: "minLength",
  [ValueErrorType.StringMaxLength]: "maxLength",
  [ValueErrorType.Union]: "union",
};

export function formatErrorMessage(error: ValueError) {
  const messageKey = ERROR_TYPE_KEYS[error.type];
  if (!messageKey || !error.schema.errorMessage) {
    return error.message;
  }

  const message = error.schema.errorMessage[messageKey];

  return message || error.message;
}

export function formatErrors(errors: ValueError[]) {
  return errors.reduce((acc, error) => {
    const field = error.path.replace(/^\//, "").replace(/\//g, ".");
    const pathExist = acc.find((err) => err.field === field);

    if (!pathExist) {
      const message = formatErrorMessage(error);
      acc.push({
        field,
        path: error.path,
        message,
        type: error.type,
      });
    }
    return acc;
  }, [] as ErrorMessage[]);
}
