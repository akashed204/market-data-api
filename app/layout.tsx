import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Institutional Market Analytics",
  description: "Realtime market analytics dashboard for the Alice Blue FastAPI backend.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

