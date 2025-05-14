"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import useDecodeToken from "@/hooks/useDecodeToken"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { LoadingErrorState } from "@/components/ui/loading-error-state"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { showErrorToast } from "@/lib/error-handling"
import { toast } from "sonner"

export default function ChangePersonalData() {
  const [editPersonalData, setEditPersonalData] = useState(false)
  const [name, setName] = useState<{ initial: string; current: string }>({
    initial: "",
    current: "",
  })
  const [surname, setSurname] = useState<{ initial: string; current: string }>({
    initial: "",
    current: "",
  })
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [shouldFetch, setShouldFetch] = useState(true)

  const { token } = useDecodeToken()

  const personalDataQuery = useQuery({
    queryKey: ["personalData"],
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
        return data
      } catch (error) {
        throw error
      }
    },
    enabled: shouldFetch,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (personalDataQuery.data) {
      setName({
        initial: personalDataQuery.data.name,
        current: personalDataQuery.data.name,
      })
      setSurname({
        initial: personalDataQuery.data.surname,
        current: personalDataQuery.data.surname,
      })
    }
  }, [personalDataQuery.data])

  useEffect(() => {
    if (isSuccess) setShouldFetch(true)
  }, [isSuccess])

  const personalDataMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`${apiUrl}/user/edit_personal_data`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.current,
            surname: surname.current,
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
  }

  return (
    <ErrorBoundary context="personalData">
      <Card className="w-full">
        <CardContent className="space-y-3">
          <LoadingErrorState
            isLoading={personalDataQuery.isLoading}
            isError={personalDataQuery.isError}
            error={
              personalDataQuery.error instanceof Error
                ? personalDataQuery.error
                : new Error("Unknown error")
            }
            context="personalData"
            resetError={() => personalDataQuery.refetch()}
          >
            <>
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
