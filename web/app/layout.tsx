import type { Metadata } from "next";
import { Dancing_Script } from "next/font/google";
import "./globals.css";

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-carta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nuestra Historia",
  description: "Nuestro espacio privado.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={dancing.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
