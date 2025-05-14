"use client"

import { Label } from "@/components/ui/label"
import useDecodeToken from "@/hooks/useDecodeToken"
import apiUrl from "@/util/apiUrl"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { LoadingErrorState } from "@/components/ui/loading-error-state"
import { getUserFriendlyErrorMessage } from "@/lib/error-handling"
import { AlertCircle } from "lucide-react"

export default function LabelWithEmail() {
  const [email, setEmail] = useState<string | null>(null)
  const { token } = useDecodeToken()

  const emailQuery = useQuery({
    queryKey: ["email"],
    queryFn: async () => {
      try {
        const response = await fetch(`${apiUrl}/user/personal_data`, {
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
        setEmail(data.email)
        return data.email
      } catch (error) {
        console.error("Error fetching email:", error)
        throw error
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  return (
    <ErrorBoundary context="email">
      <LoadingErrorState
        isLoading={emailQuery.isLoading}
        isError={emailQuery.isError}
        error={
          emailQuery.error instanceof Error
            ? emailQuery.error
            : new Error("Unknown error")
        }
        context="email"
        resetError={() => emailQuery.refetch()}
      >
        {email ? (
          <Label className="ml-3 text-3xl">Profil, email: {email}</Label>
        ) : (
          <div className="ml-3 flex items-center gap-2 text-3xl">
            <span>Profil</span>
            {emailQuery.isError && (
              <div className="text-destructive flex items-center gap-1 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {getUserFriendlyErrorMessage(emailQuery.error, "email")}
                </span>
              </div>
            )}
          </div>
        )}
      </LoadingErrorState>
    </ErrorBoundary>
  )
}
