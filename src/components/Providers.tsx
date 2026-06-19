"use client";

import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/components/QueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange enableSystem>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
