import { describe, expect, test } from "vitest";
import { loadErrorStorage } from "../error-storage-load";
import { t } from "../../type-system";
import { Value } from "@sinclair/typebox/value";

loadErrorStorage();
describe("boolean", () => {
  const schema = t.Boolean();
  const errors = Array.from(Value.Errors(schema, ""));

  test("boolean message", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("must be a boolean"),
        }),
      ]),
    );
  });
});
