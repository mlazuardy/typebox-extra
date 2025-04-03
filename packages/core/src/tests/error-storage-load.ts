import { ErrorStorage } from "../error-storage";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

export function loadErrorStorage() {
  ErrorStorage.load({
    messages: { en, id },
    defaultLocale: "en",
  });
}
