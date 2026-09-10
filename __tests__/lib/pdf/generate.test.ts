import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import { mockPackage } from "@/__tests__/helpers/mock-package";

/**
 * `@react-pdf/renderer` is replaced wholesale: `renderToBuffer` is the boundary
 * `generateContractPdf` is asserted against, and the primitives (`Document`,
 * `Page`, `Text`, `View`) are swapped for plain host tags so the element tree
 * `ContractPdf` builds can be walked without a real PDF ever being produced.
 * `StyleSheet.create` has to stay callable because `contract-pdf.tsx` invokes it
 * at module scope.
 */
const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"

const renderToBuffer = mock.fn<(element: unknown) => Promise<Uint8Array>>(
  async () => PDF_BYTES,
);

mockPackage("@react-pdf/renderer", {
  renderToBuffer,
  Document: "Document",
  Page: "Page",
  Text: "Text",
  View: "View",
  StyleSheet: { create: (styles: unknown) => styles },
  Font: { register: () => undefined },
});

type Generate = typeof import("@/lib/pdf/generate");
type Snapshot = Parameters<Generate["generateContractPdf"]>[0]["snapshot"];

let generateContractPdf: Generate["generateContractPdf"];

before(async () => {
  ({ generateContractPdf } = await import("@/lib/pdf/generate"));
});

beforeEach(() => {
  renderToBuffer.mock.resetCalls();
  renderToBuffer.mock.mockImplementation(async () => PDF_BYTES);
});

// ── Element-tree helpers ─────────────────────────────────────────────────────

interface StubElement {
  type: unknown;
  props: Record<string, unknown> & { children?: unknown };
}

function isElement(node: unknown): node is StubElement {
  return typeof node === "object" && node !== null && "props" in node;
}

/** The `<ContractPdf />` element `generateContractPdf` handed to the renderer. */
function renderedElement(): StubElement {
  const call = renderToBuffer.mock.calls[0];
  assert.ok(call, "expected the contract to be handed to renderToBuffer");
  const element = call.arguments[0];
  assert.ok(isElement(element), "expected a React element");
  return element;
}

/** Invokes `ContractPdf` so the document it builds can be inspected. */
function documentTree(): unknown {
  const element = renderedElement();
  const component = element.type as (props: unknown) => unknown;
  assert.equal(typeof component, "function");
  return component(element.props);
}

function walk(node: unknown, visit: (element: StubElement) => void): void {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (!isElement(node)) return;
  visit(node);
  walk(node.props.children, visit);
}

function elementsOfType(root: unknown, type: string): StubElement[] {
  const found: StubElement[] = [];
  walk(root, (element) => {
    if (element.type === type) found.push(element);
  });
  return found;
}

/** Every literal string rendered inside a `<Text>` in the document. */
function textContent(root: unknown): string[] {
  return elementsOfType(root, "Text").flatMap((element) => {
    const children = element.props.children;
    const parts = Array.isArray(children) ? children : [children];
    return parts.filter((part): part is string => typeof part === "string");
  });
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

function snapshot(blocks: Snapshot["blocks"]): Snapshot {
  return { blocks, variables: [] };
}

function options(overrides: Partial<Parameters<Generate["generateContractPdf"]>[0]> = {}) {
  return {
    templateName: "Design Retainer",
    snapshot: snapshot([
      { id: "b1", type: "heading" as const, content: "Agreement", order: 0 },
    ]),
    fieldValues: {},
    signerEmail: "dana@example.com",
    ...overrides,
  };
}

// ── Rendering ────────────────────────────────────────────────────────────────

test("generateContractPdf renders the contract exactly once through the PDF renderer", async () => {
  await generateContractPdf(options());

  assert.equal(renderToBuffer.mock.callCount(), 1);
});

test("generateContractPdf returns a Node Buffer carrying the rendered bytes", async () => {
  const result = await generateContractPdf(options());

  assert.ok(
    Buffer.isBuffer(result),
    "callers write this straight to S3/DocuSign, so it has to be a Buffer",
  );
  assert.deepEqual(Uint8Array.from(result), PDF_BYTES);
});

test("generateContractPdf converts a plain Uint8Array result into a Buffer", async () => {
  const bytes = new Uint8Array([1, 2, 3, 4, 5]);
  renderToBuffer.mock.mockImplementation(async () => bytes);

  const result = await generateContractPdf(options());

  assert.ok(Buffer.isBuffer(result));
  assert.deepEqual(Uint8Array.from(result), bytes);
});

test("generateContractPdf surfaces renderer failures to the caller", async () => {
  renderToBuffer.mock.mockImplementation(async () => {
    throw new Error("font missing");
  });

  await assert.rejects(() => generateContractPdf(options()), /font missing/);
});

// ── Props handed to the document ─────────────────────────────────────────────

test("generateContractPdf passes the template, snapshot, values and signer through", async () => {
  const input = options({
    templateName: "Retainer v3",
    fieldValues: { clientName: "Acme" },
    signerEmail: "signer@acme.test",
  });

  await generateContractPdf(input);

  const { props } = renderedElement();
  assert.equal(props.templateName, "Retainer v3");
  assert.deepEqual(props.snapshot, input.snapshot);
  assert.deepEqual(props.fieldValues, { clientName: "Acme" });
  assert.equal(props.signerEmail, "signer@acme.test");
});

test("generateContractPdf stamps a human-readable generation date", async () => {
  const expected = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await generateContractPdf(options());

  assert.equal(renderedElement().props.generatedAt, expected);
});

test("generateContractPdf titles the document and addresses it to the signer", async () => {
  await generateContractPdf(
    options({ templateName: "Retainer v3", signerEmail: "signer@acme.test" }),
  );

  const [doc] = elementsOfType(documentTree(), "Document");
  assert.ok(doc, "expected a Document root");
  assert.equal(doc.props.title, "Retainer v3");
  assert.equal(doc.props.subject, "Contract for signer@acme.test");
});

// ── Variable substitution ────────────────────────────────────────────────────

test("generateContractPdf substitutes {{variables}} in headings, paragraphs and clauses", async () => {
  await generateContractPdf(
    options({
      snapshot: snapshot([
        { id: "b1", type: "heading", content: "Agreement for {{clientName}}", order: 0 },
        { id: "b2", type: "paragraph", content: "Fee of {{fee}} is due on signing.", order: 1 },
        { id: "b3", type: "clause", content: "Governed by {{state}} law.", order: 2 },
      ]),
      fieldValues: { clientName: "Acme Co", fee: "$5,000", state: "Illinois" },
    }),
  );

  const text = textContent(documentTree());
  assert.ok(text.includes("Agreement for Acme Co"));
  assert.ok(text.includes("Fee of $5,000 is due on signing."));
  assert.ok(text.includes("Governed by Illinois law."));
});

test("generateContractPdf brackets variables that have no field value", async () => {
  await generateContractPdf(
    options({
      snapshot: snapshot([
        { id: "b1", type: "paragraph", content: "Due {{dueDate}} to {{clientName}}.", order: 0 },
      ]),
      fieldValues: { clientName: "Acme Co" },
    }),
  );

  assert.ok(
    textContent(documentTree()).includes("Due [dueDate] to Acme Co."),
    "an unfilled variable must stay visible rather than render blank",
  );
});

test("generateContractPdf resolves standalone variable blocks by key", async () => {
  await generateContractPdf(
    options({
      snapshot: snapshot([
        { id: "b1", type: "variable", content: "clientName", order: 0 },
        { id: "b2", type: "variable", content: "projectCode", order: 1 },
      ]),
      fieldValues: { clientName: "Acme Co" },
    }),
  );

  const text = textContent(documentTree());
  assert.ok(text.includes("Acme Co"));
  assert.ok(text.includes("[projectCode]"));
});

test("generateContractPdf renders every block in the snapshot", async () => {
  await generateContractPdf(
    options({
      snapshot: snapshot([
        { id: "b1", type: "heading", content: "One", order: 0 },
        { id: "b2", type: "paragraph", content: "Two", order: 1 },
        { id: "b3", type: "signature", content: "Signed by the client", order: 2 },
      ]),
    }),
  );

  const text = textContent(documentTree());
  assert.ok(text.includes("One"));
  assert.ok(text.includes("Two"));
  assert.ok(text.includes("Signed by the client"));
  assert.ok(
    text.includes("Client signature"),
    "signature blocks must render a signing line",
  );
});

test("generateContractPdf ignores unknown block types instead of throwing", async () => {
  const unknownBlock = {
    id: "b2",
    type: "carousel",
    content: "should not render",
    order: 1,
  } as unknown as Snapshot["blocks"][number];

  await generateContractPdf(
    options({
      snapshot: snapshot([
        { id: "b1", type: "heading", content: "Kept", order: 0 },
        unknownBlock,
      ]),
    }),
  );

  const text = textContent(documentTree());
  assert.ok(text.includes("Kept"));
  assert.ok(!text.includes("should not render"));
});
