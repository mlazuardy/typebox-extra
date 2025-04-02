import { Value } from "@sinclair/typebox/value";
import { describe, expect, test } from "vitest";
import { t } from "../../type-system";
import { ErrorStorage } from "../../error-storage";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

describe("string", () => {
  test("should be custom message", () => {
    ErrorStorage.setup({
      messages: { en, id },
      defaultLocale: "en",
    });

    const schema = t.Object({
      name: t.String({ minLength: 1 }),
    });

    const errors = Array.from(Value.Errors(schema, { name: "" }));

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("must be at least"),
        }),
      ]),
    );
  });

  test("should return errorMessage", () => {
    const schema = t.Object({
      name: t.String({
        minLength: 1,
        errorMessage: {
          required: "{{label}} cannot be empty",
        },
      }),
    });

    const errors = Array.from(Value.Errors(schema, { name: "" }));
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "cannot be empty",
        }),
      ]),
    );
  });
});
