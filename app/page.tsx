"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Group, PuzzleConfig } from "@/lib/types";

type AppData = {
  config: PuzzleConfig;
  unlocks: boolean[];
};

async function fetchState(): Promise<AppData> {
  const res = await fetch("/api/state", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load state");
  return res.json();
}

export default function PuzzlePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [finalMessage, setFinalMessage] = useState("");
  const [unlocks, setUnlocks] = useState<boolean[]>([]);
  const [inputs, setInputs] = useState<string[]>([]);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [remoteUnlocks, setRemoteUnlocks] = useState<boolean[]>([]);
  const localUnlockRef = useRef<Set<number>>(new Set());
  const [ready, setReady] = useState(false);

  const applyState = useCallback((data: AppData, fromSync = false) => {
    setGroups(data.config.groups);
    setFinalMessage(data.config.finalMessage);

    setUnlocks((prev) => {
      if (fromSync) {
        setRemoteUnlocks((prevRemote) => {
          const nextRemote = [...prevRemote];
          while (nextRemote.length < data.unlocks.length) nextRemote.push(false);
          data.unlocks.forEach((isUnlocked, idx) => {
            if (isUnlocked && !prev[idx] && !localUnlockRef.current.has(idx)) {
              nextRemote[idx] = true;
            }
          });
          return nextRemote;
        });
      }
      return data.unlocks;
    });

    setInputs((prev) => {
      return data.config.groups.map((_, idx) =>
        data.unlocks[idx] ? "" : (prev[idx] ?? "")
      );
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const data = await fetchState();
        if (!active) return;
        applyState(data);
        setReady(true);
      } catch (error) {
        console.warn(error);
      }
    }

    init();

    const interval = setInterval(async () => {
      try {
        const data = await fetchState();
        if (!active) return;
        applyState(data, true);
      } catch (error) {
        console.warn(error);
      }
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [applyState]);

  async function checkCode(idx: number) {
    if (unlocks[idx]) return;

    const val = (inputs[idx] ?? "").trim();

    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: idx, code: val }),
      });

      const data = await res.json();

      if (data.success) {
        localUnlockRef.current.add(idx);
        setUnlocks(data.unlocks);
        setGroups(data.config.groups);
        setFinalMessage(data.config.finalMessage);
        setInputs((prev) => {
          const next = [...prev];
          next[idx] = "";
          return next;
        });
        setShakeIndex(null);
      } else {
        setShakeIndex(idx);
        setTimeout(() => setShakeIndex(null), 400);
        setInputs((prev) => {
          const next = [...prev];
          next[idx] = "";
          return next;
        });
      }
    } catch (error) {
      console.warn(error);
    }
  }

  const unlockedCount = unlocks.filter(Boolean).length;
  const allUnlocked = groups.length > 0 && unlockedCount === groups.length;
  const progress = groups.length ? (unlockedCount / groups.length) * 100 : 0;

  if (!ready) {
    return (
      <>
        <header>
          <div className="title">🔐 Crack the Code</div>
          <div className="subtitle">Loading puzzle…</div>
        </header>
      </>
    );
  }

  return (
    <>
      <header>
        <div className="title">🔐 Crack the Code</div>
        <div className="subtitle">
          Enter your group&apos;s secret code → unlock the word
        </div>
        <div>
          <span className="live-badge">
            <span className="live-dot" />
            Live sync · Real-time updates
          </span>
        </div>
      </header>

      <div className="progress-wrap">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-label">
          {unlockedCount} / {groups.length} unlocked
        </div>
      </div>

      <div className="cards">
        {groups.map((group, idx) => {
          const isUnlocked = unlocks[idx] === true;
          const showRemoteBadge = isUnlocked && remoteUnlocks[idx];

          return (
            <div
              key={idx}
              className={`card ${isUnlocked ? "unlocked" : ""}`}
              data-g={idx % 4}
            >
              <div className="lock-icon">{isUnlocked ? "✅" : "🔒"}</div>
              <div className="card-body">
                <div className="group-label">
                  {group.name}
                  {showRemoteBadge && (
                    <span className="remote-badge">unlocked</span>
                  )}
                </div>

                {!isUnlocked && (
                  <div className="input-row">
                    <input
                      className={`code-input ${shakeIndex === idx ? "shake" : ""}`}
                      type="text"
                      maxLength={4}
                      placeholder="····"
                      inputMode="numeric"
                      value={inputs[idx] ?? ""}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 4);
                        setInputs((prev) => {
                          const next = [...prev];
                          next[idx] = value;
                          return next;
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") checkCode(idx);
                      }}
                    />
                    <button
                      className="go-btn"
                      type="button"
                      onClick={() => checkCode(idx)}
                    >
                      GO →
                    </button>
                  </div>
                )}

                <div className="word-reveal">{group.word}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`final-reveal ${allUnlocked ? "show" : ""}`}>
        <div className="final-emoji">🎉 🔓 🎊</div>
        <div className="final-label">🌟 MISSION COMPLETE 🌟</div>
        <div className="final-message">{finalMessage}</div>
      </div>

      <div className="admin-link">
        <Link href="/admin"></Link>
      </div>
    </>
  );
}
