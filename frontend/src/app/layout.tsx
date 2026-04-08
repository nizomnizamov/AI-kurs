import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "AI kursi — Platformasi",
  description: "Murakkab platformalar, saytlar, botlar ishlab chiqish va biznesni avtomatlashtirish hamda MVP startaplarini yo'lga qo'yishni o'rganasiz.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
