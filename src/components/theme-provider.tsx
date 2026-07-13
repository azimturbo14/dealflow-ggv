"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Drives the global theme from an <html class="dark|light"> attribute.
 * `:root` (globals.css) is the light palette; `.dark` carries the dark tokens.
 * defaultTheme is "dark" to preserve the app's current look; the choice is
 * persisted in localStorage and applied before paint by next-themes.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="dealflow-theme"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
