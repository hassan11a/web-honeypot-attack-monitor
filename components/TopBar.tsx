"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("hp-theme", next ? "dark" : "light");
    } catch {
      // ignore storage failures
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-md border border-[var(--card-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--card)]"
      title="Toggle theme"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}

export function TopBar({ username }: { username: string }) {
  const router = useRouter();
  const [now, setNow] = useState("");

  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--card-border)] bg-[var(--background)]/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3 pl-10 md:pl-0">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          MONITORING ACTIVE
        </span>
        <span className="hidden text-xs text-[var(--muted)] sm:inline font-mono">{now}</span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="hidden text-sm text-[var(--muted)] sm:inline">{username}</span>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-[var(--card-border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--card)]"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
