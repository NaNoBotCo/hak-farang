import { useEffect, useMemo, useState } from "react";

export interface ChecklistItem {
  text: string;
  note?: string;
}

interface Props {
  /** Stable id so progress persists per article. */
  slug: string;
  items: ChecklistItem[];
  /** Accent hex for the checked fill + sparkle. */
  accent?: string;
}

/**
 * Big-tap checklist. Each item checks off with a small gold sparkle burst.
 * Progress is remembered on the phone (localStorage) so she can come back.
 */
export default function Checklist({ slug, items, accent = "#f2a93b" }: Props) {
  const storageKey = useMemo(() => `hf:checklist:${slug}`, [slug]);
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  const [burstAt, setBurstAt] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as boolean[];
        if (Array.isArray(saved) && saved.length === items.length) {
          setDone(saved);
        }
      }
    } catch {
      /* private mode / disabled storage — no-op */
    }
    setHydrated(true);
  }, [storageKey, items.length]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(done));
    } catch {
      /* no-op */
    }
  }, [done, hydrated, storageKey]);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      if (next[i]) setBurstAt(i);
      return next;
    });
  };

  const completed = done.filter(Boolean).length;
  const allDone = completed === items.length && items.length > 0;

  return (
    <div className="not-prose my-8">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-[var(--font-display)] text-sm font-medium text-naga-600">
          เช็กลิสต์ · {completed}/{items.length}
        </span>
        {allDone && (
          <span className="text-sm font-medium text-marigold-600">
            ครบแล้ว เก่งมากเจ้า 🎉
          </span>
        )}
      </div>

      <ul className="space-y-2.5">
        {items.map((item, i) => {
          const checked = done[i];
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={checked}
                className="press group flex w-full items-start gap-3 rounded-2xl border border-marigold-100 bg-white/70 px-4 py-3 text-left shadow-sm ring-marigold-200 focus:outline-none focus-visible:ring-2"
                style={checked ? { background: "rgba(242,169,59,0.10)" } : undefined}
              >
                <span
                  className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                  style={{
                    borderColor: checked ? accent : "var(--color-marigold-300)",
                    background: checked ? accent : "transparent",
                  }}
                >
                  {checked && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {burstAt === i && (
                    <Sparkle
                      accent={accent}
                      onDone={() => setBurstAt(null)}
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={
                      "block leading-snug " +
                      (checked ? "text-ink-soft line-through decoration-marigold-400/60" : "text-ink")
                    }
                  >
                    {item.text}
                  </span>
                  {item.note && (
                    <span className="mt-0.5 block text-[0.95rem] leading-snug text-ink-soft">
                      {item.note}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A short burst of gold sparks around a freshly-checked item. */
function Sparkle({ accent, onDone }: { accent: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 650);
    return () => clearTimeout(t);
  }, [onDone]);

  const sparks = [0, 60, 120, 180, 240, 300];
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      {sparks.map((deg, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 5,
            height: 5,
            marginLeft: -2.5,
            marginTop: -2.5,
            borderRadius: 9999,
            background: i % 2 === 0 ? accent : "#fcebc5",
            transform: `rotate(${deg}deg) translateY(-12px)`,
            animation: "hf-sparkle 0.6s var(--ease-squish) forwards",
          }}
        />
      ))}
    </span>
  );
}
