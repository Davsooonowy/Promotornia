import { Label } from "@/components/ui/label"
import useDecodeToken from "@/hooks/useDecodeToken"
import apiUrl from "@/util/apiUrl"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export default function LabelWithEmail() {
  const [email, setEmail] = useState(null)

  const { token } = useDecodeToken()

  const emailQuery = useQuery({
    queryKey: ["email"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/user/email`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Nie udało się załadować e-maila.")
      }

      const data = await response.json()

      setEmail(data.email)
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  return (
    <Label className="ml-3 text-3xl">
      Profil, email: {email} {emailQuery.isError && emailQuery.error.message}
    </Label>
  )
}
