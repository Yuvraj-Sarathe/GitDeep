"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * The canonical list of fun "AI is running..." one-liners.
 *
 * Tone: GitDeep is a brutally honest GitHub roaster, so the lines lean
 * playful / snarky. Kept SFW and under ~70 chars so they fit the banner.
 *
 * Feel free to append more — the hook shuffles them each session.
 */
export const DEFAULT_LOADING_MESSAGES: string[] = [
  // ── roasting ──────────────────────────────────────────────
  "AI is roasting the repos…",
  "Counting README files that say 'TODO'…",
  "Judging variable names like `data2`…",
  "Measuring the stack-overflow-to-brain ratio…",
  "Searching for a single helpful comment…",
  "Tallying commits that are just 'fix typo'…",
  "Evaluating the 'AI slop' coefficient…",
  "Auditing repos with zero stars (including the owner's)…",

  // ── puzzled / dramatic ────────────────────────────────────
  "Portfolio so good, AI is puzzled…",
  "Portfolio so wild, AI needs a moment…",
  "AI is taking a breath before the verdict…",
  "Consulting the council of rubber ducks…",
  "Decoding the commit messages… good luck…",
  "Wondering why everything is named 'final_final_v2'…",
  "Trying to find the actual main branch…",

  // ── work-in-progress / flavor ─────────────────────────────
  "Scanning 1,247 files of pure chaos…",
  "Connecting the dots between repos and reality…",
  "Calibrating the snark-meter…",
  "Loading the roasting cannon…",
  "Compiling the SWOT of someone's life choices…",
  "Running the hirability algorithm on a prayer…",
  "Cross-referencing buzzwords with actual skills…",
  "Drawing the growth curve (it's a flat line)…",
  "Asking the stars… both celestial and GitHub…",
  "Almost done… probably… maybe…",
  "Drafting the roast in iambic pentameter…",
  "Plotting the trajectory of someone's career…",
  "Indexing forks nobody asked for…",
  "Estimating the caffeine-per-commit ratio…",
];

/** Fisher–Yates shuffle (non-mutating). */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Cycles through a shuffled list of loading messages on an interval.
 *
 * @param messages  Optional custom list. Defaults to the baked-in set.
 * @param intervalMs Time each message stays on screen. Default 2200ms.
 *
 * Behavior:
 * - Messages are shuffled once on mount so every session feels fresh.
 * - The first message shows immediately (no blank frame).
 * - The interval is cleaned up on unmount.
 * - If `messages` is empty, returns an empty string.
 */
export function useLoadingMessage(
  messages: readonly string[] = DEFAULT_LOADING_MESSAGES,
  intervalMs = 2200,
): string {
  const [index, setIndex] = useState(0);
  const shuffled = useMemo(() => shuffle(messages), [messages]);

  // Reset index when the message set changes.
  useEffect(() => {
    setIndex(0);
  }, [shuffled]);

  // Handle the rotation interval.
  useEffect(() => {
    if (shuffled.length <= 1) return; // nothing to cycle.

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % shuffled.length);
    }, intervalMs);

    return () => clearInterval(id);
  }, [shuffled, intervalMs]);

  return shuffled[index] ?? shuffled[0] ?? "";
}
