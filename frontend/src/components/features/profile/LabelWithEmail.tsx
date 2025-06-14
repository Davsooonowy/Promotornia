"use client"
import apiUrl from "@/util/apiUrl"
import { useMutation } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function LabelWithEmail() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [shouldFetch, setShouldFetch] = useState(true)

  const emailFetch = useMutation({
    mutationFn: async () => {
      setLoading(true)
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
    onSuccess: (data) => {
      setEmail(data)
      setLoading(false)
    },
    onError: () => {
      setIsError(true)
    },
  })

  useEffect(() => {
    if (shouldFetch) {
      setShouldFetch(false)
      emailFetch.mutate()
    }
  }, [shouldFetch, emailFetch])

  if (loading) {
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

  if (isError) {
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
        <p className="text-muted-foreground text-sm">{email}</p>
      </div>
    </div>
  )
}
