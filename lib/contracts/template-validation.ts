import {
  BLOCK_TYPE_VALUES,
  type BlockType,
  type TemplateBlock,
  type TemplateSnapshot,
  type TemplateVariable,
} from "@/lib/contracts/types";

export type SnapshotParseResult =
  | { ok: true; snapshot: TemplateSnapshot }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBlockType(value: unknown): value is BlockType {
  return BLOCK_TYPE_VALUES.includes(value as BlockType);
}

/**
 * Validates an untrusted template snapshot (editor form submission or stored
 * JSON) against `TemplateSnapshot`. Returns a rebuilt snapshot holding only
 * the known fields, or the first problem found.
 */
export function parseTemplateSnapshot(value: unknown): SnapshotParseResult {
  if (!isRecord(value)) {
    return { ok: false, error: "The template content could not be read." };
  }
  if (!Array.isArray(value.blocks)) {
    return { ok: false, error: "The template content blocks are missing." };
  }
  if (!Array.isArray(value.variables)) {
    return { ok: false, error: "The template variables are missing." };
  }

  const blocks: TemplateBlock[] = [];
  for (const [index, raw] of value.blocks.entries()) {
    const position = index + 1;
    if (!isRecord(raw)) {
      return { ok: false, error: `Block ${position} could not be read.` };
    }
    if (!isBlockType(raw.type)) {
      return { ok: false, error: `Block ${position} has an unsupported type.` };
    }
    if (typeof raw.id !== "string" || !raw.id.trim()) {
      return { ok: false, error: `Block ${position} is missing its id.` };
    }
    if (typeof raw.content !== "string") {
      return { ok: false, error: `Block ${position} content must be text.` };
    }
    blocks.push({ id: raw.id, type: raw.type, content: raw.content, order: index });
  }

  const variables: TemplateVariable[] = [];
  const seenKeys = new Set<string>();
  for (const [index, raw] of value.variables.entries()) {
    const position = index + 1;
    if (!isRecord(raw)) {
      return { ok: false, error: `Variable ${position} could not be read.` };
    }
    const key = typeof raw.key === "string" ? raw.key.trim() : "";
    if (!key) {
      return { ok: false, error: `Variable ${position} needs a key.` };
    }
    if (seenKeys.has(key)) {
      return { ok: false, error: `The variable key "${key}" is used more than once.` };
    }
    seenKeys.add(key);
    if (raw.label !== undefined && typeof raw.label !== "string") {
      return { ok: false, error: `Variable "${key}" label must be text.` };
    }
    if (raw.required !== undefined && typeof raw.required !== "boolean") {
      return { ok: false, error: `Variable "${key}" required flag must be true or false.` };
    }
    variables.push({
      key,
      label: typeof raw.label === "string" ? raw.label : "",
      required: raw.required === true,
    });
  }

  return { ok: true, snapshot: { blocks, variables } };
}
