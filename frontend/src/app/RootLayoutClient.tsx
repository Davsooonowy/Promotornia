"use client"

import type React from "react"
import Providers from "@/components/tanstack/Providers"
import { Toaster } from "sonner"
import Footer from "@/components/layout/Footer"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showFooter = pathname !== "/" && pathname !== "/forgot-password"

  return (
    <body className="flex min-h-screen flex-col">
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Providers>
          <main className="flex-grow">{children}</main>
          {showFooter && <Footer />}
        </Providers>
        <Toaster />
      </ThemeProvider>
    </body>
  )
}
