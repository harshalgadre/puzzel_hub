"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Group, PuzzleConfig } from "@/lib/types";

type Toast = { type: "success" | "error"; message: string } | null;

export default function AdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [finalMessage, setFinalMessage] = useState("");
  const [unlocks, setUnlocks] = useState<boolean[]>([]);
  const [toast, setToast] = useState<Toast>(null);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  const showToast = (next: Toast) => {
    setToast(next);
    if (next) {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const loadAll = useCallback(async () => {
    const res = await fetch("/api/state", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load");
    const data = await res.json();
    setGroups(data.config.groups);
    setFinalMessage(data.config.finalMessage);
    setUnlocks(data.unlocks);
  }, []);

  const syncUnlocks = useCallback(async () => {
    const res = await fetch("/api/state", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setUnlocks(data.unlocks);
  }, []);

  useEffect(() => {
    loadAll()
      .then(() => setReady(true))
      .catch(() => showToast({ type: "error", message: "Could not load admin data" }));

    const interval = setInterval(() => {
      syncUnlocks().catch(() => {});
    }, 2000);

    return () => clearInterval(interval);
  }, [loadAll, syncUnlocks]);

  function updateGroup(index: number, field: keyof Group, value: string) {
    setGroups((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function saveConfig() {
    setSaving(true);
    try {
      const config: PuzzleConfig = { groups, finalMessage };
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }

      setGroups(data.config.groups);
      setFinalMessage(data.config.finalMessage);
      setUnlocks(data.unlocks);
      showToast({ type: "success", message: "Config saved · synced to all players" });
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  }

  async function resetProgress() {
    if (!confirm("Reset all unlock progress? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Reset failed");

      setUnlocks(data.unlocks);
      showToast({ type: "success", message: "All groups locked again" });
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "Reset failed",
      });
    }
  }

  function addGroup() {
    setGroups((prev) => [
      ...prev,
      {
        name: `Group ${prev.length + 1}`,
        code: "0000",
        word: "WORD",
      },
    ]);
    setUnlocks((prev) => [...prev, false]);
  }

  function removeGroup(index: number) {
    if (groups.length <= 1) return;
    setGroups((prev) => prev.filter((_, i) => i !== index));
    setUnlocks((prev) => prev.filter((_, i) => i !== index));
  }

  if (!ready) {
    return (
      <div className="admin-wrap">
        <div className="admin-header">
          <div className="admin-title">🔒 Admin Panel</div>
          <div className="admin-subtitle">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <div className="admin-title">🔒 Admin Panel</div>
        <div className="admin-subtitle">
          Configure groups · codes · words · final message
        </div>
        <div style={{ marginTop: 10 }}>
          <span className="live-badge">
            <span className="live-dot" />
            Live sync · {unlocks.filter(Boolean).length} / {groups.length} unlocked
          </span>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Groups &amp; Codes</h2>

        {groups.map((group, idx) => (
          <div className="admin-group" key={idx}>
            <div className="admin-group-head">
              <span>GROUP {idx + 1}</span>
              <span
                className={`status-pill ${unlocks[idx] ? "unlocked" : "locked"}`}
              >
                {unlocks[idx] ? "✅ UNLOCKED" : "🔒 LOCKED"}
              </span>
            </div>

            <div className="admin-fields">
              <div className="admin-field">
                <label htmlFor={`name-${idx}`}>Name</label>
                <input
                  id={`name-${idx}`}
                  value={group.name}
                  onChange={(e) => updateGroup(idx, "name", e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label htmlFor={`code-${idx}`}>Code (4 digits)</label>
                <input
                  id={`code-${idx}`}
                  value={group.code}
                  maxLength={4}
                  onChange={(e) =>
                    updateGroup(idx, "code", e.target.value.slice(0, 4))
                  }
                />
              </div>
              <div className="admin-field">
                <label htmlFor={`word-${idx}`}>Word</label>
                <input
                  id={`word-${idx}`}
                  value={group.word}
                  onChange={(e) => updateGroup(idx, "word", e.target.value)}
                />
              </div>
            </div>

            {groups.length > 1 && (
              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn danger"
                  onClick={() => removeGroup(idx)}
                >
                  Remove Group
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="admin-actions">
          <button type="button" className="admin-btn secondary" onClick={addGroup}>
            + Add Group
          </button>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Final Message</h2>
        <div className="admin-field">
          <label htmlFor="final-message">Shown when all groups unlock</label>
          <input
            id="final-message"
            value={finalMessage}
            onChange={(e) => setFinalMessage(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-panel">
        <h2>Actions</h2>
        <div className="admin-actions">
          <button
            type="button"
            className="admin-btn primary"
            onClick={saveConfig}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Config"}
          </button>
          <button
            type="button"
            className="admin-btn danger"
            onClick={resetProgress}
          >
            Reset All Progress
          </button>
        </div>

        {toast && (
          <div className={`admin-toast ${toast.type}`}>{toast.message}</div>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/" className="back-link">
          ← Back to Puzzle
        </Link>
      </div>
    </div>
  );
}
