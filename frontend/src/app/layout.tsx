import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/tanstack/Providers"
import { Toaster } from "sonner"
import Footer from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "Promotornia",
  description: "System zarządzania pracami dyplomowymi dla uczelni wyższych",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
