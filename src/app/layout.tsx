import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CheatChat - Real-time Messaging Platform",
  description: "A modern, secure messaging platform for real-time communication. Share files, search messages, and collaborate in workspaces.",
  keywords: "chat, messaging, real-time communication, file sharing, workspace collaboration",
  authors: [{ name: "CheatChat Team" }],
  openGraph: {
    title: "CheatChat - Real-time Messaging Platform",
    description: "A modern, secure messaging platform for real-time communication. Share files, search messages, and collaborate in workspaces.",
    type: "website",
    locale: "en_US",
    siteName: "CheatChat",
  },
  twitter: {
    card: "summary_large_image",
    title: "CheatChat - Real-time Messaging Platform",
    description: "A modern, secure messaging platform for real-time communication. Share files, search messages, and collaborate in workspaces.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "CheatChat",
              "applicationCategory": "CommunicationApplication",
              "operatingSystem": "Web",
              "description": "A modern, secure messaging platform for real-time communication. Share files, search messages, and collaborate in workspaces.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Real-time messaging",
                "File sharing",
                "Message search",
                "Workspace collaboration",
                "Secure communication"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
