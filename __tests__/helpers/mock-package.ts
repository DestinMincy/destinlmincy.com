import { createRequire } from "node:module";
import path from "node:path";
import { mock } from "node:test";

const requireFromRoot = createRequire(path.join(process.cwd(), "package.json"));

/**
 * Replaces a third-party package with a stub for the duration of a test file.
 *
 * `mock.module("some-package", ...)` is not enough here: tsx resolves bare
 * specifiers inside the `.ts` modules under test down to a concrete dist file,
 * which never matches a registry entry keyed on the bare specifier. Registering
 * the resolved entry points instead is what makes the stub visible to the code
 * being tested. Both the CommonJS and the ESM entry are registered, because the
 * condition that wins depends on how the importing module was loaded.
 */
export function mockPackage(
  specifier: string,
  namedExports: Record<string, unknown>,
): void {
  const entries = new Set<string>([specifier]);

  let cjsEntry: string | undefined;
  try {
    cjsEntry = requireFromRoot.resolve(specifier);
  } catch {
    cjsEntry = undefined;
  }

  if (cjsEntry) {
    entries.add(cjsEntry);
    if (cjsEntry.includes(`${path.sep}cjs${path.sep}`)) {
      entries.add(cjsEntry.replace(`${path.sep}cjs${path.sep}`, `${path.sep}esm${path.sep}`));
    }
  }

  for (const entry of entries) {
    try {
      mock.module(entry, { namedExports });
    } catch (error) {
      // Several of these specifiers normalise to the same registry key (the
      // bare specifier resolves to the ESM entry, for instance). Every entry
      // is registered with the same stub, so a collision is a no-op.
      if ((error as NodeJS.ErrnoException)?.code !== "ERR_INVALID_STATE") {
        throw error;
      }
    }
  }
}

/**
 * `server-only` throws the moment it is imported outside a React Server
 * Component. Several Next/Clerk server entries pull it in, so every test that
 * touches them has to neutralise it first.
 */
export function neutraliseServerOnly(): void {
  mock.module("server-only", { namedExports: {} });
}
