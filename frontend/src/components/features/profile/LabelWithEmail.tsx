"use client"
import apiUrl from "@/util/apiUrl"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, AlertCircle } from "lucide-react"

export default function LabelWithEmail() {
  const emailQuery = useQuery({
    queryKey: ["user-email"],
    queryFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/user/personal_data/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Błąd ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.email
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  if (emailQuery.isLoading) {
    return (
      <div className="flex items-center gap-3">
        <Mail className="text-muted-foreground h-5 w-5" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    )
  }

  if (emailQuery.isError) {
    return (
      <div className="text-destructive flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <div>
          <p className="font-medium">Błąd ładowania danych</p>
          <p className="text-muted-foreground text-sm">
            Nie udało się pobrać adresu email
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Mail className="text-muted-foreground h-5 w-5" />
      <div>
        <p className="font-medium">Email</p>
        <p className="text-muted-foreground text-sm">{emailQuery.data}</p>
      </div>
    </div>
  )
}
