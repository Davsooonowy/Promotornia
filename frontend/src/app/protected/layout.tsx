"use client"
import {
  StudentTopMenu,
  SupervisorTopMenu,
  DeanTopMenu,
} from "@/components/navigation/TopMenu"
import UserRole from "@/util/UserRole"
import { useState } from "react"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [role, setRole] = useState(UserRole.student)

  return (
    <div>
      {role === UserRole.student && <StudentTopMenu />}
      {role === UserRole.supervisor && <SupervisorTopMenu />}
      {role === UserRole.dean && <DeanTopMenu />}
      <div className="flex h-screen w-full items-center justify-center">
        {children}
      </div>
    </div>
  )
}
