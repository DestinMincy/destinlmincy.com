import assert from "node:assert/strict";
import test from "node:test";

import { parseTemplateSnapshot } from "@/lib/contracts/template-validation";

test("accepts each of the five block types and rebuilds known fields only", () => {
  const result = parseTemplateSnapshot({
    blocks: ["heading", "paragraph", "clause", "variable", "signature"].map(
      (type, index) => ({ id: `b${index}`, type, content: type, order: 9, extra: "dropped" }),
    ),
    variables: [{ key: " projectName ", label: "Project", required: true, extra: 1 }],
    extra: "dropped",
  });

  assert.ok(result.ok);
  assert.deepEqual(
    result.snapshot.blocks.map(({ type, order }) => [type, order]),
    [
      ["heading", 0],
      ["paragraph", 1],
      ["clause", 2],
      ["variable", 3],
      ["signature", 4],
    ],
  );
  assert.ok(!("extra" in result.snapshot.blocks[0]!));
  assert.deepEqual(result.snapshot.variables, [
    { key: "projectName", label: "Project", required: true },
  ]);
});

test("rejects input that is not a snapshot object", () => {
  for (const value of [null, "snapshot", [], 42]) {
    assert.equal(parseTemplateSnapshot(value).ok, false);
  }
});

test("rejects a block without string content or an id", () => {
  assert.equal(
    parseTemplateSnapshot({
      blocks: [{ id: "b1", type: "paragraph", content: 5 }],
      variables: [],
    }).ok,
    false,
  );
  assert.equal(
    parseTemplateSnapshot({
      blocks: [{ type: "paragraph", content: "x" }],
      variables: [],
    }).ok,
    false,
  );
});

test("treats keys that differ only by surrounding spaces as duplicates", () => {
  const result = parseTemplateSnapshot({
    blocks: [],
    variables: [
      { key: "po", label: "PO", required: false },
      { key: " po", label: "PO again", required: false },
    ],
  });

  assert.equal(result.ok, false);
});

test("rejects a non-boolean required flag", () => {
  const result = parseTemplateSnapshot({
    blocks: [],
    variables: [{ key: "po", label: "PO", required: "yes" }],
  });

  assert.equal(result.ok, false);
});
