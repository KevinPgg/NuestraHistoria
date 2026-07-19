import type { Metadata, Viewport } from "next";
import { Dancing_Script } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-carta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nuestra Historia",
  description: "Nuestro espacio privado.",
  manifest: "/manifest.webmanifest",
  applicationName: "Nuestra Historia",
  appleWebApp: {
    capable: true,
    title: "Historia",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f472b6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={dancing.variable}>
      <body className="min-h-screen antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
