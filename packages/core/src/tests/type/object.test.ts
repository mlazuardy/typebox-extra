import { describe, expect, test } from "vitest";
import { loadErrorStorage } from "../error-storage-load";
import { t } from "../../type-system";
import { Value } from "@sinclair/typebox/value";

loadErrorStorage();

describe("object", () => {
  const schema = t.Object({
    address: t.Object({
      address1: t.String({ minLength: 3 }),
      coordinates: t.Object({
        latitude: t.Number({
          minimum: -90,
          maximum: 90,
        }),
        longitude: t.Number({
          minimum: -180,
          maximum: 180,
        }),
      }),
    }),
  });

  const errors = Array.from(
    Value.Errors(schema, {
      address: { address1: "a", coordinates: { latitude: 100 } },
    }),
  );

  test("object message", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            "address1 must be at least 3 characters",
          ),
        }),
        expect.objectContaining({
          message: expect.stringContaining("latitude must be at most 90"),
        }),
      ]),
    );
  });
});
