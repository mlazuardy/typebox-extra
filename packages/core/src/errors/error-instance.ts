import {
  DefaultErrorFunction,
  ErrorFunctionParameter,
  SetErrorFunction,
  ValueErrorType,
} from "@sinclair/typebox/errors";
import {
  ERROR_TYPE_KEYS,
  getFieldPath,
  getLabel,
  getProperty,
  parseErrorMessage,
} from "../utils";
import { Kind } from "@sinclair/typebox";

interface SetupOptions {
  messages: Record<string, any>;
  defaultLocale?: string;
}

export class ErrorInstance {
  static isLoad = false;
  private static locale: string = "en";
  static messages: Record<string, any> = {};

  static setLocale(locale: string) {
    this.locale = locale;
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
    const localeMessage = this.messages[this.locale];

    if (!error.schema.type) {
      const kind = error.schema[Kind]?.toLowerCase();
      // get every possible error message path
      // can be live within root message, standard, or format
      // the sequence of precedence is root -> standard
      return (
        getProperty(localeMessage, kind) ||
        getProperty(localeMessage, `standard.${kind}`)
      );
    }

    if (error.schema.type === "string" && error.schema.format) {
      return getProperty(localeMessage, `format.${error.schema.format}`);
    }

    return getProperty(localeMessage, `${error.schema.type}.${type}`);
  }

  static setup(options: SetupOptions) {
    this.locale = options.defaultLocale || "en";
    this.messages = options.messages;

    if (!this.isLoad) {
      SetErrorFunction((error) => {
        const label = getLabel(
          error.schema.label || getFieldPath(error.path),
          getFieldPath(error.path),
          this.locale,
        );

        const localeMessage = this.messages[this.locale];
        const variables = {
          label,
          ...error.schema,
        };
        if (!localeMessage) {
          return this.getFallbackMessage(error);
        }

        if (error.errorType === ValueErrorType.ObjectRequiredProperty) {
          return parseErrorMessage(localeMessage.required, variables);
        }

        const type = ERROR_TYPE_KEYS[error.errorType];

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
