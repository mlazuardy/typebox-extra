import {
  DefaultErrorFunction,
  ErrorFunctionParameter,
  SetErrorFunction,
  ValueErrorType,
} from "@sinclair/typebox/errors";
import { Kind } from "@sinclair/typebox";
import { getProperty } from "../utils";

interface SetupOptions {
  messages: Record<string, any>;
  defaultLocale?: string;
  fallbackLocale?: string;
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

export class ErrorInstance {
  static isLoad = false;
  private static locale: string = "en";
  private static fallbackLocale: string = "en";
  private static messages: Record<string, any> = {};

  static setLocale(locale: string) {
    this.locale = locale;
  }

  static pathToDot(path: string) {
    return path.replace(/^\//, "").replace(/\//g, ".");
  }

  static getLastPath(path: string) {
    return path.split("/").slice(-1)[0];
  }

  /**
   * Create function to beautify label format
   * possible label value is either snake case or camelCase
   */

  static getLabel(
    path: string,
    labelOptions?: string | Record<string, string>,
    locale = "en",
  ) {
    let label = path;
    if (!labelOptions) {
      label = this.getLastPath(path);
    } else {
      label =
        typeof labelOptions === "string"
          ? labelOptions
          : labelOptions[locale] || this.getLastPath(path);
    }

    return label.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  }

  static parseErrorMessage(message: string, variables?: Record<string, any>) {
    return message.replace(/{{(\w+)}}/g, (match, key) => {
      return variables?.[key] || match;
    });
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
        const label = this.getLabel(
          error.path,
          error.schema.label,
          this.locale,
        );
        const type = ERROR_TYPE_KEYS[error.errorType];

        const variables = {
          ...error.schema,
          label,
        };

        if (error.errorType === ValueErrorType.ObjectRequiredProperty) {
          return this.parseErrorMessage(localeMessage.required, variables);
        }

        if (!type) {
          return this.getFallbackMessage(error);
        }

        const key = this.getErrorKey(error, type);
        return !key
          ? this.getFallbackMessage(error)
          : this.parseErrorMessage(key, variables);
      });

      this.isLoad = true;
    }
  }
}
