import { Value } from "@sinclair/typebox/value";
import { afterAll, describe, expect, it } from "vitest";
import { t } from "../../type-system";
import { loadErrorStorage } from "../error-storage-load";
import { ErrorStorage } from "../../error-storage";

loadErrorStorage();

describe("string default locale", () => {
  const schema = t.Object({
    firstName: t.String({
      minLength: 3,
      errorMessage: {
        required: "{label} cannot be empty",
      },
    }),
    lastName: t.String({
      minLength: 3,
      label: {
        id: "nama belakang",
      },
    }),
    company: t.String({
      minLength: 3,
      label: {
        en: "Organization",
      },
    }),
  });

  const errors = Array.from(Value.Errors(schema, {}));

  it("errorMessage should take precedence", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("cannot be empty"),
        }),
      ]),
    );
  });

  it("non-defined error type inside errorMessage should fallback to default localization message", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("must be a string"),
        }),
      ]),
    );
  });

  it("label should be used", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("organization"),
        }),
      ]),
    );
  });

  it("mismatch locale label should use schema path", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("last name"),
        }),
      ]),
    );
  });
});

describe("string set locale", () => {
  ErrorStorage.setLocale("id");
  const schema = t.Object({
    firstName: t.String({
      minLength: 3,
      label: {
        id: "nama depan",
      },
      errorMessage: {
        invalid: {
          id: "nama depan tidak valid",
        },
      },
    }),
    lastName: t.String({
      minLength: 3,
      label: {
        id: "nama belakang",
      },
      errorMessage: {
        invalid: {
          en: "last name is invalid",
        },
      },
    }),
  });

  const errors = Array.from(Value.Errors(schema, {}));

  it("label should be used", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("nama"),
        }),
      ]),
    );
  });

  it("inline localize message should be used", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("nama depan tidak valid"),
        }),
      ]),
    );
  });

  it("invalid inline localize message should fallback to locale message", () => {
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("nama belakang harus berupa string"),
        }),
      ]),
    );
  });

  afterAll(() => ErrorStorage.setLocale("en"));
});
