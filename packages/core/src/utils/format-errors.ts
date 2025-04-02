import { ValueError, ValueErrorType } from "@sinclair/typebox/errors";
import { ErrorMessageSchemaOptions, FormatErrorOptions } from "../types";

interface MessageFieldOptions {
  message: string;
  errorMessage?: ErrorMessageSchemaOptions;
  locale?: string;
  type: ValueErrorType;
}

export const ERROR_TYPE_KEYS = {
  [ValueErrorType.ObjectRequiredProperty]: "required",
  [ValueErrorType.String]: "invalid",
  [ValueErrorType.StringMinLength]: "minLength",
  [ValueErrorType.StringMaxLength]: "maxLength",
  [ValueErrorType.Union]: "invalid",
  [ValueErrorType.Array]: "invalid",
  [ValueErrorType.ArrayMinItems]: "minItems",
  [ValueErrorType.ArrayMaxItems]: "maxItems",
  [ValueErrorType.StringFormat]: "format",
};

export function pathToDot(path: string) {
  return path.replace(/^\//, "").replace(/\//g, ".");
}

function getLastPath(path: string) {
  return path.split("/").slice(-1)[0];
}

/**
 * Create function to beautify label format
 * possible label value is either snake case or camelCase
 */

export function getLabel(
  path: string,
  labelOptions?: string | Record<string, string>,
  locale = "en",
) {
  let label = path;
  if (!labelOptions) {
    label = getLastPath(path);
  } else {
    label =
      typeof labelOptions === "string"
        ? labelOptions
        : labelOptions[locale] || getLastPath(path);
  }

  return label.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

export function parseErrorMessage(
  message: string,
  variables?: Record<string, any>,
) {
  return message.replace(/{{(\w+)}}/g, (match, key) => {
    return variables?.[key] || match;
  });
}

function getMessageField({
  message,
  errorMessage,
  locale = "en",
  type,
}: MessageFieldOptions) {
  if (!errorMessage) {
    return message;
  }

  const messageType = ERROR_TYPE_KEYS[type];
  const messageField = errorMessage[messageType];
  if (!messageField) {
    return message;
  }

  if (typeof messageField === "string") {
    return messageField;
  }

  return messageField[locale] || message;
}

/**
 * Format the errors from ValueError by checking schema.errorMessage
 * noted that this is only worked for inline errorMessage, not worked for messages that imported from locales
 */
export function formatErrors(
  errors: ValueError[],
  options?: FormatErrorOptions,
) {
  const locale = options?.locale || "en";
  return errors.reduce((acc, error) => {
    const pathExist = acc.find((err) => err.path === error.path);

    if (!pathExist) {
      const messageField = getMessageField({
        locale,
        message: error.message,
        errorMessage: error.schema.errorMessage,
        type: error.type,
      });
      const label = getLabel(error.path, error.schema.label, locale);
      acc.push({
        ...error,
        message: parseErrorMessage(messageField, {
          label,
          ...error.schema,
        }),
      });
    }
    return acc;
  }, [] as ValueError[]);
}
