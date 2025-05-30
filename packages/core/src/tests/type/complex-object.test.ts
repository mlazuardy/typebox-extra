import { describe, expect, test } from "vitest";
import { loadErrorStorage } from "../error-storage-load";
import { t } from "../../type-system";
import { Value } from "@sinclair/typebox/value";
import { flattenErrors } from "../../utils";

loadErrorStorage();

describe("complex object", () => {
  const schema = t.Object({
    name: t.String({ minLength: 1 }),
    ownership: t.OptionalNullable(
      t.Object({
        price: t.Number({ exclusiveMinimum: 0 }),
        features: t.Array(t.String({ minLength: 1, label: "feature" })),
      }),
    ),
  });

  const errors = [
    ...Value.Errors(schema, {
      name: "Michael Lazuardy",
      ownership: {
        price: 1,
        features: ["test"],
      },
    }),
  ];

  const flattenedErrors = flattenErrors(errors);

  test("should return correct complex object messages", () => {
    expect(flattenedErrors.length).toBe(0);
  });
});
