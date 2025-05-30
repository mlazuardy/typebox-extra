import { ValueError } from "@sinclair/typebox/errors";

export function flattenErrors(errors: ValueError[]) {
  const flattened: ValueError[] = [];
  const seenPaths = new Set();

  function processError(error: ValueError) {
    // Add current error if path is unique
    if (!seenPaths.has(error.path)) {
      seenPaths.add(error.path);
      flattened.push(error);
    }

    // Process child errors if they exist
    if (error.errors && Array.isArray(error.errors)) {
      for (const childErrorIterator of error.errors) {
        for (const childError of childErrorIterator) {
          processError(childError);
        }
      }
    }
  }

  errors.forEach(processError);
  return flattened;
}
