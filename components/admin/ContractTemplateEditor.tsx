"use client";

import { useActionState, useState, useCallback } from "react";

import type {
  BlockType,
  SaveDraftState,
  TemplateBlock,
  TemplateSnapshot,
  TemplateVariable,
} from "@/lib/contracts/types";
import {
  BLOCK_TYPE_LABELS,
  BLOCK_TYPE_VALUES,
} from "@/lib/contracts/types";

type SaveDraftAction = (
  prevState: SaveDraftState,
  formData: FormData,
) => Promise<SaveDraftState>;

interface ContractTemplateEditorProps {
  initialSnapshot: TemplateSnapshot;
  action: SaveDraftAction;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Block-based contract template editor. The snapshot (blocks + variables) is
 * serialized to JSON and submitted in a hidden field; the server action
 * persists it to the current draft version.
 */
export function ContractTemplateEditor({
  initialSnapshot,
  action,
}: ContractTemplateEditorProps) {
  const [blocks, setBlocks] = useState<TemplateBlock[]>(
    initialSnapshot.blocks,
  );
  const [variables, setVariables] = useState<TemplateVariable[]>(
    initialSnapshot.variables,
  );
  const [addBlockType, setAddBlockType] = useState<BlockType>("paragraph");

  const [saveState, formAction, isPending] = useActionState(action, {
    status: "idle",
  });

  // --- Block mutations ---

  const addBlock = useCallback(() => {
    setBlocks((prev) => [
      ...prev,
      {
        id: generateId(),
        type: addBlockType,
        content: "",
        order: prev.length,
      },
    ]);
  }, [addBlockType]);

  const removeBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }, []);

  const updateBlockContent = useCallback(
    (blockId: string, content: string) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, content } : b)),
      );
    },
    [],
  );

  const moveBlock = useCallback((index: number, direction: "up" | "down") => {
    setBlocks((prev) => {
      const next = [...prev];
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next.map((b, i) => ({ ...b, order: i }));
    });
  }, []);

  // --- Variable mutations ---

  const addVariable = useCallback(() => {
    setVariables((prev) => [
      ...prev,
      { key: generateId(), label: "", required: false },
    ]);
  }, []);

  const removeVariable = useCallback((key: string) => {
    setVariables((prev) => prev.filter((v) => v.key !== key));
  }, []);

  const updateVariable = useCallback(
    (key: string, patch: Partial<TemplateVariable>) => {
      setVariables((prev) =>
        prev.map((v) => (v.key === key ? { ...v, ...patch } : v)),
      );
    },
    [],
  );

  const snapshot: TemplateSnapshot = {
    blocks: blocks.map((b, i) => ({ ...b, order: i })),
    variables,
  };

  return (
    <form
      className="admin-form"
      action={formAction}
      noValidate
    >
      <input
        type="hidden"
        name="snapshot"
        value={JSON.stringify(snapshot)}
      />

      {saveState.error ? (
        <p className="form-error" role="alert">
          {saveState.error}
        </p>
      ) : null}

      {saveState.status === "idle" && !saveState.error ? (
        <p
          style={{
            color: "var(--success)",
            fontSize: "0.93rem",
            fontWeight: 650,
          }}
          role="status"
        >
          {isPending ? "Saving..." : "Draft saved."}
        </p>
      ) : null}

      {/* Block list */}
      <section className="admin-panel" aria-labelledby="blocks-heading">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2 className="admin-panel__title" id="blocks-heading">
            Content blocks
          </h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              aria-label="Block type to add"
              value={addBlockType}
              onChange={(e) => setAddBlockType(e.target.value as BlockType)}
              style={{ width: "auto" }}
            >
              {BLOCK_TYPE_VALUES.map((type) => (
                <option key={type} value={type}>
                  {BLOCK_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="button button--secondary button--compact"
              onClick={addBlock}
            >
              Add block
            </button>
          </div>
        </div>

        {blocks.length === 0 ? (
          <p className="admin-empty__note">
            No blocks yet. Select a type above and click "Add block".
          </p>
        ) : (
          <ol
            style={{
              display: "grid",
              gap: "12px",
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {blocks.map((block, index) => (
              <li
                key={block.id}
                style={{
                  display: "grid",
                  gap: "8px",
                  border: "1px solid var(--border)",
                  padding: "16px",
                  background: "var(--surface)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {BLOCK_TYPE_LABELS[block.type]}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      className="button button--secondary button--compact"
                      onClick={() => moveBlock(index, "up")}
                      disabled={index === 0}
                      aria-label="Move block up"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="button button--secondary button--compact"
                      onClick={() => moveBlock(index, "down")}
                      disabled={index === blocks.length - 1}
                      aria-label="Move block down"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="link-button--danger"
                      onClick={() => removeBlock(block.id)}
                      aria-label={`Remove ${BLOCK_TYPE_LABELS[block.type]} block`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <textarea
                  aria-label={`${BLOCK_TYPE_LABELS[block.type]} content`}
                  rows={block.type === "heading" ? 1 : 4}
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  placeholder={
                    block.type === "variable"
                      ? "Variable key (e.g. {{clientName}})"
                      : `${BLOCK_TYPE_LABELS[block.type]} content`
                  }
                />
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Variables */}
      <section className="admin-panel" aria-labelledby="variables-heading">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2 className="admin-panel__title" id="variables-heading">
            Template variables
          </h2>
          <button
            type="button"
            className="button button--secondary button--compact"
            onClick={addVariable}
          >
            Add variable
          </button>
        </div>

        {variables.length === 0 ? (
          <p className="admin-empty__note">
            No custom variables. Add variables that contract generators will
            fill in per contract.
          </p>
        ) : (
          <div
            style={{ display: "grid", gap: "10px" }}
            role="list"
            aria-label="Template variables"
          >
            {variables.map((variable) => (
              <div
                key={variable.key}
                role="listitem"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto auto",
                  gap: "10px",
                  alignItems: "center",
                  border: "1px solid var(--border)",
                  padding: "12px 14px",
                  background: "var(--surface)",
                }}
              >
                <div className="field">
                  <label
                    htmlFor={`var-key-${variable.key}`}
                    style={{ fontSize: "0.83rem" }}
                  >
                    Key
                  </label>
                  <input
                    id={`var-key-${variable.key}`}
                    type="text"
                    value={variable.key}
                    onChange={(e) =>
                      updateVariable(variable.key, { key: e.target.value })
                    }
                    placeholder="variableKey"
                  />
                </div>
                <div className="field">
                  <label
                    htmlFor={`var-label-${variable.key}`}
                    style={{ fontSize: "0.83rem" }}
                  >
                    Label
                  </label>
                  <input
                    id={`var-label-${variable.key}`}
                    type="text"
                    value={variable.label}
                    onChange={(e) =>
                      updateVariable(variable.key, { label: e.target.value })
                    }
                    placeholder="Human-readable label"
                  />
                </div>
                <label
                  className="checkbox-field"
                  style={{ marginTop: "20px" }}
                >
                  <input
                    type="checkbox"
                    checked={variable.required}
                    onChange={(e) =>
                      updateVariable(variable.key, {
                        required: e.target.checked,
                      })
                    }
                  />
                  Required
                </label>
                <button
                  type="button"
                  className="link-button--danger"
                  style={{ marginTop: "20px" }}
                  onClick={() => removeVariable(variable.key)}
                  aria-label={`Remove variable ${variable.label || variable.key}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="button-row">
        <button
          className="button button--primary"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving" : "Save draft"}
        </button>
      </div>
    </form>
  );
}
