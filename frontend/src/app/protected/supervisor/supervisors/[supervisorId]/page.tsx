"use client"
import { useParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import apiUrl from "@/util/apiUrl"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type FieldOfStudy = {
  id: number
  name: string
  description: string
}

type SupervisorDetails = {
  id: number
  email: string
  first_name: string
  last_name: string
  title?: string
  description?: string
  field_of_study: FieldOfStudy[]
  total_spots: number
  free_spots: number
}

export default function Supervisor() {
  const { supervisorId } = useParams<{ supervisorId: string }>()
  const numericSupervisorId = Number(supervisorId)

  const [supervisor, setSupervisor] = useState<SupervisorDetails | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const supervisorFetch = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${apiUrl}/user/supervisor/${numericSupervisorId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Nie znaleziono promotora.")
      }

      const data = await response.json()

      const supervisor: SupervisorDetails = {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        title: data.title,
        description: data.description,
        total_spots: data.total_spots,
        free_spots: data.free_spots,
        field_of_study: data.field_of_study,
      }

      return supervisor
    },
    onError: (e) => {
      setFetchError(e.message)
    },
    onSuccess: (supervisor) => {
      setSupervisor(supervisor)
    },
  })

  useEffect(() => {
    supervisorFetch.mutate()
  }, [supervisorFetch])

  useEffect(() => {
    if (fetchError) {
      toast.error("Błąd", {
        description: fetchError,
      })
    }
  }, [fetchError])

  if (fetchError) return <h1>{fetchError}</h1>

  if (!supervisor) return <p>Ładowanie...</p>

  return (
    <div className="w-full">
      <div className="flex w-full border-y-2 px-4 py-4">
        <div className="w-full space-y-6">
          <CardHeader className="space-y-2 text-2xl">
            <CardTitle>
              Promotor: {supervisor.title && `${supervisor.title} `}
              {supervisor.first_name} {supervisor.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Email: {supervisor.email}</Label>
            <Label>Ilość dostępnych miejsc: {supervisor.free_spots}</Label>
            <div>
              <Label>Kierunki:</Label>
              <div className="mt-2 space-x-2">
                {supervisor.field_of_study.length > 0 ? (
                  supervisor.field_of_study.map((field) => (
                    <Badge key={field.id} variant="secondary">
                      {field.name}
                    </Badge>
                  ))
                ) : (
                  <p>Brak przypisanych kierunków</p>
                )}
              </div>
            </div>
            <div>
              <Label>Opis:</Label>
              <p className="mt-1">{supervisor.description}</p>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  )
}
