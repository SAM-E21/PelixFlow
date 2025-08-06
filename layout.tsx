import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

export const metadata: Metadata = {
  title: "PelixFlow",
  description: "Encuentra series, películas y documentales basados en tus gustos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="google-site-verification" content="5M1bnPImeRRUcmt0xYoO3DA-xm8pZFLT4OQf1xsV0no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
          <AuthProvider>
            {children}
          </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
