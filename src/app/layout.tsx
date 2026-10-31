import type { ReactNode } from "react";
import "./globals.css";

/**
 * Root layout is a passthrough; `<html lang>` lives in `[locale]/layout`
 * so each published locale sets the correct document language.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
