"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sun/Moon switch. The `mounted` guard prevents a hydration mismatch: the
 * server doesn't know the persisted theme, so we render a stable placeholder
 * until the client has mounted and next-themes has applied the class.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-line bg-pane text-ink-2 hover:text-ink hover:bg-tint transition-colors",
        className
      )}
    >
      {/* Render a neutral icon until mounted to avoid a flash/hydration warning */}
      {!mounted ? (
        <Sun className="w-4 h-4 opacity-0" />
      ) : isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
