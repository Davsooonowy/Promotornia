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
import { Loader2 } from "lucide-react"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const { tokenPayload, isTokenError } = useDecodeToken()
  const [render, setRender] = useState(false)

  useEffect(() => {
    if (isTokenError) {
      router.push("/")
      return
    }
    if (tokenPayload) setRender(true)
  }, [tokenPayload, isTokenError, router])

  const getTopMenu = () => {
    if (tokenPayload?.role === "student") return <StudentTopMenu />
    else if (tokenPayload?.role === "supervisor") return <SupervisorTopMenu />
    else if (tokenPayload?.role === "dean") return <DeanTopMenu />
  }

  if (!render) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Autoryzacja...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {getTopMenu()}
      <div className="main-content">
        <div className="page-container">{children}</div>
      </div>
    </div>
  )
}
