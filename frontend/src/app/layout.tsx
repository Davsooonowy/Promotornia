import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { RootLayoutClient } from "./RootLayoutClient"

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
      <RootLayoutClient>{children}</RootLayoutClient>
    </html>
  )
}
