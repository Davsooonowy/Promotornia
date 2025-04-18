"use client"
import { useSearchParams } from "next/navigation"

export default function ManageUsers() {
  const searchParams = useSearchParams()
  const userType = searchParams.get("user_type")

  return <h1>Zarządzanie użytkownikami typu: {userType}</h1>
}
