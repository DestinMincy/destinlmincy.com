import { mock } from "node:test";

/** The query object a Prisma model method is called with. */
export type QueryArgs = Record<string, Record<string, unknown>>;

export type PrismaOpMock = ReturnType<typeof prismaOp>;

/**
 * A stand-in for a single Prisma model method (`findMany`, `create`, ...).
 *
 * `mock.fn()` on its own infers `() => undefined`, which makes every
 * `mockImplementation(async () => ...)` a type error, so the signature is
 * pinned here once instead of at each call site.
 */
export function prismaOp() {
  return mock.fn<(args?: unknown) => Promise<unknown>>(async () => undefined);
}

/** Builds a mocked Prisma model from a list of method names. */
export function prismaModel<Name extends string>(
  ...names: Name[]
): Record<Name, PrismaOpMock> {
  return Object.fromEntries(names.map((name) => [name, prismaOp()])) as Record<
    Name,
    PrismaOpMock
  >;
}

/** Clears call history and implementations across a set of mocked models. */
export function resetModels(...models: Record<string, PrismaOpMock>[]): void {
  for (const model of models) {
    for (const op of Object.values(model)) {
      op.mock.resetCalls();
      op.mock.mockImplementation(async () => undefined);
    }
  }
}

/** The query args a mocked Prisma method received on the given call. */
export function argsOf(op: PrismaOpMock, call = 0): QueryArgs {
  const invocation = op.mock.calls[call];
  if (!invocation) {
    throw new Error(`Expected the mock to have been called at least ${call + 1} time(s)`);
  }
  return (invocation.arguments[0] ?? {}) as QueryArgs;
}
