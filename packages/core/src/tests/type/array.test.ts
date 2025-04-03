import { describe, expect, test } from "vitest";
import { loadErrorStorage } from "../error-storage-load";
import { t } from "../../type-system";
import { Value } from "@sinclair/typebox/value";

loadErrorStorage();
describe("array", () => {
  const schema = t.Object({
    tags: t.Array(t.String({ minLength: 1 }), { maxItems: 10 }),
    permissions: t.Array(t.String({ minLength: 1 }), { minItems: 1 }),
  });

  const ELEVEN_TAGS = Array.from({ length: 11 }, () => "tag");

  const errors = Array.from(
    Value.Errors(schema, { tags: ELEVEN_TAGS, permissions: [] }),
  );

  test("array message", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("tags must have at most 10 items"),
        }),
        expect.objectContaining({
          message: expect.stringContaining(
            "permissions must have at least 1 items",
          ),
        }),
      ]),
    );
  });
});
