"use client"
import type React from "react"
import {
  StudentTopMenu,
  SupervisorTopMenu,
  DeanTopMenu,
} from "@/components/navigation/TopMenu"
import useDecodeToken from "@/hooks/useDecodeToken"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const { tokenPayload, isTokenError } = useDecodeToken()
  const [render, setRender] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (isTokenError) {
      setAuthError(
        "Sesja wygasła lub nie jesteś zalogowany. Przekierowanie na stronę logowania...",
      )
      const timer = setTimeout(() => router.push("/"), 3000)
      return () => clearTimeout(timer)
    }
    if (tokenPayload) setRender(true)
  }, [tokenPayload, isTokenError, router])

  const getTopMenu = () => {
    if (tokenPayload?.role === "student") return <StudentTopMenu />
    else if (tokenPayload?.role === "supervisor") return <SupervisorTopMenu />
    else if (tokenPayload?.role === "dean") return <DeanTopMenu />
  }

  if (authError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
        <div className="text-destructive flex items-center gap-2">
          <AlertCircle className="h-6 w-6" />
          <span className="text-lg">{authError}</span>
        </div>
        <Button onClick={() => router.push("/")} className="cursor-pointer">
          Przejdź do strony logowania
        </Button>
      </div>
    )
  }

  if (!render) {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="text-lg">Autoryzacja...</span>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        {getTopMenu()}
        <div className="main-content">
          <div className="page-container">{children}</div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
