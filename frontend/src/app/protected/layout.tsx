"use client"
import {
  StudentTopMenu,
  SupervisorTopMenu,
  DeanTopMenu,
} from "@/components/navigation/TopMenu"
import useDecodeToken from "@/hooks/useDecodeToken"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const { tokenPayload, isTokenError } = useDecodeToken()
  const [render, setRender] = useState(false)

  useEffect(() => {
    if (isTokenError) router.push("/")
    if (tokenPayload) setRender(true)
  }, [tokenPayload, isTokenError, router])

  const getTopMenu = () => {
    if (tokenPayload?.role === "student") return <StudentTopMenu />
    else if (tokenPayload?.role === "supervisor") return <SupervisorTopMenu />
    else if (tokenPayload?.role === "dean") return <DeanTopMenu />
  }

  return (
    <>
      {render ? (
        <div>
          {getTopMenu()}
          <div className="flex h-screen w-full items-center justify-center">
            {children}
          </div>
        </div>
      ) : (
        "Authorizing..."
      )}
    </>
  )
}
