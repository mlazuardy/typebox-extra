import {
  DefaultErrorFunction,
  ErrorFunctionParameter,
  SetErrorFunction,
  ValueErrorType,
} from "@sinclair/typebox/errors";
import {
  ERROR_TYPE_KEYS,
  getLabel,
  getProperty,
  parseErrorMessage,
} from "../utils";
import { Kind } from "@sinclair/typebox";

interface SetupOptions {
  messages: Record<string, any>;
  defaultLocale?: string;
  fallbackLocale?: string;
}

export class ErrorInstance {
  static isLoad = false;
  private static locale: string = "en";
  private static fallbackLocale: string = "en";
  private static messages: Record<string, any> = {};

  static setLocale(locale: string) {
    this.locale = locale;
  }

  static get localeMessage() {
    return this.messages[this.locale] || this.messages[this.fallbackLocale];
  }

  static reset() {
    SetErrorFunction(DefaultErrorFunction);
  }

  /**
   * Get the fallback message if:
   * - if local message does not exists, check errorMessage schema
   * - if errorMessage schema does not exists return default typebox message
   */
  static getFallbackMessage(error: ErrorFunctionParameter) {
    return DefaultErrorFunction(error);
  }

  private static getErrorKey(error: ErrorFunctionParameter, type: string) {
    if (!error.schema.type) {
      const kind = error.schema[Kind]?.toLowerCase();
      // get every possible error message path
      // can be live within root message, standard, or format
      // the sequence of precedence is root -> standard
      return (
        getProperty(this.localeMessage, kind) ||
        getProperty(this.localeMessage, `standard.${kind}`)
      );
    }

    if (error.schema.type === "string" && error.schema.format) {
      return getProperty(this.localeMessage, `format.${error.schema.format}`);
    }

    return getProperty(this.localeMessage, `${error.schema.type}.${type}`);
  }

  static setup(options: SetupOptions) {
    this.locale = options.defaultLocale || "en";
    this.messages = options.messages;

    if (!this.isLoad) {
      const localeMessage = this.localeMessage;

      if (!localeMessage) {
        throw new Error("Locale message not found");
      }

      SetErrorFunction((error) => {
        const label = getLabel(error.path, error.schema.label, this.locale);
        const type = ERROR_TYPE_KEYS[error.errorType];

        const variables = {
          ...error.schema,
          label,
        };

        if (error.errorType === ValueErrorType.ObjectRequiredProperty) {
          return parseErrorMessage(localeMessage.required, variables);
        }

        if (!type) {
          return this.getFallbackMessage(error);
        }

        const key = this.getErrorKey(error, type);
        return !key
          ? this.getFallbackMessage(error)
          : parseErrorMessage(key, variables);
      });

      this.isLoad = true;
    }
  }
}
