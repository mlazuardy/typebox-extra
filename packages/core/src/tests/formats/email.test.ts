import { Value } from "@sinclair/typebox/value";
import { describe, expect, it } from "vitest";
import { t } from "../../type-system";
import { loadErrorStorage } from "../error-storage-load";

loadErrorStorage();

describe("email format", () => {
  it("should return default message", () => {
    const errors = Array.from(
      Value.Errors(
        t.Email({
          errorMessage: {
            email: "invalid email",
          },
        }),
        "",
      ),
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("invalid email"),
        }),
      ]),
    );
  });
});
