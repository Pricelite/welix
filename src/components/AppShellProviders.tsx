"use client";

import { ThemeProvider } from "next-themes";

export function AppShellProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange enableSystem>
      {children}
    </ThemeProvider>
  );
}
