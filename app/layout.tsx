import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kamai · कमाई — a passbook for people banks ignore",
  description: "A street vendor's voice becomes a verifiable credit passport, and the same ledger proves her rain-out insurance claims.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <Nav />
        <div id="main">{children}</div>
        <div style={{ textAlign: "center", fontSize: 12, opacity: 0.7, padding: "18px 0 26px" }}>Weather data: Open-Meteo.com (CC BY 4.0)</div>
      </body>
    </html>
  );
}
