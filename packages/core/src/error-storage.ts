import {
  SetErrorFunction,
  DefaultErrorFunction,
  ValueErrorType,
  ErrorFunctionParameter,
  ValueError,
} from "@sinclair/typebox/errors";

import { getProperty } from "./utils";

interface LoadOptions {
  defaultLocale?: string;
  isClient?: boolean;
  messages: Record<string, any>;
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

  [ValueErrorType.Number]: "invalid",
  [ValueErrorType.NumberMinimum]: "minimum",
  [ValueErrorType.NumberMaximum]: "maximum",
  [ValueErrorType.NumberExclusiveMinimum]: "exclusiveMinimum",
  [ValueErrorType.NumberExclusiveMaximum]: "exclusiveMaximum",

  [ValueErrorType.Boolean]: "invalid",
};

/**
 * Singleton (hopefully) localize custom error instance
 */
export class ErrorStorage {
  static isLoad = false;
  static isClient = false;
  static messages: Record<string, any>;
  // for client side only
  static locale = "en";
  static fallbackLocale = "en";

  static setLocale(locale: string) {
    this.locale = locale;
  }

  static get localeMessage() {
    return this.messages[this.locale] ?? this.messages[this.fallbackLocale];
  }

  static load(options: LoadOptions) {
    this.locale = options.defaultLocale || "en";
    this.fallbackLocale = options.defaultLocale || "en";
    this.isClient = options.isClient || false;
    this.messages = options.messages;
    if (!this.isLoad) {
      SetErrorFunction((error) => {
        return this.formatError(error) || DefaultErrorFunction(error);
      });

      this.isLoad = true;
    }
  }

  static getMessage(error: ErrorFunctionParameter) {
    const { errorKey: key, prefix } = this.getErrorKey(error);
    if (!error.schema.errorMessage) {
      return getProperty(this.localeMessage, key);
    }
    const localKey = !prefix ? key : key.replace(`${prefix}.`, "");
    const inlineMessage = error.schema.errorMessage?.[localKey];

    if (inlineMessage) {
      const message =
        typeof inlineMessage === "string"
          ? inlineMessage
          : inlineMessage[this.locale];

      if (message) {
        return message;
      }
    }

    return getProperty(this.localeMessage, key);
  }

  static formatError(error: ErrorFunctionParameter) {
    const { error: childError } = this.getErrorKey(error);
    const finalError = childError || error;
    const message = this.getMessage(finalError) || this.localeMessage.invalid;

    return this.formatMessage(message, {
      ...finalError.schema,
      label: this.getLabel(finalError.path, finalError.schema.label),
    });
  }

  static format(errors: ValueError[]) {
    return errors.map((error) => ({
      field: error.path.replace(/^\//, "").replace(/\//g, "."),
      message: error.message,
    }));
  }

  static formatMessage(template: string, variables?: Record<string, any>) {
    if (!variables) {
      return template;
    }

    let message = template;

    const keys = Object.keys(variables);

    keys.forEach((key) => {
      message = message.replaceAll(`{{${key}}}`, String(variables[key]));
    });

    return message;
  }

  static getLabel(
    path: string,
    labelOptions?: string | Record<string, string>,
  ) {
    let label = path;
    const labelPath = path.split("/").slice(-1)[0];

    if (typeof labelOptions === "string") {
      label = labelOptions;
    } else {
      label = !labelOptions
        ? labelPath
        : labelOptions[this.locale || this.fallbackLocale] || labelPath;
    }

    return label
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Convert camelCase to spaced
      .replace(/_/g, " ") // Convert snake_case to spaced
      .toLowerCase();
  }

  static getErrorKey(error: ErrorFunctionParameter) {
    let childError: ErrorFunctionParameter | undefined;
    const type = error.errorType;

    if (type === ValueErrorType.ObjectRequiredProperty) {
      return {
        errorKey: "required",
        error: childError,
      };
    }

    let key = ERROR_TYPE_KEYS[type];
    let prefix: string | undefined = undefined;

    if (!key) {
      // when custom key path is not defined, fallback to typebox enum value type with prefix `types`
      key = `types.${type}`;
      prefix = `types`;
      console.log({ key, prefix });
      return { errorKey: key, error: childError, prefix };
    }

    if (error.schema.type) {
      const format =
        error.schema.type === "string" ? error.schema.format : undefined;
      key = !format ? `${error.schema.type}.${key}` : `format.${format}`;
      prefix = !format ? error.schema.type : "format";
    }
    return { errorKey: key, error: childError, prefix };
  }
}
