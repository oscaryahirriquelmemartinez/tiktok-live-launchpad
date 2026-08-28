import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIVE Launchpad · TikTok",
  description:
    "Prototipo LIVE Launchpad: convierte el pico viral de un video corto en el primer LIVE del creador.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="h-full bg-black text-white font-sans">
        <main className="relative mx-auto h-screen max-w-[400px] overflow-hidden bg-black text-white">
          {children}
        </main>
      </body>
    </html>
  );
}
