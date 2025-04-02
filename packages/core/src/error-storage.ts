import {
  SetErrorFunction,
  DefaultErrorFunction,
  ValueErrorType,
  ErrorFunctionParameter,
} from "@sinclair/typebox/errors";

import { getProperty } from "./utils";

interface LoadOptions {
  defaultLocale?: string;
  isClient?: boolean;
  messages: Record<string, any>;
}

interface ErrorKeyReturn {
  errorKey: string;
  error?: ErrorFunctionParameter;
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

  static getMessage(error: ErrorFunctionParameter, key: string) {
    if (!error.schema.errorMessage) {
      return getProperty(this.localeMessage, key);
    }
    const localKey = !error.schema.type
      ? key
      : key.replace(`${error.schema.type}.`, "");
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
    const { errorKey, error: childError } = this.getErrorKey(error);
    const finalError = childError || error;
    const message =
      this.getMessage(finalError, errorKey) || this.localeMessage.invalid;

    return this.formatMessage(message, {
      ...finalError.schema,
      label: this.getLabel(finalError.path, finalError.schema.label),
    });
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

  static getErrorKey(error: ErrorFunctionParameter): ErrorKeyReturn {
    let childError: ErrorFunctionParameter | undefined;
    const type = error.errorType;

    if (type === ValueErrorType.ObjectRequiredProperty) {
      return {
        errorKey: "required",
        error: childError,
      };
    }

    let key = ERROR_TYPE_KEYS[type];

    if (error.schema.type) {
      key = `${error.schema.type}.${key}`;
    }
    return { errorKey: key, error: childError };
  }
}
