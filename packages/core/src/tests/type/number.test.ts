import { describe, expect, test } from "vitest";
import { t } from "../../type-system";
import { Value } from "@sinclair/typebox/value";
import { loadErrorStorage } from "../error-storage-load";

loadErrorStorage();

describe("number", () => {
  const schema = t.Object({
    price: t.Number({ exclusiveMinimum: 0 }),
    age: t.Number({ exclusiveMinimum: 18 }),
    taxRate: t.Number({
      minimum: 0,
      maximum: 100,
      errorMessage: {
        maximum: "{{label}} must be at most {{maximum}}%",
      },
    }),
  });

  const errors = Array.from(
    Value.Errors(schema, { age: 17, price: 0, taxRate: 101 }),
  );

  test("should return default message", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("price must be greater than 0"),
        }),
        expect.objectContaining({
          message: expect.stringContaining("age must be greater than 18"),
        }),
        expect.objectContaining({
          message: expect.stringContaining("tax rate must be at most 100%"),
        }),
      ]),
    );
  });
});
