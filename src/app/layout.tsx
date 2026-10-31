import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gletcher Brewery",
    template: "%s | Gletcher Brewery",
  },
  description: "Пивоварня Глетчер — современное пивоварение с 2011 года.",
  metadataBase: new URL("https://www.gletcherbrewery.com"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
