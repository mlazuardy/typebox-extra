import { describe, expect, it } from "vitest";
import { t } from "../type-system";
import { Value } from "@sinclair/typebox/value";
import { formatErrors } from "../utils";
import en from "../locales/en.json";
import id from "../locales/id.json";
import { ErrorInstance } from "../errors";

enum Role {
  User = "user",
  Admin = "admin",
}

describe("message without setup", () => {
  const schema = t.Object({
    firstName: t.String({
      minLength: 3,
    }),
    email: t.Email(),
    lastName: t.String({
      minLength: 3,
      maxLength: 5,
      errorMessage: {
        minLength: {
          en: "{{label}} must be {{minLength}}.",
        },
        maxLength: {
          en: "{{label}} must be at most {{maxLength}}.",
        },
      },
    }),
    companyName: t.String({
      minLength: 3,
      errorMessage: {
        required: "{{label}} is required.",
        invalid: "{{label}} must be a string.",
      },
    }),
    role: t.Enum(Role),
  });

  it("test message", () => {
    const errors = Array.from(
      Value.Errors(schema, {
        firstName: "a",
        lastName: "abcefggasd",
        email: "",
      }),
    );

    const formattedErrors = formatErrors(errors);
    expect(formattedErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("must be at most"),
        }),
        expect.objectContaining({
          message: expect.stringContaining("is required"),
        }),
      ]),
    );
  });
});

describe("message with setup", () => {
  ErrorInstance.setup({
    messages: { en, id },
    defaultLocale: "en",
  });

  const schema = t.Object({
    name: t.String({ minLength: 3, maxLength: 60 }),
    email: t.Email(),
    companyName: t.String({
      minLength: 3,
      label: {
        id: "nama perusahaan",
      },
    }),
    role: t.Enum(Role),
    tags: t.Array(t.String({ minLength: 1 }), { minItems: 1 }),
  });

  it("should return formatted messages from locales", () => {
    const errors = Array.from(
      Value.Errors(schema, {
        name: "",
        email: "",
        // tags: [],
      }),
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("required"),
        }),
      ]),
    );
  });

  it("should return formatted messages from other locales", () => {
    ErrorInstance.setLocale("id");
    const errors = Array.from(
      Value.Errors(schema, {
        name: "",
        email: "",
        // tags: [],
      }),
    );

    console.log(
      errors.map((error) => ({
        message: error.message,
      })),
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("harus diisi"),
        }),
        // expect.objectContaining({
        //   message: expect.stringContaining("nama perusahaan"),
        // }),
      ]),
    );
  });
});
