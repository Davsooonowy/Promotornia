"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { LoadingErrorState } from "@/components/ui/loading-error-state"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { showErrorToast } from "@/lib/error-handling"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

export default function ChangeDescription() {
  const [editMode, setEditMode] = useState(false)
  const [description, setDescription] = useState<{ initial: string; current: string }>({
    initial: "",
    current: "",
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const [shouldFetch, setShouldFetch] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const descriptionFetch = useMutation({
    mutationFn: async () => {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/user/description/`, {
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
      return data
    },
    onError: (err) => {
      setError(err.message)
    },
    onSuccess: (data) => {
      setDescription({ current: data.description || "", initial: data.description || "" })
      setLoading(false)
    },
  })

  useEffect(() => {
    if (shouldFetch) {
      setShouldFetch(false)
      descriptionFetch.mutate()
    }
  }, [shouldFetch, descriptionFetch])

  const descriptionMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/user/description/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.current,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Błąd ${response.status}: ${response.statusText}`
        )
      }

      return await response.json()
    },
    onError: (error) => {
      showErrorToast(error, "Nie udało się zaktualizować opisu")
    },
    onSuccess: () => {
      setIsSuccess(true)
      setEditMode(false)
      toast.success("Sukces", {
        description: "Opis został zaktualizowany",
      })
      setTimeout(() => setIsSuccess(false), 3000)
    },
  })

  const handleSave = () => {
    descriptionMutation.mutate()
  }

  const handleCancel = () => {
    setEditMode(false)
    setDescription((prev) => ({ ...prev, current: prev.initial }))
  }

  return (
    <ErrorBoundary context="descriptionUpdate">
      <Card className="w-full">
        <CardContent className="space-y-3">
          <LoadingErrorState
            isLoading={loading}
            isError={!!error}
            error={error ? new Error(error) : new Error("Nieznany błąd")}
            context="descriptionUpdate"
            resetError={() => descriptionFetch.mutate()}
          >
            <>
              <Label>Opis zainteresowań:</Label>
              <Textarea
                disabled={!editMode}
                value={description.current}
                onChange={(e) =>
                  setDescription((desc) => ({ ...desc, current: e.target.value }))
                }
                className="min-h-[120px]"
              />

              {isSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Opis został zaktualizowany</span>
                </div>
              )}

              {descriptionMutation.isError && (
                <div className="text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Nie udało się zapisać zmian</span>
                </div>
              )}

              {editMode ? (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSave}
                    disabled={descriptionMutation.isPending}
                  >
                    {descriptionMutation.isPending ? "Zapisywanie..." : "Zapisz"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={descriptionMutation.isPending}
                  >
                    Anuluj
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setEditMode(true)}>Edytuj opis</Button>
              )}
            </>
          </LoadingErrorState>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
