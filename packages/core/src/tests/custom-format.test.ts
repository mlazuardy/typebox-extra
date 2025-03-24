import { describe, expect, it } from "vitest";
import { t } from "../type-system";
import { Value } from "@sinclair/typebox/value";

describe("email-format", () => {
  const validEmail = "b1m0G@example.com";
  const invalidEmail = "invalid-email";

  it("should be valid", () => {
    const result = Value.Check(t.Email(), validEmail);
    expect(result).toBe(true);
  });

  it("should be invalid", () => {
    const result = Value.Check(t.Email(), invalidEmail);
    expect(result).toBe(false);
  });

  // this test not work on validating email without Type.Object
  it("should be valid if optional and value undefined", () => {
    const result = Value.Check(
      t.Object({
        email: t.Optional(t.Email()),
      }),
      { email: undefined },
    );
    expect(result).toBe(true);
  });
});
