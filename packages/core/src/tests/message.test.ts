import { describe, expect, it } from "vitest";
import { t } from "../type-system";
import { Value } from "@sinclair/typebox/value";
import { formatErrors } from "../utils";

enum Role {
  Admin = "admin",
  User = "user",
}

describe("string", () => {
  it("test string message", () => {
    const schema = t.Object({
      firstName: t.String({
        minLength: 3,
        errorMessage: {
          minLength: "first name must be at least 3 characters long",
        },
      }),
      lastName: t.String({
        minLength: 3,
        maxLength: 5,
        errorMessage: {
          minLength: "last name must be at least 3 characters long",
          maxLength: "last name must be at most 5 characters long",
        },
      }),
    });

    const errors = Value.Errors(schema, {
      firstName: "a",
      lastName: "abcefggasd",
    });
    const parsedErrors = formatErrors(Array.from(errors));
    expect(parsedErrors.length).greaterThan(0);
  });
});

describe("enum", () => {
  it("test enum message", () => {
    const schema = t.Object({
      role: t.Enum(Role, {
        errorMessage: {
          union: "invalid role",
        },
      }),
    });

    const errors = Value.Errors(schema, {
      role: "invalid",
    });
    const parsedErrors = formatErrors(Array.from(errors));
    console.log(parsedErrors);
    expect(parsedErrors.length).greaterThan(0);
  });
});
