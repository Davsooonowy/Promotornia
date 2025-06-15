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
import useDecodeToken from "@/hooks/useDecodeToken"

export default function ChangePersonalData() {
  const [editPersonalData, setEditPersonalData] = useState(false)
  const [title, setTitle] = useState<{ initial: string; current: string }>({
    initial: "",
    current: "",
  })
  const [name, setName] = useState<{ initial: string; current: string }>({
    initial: "",
    current: "",
  })
  const [surname, setSurname] = useState<{ initial: string; current: string }>({
    initial: "",
    current: "",
  })
  const [totalSpots, setTotalSpots] = useState<{
    initial: string
    current: string
  }>({
    initial: "",
    current: "",
  })
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [shouldFetch, setShouldFetch] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { tokenPayload } = useDecodeToken()
  const isPromoter = tokenPayload?.role === "supervisor"

  const personalDataFetch = useMutation({
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
      return data
    },
    onError: (err) => {
      setError(err.message)
    },
    onSuccess: (data) => {
      setName({ current: data.first_name, initial: data.first_name })
      setSurname({ current: data.last_name, initial: data.last_name })
      if (isPromoter) {
        setTitle({ current: data.title, initial: data.title })
        setTotalSpots({ current: data.total_spots, initial: data.total_spots })
      }
      setLoading(false)
    },
  })

  useEffect(() => {
    if (shouldFetch) {
      setShouldFetch(false)
      personalDataFetch.mutate()
    }
  }, [shouldFetch, personalDataFetch])

  const personalDataMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      try {
        const response = await fetch(`${apiUrl}/user/personal_data/`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.current,
            first_name: name.current,
            last_name: surname.current,
            total_spots: Number(totalSpots.current),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.message ||
              `Błąd ${response.status}: ${response.statusText}`,
          )
        }

        return await response.json()
      } catch (error) {
        throw error
      }
    },
    onError: (error) => {
      showErrorToast(error, "Nie udało się zaktualizować danych osobowych")
    },
    onSuccess: () => {
      setIsSuccess(true)
      setEditPersonalData(false)
      toast.success("Sukces", {
        description: "Dane osobowe zostały zaktualizowane",
      })
      setTimeout(() => setIsSuccess(false), 3000)
    },
  })

  const handleSave = () => {
    personalDataMutation.mutate()
  }

  const handleCancel = () => {
    setEditPersonalData(false)
    setName((name) => ({ ...name, current: name.initial }))
    setSurname((surname) => ({ ...surname, current: surname.initial }))
    if (isPromoter) {
      setTitle((title) => ({ ...title, current: title.initial }))
      setTotalSpots((totalSpots) => ({
        ...totalSpots,
        current: totalSpots.initial,
      }))
    }
  }

  return (
    <ErrorBoundary context="personalData">
      <Card className="w-full">
        <CardContent className="space-y-3">
          <LoadingErrorState
            isLoading={loading}
            isError={!!error}
            error={error ? new Error(error) : new Error("Nieznany błąd")}
            context="personalData"
            resetError={() => personalDataFetch.mutate()}
          >
            <>
              {isPromoter && (
                <>
                  <Label>Tytuł:</Label>
                  <Input
                    disabled={!editPersonalData}
                    onInput={(e) => {
                      const newTitle = e.currentTarget.value
                      setTitle((title) => ({ ...title, current: newTitle }))
                    }}
                    onChange={(e) => {
                      const newTitle = e.currentTarget.value
                      setTitle((title) => ({ ...title, current: newTitle }))
                    }}
                    value={title.current}
                  />
                </>
              )}
              <Label>Imię:</Label>
              <Input
                disabled={!editPersonalData}
                onInput={(e) => {
                  const newName = e.currentTarget.value
                  setName((name) => ({ ...name, current: newName }))
                }}
                onChange={(e) => {
                  const newName = e.currentTarget.value
                  setName((name) => ({ ...name, current: newName }))
                }}
                value={name.current}
              />
              <Label>Nazwisko:</Label>
              <Input
                disabled={!editPersonalData}
                onInput={(e) => {
                  const newSurname = e.currentTarget.value
                  setSurname((surname) => ({ ...surname, current: newSurname }))
                }}
                onChange={(e) => {
                  const newSurname = e.currentTarget.value
                  setSurname((surname) => ({ ...surname, current: newSurname }))
                }}
                value={surname.current}
              />
              {isPromoter && (
                <>
                  <Label>Limit prac inżynierskich:</Label>
                  <Input
                    disabled={!editPersonalData}
                    onInput={(e) => {
                      const newTotalSpots = e.currentTarget.value
                      setTotalSpots((totalSpots) => ({
                        ...totalSpots,
                        current: newTotalSpots,
                      }))
                    }}
                    onChange={(e) => {
                      const newTotalSpots = e.currentTarget.value
                      setTotalSpots((totalSpots) => ({
                        ...totalSpots,
                        current: newTotalSpots,
                      }))
                    }}
                    value={totalSpots.current}
                  />
                </>
              )}

              {isSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Dane osobowe zaktualizowane</span>
                </div>
              )}

              {personalDataMutation.isError && (
                <div className="text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Nie udało się zaktualizować danych osobowych</span>
                </div>
              )}

              {editPersonalData ? (
                <div className="flex space-x-3">
                  <Button
                    className="cursor-pointer"
                    onClick={handleSave}
                    disabled={personalDataMutation.isPending}
                  >
                    {personalDataMutation.isPending
                      ? "Zapisywanie..."
                      : "Zapisz"}
                  </Button>
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={personalDataMutation.isPending}
                  >
                    Anuluj
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setEditPersonalData(true)}
                  className="cursor-pointer"
                >
                  Edytuj dane osobowe
                </Button>
              )}
            </>
          </LoadingErrorState>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
